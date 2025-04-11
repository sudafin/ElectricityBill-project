<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>处理反馈</span>
        </div>
      </template>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px" class="feedback-form">
        <el-form-item label="反馈ID" prop="id">
          <el-input v-model="form.id" disabled />
        </el-form-item>
        <el-form-item label="用户ID" prop="user_id">  
          <el-input v-model="form.user_id" disabled />
        </el-form-item>
        <el-form-item label="反馈类型" prop="feedback_type">
          <el-input v-model="form.feedback_type" disabled />  
        </el-form-item>
        <el-form-item label="反馈内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="4" disabled />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择">
            <el-option label="待处理" value="pending" />
            <el-option label="已处理" value="processed" />  
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-form-item>
        <el-form-item label="回复内容" prop="response">
          <el-input v-model="form.response" type="textarea" :rows="4" placeholder="请输入回复内容" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">提交</el-button>
          <el-button @click="onCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { getFeedbackDetail, updateFeedback } from '@/api/feedback'

export default {
  data() {
    return {
      form: {
        id: undefined,
        user_id: undefined,
        feedback_type: '',
        content: '',
        status: '',
        response: ''  
      },
      rules: {
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
      const id = this.$route.params.id
      try {
        const response = await getFeedbackDetail(id)
        if (response.code === 200) {
          this.form = response.data
        } else {
          this.$message.error('获取反馈详情失败')
        }
      } catch (error) {
        console.error(error)
        this.$message.error('获取反馈详情失败')
      }
    },
    onSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            const response = await updateFeedback(this.form)
            if (response.code === 200) {
              this.$message.success('提交成功')
              this.$router.pushName('FeedbackList')
            } else {
              this.$message.error('提交失败')  
            }
          } catch (error) {
            console.error(error)
            this.$message.error('提交失败')
          }
        } else {
          return false;
        }
      });
    },
    onCancel() {
      this.$router.pushName('FeedbackList')
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