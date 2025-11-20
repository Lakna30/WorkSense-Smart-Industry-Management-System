import React from 'react';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash, HiOutlineArchive, HiOutlineClock, HiOutlineTag } from 'react-icons/hi';

export default function TaskCard({ 
  task, 
  onEdit, 
  getPriorityColor, 
  getStatusColor, 
  formatDate 
}) {
  const getChecklistProgress = (checklist) => {
    if (!checklist || checklist.length === 0) return 0;
    const completed = checklist.filter(item => item.completed).length;
    return Math.round((completed / checklist.length) * 100);
  };

  const progress = getChecklistProgress(task.checklist);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
            {task.title}
          </h3>
          {task.category && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
              <HiOutlineTag className="w-4 h-4" />
              {task.category}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => onEdit(task)}
            className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
            title="Edit task"
          >
            <HiOutlinePencil className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {task.description}
        </p>
      )}

      {/* Status and Priority */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
          {task.status.replace('_', ' ')}
        </span>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </div>

      {/* Due Date */}
      {task.due_date && (
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
          <HiOutlineClock className="w-4 h-4" />
          <span className={task.due_date < new Date().toISOString().split('T')[0] ? 'text-red-600' : ''}>
            {formatDate(task.due_date)}
          </span>
        </div>
      )}

      {/* Checklist Progress */}
      {task.checklist && task.checklist.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Checklist Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {task.checklist.filter(item => item.completed).length} of {task.checklist.length} completed
          </div>
        </div>
      )}

      {/* Attachments */}
      {task.attachments && task.attachments.length > 0 && (
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">Attachments ({task.attachments.length})</div>
          <div className="flex flex-wrap gap-1">
            {task.attachments.slice(0, 3).map((attachment, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {attachment.name}
              </span>
            ))}
            {task.attachments.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{task.attachments.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {task.notes && (
        <div className="text-sm text-gray-500 italic mb-4 line-clamp-2">
          "{task.notes}"
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-400">
          Created {new Date(task.created_at).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {/* View task details */}}
            className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
            title="View details"
          >
            <HiOutlineEye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
