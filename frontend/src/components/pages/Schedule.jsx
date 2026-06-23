import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

function Schedule() {
  const [schedule, setSchedule] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [coachNote, setCoachNote] = useState('');
  const [hours, setHours] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await api.post('/schedule/generate', {
        date: new Date().toISOString(),
        available_hours: 11,
      });
      setSchedule(response.data.schedule || []);
      setPredictions(response.data.predictions || []);
      setCoachNote(response.data.coach_note || '');
      setHours(response.data.user_hours);
    } catch (error) {
      toast.error('Failed to generate schedule');
    }
    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;

  const onTime = predictions.filter(p => p.predicted_completion === 'on_time').length;
  const late = predictions.filter(p => p.predicted_completion === 'late').length;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">📅 Schedule</h1>

      {coachNote && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-700">💡 {coachNote}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Today's Plan</h2>
            {schedule.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No tasks scheduled for today.</p>
                <p className="text-sm text-gray-400 mt-1">Add projects and tasks to generate a schedule.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {schedule.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-20 text-sm font-mono text-gray-500">{item.time}</div>
                    <div className="flex-1">
                      <span className="font-medium">{item.task}</span>
                      <span className="text-xs text-gray-400 ml-2">{item.project}</span>
                    </div>
                    <div className="text-sm text-gray-500">{item.estimated}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">📊 Predictions</h2>
            <div className="flex justify-between mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{onTime}</p>
                <p className="text-xs text-gray-500">On track</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{late}</p>
                <p className="text-xs text-gray-500">At risk</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">{predictions.length}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </div>
            <div className="space-y-2">
              {predictions.map((p, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{p.project}</span>
                  <span className={p.predicted_completion === 'on_time' ? 'text-green-600' : 'text-red-600'}>
                    {p.predicted_completion === 'on_time' ? '✅ On track' : '⚠️ Late'}
                  </span>
                </div>
              ))}
              {predictions.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">No active projects to predict</p>
              )}
            </div>
          </div>

          {hours && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">⏰ Your Hours</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Weekdays</p>
                  <p className="text-gray-500">{hours.weekdays?.map(b => `${b.start} - ${b.end}`).join(' • ')}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Weekends</p>
                  <p className="text-gray-500">{hours.weekends?.map(b => `${b.start} - ${b.end}`).join(' • ')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Schedule;