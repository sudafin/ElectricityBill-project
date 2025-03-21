<template>
  <div class="approval-dashboard">
    <el-card class="approval-card">
      <template #header>
        <div class="header">
          <h3>审批对账单</h3>
        </div>
      </template>
      <el-form :model="approvalForm" label-width="120px">
        <el-form-item label="对账单号">
          <el-input v-model="approvalForm.reconciliationNo" disabled />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="approvalForm.username" disabled />
        </el-form-item>
        <el-form-item label="金额">
          <el-input v-model="approvalForm.balance" disabled />
        </el-form-item>
        <el-form-item label="审批意见">
          <el-input v-model="approvalForm.comment" type="textarea" :disabled="approvalForm.isApproved" />
        </el-form-item>
        <el-form-item label="附件/证据">
          <el-upload
            action="#"
            :auto-upload="false"
            :on-change="handleAttachmentChange"
            :file-list="approvalForm.attachments"
          >
            <el-button type="primary" :disabled="approvalForm.isApproved">选择文件</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="审批结果">
          <div class="approval-actions">
            <el-select
              v-model="approvalForm.status"
              placeholder="请选择审批结果"
              :disabled="approvalForm.isApproved"
              class="approval-select"
            >
              <el-option label="通过" value="通过" />
              <el-option label="拒绝" value="拒绝" />
              <el-option label="暂缓" value="暂缓" />
              <el-option label="退回" value="退回" />
            </el-select>
            <el-button
              type="primary"
              @click="handleSubmit"
              :disabled="approvalForm.isApproved"
              class="submit-btn"
            >
              <el-icon><Check /></el-icon>
              提交
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      
      <el-divider></el-divider>
      
      <h4>历史审批记录</h4>
      <div class="approval-history-wrapper">
        <el-table :data="approvalHistory" stripe max-height="200">
          <el-table-column prop="reconciliationNo" label="对账单号" width="120"></el-table-column>
          <el-table-column prop="approvalOperator" label="审批人" width="100"></el-table-column>
          <el-table-column prop="approvalStatus" label="审批状态" width="100"></el-table-column>
          <el-table-column prop="comment" label="审批意见" min-width="200"></el-table-column>
          <el-table-column prop="approvalTime" label="审批时间" width="200"></el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { approveReconciliationDetail, approveReconciliation } from '@/api/admin/reconciliation.js';
import { ElMessage } from 'element-plus';
const route = useRoute();
const router = useRouter();
const approvalForm = ref({});
const approvalHistory = ref([]);
onMounted(async () => {
  const res = await approveReconciliationDetail(route.params.reconciliationNo);
  approvalForm.value = res;
  approvalHistory.value = res.approvalRecordList;
});

const handleAttachmentChange = (file, fileList) => {
  //先不用传附件使用提示框
  ElMessage.warning('暂不支持上传附件');
};

const handleSubmit = async  () => {
  if(approvalForm.value.status === '' || approvalForm.value.comment === '') {
    ElMessage.warning('请选择审批结果或填写审批意见');
    return;
  }
  const params = {
    status: approvalForm.value.status,
    comment: approvalForm.value.comment,
  }
  const res = await approveReconciliation(route.params.reconciliationNo, params);
  if(res.code === 200) {
    ElMessage.success('审批成功');
    router.push('/reconciliation');
  } else {
    ElMessage.error('审批失败');
  }
};
</script>

<style scoped>
.approval-dashboard {
  padding: 20px;
  background-color: #f5f7fa;
}

.approval-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.el-form {
  margin-top: 20px;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-input {
  width: 100%;
}

.el-button {
  width: 120px;
}

.el-divider {
  margin: 20px 0;
}

h4 {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 600;
}

.approval-history-wrapper {
  max-height: 200px;
  overflow-y: auto;
}

.el-table {
  width: 100%;
}

.el-table__body-wrapper {
  overflow-y: auto;
}

.approval-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.approval-select {
  width: 200px;
}

.submit-btn,
.cancel-btn {
  flex: 1;
  max-width: 120px;
}

.submit-btn {
  background-color: #409eff;
  border-color: #409eff;
  color: #fff;
}

.submit-btn:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.cancel-btn {
  background-color: #fff;
  border-color: #dcdfe6;
  color: #606266;
}

.cancel-btn:hover {
  background-color: #f5f7fa;
  border-color: #c6e2ff;
  color: #409eff;
}

.submit-btn:active,
.cancel-btn:active {
  opacity: 0.8;
}

.submit-btn.is-disabled,
.cancel-btn.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 