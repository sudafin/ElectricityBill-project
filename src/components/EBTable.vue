<template>
  <div class="eb-table">
    <el-table 
      :data="tableData" 
      v-bind="$attrs"
      @selection-change="handleSelectionChange"
    >
      <el-table-column v-if="selection" type="selection" width="10"></el-table-column>
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
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  tableData: {
    type: Array,
    default: () => [],
  },
  columns: {
    type: Array,
    default: () => [],
  },
  selection: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['selection-change']);

const handleSelectionChange = (selection) => {
  emit('selection-change', selection);
};
</script>

<style scoped>
.eb-table {
  width: 100%;
}
</style> 