import { defineStore } from 'pinia';
import { fetchReportDataAPI } from '@/api/report';

export const useReportStore = defineStore('report', {
  actions: {
    async fetchReportData({ startDate, endDate }) {
      const { data } = await fetchReportDataAPI({ startDate, endDate });
      return data;
    },
  },
}); 