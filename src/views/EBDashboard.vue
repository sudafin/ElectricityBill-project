<template>
  <div class="dashboard">
    <h1>欢迎来到电费管理系统</h1>
    <p>这是系统的主页,您可以在这里查看系统的整体情况。</p>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>用户总数</span>
            </div>
          </template>
          <div class="card-content">
            <span class="card-number">1,234</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>总电费</span>
            </div>
          </template>
          <div class="card-content">
            <span class="card-number">￥12,345.67</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
// 添加必要的导入和逻辑
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  font-size: 24px;
}

.card-number {
  color: #409eff;
  font-weight: bold;
}
</style> 