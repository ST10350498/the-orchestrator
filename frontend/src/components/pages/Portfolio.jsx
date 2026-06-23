import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

function Portfolio() {
  const [entries, setEntries] = useState([]);
  const [bullets, setBullets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await api.get('/portfolio');
      setEntries(response.data || []);
      const bulletsRes = await api.get('/portfolio/export');
      setBullets(bulletsRes.data.cv_bullets || []);
    } catch (error) {
      toast.error('Failed to load portfolio');
    }
    setLoading(false);
  };

  const copyAllBullets = () => {
    const text = bullets.join('\n');
    navigator.clipboard.writeText(text);
    toast.success(`${bullets.length} bullets copied to clipboard`);
  };

  const deleteEntry = async (id) => {
    if (!confirm('Delete this portfolio entry?')) return;
    try {
      await api.delete(`/portfolio/${id}`);
      setEntries(entries.filter(e => e.id !== id));
      toast.success('Entry deleted');
    } catch (error) {
      toast.error('Failed to delete entry');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">📝 Portfolio</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Portfolio Entries</h2>
              {bullets.length > 0 && (
                <button onClick={copyAllBullets} className="btn-primary">
                  📋 Copy All ({bullets.length})
                </button>
              )}
            </div>
            {entries.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No portfolio entries yet.</p>
                <p className="text-sm text-gray-400 mt-1">Complete projects to generate portfolio entries.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map(entry => (
                  <div key={entry.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{entry.project_title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{entry.content}</p>
                        {entry.bullet_point && (
                          <div className="mt-2 p-2 bg-blue-50 rounded">
                            <p className="text-sm text-blue-700">📌 CV: {entry.bullet_point}</p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">📌 CV Bullets</h2>
            {bullets.length === 0 ? (
              <p className="text-gray-500 text-sm">No CV bullets yet.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {bullets.map((bullet, i) => (
                  <div key={i} className="p-2 bg-gray-50 rounded text-sm">
                    <button
                      onClick={() => navigator.clipboard.writeText(bullet)}
                      className="float-right text-xs text-primary hover:underline"
                    >
                      📋
                    </button>
                    {bullet}
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-4">Click the 📋 icon to copy individual bullets.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Portfolio;