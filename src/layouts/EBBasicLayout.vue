<template>
  <div class="eb-app-container">
    <div class="eb-app-header" >
      <EBHeader />
    </div>
    <el-container class="eb-app-content">
      <el-aside width="auto" class="eb-app-aside">
        <EBSidebar />
      </el-aside>
      <el-main class="eb-app-main">
        <div class="eb-main-content">
          <EBBreadcrumb />
          <router-view></router-view>
        </div>
      </el-main>
    </el-container>
    <div class="eb-app-footer">
      <EBFooter />
    </div>
  </div>
</template>

<script setup>
import EBHeader from '@/components/EBHeader.vue';
import EBSidebar from '@/components/EBSidebar.vue';
import EBFooter from '@/components/EBFooter.vue';
import EBBreadcrumb from '@/components/EBBreadcrumb.vue';
</script>

<style scoped>
.eb-app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f0f2f5;
}

.eb-app-header {
  width: 100%;
}

.eb-app-content {
  flex: 1;
  padding: 10px;
  display: flex;
  align-items: flex-start;
}

.eb-app-aside {
  background-color: transparent;
  color: #333;
  text-align: center;
  line-height: 200px;
  padding: 0;
  margin-right: 10px;
}

.eb-app-main {
  flex: 1;
  padding: 0;
}

/* .eb-main-content {
  background-color: #fff;
  color: #333;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); 
} */

.eb-app-footer {
  width: 100%;
}
</style> 