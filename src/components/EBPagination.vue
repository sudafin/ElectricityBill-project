<template>
  <div class="eb-pagination">
    <el-pagination
      :current-page="currentPage"
      :page-sizes="pageSizes"
      :page-size="pageSize"
      :layout="layout"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  currentPage: {
    type: Number,
    default: 1,
  },
  pageSizes: {
    type: Array,
    default: () => [10, 20, 30, 50],
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  layout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper',
  },
  total: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['size-change', 'current-change']);

const handleSizeChange = (val) => {
  emit('size-change', val);
};

const handleCurrentChange = (val) => {
  emit('current-change', val);
};
</script>

<style scoped>
.eb-pagination {
  margin-top: 20px;
  text-align: right;
}
</style> 