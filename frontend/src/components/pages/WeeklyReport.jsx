import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatsCard from '../components/StatsCard';

function WeeklyReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const response = await api.get('/reports/weekly/latest');
      setReport(response.data);
    } catch (error) {
      toast.error('Failed to load weekly report');
    }
    setLoading(false);
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const response = await api.post('/reports/weekly/generate');
      setReport(response.data);
      toast.success('Weekly report generated');
    } catch (error) {
      toast.error('Failed to generate report');
    }
    setGenerating(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📬 Weekly Coaching Report</h1>
        <button onClick={generateReport} disabled={generating} className="btn-primary">
          {generating ? 'Generating...' : '🔄 Generate Report'}
        </button>
      </div>

      {!report ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <div className="text-6xl mb-4">📬</div>
          <h3 className="text-xl font-semibold text-gray-700">No report yet</h3>
          <p className="text-gray-500 mt-2">Click "Generate Report" to get your weekly coaching.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-500">Week of {report.week_start} to {report.week_end}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard title="Completed" value={report.completed?.length || 0} icon="✅" color="green" />
            <StatsCard title="Pending" value={report.pending?.length || 0} icon="⏳" color="yellow" />
            <StatsCard title="AI Checks" value={report.ai_stats?.total_checks || 0} icon="🤖" color="teal" />
          </div>

          {report.completed && report.completed.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">✅ Completed</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {report.completed.map(p => (
                  <li key={p.id}>{p.title}</li>
                ))}
              </ul>
            </div>
          )}

          {report.pending && report.pending.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">⏳ Pending</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {report.pending.map(p => (
                  <li key={p.id}>
                    {p.title}
                    {p.due_date && (
                      <span className="text-sm text-gray-400 ml-2">
                        (due {new Date(p.due_date).toLocaleDateString()})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📊 AI Guard Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{report.ai_stats?.total_checks || 0}</p>
                <p className="text-sm text-gray-500">Total checks</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className={`text-2xl font-bold ${(report.ai_stats?.avg_score || 0) < 30 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {report.ai_stats?.avg_score || 0}%
                </p>
                <p className="text-sm text-gray-500">Average score</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Streak:</span> {report.streak || 0} days active
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">💬 Coach's Note</h2>
            <p className="text-blue-700">
              {(report.ai_stats?.avg_score || 0) < 30
                ? 'Your AI Guard scores are excellent. Keep writing naturally and maintain your current pace.'
                : 'Your AI scores are trending higher. Focus on using contractions, shorter sentences, and adding personal examples to lower your AI detection risk.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default WeeklyReport;