<template>
  <el-card class="table-card" shadow="hover">
    <template #header>
      <div class="table-header">
        <h3>详细数据</h3>
      </div>
    </template>
    <el-table 
      :data="reportData" 
      border 
      stripe
      style="width: 100%"
      v-loading="loading"
      :max-height="400"
    >
      <el-table-column prop="date" label="日期" width="120"></el-table-column>
      <el-table-column prop="electricityUsage" label="用电量" width="120">
        <template #default="{ row }">
          {{ row.electricityUsage }} kWh
        </template>
      </el-table-column>
      <el-table-column prop="feeAmount" label="费用金额" width="120">
        <template #default="{ row }">
          ¥ {{ row.feeAmount }}
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
defineProps({
  reportData: {
    type: Array,
    default: () => []
  },
  loading: Boolean  
});
</script>

<style scoped>
.table-card {
  margin-top: 12px;
  border-radius: 8px;
}

.table-header {
  padding: 0;
}

.table-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: var(--el-fill-color-light);
  font-weight: 600;
  padding: 6px;
}

:deep(.el-table td) {
  padding: 4px 6px;
}

:deep(.el-table__row) {
  transition: all 0.3s ease;
}

:deep(.el-table__row:hover) {
  background-color: var(--el-fill-color-lighter) !important;
}
</style> 