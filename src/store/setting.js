import { defineStore } from 'pinia';
import {
  getRoleList,
  createRole,
  updateRole,
  deleteRole,
  getFeeRateList,
  updateFeeRate,
  getParamList,
  updateParam,
  getLogList,
} from '@/api/setting';

export const useSettingStore = defineStore('setting', {
  state: () => ({
    roleList: [],
    roleTotal: 0,
    feeRateList: [],
    paramList: [],
    logList: [],
    logTotal: 0,
  }),
  actions: {
    async fetchRoleList(params) {
      const res = await getRoleList(params);
      this.roleList = res.data.list;
      this.roleTotal = res.data.total;
    },
    async createRole(data) {
      await createRole(data);
      this.fetchRoleList();
    },
    async updateRole(data) {
      await updateRole(data);
      this.fetchRoleList();
    },
    async deleteRole(id) {
      await deleteRole(id);
      this.fetchRoleList();
    },
    async fetchFeeRateList() {
      const res = await getFeeRateList();
      this.feeRateList = res.data;
    },
    async updateFeeRate(data) {
      await updateFeeRate(data);
      this.fetchFeeRateList();
    },
    async fetchParamList() {
      const res = await getParamList();
      this.paramList = res.data;
    },
    async updateParam(data) {
      await updateParam(data);
      this.fetchParamList();
    },
    async fetchLogList(params) {
      const res = await getLogList(params);
      this.logList = res.data.list;
      this.logTotal = res.data.total;
    },
  },
}); 