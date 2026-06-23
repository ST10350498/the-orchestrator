import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data.project);
      setTasks(response.data.tasks || []);
    } catch (error) {
      toast.error('Project not found');
      navigate('/projects');
    }
    setLoading(false);
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      const response = await api.post(`/projects/${id}/tasks`, { title: newTask, estimated_minutes: 60 });
      setTasks([...tasks, response.data]);
      setNewTask('');
      toast.success('Task added');
    } catch (error) {
      toast.error('Failed to add task');
    }
  };

  const toggleTask = async (taskId, completed) => {
    try {
      const response = await api.put(`/projects/tasks/${taskId}`, { completed: !completed });
      setTasks(tasks.map(t => t.id === taskId ? response.data : t));
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/projects/tasks/${taskId}`);
      setTasks(tasks.filter(t => t.id !== taskId));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const updateStatus = async (status) => {
    try {
      const response = await api.put(`/projects/${id}`, { status });
      setProject({ ...project, status });
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!project) return <div>Project not found</div>;

  const progress = project.hours_estimated > 0
    ? Math.min(100, Math.round(((project.hours_spent || 0) / project.hours_estimated) * 100))
    : 0;

  const statusOptions = ['not_started', 'in_progress', 'submitted'];
  const statusLabels = { not_started: 'Not Started', in_progress: 'In Progress', submitted: 'Submitted' };

  return (
    <div>
      <button onClick={() => navigate('/projects')} className="text-primary hover:underline mb-4">
        ← Back to Projects
      </button>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <p className="text-gray-500">{project.code} • {project.type}</p>
          </div>
          <div className="flex gap-2">
            {statusOptions.map(s => (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                className={`px-3 py-1 rounded text-sm ${project.status === s ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
              >
                {statusLabels[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div>
            <p className="text-sm text-gray-500">Due Date</p>
            <p className="font-medium">{project.due_date ? new Date(project.due_date).toLocaleDateString() : 'No deadline'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Hours</p>
            <p className="font-medium">{project.hours_spent || 0} / {project.hours_estimated || 0} hrs</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Progress</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-xs text-gray-400 mt-1">{progress}% complete</p>
          </div>
        </div>
        {project.next_action && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">📌 Next: {project.next_action}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">✅ Tasks</h2>
        <form onSubmit={addTask} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="input flex-1"
            placeholder="Add a task..."
          />
          <button type="submit" className="btn-primary">Add</button>
        </form>
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No tasks yet. Add one above.</p>
        ) : (
          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id, task.completed)}
                  className="w-4 h-4 accent-primary"
                />
                <span className={`flex-1 ${task.completed ? 'line-through text-gray-400' : ''}`}>
                  {task.title}
                </span>
                <span className="text-xs text-gray-400">{task.estimated_minutes || 60}m</span>
                <button onClick={() => deleteTask(task.id)} className="text-red-500 text-sm">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectDetail;