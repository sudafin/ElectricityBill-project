<template>
  <div class="payment-detail">
    <div class="info-section">
      <div class="info-item">
        <span class="label">用户名:</span>
        <span class="value">{{ payment.username }}</span>
      </div>
      <div class="info-item">
        <span class="label">用户ID:</span>
        <span class="value">{{ payment.userId }}</span>
      </div>
      <el-divider></el-divider>
      <div class="info-item">
        <span class="label">订单号:</span>
        <span class="value">{{ payment.orderNo }}</span>
      </div>
      <div class="info-item">
        <span class="label">支付金额:</span>
        <span class="value">{{ payment.amount }} 元</span>
      </div>
      <div class="info-item">
        <span class="label">支付方式:</span>
        <span class="value">{{ payment.paymentMethod }}</span>
      </div>
      <div class="info-item">
        <span class="label">支付流水号:</span>
        <span class="value">{{ payment.transactionNo }}</span>
      </div>
      <el-divider></el-divider>
      <div class="info-item">
        <span class="label">支付状态:</span>
        <span class="value">
          <el-tag :type="getStatusType(payment.status)">{{ getStatusText(payment.status) }}</el-tag>
        </span>
      </div>
      <div class="info-item" v-if="payment.status === 'failed'">
        <span class="label">失败原因:</span>
        <span class="value">{{ payment.failureReason }}</span>
      </div>
      <el-divider></el-divider>
      <div class="info-item">
        <span class="label">关联账单:</span>
        <span class="value">{{ payment.billNo }}</span>
      </div>
    </div>
    <div class="actions">
      <!-- $emit 向父组件传递事件 refund表示发送的事件名称  -->
      <el-button v-if="payment.status === 'success'" type="danger" @click="$emit('refund')">退款</el-button>
      <el-button v-if="payment.status === 'failed'" type="primary" @click="$emit('retry')">重新支付</el-button>
      <el-button v-if="payment.status === 'pending'" type="warning" @click="$emit('urge')">催促处理</el-button>
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

// 定义 emits 向父组件传递事件 retry、urge、refund分别表示重新支付、催促处理、退款的事件
const emit = defineEmits(['retry', 'urge', 'refund']);

const getStatusType = (status) => {
  switch (status) {
    case 'success':
      return 'success';
    case 'failed':
      return 'danger';
    case 'pending':
      return 'warning';
    default:
      return 'info';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'success':
      return '成功';
    case 'failed':
      return '失败';
    case 'pending':
      return '待处理';
    default:
      return '';
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