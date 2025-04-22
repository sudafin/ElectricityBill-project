<template>
  <div class="fee-dashboard">
    <el-card class="admin-card">
      <template #header>
        <div class="header">
          <h3 class="header-title">
            <el-icon><Money /></el-icon>
            电费管理
          </h3>
          <div class="search-area">
            <el-input
              v-model="searchText"
              placeholder="搜索用户名或电话"
              clearable
              @clear="fetchUserList"
              @keyup.enter="fetchUserList"
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
              class="filter-select"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
              <el-option label="全部" value=""></el-option>
              <el-option label="居民用户" value="居民用户"></el-option>
              <el-option label="商业用户" value="商业用户"></el-option>
            </el-select>
            <el-select
              v-model="searchAccountStatus"
              clearable
              placeholder="账号状态"
              @change="fetchUserList"
              class="filter-select"
            >
              <template #prefix>
                <el-icon><InfoFilled /></el-icon>
              </template>
              <el-option label="全部" value=""></el-option>
              <el-option label="正常" value="正常"></el-option>
              <el-option label="欠费" value="欠费"></el-option>
            </el-select>
            <el-input
              v-model="searchMeterNo"
              placeholder="电表编号"
              clearable
              @clear="fetchUserList"
              @keyup.enter="fetchUserList"
              class="meter-input"
            >
              <template #prefix>
                <el-icon><Odometer /></el-icon>
              </template>
            </el-input>
            <el-date-picker
              v-model="searchDateRange"
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
            <div class="action-buttons">
              <el-button type="primary" class="action-button" @click="handleSearch">
                <el-icon><Search /></el-icon>搜索
              </el-button>
              <el-button type="primary" @click="handleCreate">
                <el-icon><Plus /></el-icon>新增用户
              </el-button>
              <el-button type="danger" @click="handleBatchDelete" :disabled="!selectedUserIds.length">
                <el-icon><Delete /></el-icon>批量删除
              </el-button>
            </div>
          </div>
        </div>
      </template>
      <!-- 表格 -->
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="userList"
        @selection-change="handleSelectionChange"
        class="admin-table"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="username" label="用户姓名"></el-table-column>
        <el-table-column prop="phone" label="电话"></el-table-column>
        <el-table-column prop="meterNo" label="电表编号"></el-table-column>
        <el-table-column prop="address" label="地址"></el-table-column>
        <el-table-column prop="userType" label="用户类型"></el-table-column>
        <el-table-column label="账号状态">
          <template #default="{ row }">
            <el-tag :type="row.accountStatus === '正常' ? 'success' : 'danger'">
              {{ row.accountStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="当前电费余额"></el-table-column>
        <el-table-column prop="electricityUsage" label="用电量"></el-table-column>
        <el-table-column prop="lastPaymentDate" label="最近缴费时间"></el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="showDetail(row.id)">详情</el-button>
            <el-button type="warning" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="admin-pagination">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          :disabled="loading"
          @current-change="handlePageChange"
          layout="prev, pager, next, jumper"
        ></el-pagination>
        <div class="total-info">共 {{ total }} 条记录</div>
      </div>
    </el-card>

    <!-- 详情抽屉 -->
    <el-drawer v-model="detailVisible" title="用户详情" size="50%" :with-header="false" direction="rtl">
      <div class="drawer-content">
        <div class="drawer-header">
          <h3 class="drawer-title">用户详情</h3>
        </div>
        <div class="drawer-body">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户姓名">{{ currentUser.username }}</el-descriptions-item>
            <el-descriptions-item label="电话">{{ currentUser.phone }}</el-descriptions-item>
            <el-descriptions-item label="地址">{{ currentUser.address }}</el-descriptions-item>
            <el-descriptions-item label="用户类型">{{ currentUser.userType }}</el-descriptions-item>
            <el-descriptions-item label="账号状态">
              <el-tag :type="currentUser.accountStatus === '正常' ? 'success' : 'danger'">
                {{ currentUser.accountStatus }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="当前电费余额">{{ currentUser.balance }}</el-descriptions-item>
            <el-descriptions-item label="当前剩余用电量">{{ currentUser.electricityUsage }}</el-descriptions-item>
          </el-descriptions>
          <el-divider></el-divider>
          <div class="payment-history">
            <h4>缴费记录</h4>
            <el-table :data="currentUser.userPaymentRecordVOList" stripe>
              <el-table-column prop="paymentTime" label="缴费时间" width="180"></el-table-column>
              <el-table-column prop="paymentAmount" label="缴费金额" width="120"></el-table-column>
              <el-table-column prop="accountStatus" label="支付状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.paymentStatus === '成功' ? 'success' : 'danger'">
                    {{ row.paymentStatus }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="paymentMethod" label="支付方式" width="100"></el-table-column>
              <el-table-column prop="operator" label="操作人员" width="120"></el-table-column>
              <el-table-column prop="remark" label="备注"></el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Search, User, InfoFilled, Calendar, Plus, Delete, Odometer } from '@element-plus/icons-vue'
import { getUserList, getUserDetail, deleteUser } from '@/api/admin/user.js';
const router = useRouter();

const searchText = ref('');
const searchUserType = ref('');
const searchAccountStatus = ref('');
const currentPage = ref(1);
const pageSize = ref(5);
const loading = ref(false);
const userList = ref([]);
const total = ref(0);
const selectedUserIds = ref([]);
const searchDateRange = ref([]);
const searchMeterNo = ref('');

//获取用户列表
const fetchUserList = async (page = currentPage.value, shouldResetPage = false) => {
  loading.value = true;
  
  if (shouldResetPage) {
    currentPage.value = 1; // 重置页码
  } else {
    currentPage.value = page;
  }

  //创建条件查询对象
  const userPageQuery = {
    pageNo: currentPage.value,
    pageSize: pageSize.value,
    userType: searchUserType.value,
    accountStatus: searchAccountStatus.value,
    meterNo: searchMeterNo.value,
    startDate: searchDateRange.value && searchDateRange.value.length === 2 ? searchDateRange.value[0] : undefined,
    endDate: searchDateRange.value && searchDateRange.value.length === 2 ? searchDateRange.value[1] : undefined,
    name: searchText.value && !isNaN(searchText.value) ? undefined : searchText.value,
    phone: searchText.value && isNaN(searchText.value) ? undefined : searchText.value
  };
//分页查询
  try {
    const res = await getUserList(userPageQuery);
    userList.value = res.list;
    total.value = Number(res.total);
  } catch (err) {
    console.error(err);
    ElMessage.error('获取用户列表失败');
  }
  loading.value = false;
};

//获取用户详情
const fetchUserDetail = async (userId) => {
  const res = await getUserDetail(userId);
  return res;
};

const detailVisible = ref(false);
const currentUser = ref({});

const showDetail  = async (userId) => {
  const userDetail = await fetchUserDetail(userId);
  currentUser.value = userDetail;
  detailVisible.value = true;
};

const handleCreate = () => {
  // 跳转到用户新增页面
  router.push({ name: 'UserForm' });
};


//删除单个用户
const handleDelete = async (row) => {
  ElMessageBox.confirm('确定删除该用户吗?', '提示', { 
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await deleteUser(row.id);
      fetchUserList();
      ElMessage.success('删除成功');
    })
    .catch(() => {});
};

// 批量删除用户
const tableRef = ref(null);

const handleSelectionChange = (selectedRows) => {
  selectedUserIds.value = selectedRows.map((row) => row.id);
};
const handleBatchDelete = async () => {
  ElMessageBox.confirm(`确定删除选中的 ${selectedUserIds.value.length} 个用户吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
  .then(async () => {
    selectedUserIds.value = selectedUserIds.value.join(',');
    const res = await deleteUser(selectedUserIds.value);
    if(res.code === 200){
      fetchUserList();
    ElMessage.success('删除成功');
  } else {
      ElMessage.error('删除失败');
    }
  })
  .catch(() => {});
};


// 添加搜索处理函数
const handleSearch = () => {
  fetchUserList(1, true); // 点击搜索按钮时,从第一页开始搜索,并重置页码
};

// 修改其他输入框和选择器的事件处理
const handleInputChange = () => {
  // 输入变化时不立即搜索，等待用户点击搜索按钮
};

// 分页
const handlePageChange = (page) => {
  fetchUserList(page);
};

// 编辑用户
const handleEdit = (row) => {
  router.push({ 
    name: 'UserEdit', 
    params: { id: row.id }
  });
};

onMounted(() => {
  fetchUserList(1); // 组件初始化时获取第一页数据
});
</script>

<style scoped>
@import '@/styles/admin-card.scss';

.fee-dashboard {
  padding: 0px;
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

.meter-input {
  width: 140px;
}
</style> 
