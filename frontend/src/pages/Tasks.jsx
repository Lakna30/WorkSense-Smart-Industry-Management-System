import React, { useState, useEffect } from 'react';
import {
  HiOutlinePlus,
  HiOutlineFilter,
  HiOutlineSearch,
  HiOutlineDownload,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCalendar,
  HiOutlineFlag,
  HiOutlineTag
} from 'react-icons/hi';
import useTaskStore from '../lib/taskStore.js';
import TaskForm from '../components/ui/TaskForm.jsx';
import TaskStats from '../components/ui/TaskStats.jsx';
import { exportTasksToPDF } from '../utils/pdfExport.js';

export default function Tasks() {
  const {
    tasks,
    stats,
    isLoading,
    error,
    filters,
    pagination,
    fetchTasks,
    fetchTaskStats,
    setFilters,
    setPagination,
    clearError,
    createTask,
    updateTask,
    deleteTask
  } = useTaskStore();

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickAddError, setQuickAddError] = useState('');
  const [quickAddLoading, setQuickAddLoading] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchTaskStats();
  }, [fetchTasks, fetchTaskStats]);

  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value });
    setPagination({ page: 1 });
    fetchTasks({ page: 1, [key]: value });
  };

  const handleSearch = () => {
    setFilters({ search: searchTerm });
    setPagination({ page: 1 });
    fetchTasks({ page: 1, search: searchTerm });
  };

  const handlePageChange = (page) => {
    setPagination({ page });
    fetchTasks({ page });
  };

  const handleQuickAdd = async () => {
    if (!quickTaskTitle.trim()) {
      setQuickAddError('Please enter a task title.');
      return;
    }

    setQuickAddError('');
    setQuickAddLoading(true);

    try {
      await createTask({
        title: quickTaskTitle.trim(),
        status: 'pending',
        priority: 'medium'
      });
      setQuickTaskTitle('');
      fetchTaskStats();
    } catch (error) {
      console.error('Error creating task:', error);
      setQuickAddError('Unable to create task. Please try again.');
    } finally {
      setQuickAddLoading(false);
    }
  };

  const handleToggleComplete = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    setUpdatingTaskId(task.id);

    try {
      await updateTask(task.id, { status: nextStatus });
      fetchTaskStats();
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleExportPDF = async () => {
    try {
      await exportTasksToPDF(tasks, stats);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const handleCloseForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleDeleteTask = async (taskId) => {
    const confirmed = window.confirm('Are you sure you want to delete this task? This action cannot be undone.');
    if (!confirmed) return;

    setDeletingTaskId(taskId);
    try {
      await deleteTask(taskId);
      fetchTaskStats();
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setDeletingTaskId(null);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-gray-600 bg-gray-100 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'cancelled':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  const isInitialLoad = isLoading && tasks.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
              <p className="text-gray-600 mt-1">
                Organize and track your tasks with custom checklists
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <HiOutlineDownload className="w-4 h-4" />
                Export PDF
              </button>
              <button
                onClick={handleCreateTask}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <HiOutlinePlus className="w-4 h-4" />
                New Task
              </button>
            </div>
          </div>
        </div>

        {/* Task Statistics */}
        <TaskStats stats={stats} />

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[220px]">
              <div className="relative">
                <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Quick Add */}
            <div className="flex-1 min-w-[220px] flex gap-2">
              <input
                type="text"
                placeholder="Quick add a task..."
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <button
                onClick={handleQuickAdd}
                disabled={quickAddLoading}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {quickAddLoading ? 'Adding...' : 'Add'}
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <HiOutlineFilter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {quickAddError && (
            <p className="mt-3 text-sm text-red-500">{quickAddError}</p>
          )}

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={filters.priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    <option value="Documentation">Documentation</option>
                    <option value="HR">HR</option>
                    <option value="Security">Security</option>
                    <option value="Development">Development</option>
                    <option value="Performance">Performance</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleSearch}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
            <button
              onClick={clearError}
              className="ml-2 text-red-500 hover:text-red-700 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tasks List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Todo List</h2>
            {isLoading && tasks.length > 0 && (
              <span className="text-xs text-gray-500">Refreshing…</span>
            )}
          </div>

          {isInitialLoad ? (
            <div className="divide-y divide-gray-200">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="px-6 py-4 flex items-start gap-4 animate-pulse">
                  <div className="h-5 w-5 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="px-6 py-16 text-center text-gray-500">
              <p className="text-lg font-medium text-gray-900 mb-2">No tasks yet</p>
              <p className="mb-6">
                {searchTerm || filters.status || filters.priority || filters.category
                  ? 'Try adjusting your search and filter settings.'
                  : 'Add tasks using the quick add field or create a detailed task.'}
              </p>
              <button
                onClick={handleCreateTask}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <HiOutlinePlus className="w-4 h-4" />
                Create Task
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {tasks.map((task) => {
                const isCompleted = task.status === 'completed';
                const checklistTotal = task.checklist?.length || 0;
                const checklistComplete = task.checklist?.filter(item => item.completed).length || 0;

                return (
                  <div
                    key={task.id}
                    className="px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:gap-6"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => handleToggleComplete(task)}
                        disabled={updatingTaskId === task.id || deletingTaskId === task.id}
                        className="mt-1 h-5 w-5 text-red-500 border-gray-300 rounded focus:ring-red-500"
                      />

                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                          <h3
                            className={`text-base font-semibold ${
                              isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'
                            }`}
                          >
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}
                            >
                              {task.status.replace('_', ' ')}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}
                            >
                              <HiOutlineFlag className="w-3 h-3" />
                              <span className="capitalize">{task.priority}</span>
                            </span>
                          </div>
                        </div>

                        {task.description && (
                          <p
                            className={`text-sm ${
                              isCompleted ? 'text-gray-400 line-through' : 'text-gray-600'
                            }`}
                          >
                            {task.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <HiOutlineCalendar className="w-4 h-4" />
                            {task.due_date ? formatDate(task.due_date) : 'No due date'}
                          </span>

                          {task.category && (
                            <span className="inline-flex items-center gap-1">
                              <HiOutlineTag className="w-4 h-4" />
                              {task.category}
                            </span>
                          )}

                          {checklistTotal > 0 && (
                            <span>
                              Checklist {checklistComplete}/{checklistTotal}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-center">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
                        title="Edit task"
                      >
                        <HiOutlinePencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        disabled={deletingTaskId === task.id}
                        className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Delete task"
                      >
                        <HiOutlineTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} tasks
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {pagination.page} of {pagination.pages}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
