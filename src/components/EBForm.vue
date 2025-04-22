<template>
  <div class="eb-form">
    <el-form ref="formRef" :model="formData" v-bind="$attrs">
      <el-form-item
        v-for="(item, index) in formItems"
        :key="index"
        :label="item.label"
        :prop="item.prop"
        :rules="item.rules"
      >
        <component
          :is="item.component"
          v-model="formData[item.prop]"
          v-bind="item.attrs"
          :placeholder="item.placeholder || `请输入${item.label}`"
        >
          <template v-if="item.options">
            <component
              :is="item.optionComponent || 'el-option'"
              v-for="(option, oIndex) in item.options"
              :key="oIndex"
              :label="option.label"
              :value="option.value"
            ></component>
          </template>
        </component>
      </el-form-item>
      <slot></slot>
    </el-form>
  </div>
</template>

<script setup>
import { defineProps, defineExpose, ref } from 'vue';

const props = defineProps({
  formItems: {
    type: Array,
    default: () => [],
  },
  formData: {
    type: Object,
    default: () => ({}),
  },
});

const formRef = ref(null);

const resetForm = () => {
  formRef.value.resetFields();
};

const validate = () => {
  return formRef.value.validate();
};

defineExpose({
  resetForm,
  validate,
});
</script>

<style scoped>
.eb-form {
  width: 100%;
}
</style> 