import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

function Settings() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [hours, setHours] = useState({ weekdays: [], weekends: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setStudentNumber(user.student_number || '');
    }
    fetchHours();
  }, [user]);

  const fetchHours = async () => {
    try {
      const response = await api.get('/users/hours');
      if (response.data.hours) {
        setHours(response.data.hours);
      }
    } catch (error) {
      console.error('Failed to fetch hours');
    }
    setLoading(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/users/profile', { name, student_number: studentNumber });
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Failed to update profile');
    }
    setSaving(false);
  };

  const saveHours = async () => {
    setSaving(true);
    try {
      await api.post('/users/hours', hours);
      toast.success('Hours updated');
    } catch (error) {
      toast.error('Failed to update hours');
    }
    setSaving(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">⚙️ Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Student Number</label>
              <input
                type="text"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" value={user?.email || ''} className="input bg-gray-100" disabled />
            </div>
            <button onClick={saveProfile} disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Available Hours</h2>
          <div className="space-y-4">
            <div>
              <label className="label font-semibold">Weekdays</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="time"
                  value={hours.weekdays?.[0]?.start || '08:30'}
                  onChange={(e) => setHours({
                    ...hours,
                    weekdays: [{ ...hours.weekdays?.[0] || { start: '08:30', end: '15:30' }, start: e.target.value }, hours.weekdays?.[1] || { start: '20:00', end: '23:59' }]
                  })}
                  className="input"
                />
                <input
                  type="time"
                  value={hours.weekdays?.[0]?.end || '15:30'}
                  onChange={(e) => setHours({
                    ...hours,
                    weekdays: [{ ...hours.weekdays?.[0] || { start: '08:30', end: '15:30' }, end: e.target.value }, hours.weekdays?.[1] || { start: '20:00', end: '23:59' }]
                  })}
                  className="input"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <input
                  type="time"
                  value={hours.weekdays?.[1]?.start || '20:00'}
                  onChange={(e) => setHours({
                    ...hours,
                    weekdays: [hours.weekdays?.[0] || { start: '08:30', end: '15:30' }, { ...hours.weekdays?.[1] || { start: '20:00', end: '23:59' }, start: e.target.value }]
                  })}
                  className="input"
                />
                <input
                  type="time"
                  value={hours.weekdays?.[1]?.end || '23:59'}
                  onChange={(e) => setHours({
                    ...hours,
                    weekdays: [hours.weekdays?.[0] || { start: '08:30', end: '15:30' }, { ...hours.weekdays?.[1] || { start: '20:00', end: '23:59' }, end: e.target.value }]
                  })}
                  className="input"
                />
              </div>
            </div>
            <div>
              <label className="label font-semibold">Weekends</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="time"
                  value={hours.weekends?.[0]?.start || '04:00'}
                  onChange={(e) => setHours({
                    ...hours,
                    weekends: [{ ...hours.weekends?.[0] || { start: '04:00', end: '07:00' }, start: e.target.value }, hours.weekends?.[1] || { start: '20:00', end: '23:59' }]
                  })}
                  className="input"
                />
                <input
                  type="time"
                  value={hours.weekends?.[0]?.end || '07:00'}
                  onChange={(e) => setHours({
                    ...hours,
                    weekends: [{ ...hours.weekends?.[0] || { start: '04:00', end: '07:00' }, end: e.target.value }, hours.weekends?.[1] || { start: '20:00', end: '23:59' }]
                  })}
                  className="input"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <input
                  type="time"
                  value={hours.weekends?.[1]?.start || '20:00'}
                  onChange={(e) => setHours({
                    ...hours,
                    weekends: [hours.weekends?.[0] || { start: '04:00', end: '07:00' }, { ...hours.weekends?.[1] || { start: '20:00', end: '23:59' }, start: e.target.value }]
                  })}
                  className="input"
                />
                <input
                  type="time"
                  value={hours.weekends?.[1]?.end || '23:59'}
                  onChange={(e) => setHours({
                    ...hours,
                    weekends: [hours.weekends?.[0] || { start: '04:00', end: '07:00' }, { ...hours.weekends?.[1] || { start: '20:00', end: '23:59' }, end: e.target.value }]
                  })}
                  className="input"
                />
              </div>
            </div>
            <button onClick={saveHours} disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving...' : 'Save Hours'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;