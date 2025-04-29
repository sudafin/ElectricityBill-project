<template>
  <div class="reconciliation-dashboard">
    <div class="content-wrapper">
      <!-- 添加标题区域 -->
      <div class="dashboard-header">
        <div class="title-area">
          <el-icon class="header-icon"><Document /></el-icon>
          <h2 class="header-title">对账管理</h2>
        </div>
      </div>

      <!-- 使用新的筛选栏组件 -->
      <EBFilterBar
        :filters="filters"
        :initial-values="initialFilterValues"
        button-size="default"
        @search="handleFilterSearch"
        @reset="clearSearch"
      >
        <!-- 添加额外按钮 -->
        <template #append-buttons>
          <el-button 
            type="success" 
            class="action-button" 
            size="default"
            @click="exportReconciliationList"
          >
            <el-icon><Download /></el-icon>导出
          </el-button>
        </template>
      </EBFilterBar>

      <!-- 使用新的表格组件 -->
      <div class="table-container">
        <EBTable
          ref="tableRef"
          :columns="tableColumns"
          :data="reconciliationList"
          :loading="loading"
          :border="false"
          selection
          show-actions
          actions-width="180"
          actions-fixed="right"
          :auto-height="true"
          pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          @selection-change="handleSelectionChange"
          @page-change="handlePageChange"
          :row-style="{ height: '55px' }"
        >
          <!-- 状态列自定义渲染 -->
          <template #reconciliationStatus="{ row }">
            <el-tag :type="row.reconciliationStatus === '待审批' ? 'info' : row.reconciliationStatus === '通过' ? 'success' : row.reconciliationStatus === '拒绝' ? 'danger' : row.reconciliationStatus === '退回' ? 'warning' : row.reconciliationStatus === '暂缓' ? 'info' : 'warning'">
              {{ row.reconciliationStatus }}
            </el-tag>
          </template>

          <!-- 操作列 -->
          <template #actions="{ row }">
            <el-button type="primary" link size="small" @click="showDetail(row)">详情</el-button>
            <el-button type="primary" link size="small" @click="handleApproval(row)">审批</el-button>
          </template>
        </EBTable>
      </div>
    </div>

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
              <el-tag :type="currentReconciliation.reconciliationStatus === '待审批' ? 'info' : currentReconciliation.reconciliationStatus === '通过' ? 'success' : currentReconciliation.reconciliationStatus === '拒绝' ? 'danger' : currentReconciliation.reconciliationStatus === '退回' ? 'warning' : currentReconciliation.reconciliationStatus === '暂缓' ? 'info' : 'warning'">
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
import { onMounted, ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Document, Search, InfoFilled, Calendar, Download, User, Odometer } from '@element-plus/icons-vue';
import { queryPage, queryReconciliationDetail, exportReconciliation } from '@/api/admin/reconciliation.js';
import { getUserTypeList } from '@/api/admin/admin.js';
import { ElMessage } from 'element-plus';
import { EBFilterBar, EBTable } from '@/components';

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
const loading = ref(false);
const reconciliationList = ref([]);
const selectedIds = ref([]);
const userTypeOptions = ref([
  { label: '全部类型', value: '' }
]);

// 基本筛选条件配置
const baseFilters = [
  {
    type: 'input',
    field: 'searchText',
    label: '对账单号',
    placeholder: '请输入对账单号或用户名'
  },
  {
    type: 'select',
    field: 'searchStatus',
    label: '审批状态',
    options: [
      { label: '全部', value: '' },
      { label: '待审批', value: '待审批' },
      { label: '通过', value: '通过' },
      { label: '拒绝', value: '拒绝' },
      { label: '暂缓', value: '暂缓' }
    ]
  },
  {
    type: 'input',
    field: 'searchMeterNo',
    label: '电表编号',
    placeholder: '请输入电表编号'
  },
  {
    type: 'daterange',
    field: 'dateRange',
    label: '日期范围'
  }
];

// 计算属性：完整的筛选配置，包含动态用户类型选项
const filters = computed(() => {
  // 构建用户类型选项筛选配置
  const userTypeFilter = {
    type: 'select',
    field: 'searchUserType',
    label: '用户类型',
    options: userTypeOptions.value // 直接使用响应式对象的值
  };
  
  // 将用户类型筛选插入到第二个位置
  const configList = [...baseFilters];
  configList.splice(1, 0, userTypeFilter);
  
  console.log('计算的筛选配置:', configList);
  console.log('计算的用户类型选项:', userTypeOptions.value);
  
  return configList;
});

// 初始值
const initialFilterValues = {
  searchText: '',
  searchUserType: '',
  searchStatus: '',
  searchMeterNo: '',
  dateRange: []
};

// 获取用户类型列表
const fetchUserTypeList = async () => {
  try {
    console.log('开始获取用户类型列表');
    const res = await getUserTypeList();
    console.log('获取用户类型列表成功，返回数据:', res);
    console.log('返回数据类型:', typeof res);
    
    // 清空之前的选项，保留"全部类型"
    userTypeOptions.value = [{ label: '全部类型', value: '' }];
    
    // 检查响应数据结构
    if (res) {
      // 如果响应是对象，并且有data属性
      if (typeof res === 'object' && res.data) {
        console.log('数据在res.data中，类型为:', typeof res.data);
        console.log('res.data内容:', res.data);
        
        // 处理不同的数据格式
        if (Array.isArray(res.data)) {
          // 如果res.data是数组
          res.data.forEach(type => {
            if (typeof type === 'string') {
              userTypeOptions.value.push({ label: type, value: type });
            } else if (type && typeof type === 'object') {
              // 检查可能的属性名
              const typeName = type.typeName || type.name || type.label || type.value || type.type;
              if (typeName) {
                userTypeOptions.value.push({ label: typeName, value: typeName });
              } else {
                console.log('无法从对象中提取类型名称:', type);
              }
            }
          });
        } else if (typeof res.data === 'object' && !Array.isArray(res.data)) {
          // 如果res.data是对象而不是数组
          Object.keys(res.data).forEach(key => {
            const value = res.data[key];
            if (typeof value === 'string') {
              userTypeOptions.value.push({ label: value, value: value });
            }
          });
        }
      } else if (Array.isArray(res)) {
        // 如果响应直接是数组
        res.forEach(type => {
          if (typeof type === 'string') {
            userTypeOptions.value.push({ label: type, value: type });
          } else if (type && typeof type === 'object') {
            // 检查可能的属性名
            const typeName = type.typeName || type.name || type.label || type.value || type.type;
            if (typeName) {
              userTypeOptions.value.push({ label: typeName, value: typeName });
            } else {
              console.log('无法从对象中提取类型名称:', type);
            }
          }
        });
      } else {
        console.log('响应格式不是预期的数组或对象格式:', res);
      }
    } else {
      console.log('响应为空或无效');
    }
    
    console.log('更新后的用户类型选项:', userTypeOptions.value);
    
    // 如果没有获取到任何选项（除了"全部类型"），添加默认选项
    if (userTypeOptions.value.length <= 1) {
      console.log('未获取到有效的用户类型选项，添加默认选项');
      userTypeOptions.value.push(
        { label: '居民用户', value: '居民用户' },
        { label: '商业用户', value: '商业用户' }
      );
    }
    
    // 打印最终的用户类型选项，确认是否已经添加
    console.log('最终的用户类型选项:', userTypeOptions.value);
  } catch (error) {
    console.error('获取用户类型列表失败:', error);
    ElMessage.error('获取用户类型列表失败，使用默认选项');
    
    // 出错时使用默认选项
    userTypeOptions.value = [
      { label: '全部类型', value: '' },
      { label: '居民用户', value: '居民用户' },
      { label: '商业用户', value: '商业用户' }
    ];
  }
  
  // 确保返回处理后的选项数组
  return userTypeOptions.value;
};

// 表格列配置
const tableColumns = [
  { prop: 'reconciliationNo', label: '对账单号', minWidth: '150' },
  { prop: 'username', label: '用户名', minWidth: '120' },
  { prop: 'meterNo', label: '电表编号', minWidth: '120' },
  { prop: 'userType', label: '用户类型', minWidth: '120' },
  { prop: 'balance', label: '金额', minWidth: '100' },
  { 
    prop: 'reconciliationStatus', 
    label: '状态',
    minWidth: '100',
    type: 'tag',
    tagMap: {
      '待审批': 'info',
      '通过': 'success',
      '拒绝': 'danger',
      '退回': 'warning',
      '暂缓': 'info'
    }
  },
  { prop: 'reconciliationTime', label: '创建时间', minWidth: '180' }
];

const fetchReconciliationList = async (page = currentPage.value, shouldResetPage = false) => {
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
    const res = await queryPage(reconciliationPageQuery);
    reconciliationList.value = res.list;
    total.value = Number(res.total);
  } catch (err) {
    ElMessage.error('获取对账单列表失败');
  }finally{
    loading.value = false;
  }
};

// 处理筛选搜索
const handleFilterSearch = (filterValues) => {
  // 更新筛选值
  searchText.value = filterValues.searchText || '';
  searchUserType.value = filterValues.searchUserType || '';
  searchStatus.value = filterValues.searchStatus || '';
  searchMeterNo.value = filterValues.searchMeterNo || '';
  dateRange.value = filterValues.dateRange || [];
  
  // 重新加载数据
  fetchReconciliationList(1, true);
};

// 清空搜索条件
const clearSearch = () => {
  searchText.value = '';
  searchUserType.value = '';
  searchStatus.value = '';
  searchMeterNo.value = '';
  dateRange.value = [];
};

onMounted(async () => {
  console.log('组件挂载开始');
  // 先获取用户类型列表
  await fetchUserTypeList();
  
  // 打印挂载后的用户类型选项
  console.log('挂载后的用户类型选项:', userTypeOptions.value);
  console.log('挂载后的筛选配置:', filters.value);
  
  // 再加载对账单列表
  fetchReconciliationList(1, true);
});

const handlePageChange = (page) => {
  fetchReconciliationList(page);
};

const fetchReconciliationDetail = async (id) => {
  const res = await queryReconciliationDetail(id);
  return res;
};

const showDetail = async (row) => {
  const detail = await fetchReconciliationDetail(row.reconciliationNo);
  currentReconciliation.value = detail;
  detailVisible.value = true;
};

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id);
};

const exportReconciliationList = async () => {
  const res = await exportReconciliation();
  // 创建 Blob 对象并下载
  const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'reconciliation_details.xlsx';
  link.click();
  window.URL.revokeObjectURL(url);
  if(res.size > 0){
    ElMessage.success('对账单报表导出成功');
  }else{
    ElMessage.error('对账单报表导出失败');
  }
};

const handleApproval = (row) => {
  router.push({ name: 'Approval', params: { reconciliationNo: row.reconciliationNo } });
};
</script>

<style scoped>
.reconciliation-dashboard {
  padding: 0px;
  background-color: #f5f7fa;
}

.content-wrapper {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.content-wrapper:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

/* 标题区域样式 */
.dashboard-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fff;
}

.title-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 20px;
  color: #409EFF;
}

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  line-height: 1.5;
}

.table-container {
  padding: 0 20px 20px 20px;
  background-color: #fff;
  border-radius: 0 0 8px 8px;
}

/* 自定义表头样式 */
:deep(.el-table th.el-table__cell) {
  background-color: #f8f9fb;
  color: #606266;
  font-weight: 500;
  padding: 12px 0;
}

/* 自定义表格单元格样式 */
:deep(.el-table td.el-table__cell) {
  padding: 12px 0;
  height: 55px;
  line-height: 20px;
}

/* 确保表格内容垂直居中 */
:deep(.el-table .cell) {
  display: flex;
  align-items: center;
  height: 100%;
}

/* 标签特殊处理，避免由于flex布局导致的显示问题 */
:deep(.el-table .el-tag) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 操作列的特殊处理 */
:deep(.el-table .cell .el-button) {
  margin: 0 5px;
}

:deep(.el-table .cell .el-button--link) {
  height: auto;
  padding: 4px 0;
}

/* 固定列阴影效果优化 */
:deep(.el-table .is-right-fixed) {
  box-shadow: -5px 0 5px -5px rgba(0, 0, 0, 0.12);
}

:deep(.el-table .is-right-fixed .cell) {
  padding-left: 10px;
  padding-right: 10px;
}

/* 统一移除EBFilterBar和EBTable的边框样式 */
:deep(.eb-filter-bar .filter-container) {
  box-shadow: none;
  border-radius: 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 0;
}

:deep(.eb-table .el-table) {
  border: none;
}

:deep(.eb-pagination) {
  padding-top: 15px;
}

/* 统一操作区按钮样式 */
:deep(.action-button) {
  min-width: 90px;
}

:deep(.el-button--link) {
  min-width: auto;
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
</style> 