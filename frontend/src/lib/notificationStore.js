import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from './api.js';

const useNotificationStore = create(
  persist(
    (set, get) => ({
      // State
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      filters: {
        type: '',
        priority: '',
        is_read: ''
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

      // Fetch notifications
      fetchNotifications: async (params = {}) => {
        set({ isLoading: true, error: null });
        
        try {
          const { filters, pagination } = get();
          const queryParams = new URLSearchParams({
            page: pagination.page.toString(),
            limit: pagination.limit.toString(),
            ...filters,
            ...params
          });

          const response = await api.get(`/notifications?${queryParams}`);
          const { notifications, pagination: newPagination } = response.data;
          
          set({
            notifications,
            pagination: newPagination,
            isLoading: false
          });
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to fetch notifications',
            isLoading: false
          });
        }
      },

      // Fetch unread count
      fetchUnreadCount: async () => {
        try {
          const response = await api.get('/notifications/unread-count');
          set({ unreadCount: response.data.unreadCount });
        } catch (error) {
          console.error('Failed to fetch unread count:', error);
        }
      },

      // Mark notification as read
      markAsRead: async (notificationId) => {
        try {
          await api.patch(`/notifications/${notificationId}/read`);
          
          set(state => ({
            notifications: state.notifications.map(notification =>
              notification.id === notificationId
                ? { ...notification, is_read: true, read_at: new Date().toISOString() }
                : notification
            ),
            unreadCount: Math.max(0, state.unreadCount - 1)
          }));
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to mark notification as read' });
        }
      },

      // Mark all notifications as read
      markAllAsRead: async () => {
        try {
          await api.patch('/notifications/mark-all-read');
          
          set(state => ({
            notifications: state.notifications.map(notification => ({
              ...notification,
              is_read: true,
              read_at: new Date().toISOString()
            })),
            unreadCount: 0
          }));
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to mark all notifications as read' });
        }
      },

      // Archive notification
      archiveNotification: async (notificationId) => {
        try {
          await api.patch(`/notifications/${notificationId}/archive`);
          
          set(state => ({
            notifications: state.notifications.filter(notification => notification.id !== notificationId)
          }));
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to archive notification' });
        }
      },

      // Delete notification
      deleteNotification: async (notificationId) => {
        try {
          await api.delete(`/notifications/${notificationId}`);
          
          set(state => ({
            notifications: state.notifications.filter(notification => notification.id !== notificationId),
            unreadCount: state.notifications.find(n => n.id === notificationId && !n.is_read) 
              ? Math.max(0, state.unreadCount - 1) 
              : state.unreadCount
          }));
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to delete notification' });
        }
      },

      // Add new notification (for real-time updates)
      addNotification: (notification) => {
        set(state => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1
        }));
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Reset store
      reset: () => set({
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        error: null,
        filters: {
          type: '',
          priority: '',
          is_read: ''
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
      name: 'notification-store',
      partialize: (state) => ({
        unreadCount: state.unreadCount,
        filters: state.filters
      })
    }
  )
);

export default useNotificationStore;
