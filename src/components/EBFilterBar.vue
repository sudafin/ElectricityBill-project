<template>
  <div class="eb-filter-bar">
    <div class="filter-container">
      <div class="filter-area">
        <div class="filter-form-container">
          <!-- 动态渲染筛选项 -->
          <div 
            v-for="(filter, index) in filters" 
            :key="index" 
            class="filter-item"
          >
            <span class="filter-label">{{ filter.label }}</span>
            
            <!-- 输入框 -->
            <el-input
              v-if="filter.type === 'input'"
              v-model="filterValues[filter.field]"
              :placeholder="filter.placeholder || `请输入${filter.label}`"
              :clearable="filter.clearable !== false"
              @keyup.enter="handleSearch"
              @clear="handleClear(filter.field)"
            />
            
            <!-- 选择器 -->
            <el-select
              v-else-if="filter.type === 'select'"
              v-model="filterValues[filter.field]"
              :placeholder="filter.placeholder || `请选择${filter.label}`"
              :clearable="filter.clearable !== false"
              @change="filter.immediate && handleSearch()"
            >
              <el-option
                v-for="option in filter.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            
            <!-- 日期选择器 -->
            <el-date-picker
              v-else-if="filter.type === 'date'"
              v-model="filterValues[filter.field]"
              :type="filter.dateType || 'date'"
              :placeholder="filter.placeholder || `请选择${filter.label}`"
              :clearable="filter.clearable !== false"
              :format="filter.format"
              :value-format="filter.valueFormat || 'YYYY-MM-DD'"
            />
            
            <!-- 日期范围选择器 -->
            <el-date-picker
              v-else-if="filter.type === 'daterange'"
              v-model="filterValues[filter.field]"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :clearable="filter.clearable !== false"
              :format="filter.format"
              :value-format="filter.valueFormat || 'YYYY-MM-DD'"
            />
            
            <!-- 数字输入框 -->
            <el-input-number
              v-else-if="filter.type === 'number'"
              v-model="filterValues[filter.field]"
              :min="filter.min"
              :max="filter.max"
              :step="filter.step || 1"
              :precision="filter.precision"
              :controls="filter.controls !== false"
            />
            
            <!-- 自定义插槽 -->
            <slot 
              v-else-if="filter.type === 'custom'" 
              :name="`filter-${filter.field}`"
              :filter="filter"
              :value="filterValues[filter.field]"
              @update:value="val => filterValues[filter.field] = val"
            />
          </div>
        </div>
        
        <!-- 操作按钮区域 -->
        <div class="action-buttons">
          <slot name="prepend-buttons"></slot>
          
          <el-button 
            type="primary" 
            class="action-button" 
            @click="handleSearch"
            :size="buttonSize"
            :icon="searchIcon"
          >
            {{ searchButtonText }}
          </el-button>
          
          <el-button 
            type="info" 
            plain
            class="action-button" 
            @click="handleReset"
            :size="buttonSize"
            :icon="resetIcon"
          >
            {{ resetButtonText }}
          </el-button>
          
          <slot name="append-buttons"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits, onMounted, watch } from 'vue';
import { Search, RefreshRight } from '@element-plus/icons-vue';

const props = defineProps({
  // 筛选项配置
  filters: {
    type: Array,
    required: true,
    // 每个筛选项的格式:
    // {
    //   type: 'input' | 'select' | 'date' | 'daterange' | 'number' | 'custom',
    //   field: 'fieldName', // 对应的字段名
    //   label: '显示名称',
    //   placeholder: '提示文本',
    //   clearable: true,
    //   options: [] // select类型的选项
    //   ... 其他特定类型的属性
    // }
  },
  // 初始值
  initialValues: {
    type: Object,
    default: () => ({})
  },
  // 按钮文本
  searchButtonText: {
    type: String,
    default: '查询'
  },
  resetButtonText: {
    type: String,
    default: '重置'
  },
  // 是否有搜索图标
  searchIcon: {
    type: Object,
    default: () => Search
  },
  // 是否有重置图标
  resetIcon: {
    type: Object,
    default: () => RefreshRight
  },
  // 添加按钮尺寸属性
  buttonSize: {
    type: String,
    default: 'default'
  }
});

const emit = defineEmits(['search', 'reset', 'filter-change']);

// 筛选值
const filterValues = reactive({ ...props.initialValues });

// 搜索
const handleSearch = () => {
  emit('search', { ...filterValues });
};

// 清除单个字段
const handleClear = (field) => {
  filterValues[field] = undefined;
  emit('filter-change', { field, value: undefined, values: { ...filterValues } });
};

// 重置所有过滤条件
const handleReset = () => {
  Object.keys(filterValues).forEach(key => {
    filterValues[key] = undefined;
  });
  emit('reset');
  emit('search', { ...filterValues });
};

// 监听值变化
watch(filterValues, (newVal) => {
  emit('filter-change', { values: { ...newVal } });
}, { deep: true });

// 初始化
onMounted(() => {
  if (Object.keys(props.initialValues).length > 0) {
    Object.assign(filterValues, props.initialValues);
  }
});
</script>

<style scoped>
.eb-filter-bar {
  width: 100%;
}

.filter-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.filter-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  padding-bottom: 60px;
}

.filter-form-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px 40px;
  width: 100%;
  justify-items: center;
}

.filter-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  gap: 10px;
}

.filter-label {
  font-size: 14px;
  color: #606266;
  width: 80px;
  text-align: right;
  flex-shrink: 0;
}

.action-buttons {
  display: flex;
  gap: 15px;
  position: absolute;
  bottom: 15px;
  right: 0;
}

/* 统一按钮样式 */
.action-button {
  min-width: 90px; /* 设置最小宽度确保按钮宽度一致 */
  border-radius: 4px;
}

/* 统一图标按钮样式 */
:deep(.action-button .el-icon) {
  margin-right: 4px;
  vertical-align: middle;
}

/* 响应式布局 */
@media screen and (max-width: 1200px) {
  .filter-form-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media screen and (max-width: 768px) {
  .filter-form-container {
    grid-template-columns: 1fr;
  }
  
  .filter-label {
    width: 70px;
  }
  
  .action-buttons {
    position: static;
    justify-content: flex-end;
    margin-top: 15px;
  }
  
  .filter-area {
    padding-bottom: 0;
  }
}
</style> 