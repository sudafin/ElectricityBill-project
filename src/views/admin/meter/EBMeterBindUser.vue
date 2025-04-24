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
            placeholder="请输入用户身份证号查询"
            @keyup.enter="searchUserByIdCard"
          >
            <template #append>
              <el-button @click="searchUserByIdCard">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>
      </el-form-item>
    </el-form>
    
    <div class="user-table-container">
      <div class="user-list" v-loading="loading">
        <el-empty v-if="!userData" description="暂无用户数据"></el-empty>
        <div v-else class="user-info-card">
          <div class="user-list-header">
            <div class="user-item header">
              <div class="user-name">用户名</div>
              <div class="user-phone">手机号</div>
              <div class="user-idcard">身份证号</div>
              <div class="user-status">状态</div>
            </div>
          </div>
          <div class="user-list-body">
            <div 
              class="user-item selected"
            >
              <div class="user-name" :title="userData.username">{{ userData.username }}</div>
              <div class="user-phone" :title="userData.phone">{{ userData.phone }}</div>
              <div class="user-idcard" :title="userData.idCardNo">{{ userData.idCardNo || '-' }}</div>
              <div class="user-status">
                <el-tag :type="userData.status === '正常' ? 'success' : 'danger'" size="small">
                  {{ userData.status || '正常' }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="dialog-footer">
      <el-button @click="$emit('cancel')">取消</el-button>
      <el-button type="primary" @click="confirmBind" :disabled="!userData" :loading="binding">
        确认绑定
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { getUserInfoByIdCard, bindMeter } from '@/api/admin/user';

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
const userData = ref(null);

const bindForm = reactive({});

// 通过身份证号查询用户
const searchUserByIdCard = async () => {
  if (!searchKeyword.value) {
    ElMessage.warning('请输入身份证号');
    return;
  }
  
  loading.value = true;
  try {
    const res = await getUserInfoByIdCard(searchKeyword.value);
    console.log('通过身份证查询用户结果:', res);
    
    if (res && res.id) {
      // 确保返回的数据符合预期的格式
      userData.value = {
        id: res.id,
        username: res.username || '未知用户',
        phone: res.phone || '无',
        idCardNo: searchKeyword.value, // 使用查询的身份证号
        status: res.status || '正常'
      };
      
      console.log('处理后的用户数据:', userData.value);
    } else {
      userData.value = null;
      ElMessage.warning('未找到匹配的用户');
    }
  } catch (error) {
    ElMessage.error('查询用户失败');
    console.error('查询用户失败', error);
    userData.value = null;
  } finally {
    loading.value = false;
  }
};

// 确认绑定
const confirmBind = async () => {
  if (!userData.value || !userData.value.id) {
    ElMessage.warning('请先查询并确认用户信息');
    return;
  }
  
  binding.value = true;
  try {
    const bindData = {
      meterId: props.meter.id,
      userId: userData.value.id,
      status: 1 // 1表示绑定
    };
    
    console.log('绑定电表数据:', bindData);
    const res = await bindMeter(bindData);
    
    if (res && res.code === 200) {
      ElMessage.success('绑定用户成功');
      emit('success', userData.value);
    } else {
      ElMessage.error(res?.msg || '绑定用户失败');
    }
  } catch (error) {
    ElMessage.error('绑定用户失败');
    console.error('绑定用户失败', error);
  } finally {
    binding.value = false;
  }
};
</script>

<style scoped>
.bind-user-container {
  padding: 10px 0;
  width: 100%;
}

.search-user {
  display: flex;
  width: 100%;
  margin-bottom: 20px;
}

.user-table-container {
  width: 100%;
  overflow-x: visible;
}

.user-list {
  margin: 20px 0;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  width: 100%;
}

.user-info-card {
  width: 100%;
  display: block;
}

.user-list-header {
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  width: 100%;
}

.user-list-body {
  max-height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 12px 10px;
  border-bottom: 1px solid #ebeef5;
  width: 100%;
  box-sizing: border-box;
  min-height: 50px;
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

.user-name {
  width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 5px;
  flex-shrink: 0;
  font-size: 14px;
  line-height: 1.4;
}

.user-phone {
  width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 5px;
  flex-shrink: 0;
  font-size: 14px;
  line-height: 1.4;
}

.user-idcard {
  width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 5px;
  flex-shrink: 0;
  font-size: 14px;
  line-height: 1.4;
}

.user-status {
  width: 80px;
  text-align: center;
  padding: 0 5px;
  flex-shrink: 0;
}

.dialog-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 