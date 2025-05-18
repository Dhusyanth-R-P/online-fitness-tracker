import React from 'react';
import { useParams } from 'react-router-dom';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export default function Results() {
  const { id } = useParams();
  const supabase = useSupabaseClient();
  const [pollData, setPollData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchPollResults() {
      if (!id) return;

      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .select(`
          *,
          options (
            id,
            option_text,
            votes (count)
          )
        `)
        .eq('id', id)
        .single();

      if (!pollError && poll) {
        setPollData(poll);
      }
      setLoading(false);
    }

    fetchPollResults();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading results...</div>
      </div>
    );
  }

  if (!pollData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Poll not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{pollData.title}</h1>
          <p className="text-gray-600 mb-6">{pollData.description}</p>
          
          <div className="space-y-4">
            {pollData.options?.map((option: any) => {
              const voteCount = option.votes?.[0]?.count || 0;
              const totalVotes = pollData.options.reduce((acc: number, curr: any) => 
                acc + (curr.votes?.[0]?.count || 0), 0
              );
              const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
              
              return (
                <div key={option.id} className="bg-gray-50 rounded p-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-700">{option.option_text}</span>
                    <span className="text-gray-600">{voteCount} votes ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}