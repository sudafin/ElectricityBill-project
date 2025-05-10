<template>
  <div class="eb-pagination">
    <el-pagination
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      :disabled="disabled"
      @current-change="handlePageChange"
      :layout="layout"
      :prev-text="prevText"
      :next-text="nextText"
    ></el-pagination>
    <div class="eb-pagination-total" v-if="showTotal">共 {{ total }} 条</div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  total: {
    type: Number,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  layout: {
    type: String,
    default: 'prev, pager, next, jumper',
  },
  prevText: {
    type: String,
    default: '上一页',
  },
  nextText: {
    type: String,
    default: '下一页',
  },
  showTotal: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['page-change']);

const handlePageChange = (page) => {
  emit('page-change', page);
};
</script>

<style scoped>
.eb-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.eb-pagination-total {
  color: #999;
  font-size: 14px;
}
</style> 