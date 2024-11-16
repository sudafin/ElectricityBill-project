import { defineStore } from 'pinia';
import { getFeeList, getFeeDetail, createFee, updateFee, deleteFee } from '@/api/fee';

export const useFeeStore = defineStore('fee', {
  state: () => ({
    feeList: [],
    total: 0,
    feeDetail: {},
  }),
  actions: {
    async fetchFeeList(params) {
      const res = await getFeeList(params);
      this.feeList = res.data.list;
      this.total = res.data.total;
    },
    async fetchFeeDetail(id) {
      const res = await getFeeDetail(id);
      this.feeDetail = res.data;
    },
    async createFee(data) {
      await createFee(data);
      this.fetchFeeList();
    },
    async updateFee(data) {
      await updateFee(data);
      this.fetchFeeList();
    },
    async deleteFee(id) {
      await deleteFee(id);
      this.fetchFeeList();
    },
  },
}); 