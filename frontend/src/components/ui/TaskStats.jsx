import React from 'react';
import { HiOutlineClipboardList, HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineExclamation } from 'react-icons/hi';

export default function TaskStats({ tasks = [] }) {
  // Calculate stats from tasks data
  const stats = {
    total: tasks.length,
    pending: tasks.filter(task => task.status === 'Pending').length,
    in_progress: tasks.filter(task => task.status === 'In Progress').length,
    completed: tasks.filter(task => task.status === 'Completed').length,
    cancelled: tasks.filter(task => task.status === 'Cancelled').length,
    overdue: tasks.filter(task => {
      if (task.status === 'Completed' || task.status === 'Cancelled') return false;
      if (!task.deadline) return false;
      return new Date(task.deadline) < new Date();
    }).length
  };

  const statItems = [
    {
      label: 'Total Tasks',
      value: stats.total,
      icon: HiOutlineClipboardList,
      color: 'text-blue-600 bg-blue-100',
      borderColor: 'border-blue-200'
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: HiOutlineClock,
      color: 'text-yellow-600 bg-yellow-100',
      borderColor: 'border-yellow-200'
    },
    {
      label: 'In Progress',
      value: stats.in_progress,
      icon: HiOutlineExclamation,
      color: 'text-blue-600 bg-blue-100',
      borderColor: 'border-blue-200'
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: HiOutlineCheckCircle,
      color: 'text-green-600 bg-green-100',
      borderColor: 'border-green-200'
    },
    {
      label: 'Cancelled',
      value: stats.cancelled,
      icon: HiOutlineXCircle,
      color: 'text-red-600 bg-red-100',
      borderColor: 'border-red-200'
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      icon: HiOutlineExclamation,
      color: 'text-red-600 bg-red-100',
      borderColor: 'border-red-200'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className={`bg-white rounded-xl shadow-sm border ${item.borderColor} p-4`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}