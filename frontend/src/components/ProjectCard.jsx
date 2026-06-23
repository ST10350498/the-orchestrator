import React from 'react';
import { Link } from 'react-router-dom';

function ProjectCard({ project, onDelete }) {
  const getStatusColor = (status) => {
    const colors = {
      submitted: 'bg-green-100 text-green-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      not_started: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.not_started;
  };

  const getRiskColor = (risk) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return colors[risk] || colors.low;
  };

  const getStatusLabel = (status) => {
    const labels = {
      submitted: '✅ Submitted',
      in_progress: '🔄 In Progress',
      not_started: '⏳ Not Started',
    };
    return labels[status] || status;
  };

  const daysLeft = project.due_date
    ? Math.ceil((new Date(project.due_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">{project.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded ${getRiskColor(project.ai_risk)}`}>
              {project.ai_risk === 'low' ? '🟢 Low AI risk' : project.ai_risk === 'medium' ? '🟡 Medium AI risk' : '🔴 High AI risk'}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {project.code} • {project.type}
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className={`px-2 py-0.5 rounded ${getStatusColor(project.status)}`}>
              {getStatusLabel(project.status)}
            </span>
            {daysLeft !== null && (
              <span className={daysLeft < 0 ? 'text-red-600' : 'text-gray-500'}>
                {daysLeft < 0 ? `⏰ ${Math.abs(daysLeft)} days late` : `📅 ${daysLeft} days left`}
              </span>
            )}
            {project.hours_estimated > 0 && (
              <span className="text-gray-500">
                ⏱️ {project.hours_spent || 0}/{project.hours_estimated} hrs
              </span>
            )}
          </div>
          {project.next_action && (
            <p className="text-sm text-gray-500 mt-2">Next: {project.next_action}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/projects/${project.id}`}
            className="text-primary hover:text-primary-dark text-sm font-medium"
          >
            View →
          </Link>
          <button
            onClick={() => onDelete && onDelete(project.id)}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;