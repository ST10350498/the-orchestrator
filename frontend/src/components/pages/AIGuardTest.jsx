import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

function AIGuardTest() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/ai-guard/history');
      setHistory(response.data.checks || []);
    } catch (error) {
      console.error('Failed to fetch history');
    }
    setHistoryLoading(false);
  };

  const checkAI = async () => {
    if (!inputText.trim()) {
      toast.error('Please paste some text to check');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/ai-guard/check', { text: inputText });
      setResult(response.data);
      fetchHistory();
      toast.success('Analysis complete');
    } catch (error) {
      toast.error('Failed to analyze text');
    }
    setLoading(false);
  };

  const getVerdictColor = (verdict) => {
    if (verdict === 'safe') return 'text-green-600 bg-green-50';
    if (verdict === 'review') return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreColor = (score) => {
    if (score <= 20) return 'text-green-600';
    if (score <= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">🤖 AI Guard</h1>
      <p className="text-gray-600 mb-6">Test your writing for AI detection. Target: below 20% | Alert: above 40%</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <label className="label">Paste your text here:</label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-mono text-sm"
              placeholder="Paste your assignment answer here to check AI probability..."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={checkAI}
                disabled={loading || !inputText.trim()}
                className="btn-primary flex-1 py-3 disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : '🔍 Check AI Score'}
              </button>
              <button
                onClick={() => setInputText('')}
                className="btn-outline px-6"
              >
                Clear
              </button>
            </div>
          </div>

          {result && (
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Results</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-500">AI Score</div>
                  <div className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
                    {result.score}%
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Target: 20% | Alert: 40%</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-500">Verdict</div>
                  <div className={`text-xl font-bold ${getVerdictColor(result.verdict)} px-4 py-2 rounded-lg`}>
                    {result.verdict === 'safe' && '✅ SAFE'}
                    {result.verdict === 'review' && '⚠️ REVIEW'}
                    {result.verdict === 'rewrite' && '❌ REWRITE'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-500">Action</div>
                  <div className="text-lg font-semibold">
                    {result.score <= 20 && '✅ Ready to submit'}
                    {result.score > 20 && result.score <= 40 && '⚠️ Review suggested'}
                    {result.score > 40 && '❌ Rewrite required'}
                  </div>
                </div>
              </div>

              {result.suggestions && result.suggestions.length > 0 && (
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">Suggestions to lower score:</h3>
                  <ul className="list-disc list-inside text-yellow-700 space-y-1">
                    {result.suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.humanized && (
                <div className="p-4 bg-green-50 rounded-lg mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-green-800">✨ Humanized version:</h3>
                    <button
                      onClick={() => copyToClipboard(result.humanized)}
                      className="text-sm bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <p className="text-green-700 whitespace-pre-wrap">{result.humanized}</p>
                </div>
              )}

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Original text:</h3>
                <p className="text-gray-600 whitespace-pre-wrap text-sm">{result.original}</p>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">📊 History</h2>
            {historyLoading ? (
              <LoadingSpinner size="sm" />
            ) : history.length === 0 ? (
              <p className="text-gray-500 text-sm">No checks yet. Test your writing above.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.slice(0, 10).map((check) => (
                  <div key={check.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${getVerdictColor(check.verdict)}`}>
                        {check.score}%
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(check.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 truncate">{check.original_text?.substring(0, 60)}...</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">💡 Tips to keep AI score low:</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
          <li>• Use contractions (don't, can't, won't, it's)</li>
          <li>• Mix short and medium sentences</li>
          <li>• Avoid "The system shall" – use "Users need to be able to"</li>
          <li>• Add personal phrases like "I think" or "From what I understand"</li>
          <li>• Don't use "Furthermore", "Moreover", "Additionally"</li>
          <li>• Vary paragraph length</li>
        </ul>
      </div>
    </div>
  );
}

export default AIGuardTest;