<template>
  <div class="report">
    <el-card>
      <template #header>
        <div class="header">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="fetchReportData"
          ></el-date-picker>
          <el-button type="primary" @click="exportReport">导出报表</el-button>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <EBChart :option="electricityUsageOption" />
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <EBChart :option="feeAmountOption" />
          </el-card>
        </el-col>
      </el-row>
      <el-card>
        <el-table :data="reportData" border>
          <el-table-column prop="date" label="日期"></el-table-column>
          <el-table-column prop="electricityUsage" label="用电量"></el-table-column>
          <el-table-column prop="feeAmount" label="费用金额"></el-table-column>
        </el-table>
      </el-card>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useReportStore } from '@/store/report';
import EBChart from '@/components/EBChart.vue';

const reportStore = useReportStore();

const dateRange = ref([]);
const reportData = ref([]);
const electricityUsageOption = ref({});
const feeAmountOption = ref({});

const fetchReportData = async () => {
  const [startDate, endDate] = dateRange.value;
  const { data } = await reportStore.fetchReportData({ startDate, endDate });
  reportData.value = data.reportData;
  electricityUsageOption.value = data.electricityUsageOption;
  feeAmountOption.value = data.feeAmountOption;
};

fetchReportData();

const exportReport = () => {
  // 导出报表逻辑
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.el-date-picker {
  width: 300px;
}

.report .el-card {
  margin-bottom: 20px;
}
</style> 