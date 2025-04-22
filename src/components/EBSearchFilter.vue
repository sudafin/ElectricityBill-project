<template>
  <div class="eb-search-filter">
    <slot name="prefix"></slot>
    
    <el-input
      v-if="showSearch"
      v-model="searchModel"
      :placeholder="searchPlaceholder"
      clearable
      @clear="handleClear"
      @keyup.enter="handleSearch"
      :style="{ width: searchWidth }"
    >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>
    
    <slot name="filters"></slot>
    
    <EBButton type="primary" @click="handleSearch">
      <el-icon><Search /></el-icon>搜索
    </EBButton>
    
    <slot name="actions"></slot>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { EBButton } from '@/components';

const props = defineProps({
  searchValue: {
    type: String,
    default: '',
  },
  searchPlaceholder: {
    type: String,
    default: '搜索',
  },
  searchWidth: {
    type: String,
    default: '300px',
  },
  showSearch: {
    type: Boolean,
    default: true,
  }
});

const emit = defineEmits(['search', 'clear', 'update:searchValue']);

const searchModel = ref(props.searchValue);

watch(() => props.searchValue, (newVal) => {
  searchModel.value = newVal;
});

watch(searchModel, (newVal) => {
  emit('update:searchValue', newVal);
});

const handleSearch = () => {
  emit('search');
};

const handleClear = () => {
  emit('clear');
};
</script>

<style scoped>
.eb-search-filter {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
}

.eb-search-filter .el-input {
  width: 240px;
}

.eb-search-filter .el-select {
  width: 120px;
}

.eb-search-filter .el-date-picker {
  width: 220px;
}

.eb-search-filter .el-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  white-space: nowrap;
}

.eb-search-filter .el-button .el-icon {
  margin-right: 4px;
}
</style> 