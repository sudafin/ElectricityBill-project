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
                value-format="YYYY-MM-DD"
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
      <el-table :data="reconciliationList" v-loading="loading">
        <el-table-column prop="reconciliationNo" label="对账单号"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="meterNo" label="电表编号"></el-table-column>
        <el-table-column prop="userType" label="用户类型"></el-table-column>
        <el-table-column prop="balance" label="金额"></el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.reconciliationStatus === '未审批' ? 'info' : row.reconciliationStatus === '通过' ? 'success' : row.reconciliationStatus === '拒绝' ? 'danger' : 'warning'">
                {{ row.reconciliationStatus }}
              </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reconciliationTime" label="创建时间"></el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" link @click="showDetail(row)">详情</el-button>
            <el-button type="primary" link @click="handleApproval(row)">审批</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          :disabled="loading"
          @current-change="handlePageChange"
          layout="prev, pager, next, jumper"
          prev-text="上一页"
          next-text="下一页"
        ></el-pagination>
        <div class="total">共 {{ total }} 条</div>
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
            <el-descriptions-item label="用户类型">{{ currentReconciliation.userType}}</el-descriptions-item>
            <el-descriptions-item label="金额">{{ currentReconciliation.balance }}</el-descriptions-item>
            <el-descriptions-item label="审批状态">
              <el-tag :type="currentReconciliation.reconciliationStatus === '未审批' ? 'info' : currentReconciliation.reconciliationStatus === '通过' ? 'success' : currentReconciliation.reconciliationStatus === '拒绝' ? 'danger' : 'warning'">
                {{ currentReconciliation.reconciliationStatus }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="审批人">
              <template v-if="currentReconciliation.reconciliationStatus !== '待审批'">
                {{ currentReconciliation.approvalOperator }}
              </template>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ currentReconciliation.createTime }}</el-descriptions-item>
            <el-descriptions-item label="审批时间">{{ currentReconciliation.approvalTime }}</el-descriptions-item>
            <el-descriptions-item label="支付状态">
              <el-tag :type="currentReconciliation.paymentStatus === '未支付' ? 'info' : currentReconciliation.paymentStatus === '已支付' ? 'success' : 'warning'">
                {{ currentReconciliation.paymentStatus }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
          
          <el-divider></el-divider>
          
          <div class="comment-section">
            <h4>审批意见</h4>
            <p>{{ currentReconciliation.approvalComment || '暂无审批意见' }}</p>
          </div>
          
          <el-divider></el-divider>
          
          <h4>支付信息</h4>
          <el-table :data="currentReconciliation.userPaymentRecordVOList" stripe>
            <el-table-column prop="paymentTime" label="支付日期"></el-table-column>
            <el-table-column prop="paymentAmount" label="支付金额"></el-table-column>
            <el-table-column prop="paymentMethod" label="支付方式"></el-table-column>
            <el-table-column prop="paymentStatus" label="支付状态"></el-table-column>
            <el-table-column prop="operator" label="支付人"></el-table-column>
            <el-table-column prop="remark" label="备注"></el-table-column>
          </el-table>

        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Search, InfoFilled, Calendar, Download, User, Odometer } from '@element-plus/icons-vue';
import { getReconciliationList, getReconciliationDetail} from '@/api/reconciliation';
import { ElMessage } from 'element-plus';

const router = useRouter();
const searchText = ref('');
const searchStatus = ref('');
const dateRange = ref([]);
const currentPage = ref(1);
const pageSize = ref(5);
const total = ref(0);
const searchUserType = ref('');
const searchMeterNo = ref('');
const detailVisible = ref(false);
const currentReconciliation = ref({});
const loading = ref(false);
const reconciliationList = ref([]);

const columns = [
  { prop: 'reconciliationNo', label: '对账单号' },
  { prop: 'username', label: '用户名' },
  { prop: 'meterNo', label: '电表编号' },
  { prop: 'userType', label: '用户类型' },
  { prop: 'balance', label: '金额' },
  { prop: 'status', label: '状态', slotName: 'status' },
  { prop: 'reconciliationTime', label: '创建时间' },
  { prop: 'actions', label: '操作', slotName: 'actions', width: '120px' },
];


const fetchReconciliationList = async (page = currentPage.value,shouldResetPage = false) => {
  loading.value = true;
  if(shouldResetPage){
    currentPage.value = 1;
  }else {
    currentPage.value = page;
  }
  //创建条件查询对象
  const reconciliationPageQuery = {
  pageNo: currentPage.value,
  pageSize: pageSize.value,
  reconciliationNo: searchText.value && /^\d+$/.test(searchText.value) ? searchText.value : undefined,
  username: searchText.value && /^[\u4e00-\u9fa5]+$/.test(searchText.value) ? searchText.value : undefined,
  reconciliationStatus: searchStatus.value,
  userType: searchUserType.value,
  meterNo: searchMeterNo.value,
  startDate: dateRange.value && dateRange.value.length === 2 ? dateRange.value[0] : undefined,
  endDate: dateRange.value && dateRange.value.length === 2 ? dateRange.value[1] : undefined,
}
//获取数据
  try{
    // 模拟从后端获取数据,添加搜索条件
    const res = await getReconciliationList(reconciliationPageQuery);
    reconciliationList.value = res.list;
    total.value = Number(res.total);
  } catch (err) {
    ElMessage.error('获取对账单列表失败');
  }finally{
    loading.value = false;
  }
};
onMounted(()=>{
  fetchReconciliationList(1,true);
})
const handleSearch = () => {
  fetchReconciliationList(1,true);
};
const handlePageChange = (page) => {
  fetchReconciliationList(page);
}

const fetchReconciliationDetail = async (id) => {
  const res = await getReconciliationDetail(id);
  return res;
};
const showDetail = async (row) => {
  const detail = await fetchReconciliationDetail(row.reconciliationNo);
  currentReconciliation.value = detail;
  detailVisible.value = true;
};

const exportReconciliationList = () => {
  // 处理导出逻辑
};

const handleApproval = (row) => {
  router.push({ name: 'Approval', params: { reconciliationNo: row.reconciliationNo } });
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
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.total {
  color: #999;
  font-size: 14px;
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