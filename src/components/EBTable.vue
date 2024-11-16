<template>
  <div class="eb-table">
    <el-table :data="tableData" v-bind="$attrs">
      <el-table-column
        v-for="(column, index) in columns"
        :key="index"
        :prop="column.prop"
        :label="column.label"
        :width="column.width"
        :fixed="column.fixed"
        :formatter="column.formatter"
      >
        <template #default="scope">
          <slot :name="column.prop" :row="scope.row">
            {{ scope.row[column.prop] }}
          </slot>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  tableData: {
    type: Array,
    default: () => [],
  },
  columns: {
    type: Array,
    default: () => [],
  },
});
</script>

<style scoped>
.eb-table {
  width: 100%;
}
</style> 