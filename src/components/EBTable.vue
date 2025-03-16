<template>
  <div class="eb-table">
    <el-table
      ref="tableRef"
      v-bind="$attrs"
      :data="data"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      :loading="loading"
    >
      <el-table-column v-if="selection" type="selection" width="55"></el-table-column>
      <el-table-column
        v-for="column in columns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :width="column.width"
        :fixed="column.fixed"
        :formatter="column.formatter"
        :show-overflow-tooltip="column.showOverflowTooltip"
        :sortable="column.sortable"
        :sort-by="column.sortBy"
        :align="column.align"
      >
        <template #default="scope">
          <slot :name="column.prop" v-bind="scope">
            {{ scope.row[column.prop] }}
          </slot>
        </template>
        <template #header v-if="column.headerSlot">
          <slot :name="`header-${column.prop}`">
            {{ column.label }}
          </slot>
        </template>
      </el-table-column>
      <el-table-column v-if="showActions" :label="actionsLabel" :width="actionsWidth" :align="actionsAlign">
        <template #header>
          <slot name="actions-header">
            <div class="cell">{{ actionsLabel }}</div>
          </slot>
        </template>
        <template #default="scope">
          <slot name="actions" v-bind="scope"></slot>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
  selection: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  showActions: {
    type: Boolean,
    default: false,
  },
  actionsLabel: {
    type: String,
    default: '操作',
  },
  actionsWidth: {
    type: String,
    default: '120',
  },
  actionsAlign: {
    type: String,
    default: 'center',
  }
});

const emit = defineEmits(['selection-change', 'sort-change']);

const tableRef = ref(null);

const handleSelectionChange = (selection) => {
  emit('selection-change', selection);
};

const handleSortChange = (sortParams) => {
  emit('sort-change', sortParams);
};

</script>

<style scoped>
.eb-table {
  width: 100%;
}
</style> 