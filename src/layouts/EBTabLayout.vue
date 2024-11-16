<template>
  <div class="eb-tab-layout">
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane
        v-for="tab in tabs"
        :key="tab.name"
        :label="tab.label"
        :name="tab.name"
      >
        <router-view :name="tab.name"></router-view>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const tabs = [
  { label: '选项卡1', name: 'tab1' },
  { label: '选项卡2', name: 'tab2' },
  { label: '选项卡3', name: 'tab3' },
];

const activeTab = ref(route.name);

const handleTabClick = (tab) => {
  router.push({ name: tab.props.name });
};
</script>

<style scoped>
.eb-tab-layout {
  padding: 20px;
}
</style> 