import { defineStore } from 'pinia';
import { getReconciliationList, getReconciliationDetail, approveReconciliation } from '@/api/reconciliation';

export const useReconciliationStore = defineStore('reconciliation', {
  state: () => ({
    reconciliationList: [],
    total: 0,
    reconciliationDetail: {},
  }),
  actions: {
    async fetchReconciliationList(params) {
      const res = await getReconciliationList(params);
      this.reconciliationList = res.data.list;
      this.total = res.data.total;
    },
    async fetchReconciliationDetail(id) {
      const res = await getReconciliationDetail(id);
      this.reconciliationDetail = res.data;
    },
    async approveReconciliation(data) {
      await approveReconciliation(data);
      this.fetchReconciliationList();
    },
  },
}); 