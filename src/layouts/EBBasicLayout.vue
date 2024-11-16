<template>
  <div class="eb-app-container">
    <el-container>
      <el-aside width="auto">
        <EBSidebar />
      </el-aside>
      <el-container>
        <el-main>
          <EBHeader />
          <EBBreadcrumb />
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
    <el-footer>
      <EBFooter />
    </el-footer>
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
}

.el-container {
  flex: 1;
}

.el-header {
  background-color: #fff;
  color: #333;
  text-align: center;
  line-height: 60px;
}

.el-aside {
  background-color: #545c64;
  color: #333;
  text-align: center;
  line-height: 200px;
}

.el-main {
  background-color: #f0f2f5;
  color: #333;
  padding: 0;
}

.el-footer {
  background-color: #fff;
  color: #333;
  text-align: center;
  line-height: 60px;
}
</style> 