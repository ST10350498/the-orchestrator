import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function Onboarding() {
  const navigate = useNavigate();
  const { setOnboardingComplete } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');

  const [hours, setHours] = useState({
    weekdays: [{ start: '08:30', end: '15:30' }, { start: '20:00', end: '23:59' }],
    weekends: [{ start: '04:00', end: '07:00' }, { start: '20:00', end: '23:59' }],
  });

  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState({
    title: '',
    code: '',
    due_date: '',
    type: 'assignment',
    hours_estimated: '',
  });

  const [preferences] = useState({
    targetScore: 20,
    alertThreshold: 40,
    autoHumanize: true,
    weeklyReportDay: 'Sunday',
  });

  const addProject = () => {
    if (!currentProject.title) {
      toast.error('Please enter a project title');
      return;
    }
    setProjects([...projects, { ...currentProject, hours_estimated: parseInt(currentProject.hours_estimated) || 0 }]);
    setCurrentProject({ title: '', code: '', due_date: '', type: 'assignment', hours_estimated: '' });
    toast.success('Project added');
  };

  const removeProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const saveOnboarding = async () => {
    setLoading(true);
    try {
      await api.put('/users/profile', { name, student_number: studentNumber });
      await api.post('/users/hours', { weekdays: hours.weekdays, weekends: hours.weekends });

      for (const project of projects) {
        await api.post('/projects', project);
      }

      await api.post('/users/onboarding/complete');

      toast.success('🎉 Welcome to The Orchestrator!');
      setOnboardingComplete();
      navigate('/dashboard');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
      console.error(error);
    }
    setLoading(false);
  };

  const totalSteps = 4;
  const progress = ((step - 1) / totalSteps) * 100;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-2">Who are you?</h2>
            <p className="text-gray-500 mb-6">Tell me a bit about yourself so I can personalize your experience.</p>
            <div className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="e.g., Kgopotso Sereme"
                />
              </div>
              <div>
                <label className="label">Student Number</label>
                <input
                  type="text"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  className="input"
                  placeholder="e.g., ST10350498"
                />
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!name.trim() || !studentNumber.trim()}
                className="btn-primary w-full py-3 disabled:opacity-50"
              >
                Continue →
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-2">When do you work?</h2>
            <p className="text-gray-500 mb-6">I'll never schedule work outside these hours.</p>
            <div className="space-y-6">
              <div>
                <label className="label font-semibold">Weekdays</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="time"
                    value={hours.weekdays[0].start}
                    onChange={(e) => setHours({
                      ...hours,
                      weekdays: [{ ...hours.weekdays[0], start: e.target.value }, hours.weekdays[1]]
                    })}
                    className="input"
                  />
                  <input
                    type="time"
                    value={hours.weekdays[0].end}
                    onChange={(e) => setHours({
                      ...hours,
                      weekdays: [{ ...hours.weekdays[0], end: e.target.value }, hours.weekdays[1]]
                    })}
                    className="input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <input
                    type="time"
                    value={hours.weekdays[1].start}
                    onChange={(e) => setHours({
                      ...hours,
                      weekdays: [hours.weekdays[0], { ...hours.weekdays[1], start: e.target.value }]
                    })}
                    className="input"
                  />
                  <input
                    type="time"
                    value={hours.weekdays[1].end}
                    onChange={(e) => setHours({
                      ...hours,
                      weekdays: [hours.weekdays[0], { ...hours.weekdays[1], end: e.target.value }]
                    })}
                    className="input"
                  />
                </div>
              </div>
              <div>
                <label className="label font-semibold">Weekends</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="time"
                    value={hours.weekends[0].start}
                    onChange={(e) => setHours({
                      ...hours,
                      weekends: [{ ...hours.weekends[0], start: e.target.value }, hours.weekends[1]]
                    })}
                    className="input"
                  />
                  <input
                    type="time"
                    value={hours.weekends[0].end}
                    onChange={(e) => setHours({
                      ...hours,
                      weekends: [{ ...hours.weekends[0], end: e.target.value }, hours.weekends[1]]
                    })}
                    className="input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <input
                    type="time"
                    value={hours.weekends[1].start}
                    onChange={(e) => setHours({
                      ...hours,
                      weekends: [hours.weekends[0], { ...hours.weekends[1], start: e.target.value }]
                    })}
                    className="input"
                  />
                  <input
                    type="time"
                    value={hours.weekends[1].end}
                    onChange={(e) => setHours({
                      ...hours,
                      weekends: [hours.weekends[0], { ...hours.weekends[1], end: e.target.value }]
                    })}
                    className="input"
                  />
                </div>
              </div>
              <button
                onClick={() => setStep(3)}
                className="btn-primary w-full py-3"
              >
                Continue →
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-2">What are you working on?</h2>
            <p className="text-gray-500 mb-6">Add your current modules and assignments.</p>
            <div className="space-y-4">
              <div>
                <label className="label">Project Title</label>
                <input
                  type="text"
                  value={currentProject.title}
                  onChange={(e) => setCurrentProject({ ...currentProject, title: e.target.value })}
                  className="input"
                  placeholder="e.g., CLDV6211 POE"
                />
              </div>
              <div>
                <label className="label">Module Code</label>
                <input
                  type="text"
                  value={currentProject.code}
                  onChange={(e) => setCurrentProject({ ...currentProject, code: e.target.value })}
                  className="input"
                  placeholder="e.g., CLDV-POE"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Type</label>
                  <select
                    value={currentProject.type}
                    onChange={(e) => setCurrentProject({ ...currentProject, type: e.target.value })}
                    className="input"
                  >
                    <option value="assignment">Assignment</option>
                    <option value="exam">Exam</option>
                    <option value="project">Project</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
                <div>
                  <label className="label">Due Date</label>
                  <input
                    type="date"
                    value={currentProject.due_date}
                    onChange={(e) => setCurrentProject({ ...currentProject, due_date: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              <div>
                <label className="label">Estimated Hours</label>
                <input
                  type="number"
                  value={currentProject.hours_estimated}
                  onChange={(e) => setCurrentProject({ ...currentProject, hours_estimated: e.target.value })}
                  className="input"
                  placeholder="e.g., 20"
                />
              </div>
              <button
                onClick={addProject}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition"
              >
                + Add Project
              </button>
            </div>
            {projects.length > 0 && (
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Added ({projects.length}):</p>
                {projects.map((p, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                    <span className="text-sm">{p.title}</span>
                    <button onClick={() => removeProject(i)} className="text-red-500 text-sm">✕</button>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setStep(4)}
              className="mt-4 btn-primary w-full py-3"
            >
              Continue →
            </button>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-2">How strict should I be?</h2>
            <p className="text-gray-500 mb-6">Set your AI Guard preferences.</p>
            <div className="space-y-6">
              <div>
                <label className="label">Target AI Score</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={preferences.targetScore}
                    onChange={() => {}}
                    className="w-full"
                  />
                  <span className="text-primary font-medium min-w-12">{preferences.targetScore}%</span>
                </div>
                <p className="text-xs text-gray-400">Lower = safer, but harder to achieve</p>
              </div>
              <div>
                <label className="label">Alert Threshold</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="20"
                    max="60"
                    value={preferences.alertThreshold}
                    onChange={() => {}}
                    className="w-full"
                  />
                  <span className="text-yellow-600 font-medium min-w-12">{preferences.alertThreshold}%</span>
                </div>
                <p className="text-xs text-gray-400">You'll be alerted if score exceeds this</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={preferences.autoHumanize}
                  onChange={() => {}}
                  className="w-4 h-4 accent-primary"
                />
                <label className="text-sm text-gray-700">Automatically humanize text above threshold</label>
              </div>
              <div>
                <label className="label">Weekly Report Day</label>
                <select
                  value={preferences.weeklyReportDay}
                  onChange={() => {}}
                  className="input"
                >
                  <option>Sunday</option>
                  <option>Monday</option>
                  <option>Tuesday</option>
                  <option>Wednesday</option>
                  <option>Thursday</option>
                  <option>Friday</option>
                  <option>Saturday</option>
                </select>
              </div>
              <button
                onClick={saveOnboarding}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition w-full disabled:opacity-50"
              >
                {loading ? 'Setting up...' : '🚀 Start The Orchestrator'}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary">🎼 The Orchestrator</h1>
          <span className="text-sm text-gray-400">Step {step} of {totalSteps}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
        {renderStep()}
      </div>
    </div>
  );
}

export default Onboarding;