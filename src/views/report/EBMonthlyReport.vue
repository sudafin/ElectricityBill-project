<template>
  <div class="monthly-report">
    <el-card>
      <template #header>
        <div class="header">
          <span>月报表</span>
          <el-date-picker
            v-model="month"
            type="month"
            placeholder="选择月份"
            @change="fetchMonthlyReportData"
          ></el-date-picker>
        </div>
      </template>
      <el-table :data="reportData" border>
        <el-table-column prop="date" label="日期"></el-table-column>
        <el-table-column prop="electricityUsage" label="用电量"></el-table-column>
        <el-table-column prop="feeAmount" label="费用金额"></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useReportStore } from '@/store/report';

const reportStore = useReportStore();

const month = ref(new Date());
const reportData = ref([]);

const fetchMonthlyReportData = async () => {
  const { data } = await reportStore.fetchMonthlyReportData({ month: month.value });
  reportData.value = data;
};

fetchMonthlyReportData();
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style> 