<template>
  <div class="meter-dashboard">
    <el-card class="admin-card">
      <template #header>
        <div class="header">
          <h3 class="header-title">
            <el-icon><Odometer /></el-icon>
            电表管理
          </h3>
          <div class="search-area">
            <el-input
              v-model="searchText"
              placeholder="搜索电表编号或型号"
              clearable
              @clear="fetchMeterList"
              @keyup.enter="fetchMeterList"
              class="search-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select
              v-model="searchStatus"
              clearable
              placeholder="电表状态"
              class="filter-select"
            >
              <template #prefix>
                <el-icon><CircleCheck /></el-icon>
              </template>
              <el-option label="全部" value=""></el-option>
              <el-option label="正常" value="正常"></el-option>
              <el-option label="故障" value="故障"></el-option>
              <el-option label="停用" value="停用"></el-option>
            </el-select>
            <el-select
              v-model="searchBind"
              clearable
              placeholder="绑定状态"
              class="filter-select"
            >
              <template #prefix>
                <el-icon><Link /></el-icon>
              </template>
              <el-option label="全部" value=""></el-option>
              <el-option label="已绑定" value="bound"></el-option>
              <el-option label="未绑定" value="unbound"></el-option>
            </el-select>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              unlink-panels
              range-separator="至"
              start-placeholder="安装开始日期"
              end-placeholder="安装结束日期"
              value-format="YYYY-MM-DD"
              class="filter-date-range"
            >
              <template #prefix>
                <el-icon><Calendar /></el-icon>
              </template>
            </el-date-picker>
            <div class="action-buttons">
              <el-button type="primary" class="action-button" @click="handleSearch">
                <el-icon><Search /></el-icon>搜索
              </el-button>
              <el-button type="primary" class="action-button" @click="handleCreate">
                <el-icon><Plus /></el-icon>新增电表
              </el-button>
              <el-button 
                type="danger" 
                class="action-button" 
                @click="handleBatchDelete" 
                :disabled="!selectedMeterIds.length"
              >
                <el-icon><Delete /></el-icon>批量删除
              </el-button>
            </div>
          </div>
        </div>
      </template>
      
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="meterList"
        @selection-change="handleSelectionChange"
        class="admin-table"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="电表编号" prop="meterNo" width="180"></el-table-column>
        <el-table-column label="电表型号" prop="model" width="160"></el-table-column>
        <el-table-column label="安装日期" prop="installDate" width="120"></el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag 
              :type="row.status === '正常' ? 'success' : row.status === '故障' ? 'danger' : 'info'"
            >
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="绑定用户" width="180">
          <template #default="{ row }">
            <span v-if="row.username">
              {{ row.username }}
              <el-tag size="small" type="success">已绑定</el-tag>
            </span>
            <span v-else class="no-bind">
              未绑定
              <el-button 
                type="primary" 
                link 
                size="small" 
                @click="handleBind(row)"
              >
                绑定用户
              </el-button>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <div class="action-group">
              <el-button type="primary" link @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>编辑
              </el-button>
              <el-button type="primary" link @click="handleDetail(row)">
                <el-icon><View /></el-icon>详情
              </el-button>
              <el-button 
                type="danger" 
                link 
                @click="handleDelete(row.id)"
              >
                <el-icon><Delete /></el-icon>删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="admin-pagination">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          @current-change="handlePageChange"
          layout="prev, pager, next, jumper"
        ></el-pagination>
        <div class="total-info">共 {{ total }} 条记录</div>
      </div>
    </el-card>
    
    <!-- 绑定用户弹窗 -->
    <el-dialog
      v-model="bindDialogVisible"
      title="绑定用户"
      width="550px"
      destroy-on-close
    >
      <EBMeterBindUser 
        :meter="currentMeter" 
        @success="handleBindSuccess" 
        @cancel="bindDialogVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Odometer, Search, Calendar, CircleCheck, Plus, Delete, Edit, Link, View
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import EBMeterBindUser from './EBMeterBindUser.vue';

const router = useRouter();
const searchText = ref('');
const searchStatus = ref('');
const searchBind = ref('');
const dateRange = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const meterList = ref([]);
const total = ref(0);
const selectedMeterIds = ref([]);
const bindDialogVisible = ref(false);
const currentMeter = ref({});

// 获取电表列表
const fetchMeterList = async (page = currentPage.value, shouldResetPage = false) => {
  loading.value = true;
  if (shouldResetPage) {
    currentPage.value = 1;
  } else {
    currentPage.value = page;
  }
  
  try {
    // 这里替换为实际的API调用
    const res = await getMeterList({
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchText.value,
      status: searchStatus.value,
      bindStatus: searchBind.value,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1]
    });
    
    meterList.value = res.list;
    total.value = res.total;
  } catch (error) {
    ElMessage.error('获取电表列表失败');
    console.error('获取电表列表失败', error);
  } finally {
    loading.value = false;
  }
};

// 搜索处理函数
const handleSearch = () => {
  fetchMeterList(1, true);
};

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedMeterIds.value = selection.map(item => item.id);
};

// 分页处理
const handlePageChange = (page) => {
  fetchMeterList(page);
};

// 创建电表
const handleCreate = () => {
  router.push('/admin/meter/create');
};

// 编辑电表
const handleEdit = (row) => {
  router.push(`/admin/meter/edit/${row.id}`);
};

// 查看电表详情
const handleDetail = (row) => {
  router.push(`/admin/meter/detail/${row.id}`);
};

// 删除电表
const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除该电表吗？删除后无法恢复', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 这里替换为实际的API调用
      await deleteMeter(id);
      ElMessage.success('删除成功');
      fetchMeterList(currentPage.value);
    } catch (error) {
      ElMessage.error('删除失败');
      console.error('删除电表失败', error);
    }
  }).catch(() => {});
};

// 批量删除
const handleBatchDelete = () => {
  if (selectedMeterIds.value.length === 0) {
    ElMessage.warning('请选择要删除的电表');
    return;
  }
  
  ElMessageBox.confirm(`确定要删除选中的 ${selectedMeterIds.value.length} 个电表吗？删除后无法恢复`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 这里替换为实际的API调用
      await batchDeleteMeters(selectedMeterIds.value);
      ElMessage.success('批量删除成功');
      fetchMeterList(1, true);
    } catch (error) {
      ElMessage.error('批量删除失败');
      console.error('批量删除电表失败', error);
    }
  }).catch(() => {});
};

// 绑定用户
const handleBind = (row) => {
  currentMeter.value = row;
  bindDialogVisible.value = true;
};

// 绑定成功回调
const handleBindSuccess = () => {
  bindDialogVisible.value = false;
  fetchMeterList(currentPage.value);
  ElMessage.success('绑定用户成功');
};

onMounted(() => {
  fetchMeterList(1, true);
});
</script>

<style scoped>
@import '@/styles/admin-card.scss';

.meter-dashboard {
  padding: 20px;
  background-color: #f5f7fa;
}

/* 组件特定的样式 */
.search-input {
  width: 220px;
}

.filter-select {
  width: 140px;
}

.filter-date-range {
  width: 260px;
}

.no-bind {
  color: #909399;
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-group {
  display: flex;
  gap: 8px;
}

:deep(.el-dialog__body) {
  padding-top: 10px;
}
</style> 