<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>处理反馈</span>
        </div>
      </template>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px" class="feedback-form" v-loading="loading">
        <el-form-item label="反馈ID" prop="id">
          <el-input v-model="form.id" disabled />
        </el-form-item>
        <el-form-item label="用户名" prop="userName">  
          <el-input v-model="form.userName" disabled />
        </el-form-item>
        <el-form-item label="反馈类型" prop="feedbackType">
          <el-input v-model="form.feedbackType" disabled />  
        </el-form-item>
        <el-form-item label="反馈内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="4" disabled />
        </el-form-item>
        <el-form-item label="状态" prop="feedbackStatus">
          <el-select v-model="form.feedbackStatus" placeholder="请选择">
            <el-option label="待处理" value="pending" />
            <el-option label="已处理" value="processed" />  
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-form-item>
        <el-form-item label="回复内容" prop="response">
          <el-input v-model="form.response" type="textarea" :rows="4" placeholder="请输入回复内容" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit" :loading="submitting">提交</el-button>
          <el-button @click="onCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { getFeedBackDetail, processFeedBack } from '@/api/admin/feedback';
import { ElMessage } from 'element-plus';

export default {
  data() {
    return {
      loading: false,
      submitting: false,
      form: {
        id: undefined,
        userName: '',
        feedbackType: '',
        content: '',
        feedbackStatus: '',
        response: '',
        submitTime: ''
      },
      rules: {
        feedbackStatus: [
          { required: true, message: '请选择处理状态', trigger: 'change' }
        ],
        response: [
          { required: true, message: '请输入回复内容', trigger: 'blur' }
        ]  
      }
    }
  },
  created() {
    this.getFeedback()
  },
  methods: {
    async getFeedback() {
      const id = this.$route.params.id;
      if (!id) {
        ElMessage.error('缺少反馈ID');
        this.onCancel();
        return;
      }
      
      this.loading = true;
      try {
        const response = await getFeedBackDetail(id);
        this.form = response || {};
      } catch (error) {
        console.error(error);
        ElMessage.error('获取反馈详情失败');
      } finally {
        this.loading = false;
      }
    },
    async onSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.submitting = true;
          try {
            await processFeedBack({
              feedbackId: this.form.id,
              feedbackStatus: this.form.feedbackStatus,
              response: this.form.response
            });
            ElMessage.success('提交成功');
            this.onCancel();
          } catch (error) {
            console.error(error);
            ElMessage.error('提交失败');
          } finally {
            this.submitting = false;
          }
        } else {
          return false;
        }
      });
    },
    onCancel() {
      this.$router.push('/admin/feedback');
    }
  }
}
</script>

<style scoped>
.feedback-form {
  width: 600px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 