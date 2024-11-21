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
          <el-input v-model="approvalForm.amount" disabled />
        </el-form-item>
        <el-form-item label="审批意见">
          <el-input v-model="approvalForm.comment" type="textarea" />
        </el-form-item>
        <el-form-item label="附件/证据">
          <el-upload
            action="#"
            :auto-upload="false"
            :on-change="handleAttachmentChange"
            :file-list="approvalForm.attachments"
          >
            <el-button type="primary">选择文件</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="success" @click="approveReconciliation">通过</el-button>
          <el-button type="danger" @click="rejectReconciliation">拒绝</el-button>
          <el-button type="warning" @click="holdReconciliation">暂时搁置</el-button>
          <el-button @click="cancelApproval">取消</el-button>
        </el-form-item>
      </el-form>
      
      <el-divider></el-divider>
      
      <h4>历史审批记录</h4>
      <div class="approval-history-wrapper">
        <el-table :data="approvalHistory" stripe max-height="200">
          <el-table-column prop="reconciliationNo" label="对账单号" width="120"></el-table-column>
          <el-table-column prop="approver" label="审批人" width="100"></el-table-column>
          <el-table-column prop="status" label="审批状态" width="100"></el-table-column>
          <el-table-column prop="comment" label="审批意见" min-width="200"></el-table-column>
          <el-table-column prop="approvalTime" label="审批时间" width="160"></el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const approvalForm = ref({
  id: route.params.id,
  reconciliationNo: 'R20230501001',
  username: '张三',
  amount: 1000,
  comment: '',
  attachments: [],
});

const approvalHistory = ref([
  {
    reconciliationNo: 'R20230501002',
    approver: '李四',
    status: '已通过',
    comment: '审批通过,可以报销',
    approvalTime: '2023-05-20 10:30:00',
  },
  {
    reconciliationNo: 'R20230501003',
    approver: '王五',
    status: '已拒绝',
    comment: '费用不合理,不予报销',
    approvalTime: '2023-05-18 14:20:00',
  },
  {
    reconciliationNo: 'R20230401001',
    approver: '赵六',
    status: '已通过',
    comment: '审批通过,可以报销',
    approvalTime: '2023-04-15 10:30:00',
  },
  {
    reconciliationNo: 'R20230301001',
    approver: '钱七',
    status: '已拒绝',
    comment: '费用不合理,不予报销',
    approvalTime: '2023-03-10 14:20:00',
  },
  {
    reconciliationNo: 'R20230201001',
    approver: '孙八',
    status: '已通过',
    comment: '审批通过,可以报销',
    approvalTime: '2023-02-05 09:15:00',
  },
  {
    reconciliationNo: 'R20230101001',
    approver: '周九',
    status: '已通过',
    comment: '审批通过,可以报销',
    approvalTime: '2023-01-20 16:45:00',
  },
]);

const handleAttachmentChange = (file, fileList) => {
  approvalForm.value.attachments = fileList;
};

const approveReconciliation = () => {
  // 处理通过审批的逻辑
  router.push({ name: 'Reconciliation' });
};

const rejectReconciliation = () => {
  // 处理拒绝审批的逻辑
  router.push({ name: 'Reconciliation' });
};

const holdReconciliation = () => {
  // 处理暂时搁置审批的逻辑
  router.push({ name: 'Reconciliation' });
};

const cancelApproval = () => {
  router.push({ name: 'Reconciliation' });
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
</style> 