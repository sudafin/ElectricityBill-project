import { defineStore } from 'pinia';
import { getPaymentList, getPaymentDetail, createPayment } from '@/api/payment';

export const usePaymentStore = defineStore('payment', {
  state: () => ({
    paymentList: [],
    total: 0,
    paymentDetail: {},
  }),
  actions: {
    async fetchPaymentList(params) {
      const res = await getPaymentList(params);
      this.paymentList = res.data.list;
      this.total = res.data.total;
    },
    async fetchPaymentDetail(id) {
      const res = await getPaymentDetail(id);
      this.paymentDetail = res.data;
    },
    async createPayment(data) {
      await createPayment(data);
      this.fetchPaymentList();
    },
  },
}); 