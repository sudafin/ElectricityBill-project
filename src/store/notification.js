import { defineStore } from 'pinia';
import { getNotificationList, createNotification, updateNotification, deleteNotification } from '@/api/notification';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notificationList: [],
    total: 0,
  }),
  actions: {
    async fetchNotificationList(params) {
      const res = await getNotificationList(params);
      this.notificationList = res.data.list;
      this.total = res.data.total;
    },
    async createNotification(data) {
      await createNotification(data);
      this.fetchNotificationList();
    },
    async updateNotification(data) {
      await updateNotification(data);
      this.fetchNotificationList();
    },
    async deleteNotification(id) {
      await deleteNotification(id);
      this.fetchNotificationList();
    },
  },
}); 