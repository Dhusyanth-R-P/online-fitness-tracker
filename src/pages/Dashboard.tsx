import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Vote, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

interface Poll {
  id: string;
  title: string;
  description: string;
  created_at: string;
  votes_count: number;
}

export default function Dashboard() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const { data, error } = await supabase
          .from('polls')
          .select(`
            id,
            title,
            description,
            created_at,
            votes:votes(count)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const pollsWithVoteCount = data.map(poll => ({
          ...poll,
          votes_count: poll.votes?.[0]?.count || 0
        }));

        setPolls(pollsWithVoteCount);
      } catch (error) {
        console.error('Error fetching polls:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Polls</h2>
          <p className="mt-1 text-sm text-gray-500">View and manage your created polls</p>
        </div>
        <div className="border-t border-gray-200">
          {polls.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <Vote className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No polls yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first poll.</p>
              <div className="mt-6">
                <Link
                  to="/create-poll"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Create New Poll
                </Link>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {polls.map((poll) => (
                <li key={poll.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/poll/${poll.id}`}
                          className="block focus:outline-none"
                        >
                          <p className="text-sm font-medium text-indigo-600 truncate">{poll.title}</p>
                          <p className="mt-1 text-sm text-gray-500 truncate">{poll.description}</p>
                        </Link>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <BarChart3 className="h-5 w-5 mr-1" />
                          <span>{poll.votes_count} votes</span>
                        </div>
                        <Link
                          to={`/results/${poll.id}`}
                          className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
                        >
                          View Results
                          <ChevronRight className="ml-1 h-5 w-5" />
                        </Link>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          Created {new Date(poll.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
}