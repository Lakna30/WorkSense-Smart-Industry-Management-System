import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from './api.js';

const useTaskStore = create(
  persist(
    (set, get) => ({
      // State
      tasks: [],
      currentTask: null,
      stats: {
        total: 0,
        pending: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
        overdue: 0
      },
      isLoading: false,
      error: null,
      filters: {
        status: '',
        priority: '',
        category: '',
        search: ''
      },
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      },

      // Actions
      setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
      
      setPagination: (pagination) => set({ pagination: { ...get().pagination, ...pagination } }),

      // Fetch tasks
      fetchTasks: async (params = {}) => {
        set({ isLoading: true, error: null });
        
        try {
          const { filters, pagination } = get();
          const queryParams = new URLSearchParams({
            page: pagination.page.toString(),
            limit: pagination.limit.toString(),
            ...filters,
            ...params
          });

          const response = await api.get(`/tasks?${queryParams}`);
          const { tasks, pagination: newPagination } = response.data;
          
          set({
            tasks,
            pagination: newPagination,
            isLoading: false
          });
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to fetch tasks',
            isLoading: false
          });
        }
      },

      // Fetch task by ID
      fetchTaskById: async (taskId) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.get(`/tasks/${taskId}`);
          set({
            currentTask: response.data.task,
            isLoading: false
          });
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to fetch task',
            isLoading: false
          });
        }
      },

      // Fetch task statistics
      fetchTaskStats: async () => {
        try {
          const response = await api.get('/tasks/stats');
          set({ stats: response.data.stats });
        } catch (error) {
          console.error('Failed to fetch task stats:', error);
        }
      },

      // Create task
      createTask: async (taskData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post('/tasks', taskData);
          set(state => ({
            tasks: [response.data.task, ...state.tasks],
            isLoading: false
          }));
          return response.data.task;
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to create task',
            isLoading: false
          });
          throw error;
        }
      },

      // Update task
      updateTask: async (taskId, taskData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.put(`/tasks/${taskId}`, taskData);
          set(state => ({
            tasks: state.tasks.map(task => 
              task.id === taskId ? response.data.task : task
            ),
            currentTask: state.currentTask?.id === taskId ? response.data.task : state.currentTask,
            isLoading: false
          }));
          return response.data.task;
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to update task',
            isLoading: false
          });
          throw error;
        }
      },

      // Delete task
      deleteTask: async (taskId) => {
        try {
          await api.delete(`/tasks/${taskId}`);
          set(state => ({
            tasks: state.tasks.filter(task => task.id !== taskId),
            currentTask: state.currentTask?.id === taskId ? null : state.currentTask
          }));
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to delete task' });
          throw error;
        }
      },

      // Archive task
      archiveTask: async (taskId) => {
        try {
          await api.patch(`/tasks/${taskId}/archive`);
          set(state => ({
            tasks: state.tasks.filter(task => task.id !== taskId),
            currentTask: state.currentTask?.id === taskId ? null : state.currentTask
          }));
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to archive task' });
          throw error;
        }
      },

      // Update checklist item
      updateChecklistItem: async (taskId, itemId, completed) => {
        try {
          const response = await api.patch(`/tasks/${taskId}/checklist`, {
            itemId,
            completed
          });
          
          set(state => ({
            tasks: state.tasks.map(task => 
              task.id === taskId 
                ? { ...task, checklist: response.data.checklist }
                : task
            ),
            currentTask: state.currentTask?.id === taskId 
              ? { ...state.currentTask, checklist: response.data.checklist }
              : state.currentTask
          }));
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to update checklist item' });
          throw error;
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Reset store
      reset: () => set({
        tasks: [],
        currentTask: null,
        stats: {
          total: 0,
          pending: 0,
          in_progress: 0,
          completed: 0,
          cancelled: 0,
          overdue: 0
        },
        isLoading: false,
        error: null,
        filters: {
          status: '',
          priority: '',
          category: '',
          search: ''
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0
        }
      })
    }),
    {
      name: 'task-store',
      partialize: (state) => ({
        filters: state.filters
      })
    }
  )
);

export default useTaskStore;
