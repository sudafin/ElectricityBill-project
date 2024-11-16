<template>
  <div class="daily-report">
    <el-card>
      <template #header>
        <div class="header">
          <span>日报表</span>
          <el-date-picker
            v-model="date"
            type="date"
            placeholder="选择日期"
            @change="fetchDailyReportData"
          ></el-date-picker>
        </div>
      </template>
      <el-table :data="reportData" border>
        <el-table-column prop="hour" label="小时"></el-table-column>
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

const date = ref(new Date());
const reportData = ref([]);

const fetchDailyReportData = async () => {
  const { data } = await reportStore.fetchDailyReportData({ date: date.value });
  reportData.value = data;
};

fetchDailyReportData();
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style> 