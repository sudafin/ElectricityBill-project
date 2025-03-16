<template>
  <div class="payment-detail">
    <div class="info-section">
      <div class="info-item">
        <span class="label">用户名:</span>
        <span class="value">{{ payment.username }}</span>
      </div>
      <div class="info-item">
        <span class="label">用户状态:</span>
        <span class="value">{{ payment.userStatus }}</span>
      </div>
      <el-divider></el-divider>
      <div class="info-item">
        <span class="label">支付单号:</span>
        <span class="value">{{ payment.paymentId }}</span>
      </div>
      <div class="info-item">
        <span class="label">支付金额:</span>  
        <span class="value">{{ payment.balance }} 元</span>
      </div>
      <div class="info-item">
        <span class="label">支付方式:</span>
        <span class="value">{{ payment.paymentMethod }}</span>
      </div>
      <div class="info-item">
        <span class="label">支付状态:</span>
        <span class="value">
          <el-tag :type="getStatusType(payment.status)">{{ payment.status }}</el-tag>
        </span>
      </div>
      <div class="info-item">
        <span class="label">支付时间:</span>
        <span class="value">{{ payment.paymentTime }}</span>
      </div>
      <el-divider></el-divider>
      <div class="info-item">
        <span class="label">关联对账:</span>
        <template v-if="payment.reconciliationId">
          <span class="value">{{ payment.reconciliationId }}</span>
        </template>
        <template v-else>
          <span class="value">无</span>
        </template>
      </div>
      <div class="info-item">
        <span class="label">对账状态:</span>
        <template v-if="payment.reconciliationStatus">
        <span class="value">{{ payment.reconciliationStatus }}</span>
        </template>
        <template v-else>
          <span class="value">待审批</span>
        </template>
      </div>
      <div class="info-item">
        <span class="label">审批备注:</span>
        <template v-if="payment.reconciliationRemark">
          <span class="value">{{ payment.reconciliationRemark }}</span>
        </template>
        <template v-else>
          <span class="value">无</span>
        </template>
      </div>

    </div>
    <div class="actions">
      <!-- $emit 向父组件传递事件 refund表示发送的事件名称  -->
      <el-button v-if="payment.status === '已支付'" type="danger" @click="$emit('refund')">退款</el-button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

// 定义 props 接收父组件传递的支付信息 type表示支付信息对象里面包含有支付属性 required表示支付信息对象父组件必须传递
const props = defineProps({
  payment: {
    type: Object,
    required: true,
  },
});

// 定义 emits 向父组件传递事件 refund表示退款的事件
const emit = defineEmits(['refund']);

const getStatusType = (status) => {
  switch (status) {
    case '已支付':
      return 'success';
    case '失败':
      return 'danger';
    case '退款':
      return 'warning';
    default:
      return 'info';
  }
};

</script>

<style scoped>
.payment-detail {
  padding: 20px;
}

.info-section {
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.info-item .label {
  width: 100px;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.info-item .value {
  color: #303133;
  font-size: 14px;
}

.el-divider {
  margin: 16px 0;
}

.actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 