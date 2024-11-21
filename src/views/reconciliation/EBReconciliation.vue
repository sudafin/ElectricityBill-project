<template>
  <div class="reconciliation-dashboard">
    <el-card class="filter-card">
      <template #header>
        <div class="header">
          <div class="search-area">
            <div class="search-row">
              <el-input
                v-model="searchText"
                placeholder="搜索对账单号或用户名"
                clearable
                @clear="fetchReconciliationList"
                @keyup.enter="fetchReconciliationList"
                class="search-input"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-select
                v-model="searchUserType"
                clearable
                placeholder="用户类型"
                @change="fetchReconciliationList"
                class="user-type-select"
              >
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
                <el-option label="全部" value=""></el-option>
                <el-option label="居民" value="居民用户"></el-option>
                <el-option label="商业" value="商业用户"></el-option>
              </el-select>
              <el-select
                v-model="searchStatus"
                clearable
                placeholder="状态"
                @change="fetchReconciliationList"
                class="status-select"
              >
                <template #prefix>
                  <el-icon><InfoFilled /></el-icon>
                </template>
                <el-option label="全部" value=""></el-option>
                <el-option label="待审批" value="pending"></el-option>
                <el-option label="已完成" value="completed"></el-option>
              </el-select>
              <el-input
                v-model="searchMeterNo"
                placeholder="电表编号"
                clearable
                @clear="fetchReconciliationList"
                @keyup.enter="fetchReconciliationList"
                class="meter-input"
              >
                <template #prefix>
                  <el-icon><Odometer /></el-icon>
                </template>
              </el-input>
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                unlink-panels
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @change="fetchReconciliationList"
                class="filter-date-range"
              >
                <template #prefix>
                  <el-icon><Calendar /></el-icon>
                </template>
              </el-date-picker>
            </div>
          </div>
          <div class="action-buttons">
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>搜索
            </el-button>
            <el-button type="success" @click="exportReconciliationList">
              <el-icon><Download /></el-icon>导出
            </el-button>
          </div>
        </div>
      </template>
      <!-- 对账表格 -->
      <EBTable :columns="columns" :data="reconciliationList">
        <template #status="{ row }">
          <el-tag :type="row.status === 'pending' ? 'warning' : 'success'">{{ row.status === 'pending' ? '待审批' : '已完成' }}</el-tag>
        </template>
        <template #actions="{ row }">
          <el-button type="primary" link @click="showDetail(row)">详情</el-button>
          <el-button type="primary" link @click="handleApproval(row)">审批</el-button>
        </template>
      </EBTable>
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          background
          layout="prev, pager, next"
          @current-change="fetchReconciliationList"
        />
      </div>
    </el-card>

    <!-- 详情抽屉 -->
    <el-drawer v-model="detailVisible" title="对账单详情" size="50%" :with-header="false" direction="rtl">
      <div class="drawer-content">
        <div class="drawer-header">
          <h3 class="drawer-title">对账单详情</h3>
        </div>
        <div class="drawer-body">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="对账单号">{{ currentReconciliation.reconciliationNo }}</el-descriptions-item>
            <el-descriptions-item label="用户名">{{ currentReconciliation.username }}</el-descriptions-item>
            <el-descriptions-item label="电表编号">{{ currentReconciliation.meterNo }}</el-descriptions-item>
            <el-descriptions-item label="用户类型">{{ currentReconciliation.userType }}</el-descriptions-item>
            <el-descriptions-item label="金额">{{ currentReconciliation.amount }}</el-descriptions-item>
            <el-descriptions-item label="用电量">{{ currentReconciliation.electricityUsage }} kWh</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="currentReconciliation.status === 'pending' ? 'warning' : 'success'">
                {{ currentReconciliation.status === 'pending' ? '待审批' : '已完成' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="审批人">
              {{ currentReconciliation.status === 'pending' ? '待审批' : currentReconciliation.approver }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ currentReconciliation.createTime }}</el-descriptions-item>
            <el-descriptions-item label="审批时间">{{ currentReconciliation.approvalTime }}</el-descriptions-item>
          </el-descriptions>
          
          <el-divider></el-divider>
          
          <div class="comment-section">
            <h4>审批意见</h4>
            <p>{{ currentReconciliation.comment || '暂无审批意见' }}</p>
          </div>
          
          <el-divider></el-divider>
          
          <h4>支付信息</h4>
          <el-table :data="currentReconciliation.paymentHistory" stripe>
            <el-table-column prop="date" label="支付日期"></el-table-column>
            <el-table-column prop="amount" label="支付金额"></el-table-column>
            <el-table-column prop="method" label="支付方式"></el-table-column>
          </el-table>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import EBTable from '@/components/EBTable.vue';
import { Search, InfoFilled, Calendar, Download, User, Odometer } from '@element-plus/icons-vue';

const router = useRouter();
const searchText = ref('');
const searchStatus = ref('');
const dateRange = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const searchUserType = ref('');
const searchMeterNo = ref('');
const detailVisible = ref(false);
const currentReconciliation = ref({});

const reconciliationList = ref([
  { id: 1, reconciliationNo: 'R20230501001', username: '张三', meterNo: 'M20230501001', userType: '居民用户', amount: 1000, electricityUsage: 500, status: 'pending', approver: '', comment: '', createTime: '2023-05-01 10:00:00', approvalTime: '', paymentHistory: [
    { date: '2023-04-01', amount: 500, method: '支付宝' },
    { date: '2023-03-01', amount: 800, method: '微信' },
  ], },
  { id: 2, reconciliationNo: 'R20230501002', username: '李四', meterNo: 'M20230501002', userType: '商业用户', amount: 2000, status: 'completed', approver: '王五', createTime: '2023-05-01 11:00:00', approvalTime: '2023-05-01 12:00:00' },
]);

const columns = [
  { prop: 'reconciliationNo', label: '对账单号' },
  { prop: 'username', label: '用户名' },
  { prop: 'meterNo', label: '电表编号' },
  { prop: 'userType', label: '用户类型' },
  { prop: 'amount', label: '金额' },
  { prop: 'status', label: '状态', slotName: 'status' },
  { prop: 'actions', label: '操作', slotName: 'actions', width: '120px' },
];

const fetchReconciliationList = async (page = currentPage.value) => {
  currentPage.value = page;
  // 模拟从后端获取数据,添加搜索条件
  let mockData = reconciliationList.value;
  if (searchStatus.value) {
    mockData = mockData.filter(item => item.status === searchStatus.value);
  }
  if (searchUserType.value) {
    mockData = mockData.filter(item => item.userType === searchUserType.value);
  }
  if (searchText.value) {
    mockData = mockData.filter(item =>
      item.reconciliationNo.includes(searchText.value) ||
      item.username.includes(searchText.value)
    );
  }
  if (searchMeterNo.value) {
    mockData = mockData.filter(item =>
      item.meterNo.toLowerCase().includes(searchMeterNo.value.toLowerCase())
    );
  }
  // 添加时间范围筛选
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value;
    mockData = mockData.filter(item => {
      const date = new Date(item.date);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });
  }
  total.value = mockData.length;
};

const handleSearch = () => {
  fetchReconciliationList(1);
};

const exportReconciliationList = () => {
  // 处理导出逻辑
};

const handleApproval = (row) => {
  router.push({ name: 'Approval', params: { id: row.id } });
};

const showDetail = (row) => {
  currentReconciliation.value = { ...row };
  detailVisible.value = true;
};
</script>

<style scoped>
.reconciliation-dashboard {
  padding: 20px;
  background-color: #f5f7fa;
}

.filter-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.search-area {
  flex: 1;
  background: transparent;
  padding: 12px 0;
  border-radius: 8px;
  min-width: 0;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  width: 100%;
}

.search-input {
  width: 360px;
  flex-shrink: 0;
}

.filter-date-range {
  width: 320px;
  flex-shrink: 0;
}

.action-buttons {
  display: flex;
  gap: 8px;
  padding: 12px 0;
  flex-shrink: 0;
}

.action-buttons .el-button {
  min-width: 88px;
  border-radius: 8px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  white-space: nowrap;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.meter-input {
  width: 140px;
  flex-shrink: 0;
}

.status-select {
  width: 120px;
  flex-shrink: 0;
}

.user-type-select {
  width: 120px;
  flex-shrink: 0;
}

@media screen and (max-width: 1400px) {
  .search-row {
    flex-wrap: wrap;
    gap: 8px;
  }

  .search-input,
  .user-type-select,
  .status-select,
  .meter-input {
    flex: 1;
    min-width: 160px;
  }
  
  .filter-date-range {
    width: 100%;
  }
}

.el-drawer {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.el-drawer__container {
  transition: all 0.3s ease;
}

.drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
}

.drawer-header {
  margin-bottom: 20px;
}

.drawer-title {
  font-size: 18px;
  font-weight: bold;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
}

.el-divider {
  margin: 20px 0;
}

h4 {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 600;
}

.comment-section {
  margin-bottom: 20px;
}

.comment-section h4 {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 600;
}

.comment-section p {
  margin: 0;
  color: #666;
}

.el-divider {
  margin: 20px 0;
}

h4 {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 600;
}

.el-table {
  width: 100%;
}
</style> 