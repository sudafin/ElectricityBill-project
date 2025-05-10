<template>
  <EBPageLayout>
    <template #header>
      <div class="eb-help-header">
        <h2 class="eb-section-title">帮助中心</h2>
        <div class="eb-help-search">
          <el-input
            v-model="searchQuery"
            placeholder="搜索问题或关键词"
            class="search-input"
            clearable
            @input="handleSearch"
          >
            <template #suffix>
              <el-icon class="search-icon"><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>
    </template>

    <div class="eb-help-container">
      <!-- 常见问题类别 -->
      <div class="help-categories">
        <div 
          v-for="category in categories" 
          :key="category.id" 
          class="category-card"
          :class="{ 'active': currentCategory === category.id }"
          @click="selectCategory(category.id)"
        >
          <el-icon class="category-icon"><component :is="category.icon" /></el-icon>
          <span class="category-name">{{ category.name }}</span>
        </div>
      </div>

      <!-- FAQ 列表 -->
      <div class="faq-section">
        <div v-if="loading" class="eb-loading-container">
          <el-skeleton :rows="5" animated />
        </div>
        <el-empty v-else-if="filteredFaqs.length === 0" description="未找到符合条件的问题" />
        <el-collapse v-else accordion>
          <el-collapse-item 
            v-for="faq in filteredFaqs" 
            :key="faq.id" 
            :title="faq.question" 
            :name="faq.id"
          >
            <div class="faq-answer" v-html="faq.answer"></div>
            <div class="faq-footer">
              <span class="faq-helpful">这个回答对您有帮助吗？</span>
              <div class="faq-actions">
                <EBButton size="small" @click="markHelpful(faq.id, true)">有帮助</EBButton>
                <EBButton size="small" @click="markHelpful(faq.id, false)">没帮助</EBButton>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>

    <!-- 联系客服 -->
    <div class="contact-support">
      <h3>没有找到您需要的信息？</h3>
      <p>我们的客服团队随时为您提供帮助</p>
      <div class="contact-actions">
        <EBButton type="primary" @click="contactCustomerService">
          <el-icon><Service /></el-icon> 联系客服
        </EBButton>
        <EBButton @click="submitFeedback">
          <el-icon><EditPen /></el-icon> 提交反馈
        </EBButton>
      </div>
    </div>

    <!-- 反馈表单对话框 -->
    <el-dialog v-model="feedbackDialogVisible" title="提交反馈" width="30%">
      <el-form :model="feedbackForm" label-width="80px">
        <el-form-item label="反馈类型">
          <el-select v-model="feedbackForm.type" placeholder="请选择反馈类型">
            <el-option label="问题报告" value="problem" />
            <el-option label="功能建议" value="suggestion" />
            <el-option label="内容错误" value="content" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="反馈内容">
          <el-input
            v-model="feedbackForm.content"
            type="textarea"
            :rows="4"
            placeholder="请描述您的反馈内容"
          />
        </el-form-item>
        <el-form-item label="联系方式">
          <el-input v-model="feedbackForm.contact" placeholder="选填，方便我们联系您" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <EBButton @click="feedbackDialogVisible = false">取消</EBButton>
          <EBButton type="primary" @click="submitFeedbackForm" :loading="submitting">
            提交
          </EBButton>
        </span>
      </template>
    </el-dialog>
  </EBPageLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, QuestionFilled, CreditCard, Warning, Setting, Mobile, Document, Service, EditPen } from '@element-plus/icons-vue';
import { EBPageLayout, EBButton } from '@/components';

// ... existing script content ...
</script>

<style scoped>
.eb-help-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
  margin-bottom: 15px;
}

.eb-section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.eb-help-search {
  width: 300px;
}

.search-input {
  width: 100%;
}

.search-icon {
  color: #909399;
}

.eb-help-container {
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
  margin-bottom: 20px;
}

.help-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 30px;
}

.category-card {
  flex: 1;
  min-width: 150px;
  max-width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-card:hover {
  border-color: #e4e7ed;
  background-color: #f5f7fa;
}

.category-card.active {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.category-icon {
  font-size: 30px;
  color: #409eff;
  margin-bottom: 15px;
}

.category-name {
  font-size: 14px;
  color: #606266;
}

.faq-section {
  margin-bottom: 30px;
}

.faq-answer {
  color: #606266;
  line-height: 1.6;
}

.faq-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  border-top: 1px solid #ebeef5;
  padding-top: 15px;
}

.faq-helpful {
  font-size: 14px;
  color: #909399;
}

.faq-actions {
  display: flex;
  gap: 10px;
}

.contact-support {
  text-align: center;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
  margin-bottom: 20px;
}

.contact-support h3 {
  font-size: 18px;
  color: #303133;
  margin-top: 0;
  margin-bottom: 10px;
}

.contact-support p {
  color: #606266;
  margin-bottom: 20px;
}

.contact-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.eb-loading-container {
  padding: 20px;
}
</style> 