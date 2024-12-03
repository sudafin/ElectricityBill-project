<template>
  <div class="eb-table">
    <el-table
      ref="tableRef"
      v-bind="$attrs"
      :data="data"
      @selection-change="handleSelectionChange"
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
      >
        <template #default="scope">
          <slot :name="column.slotName" v-bind="scope" >
            {{ scope.row[column.prop] }}
          </slot>
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
});

const emit = defineEmits(['selection-change']);

const tableRef = ref(null);

const handleSelectionChange = (selection) => {
  emit('selection-change', selection);
};

</script>

<style scoped>
.eb-table {
  width: 100%;
}
</style> 