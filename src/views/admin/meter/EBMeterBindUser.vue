<template>
  <div class="bind-user-container">
    <el-form :model="bindForm" label-width="100px">
      <el-form-item label="电表编号">
        <el-input v-model="meter.meterNo" disabled />
      </el-form-item>
      
      <el-form-item label="查找用户">
        <div class="search-user">
          <el-input
            v-model="searchKeyword"
            placeholder="输入用户名/手机号/账号搜索"
            @keyup.enter="searchUsers"
          >
            <template #append>
              <el-button @click="searchUsers">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>
      </el-form-item>
    </el-form>
    
    <div class="user-list" v-loading="loading">
      <el-empty v-if="userList.length === 0" description="暂无用户数据"></el-empty>
      <el-radio-group v-else v-model="bindForm.selectedUserId">
        <div class="user-list-header">
          <div class="user-item header">
            <div class="user-select">选择</div>
            <div class="user-name">用户名</div>
            <div class="user-phone">手机号</div>
            <div class="user-type">用户类型</div>
            <div class="user-status">状态</div>
          </div>
        </div>
        <div class="user-list-body">
          <div 
            v-for="user in userList" 
            :key="user.id" 
            class="user-item"
            :class="{ 'selected': bindForm.selectedUserId === user.id }"
          >
            <div class="user-select">
              <el-radio :label="user.id" />
            </div>
            <div class="user-name">{{ user.username }}</div>
            <div class="user-phone">{{ user.phone }}</div>
            <div class="user-type">{{ user.userType }}</div>
            <div class="user-status">
              <el-tag :type="user.status === '正常' ? 'success' : 'danger'" size="small">
                {{ user.status }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-radio-group>
      
      <!-- 分页 -->
      <div class="pagination" v-if="userList.length > 0">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :current-page="currentPage"
          :page-size="pageSize"
          @current-change="handlePageChange"
        />
      </div>
    </div>
    
    <div class="dialog-footer">
      <el-button @click="$emit('cancel')">取消</el-button>
      <el-button type="primary" @click="confirmBind" :disabled="!bindForm.selectedUserId" :loading="binding">
        确认绑定
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';

const props = defineProps({
  meter: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['success', 'cancel']);

const searchKeyword = ref('');
const loading = ref(false);
const binding = ref(false);
const userList = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(5);

const bindForm = reactive({
  selectedUserId: null
});

// 搜索用户
const searchUsers = async () => {
  loading.value = true;
  try {
    // 这里替换为实际的API调用
    const res = await getUserList({
      keyword: searchKeyword.value,
      pageNo: currentPage.value,
      pageSize: pageSize.value
    });
    userList.value = res.list;
    total.value = res.total;
  } catch (error) {
    ElMessage.error('搜索用户失败');
    console.error('搜索用户失败', error);
  } finally {
    loading.value = false;
  }
};

// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page;
  searchUsers();
};

// 确认绑定
const confirmBind = async () => {
  if (!bindForm.selectedUserId) {
    ElMessage.warning('请选择要绑定的用户');
    return;
  }
  
  binding.value = true;
  try {
    // 这里替换为实际的API调用
    await bindMeterToUser({
      meterId: props.meter.id,
      userId: bindForm.selectedUserId
    });
    
    // 获取绑定用户的信息
    const selectedUser = userList.value.find(user => user.id === bindForm.selectedUserId);
    
    emit('success', selectedUser);
  } catch (error) {
    ElMessage.error('绑定用户失败');
    console.error('绑定用户失败', error);
  } finally {
    binding.value = false;
  }
};

// 初始搜索
watch(() => props.meter, () => {
  searchUsers();
}, { immediate: true });
</script>

<style scoped>
.bind-user-container {
  padding: 10px 0;
}

.search-user {
  display: flex;
  gap: 10px;
}

.user-list {
  margin: 20px 0;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.user-list-header {
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.user-list-body {
  max-height: 300px;
  overflow-y: auto;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
}

.user-item:last-child {
  border-bottom: none;
}

.user-item.header {
  font-weight: bold;
  color: #606266;
}

.user-item.selected {
  background-color: #f0f7ff;
}

.user-select {
  width: 60px;
  display: flex;
  align-items: center;
}

.user-name {
  flex: 1;
  min-width: 100px;
}

.user-phone {
  width: 120px;
}

.user-type {
  width: 100px;
}

.user-status {
  width: 80px;
  text-align: center;
}

.pagination {
  margin-top: 15px;
  text-align: right;
}

.dialog-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 