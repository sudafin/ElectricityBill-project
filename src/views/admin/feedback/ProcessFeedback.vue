<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>处理反馈</span>
        </div>
      </template>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px" class="feedback-form" v-loading="loading">
        <el-form-item label="用户名" prop="userName">  
          <el-input v-model="form.userName" disabled />
        </el-form-item>
        <el-form-item label="反馈类型" prop="feedbackType">
          <el-input v-model="form.feedbackType" disabled />  
        </el-form-item>
        <el-form-item label="反馈内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="4" disabled />
        </el-form-item>
        <el-form-item label="提交时间" prop="submitTime">
          <el-input v-model="form.submitTime" disabled />
        </el-form-item>
        <el-form-item label="状态" prop="feedbackStatus">
          <el-select v-model="form.feedbackStatus" placeholder="请选择" @change="handleStatusChange">
            <el-option label="待处理" value="待处理" />
            <el-option label="正在处理" value="正在处理" />
            <el-option label="已处理" value="已处理" />  
            <el-option label="已关闭" value="已关闭" />
          </el-select>
        </el-form-item>
        <el-form-item label="回复内容" prop="response">
          <el-input 
            v-model="form.response" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入回复内容" 
            :disabled="form.feedbackStatus === '已关闭'" 
          />
        </el-form-item>
        <el-form-item label="处理时间" prop="processTime" v-if="form.processTime">
          <el-input v-model="form.processTime" disabled />
        </el-form-item>
        <el-form-item label="处理人" prop="processorName" v-if="form.processorName">
          <el-input v-model="form.processorName" disabled />
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
    // 定义响应验证器
    const validateResponse = (rule, value, callback) => {
      if (this.form.feedbackStatus === '已关闭') {
        // 如果状态是已关闭，不需要验证回复内容
        callback();
      } else if (!value || value.trim() === '') {
        callback(new Error('请输入回复内容'));
      } else {
        callback();
      }
    };
    
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
        submitTime: '',
        processTime: '',
        processorName: ''
      },
      rules: {
        feedbackStatus: [
          { required: true, message: '请选择处理状态', trigger: 'change' }
        ],
        response: [
          { required: true, message: '请输入回复内容', trigger: 'blur', validator: validateResponse }
        ]  
      }
    }
  },
  created() {
    this.getFeedback()
  },
  methods: {
    // 状态变更处理
    handleStatusChange(value) {
      console.log('状态变更为:', value);
      
      if (value === '已关闭') {
        // 如果选择了"已关闭"状态，自动填写默认回复内容
        if (!this.form.response || this.form.response.trim() === '') {
          this.form.response = '该反馈已关闭';
        }
      }
      
      // 重新验证表单
      this.$refs.form.validateField('response');
    },
    
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
        if (response) {
          this.form = {
            userName: response.userName || '',
            feedbackType: response.feedbackType || '',
            content: response.content || '',
            feedbackStatus: response.feedbackStatus || '',
            response: response.response || '',
            submitTime: response.submitTime || '',
            processTime: response.processTime || '',
            processorName: response.processorName || ''
          };
        }
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
            // 构造处理反馈的参数
            const processData = {
              feedbackId: this.$route.params.id,
              feedbackStatus: this.form.feedbackStatus,
              response: this.form.response || (this.form.feedbackStatus === '已关闭' ? '该反馈已关闭' : '')
            };
            
            console.log('提交处理反馈:', processData);
            await processFeedBack(processData);
            ElMessage.success('提交成功');
            this.onCancel();
          } catch (error) {
            console.error('处理反馈失败:', error);
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
      this.$router.push('/admin/feedback/list');
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