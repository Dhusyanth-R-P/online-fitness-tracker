import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

interface Option {
  id: string;
  option_text: string;
}

interface Poll {
  id: string;
  title: string;
  description: string;
  created_by: string;
  created_at: string;
  options: Option[];
  user_vote?: string;
}

export default function PollDetails() {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        // Fetch poll details with options
        const { data: pollData, error: pollError } = await supabase
          .from('polls')
          .select(`
            *,
            options (
              id,
              option_text
            )
          `)
          .eq('id', id)
          .single();

        if (pollError) throw pollError;

        // Check if user has already voted
        const { data: voteData, error: voteError } = await supabase
          .from('votes')
          .select('option_id')
          .eq('poll_id', id)
          .eq('user_id', user!.id)
          .single();

        if (voteError && voteError.code !== 'PGRST116') throw voteError;

        setPoll({
          ...pollData,
          user_vote: voteData?.option_id
        });
      } catch (err) {
        console.error('Error fetching poll:', err);
        setError('Failed to load poll');
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
  }, [id, user]);

  const handleVote = async () => {
    if (!selectedOption) {
      setError('Please select an option');
      return;
    }

    try {
      setVoting(true);
      setError('');

      const { error: voteError } = await supabase
        .from('votes')
        .insert({
          poll_id: id,
          option_id: selectedOption,
          user_id: user!.id
        });

      if (voteError) throw voteError;

      // Navigate to results page after voting
      navigate(`/results/${id}`);
    } catch (err) {
      console.error('Error voting:', err);
      setError('Failed to submit vote');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (!poll) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-2 text-lg font-medium text-gray-900">Poll not found</h2>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">{poll.title}</h1>
            <p className="text-gray-600 mb-6">{poll.description}</p>

            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {poll.user_vote ? (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">You have already voted in this poll.</p>
                <button
                  onClick={() => navigate(`/results/${id}`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <BarChart3 className="h-5 w-5 mr-2" />
                  View Results
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  {poll.options.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="poll-option"
                        value={option.id}
                        checked={selectedOption === option.id}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-3 text-gray-900">{option.option_text}</span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={handleVote}
                  disabled={voting || !selectedOption}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {voting && <Loader2 className="animate-spin h-5 w-5 mr-2" />}
                  {voting ? 'Submitting Vote...' : 'Submit Vote'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}