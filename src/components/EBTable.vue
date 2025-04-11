<template>
  <div class="eb-table">
    <el-table
      ref="tableRef"
      v-bind="$attrs"
      :data="data"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      :loading="loading"
      :border="border"
      stripe
      :height="autoHeight ? undefined : height"
      :max-height="autoHeight ? undefined : maxHeight"
      highlight-current-row
      @row-click="handleRowClick"
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
        :show-overflow-tooltip="column.showOverflowTooltip || true"
        :sortable="column.sortable"
        :sort-by="column.sortBy"
        :align="column.align || 'center'"
      >
        <template #default="scope">
          <slot :name="column.prop" v-bind="scope">
            <template v-if="column.type === 'tag'">
              <el-tag
                :type="getTagType(scope.row[column.prop], column.tagMap)"
                :effect="column.tagEffect || 'plain'"
              >
                {{ scope.row[column.prop] }}
              </el-tag>
            </template>
            <template v-else-if="column.type === 'date'">
              {{ formatDate(scope.row[column.prop], column.dateFormat) }}
            </template>
            <template v-else>
              {{ scope.row[column.prop] }}
            </template>
          </slot>
        </template>
        <template #header v-if="column.headerSlot">
          <slot :name="`header-${column.prop}`">
            {{ column.label }}
          </slot>
        </template>
      </el-table-column>
      <el-table-column v-if="showActions" :label="actionsLabel" :width="actionsWidth" :fixed="actionsFixed" :align="actionsAlign">
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
    
    <!-- 分页组件 -->
    <div v-if="pagination" class="eb-pagination">
      <el-pagination
        v-bind="paginationProps"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="pageSizes"
        :layout="paginationLayout"
        :total="total"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, computed, onMounted, nextTick } from 'vue';

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
  border: {
    type: Boolean,
    default: true,
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
    default: '160',
  },
  actionsAlign: {
    type: String,
    default: 'center',
  },
  actionsFixed: {
    type: String,
    default: 'right',
  },
  // 分页相关属性
  pagination: {
    type: Boolean,
    default: false,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  pageSizes: {
    type: Array,
    default: () => [10, 20, 50, 100],
  },
  total: {
    type: Number,
    default: 0,
  },
  paginationLayout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper',
  },
  height: {
    type: [String, Number],
    default: '',
  },
  maxHeight: {
    type: [String, Number],
    default: '',
  },
  paginationProps: {
    type: Object,
    default: () => ({}),
  },
  // 新增自动高度属性
  autoHeight: {
    type: Boolean,
    default: true,
  }
});

const emit = defineEmits([
  'selection-change', 
  'sort-change', 
  'row-click', 
  'page-change', 
  'size-change'
]);

const tableRef = ref(null);

const handleSelectionChange = (selection) => {
  emit('selection-change', selection);
};

const handleSortChange = (sortParams) => {
  emit('sort-change', sortParams);
};

const handleRowClick = (row, column, event) => {
  emit('row-click', { row, column, event });
};

const handleSizeChange = (size) => {
  emit('size-change', size);
};

const handleCurrentChange = (page) => {
  emit('page-change', page);
};

// 获取标签类型
const getTagType = (value, tagMap) => {
  if (!tagMap) return '';
  return tagMap[value] || '';
};

// 格式化日期
const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '';
  // 简单的日期格式化，实际项目中可以使用dayjs等库
  return date;
};

// 确保表格在DOM渲染后再设置高度
onMounted(() => {
  if (!props.autoHeight && (props.height || props.maxHeight)) {
    // 等待DOM渲染完成再获取表格引用
    nextTick(() => {
      if (tableRef.value) {
        // 可以在这里手动触发表格布局更新
        tableRef.value.doLayout();
      }
    });
  }
});

</script>

<style scoped>
.eb-table {
  width: 100%;
}

.eb-pagination {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

/* 调整表格风格使其与白色背景融合 */
:deep(.el-table) {
  background-color: transparent;
}

:deep(.el-table__header-wrapper),
:deep(.el-table__body-wrapper) {
  background-color: transparent;
}

:deep(.el-table th.el-table__cell) {
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-table .el-table__cell) {
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-table::before) {
  height: 0; /* 移除表格底部的线 */
}

/* 简化分页组件样式 */
:deep(.el-pagination) {
  padding: 0;
  margin-top: 15px;
}
</style> 