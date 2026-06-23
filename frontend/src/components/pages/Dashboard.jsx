import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatsCard from '../components/StatsCard';
import ProjectCard from '../components/ProjectCard';

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, in_progress: 0 });
  const [schedule, setSchedule] = useState([]);
  const [aiStats, setAiStats] = useState({ total: 0, avg_score: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, scheduleRes, aiStatsRes] = await Promise.all([
        api.get('/projects'),
        api.post('/schedule/generate', { date: new Date().toISOString(), available_hours: 11 }),
        api.get('/ai-guard/stats'),
      ]);

      setProjects(projectsRes.data.projects || []);
      setStats(projectsRes.data.stats || { total: 0, completed: 0, in_progress: 0 });
      setSchedule(scheduleRes.data.schedule || []);
      setAiStats(aiStatsRes.data || { total: 0, avg_score: 0 });
    } catch (error) {
      toast.error('Failed to load dashboard');
    }
    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;

  const pendingCount = projects.filter(p => p.status !== 'submitted').length;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">📊 Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Total Projects" value={stats.total} icon="📁" />
        <StatsCard title="Completed" value={stats.completed} icon="✅" color="green" />
        <StatsCard title="In Progress" value={stats.in_progress} icon="🔄" color="yellow" />
        <StatsCard title="Pending" value={pendingCount} icon="⏳" color="teal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📋 Active Projects</h2>
            {projects.filter(p => p.status !== 'submitted').length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-700">No active projects</h3>
                <p className="text-gray-500 mt-2">Add your first project to start tracking.</p>
                <Link to="/projects" className="mt-4 inline-block btn-primary">
                  + Add Project
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.filter(p => p.status !== 'submitted').map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">📅 Today's Schedule</h2>
            {schedule.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No tasks scheduled</p>
            ) : (
              <div className="space-y-3">
                {schedule.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">{item.time}</span>
                    <span className="text-sm">{item.task}</span>
                    <span className="text-xs text-gray-400">{item.estimated}</span>
                  </div>
                ))}
              </div>
            )}
            <Link to="/schedule" className="mt-4 text-primary hover:underline text-sm block text-center">
              View full schedule →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">🤖 AI Guard</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{aiStats.total || 0}</p>
                <p className="text-sm text-gray-500">Checks run</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${(aiStats.avg_score || 0) < 30 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {(aiStats.avg_score || 0).toFixed(0)}%
                </p>
                <p className="text-sm text-gray-500">Average score</p>
              </div>
            </div>
            <Link to="/ai-guard" className="mt-4 btn-primary w-full text-center block">
              Test Your Writing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;