<template>
  <div class="user-form-container">
      <el-form 
      ref="formRef"
        :model="userForm" 
        :rules="rules" 
        label-width="120px"
      class="user-form"
    >
      <el-form-item label="身份证号" prop="idCardNo">
        <el-input v-model="userForm.idCardNo" placeholder="请输入18位身份证号" />
      </el-form-item>
      <el-form-item label="用户名" prop="username">
        <el-input v-model="userForm.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="userForm.phone" placeholder="请输入手机号" />
        </el-form-item>
      <el-form-item label="所在地区" prop="region">
        <el-cascader
          v-model="userForm.region"
          :options="regionOptions"
          placeholder="请选择省/市/区"
          @change="handleRegionChange"
        />
        </el-form-item>
      <el-form-item label="详细地址" prop="addressDetail">
        <el-input v-model="userForm.addressDetail" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="电表编号" prop="meterNo">
        <el-input v-model="userForm.meterNo" placeholder="请输入电表编号" />
        </el-form-item>
        <el-form-item label="用户类型" prop="userType">
          <el-select v-model="userForm.userType" placeholder="请选择用户类型">
          <el-option 
            v-for="item in userTypeOptions" 
            :key="item.value" 
            :label="item.label" 
            :value="item.value" 
          />
          </el-select>
        </el-form-item>
      <el-form-item class="form-button-group">
        <el-button @click="resetForm">重置</el-button>
        <el-button type="primary" @click="submitForm">提交</el-button>
        </el-form-item>
      </el-form>
  </div>
</template>

<script>
import { reactive, ref, toRefs, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { createUser, editUser, getUserDetail, getUserTypeList } from '@/api/admin/admin'
import { regionData } from './regionData'
import { useRoute } from 'vue-router'

export default {
  name: 'EBUserForm',
  props: {
    userId: {
      type: [String, Number],
      default: null
    }
  },
  emits: ['submit-success'],
  setup(props, { emit }) {
    const formRef = ref(null)
    const regionOptions = ref(regionData)
    const route = useRoute()
    const isEditMode = ref(false)
    const loading = ref(false)
    
    // 用户类型选项
    const userTypeOptions = ref([
      { value: 0, label: '居民' },
      { value: 1, label: '商业' }
    ])
    
    const state = reactive({
      userForm: {
        idCardNo: '',
  username: '',
  phone: '',
        region: [], // 存储省市区的值
        addressDetail: '', // 详细地址
        address: '', // 完整地址（提交时拼接）
  meterNo: '',
        userType: 0
      }
    })

    // 表单验证规则
    const rules = reactive({
      idCardNo: [
        { required: true, message: '请输入身份证号', trigger: 'blur' },
        { 
          pattern: /(^\d{18}$)|(^\d{17}(\d|X|x)$)/, 
          message: '请输入正确的18位身份证号', 
          trigger: 'blur' 
        }
      ],
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 2, max: 20, message: '用户名长度应为2-20个字符', trigger: 'blur' }
      ],
      phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
      ],
      region: [
        { required: true, message: '请选择所在地区', trigger: 'change' }
      ],
      addressDetail: [
        { required: true, message: '请输入详细地址', trigger: 'blur' }
      ],
      meterNo: [
        // 移除必填验证
      ],
      userType: [
        { required: true, message: '请选择用户类型', trigger: 'change' }
      ]
    })

    // 获取用户类型列表
    const fetchUserTypeList = async () => {
      try {
        console.log('开始获取用户类型列表')
        const res = await getUserTypeList()
        console.log('获取到的用户类型列表:', res)
        
        // 处理不同格式的响应
        if (Array.isArray(res)) {
          // 如果是简单的字符串数组 (List<String>)
          if (res.length > 0 && typeof res[0] === 'string') {
            userTypeOptions.value = [
              ...res.map((typeName, index) => ({ 
                value: index, 
                label: typeName 
              }))
            ]
          } 
          // 如果是对象数组 (List<UserType>)
          else if (res.length > 0 && typeof res[0] === 'object') {
            userTypeOptions.value = [
              ...res.map((type, index) => ({ 
                value: index, 
                label: type.typeName || type.name || `类型${index}` 
              }))
            ]
          }
        } else if (res && res.data && Array.isArray(res.data)) {
          userTypeOptions.value = [
            ...res.data.map((item, index) => {
              if (typeof item === 'string') {
                return { value: index, label: item }
              }
              return { 
                value: index, 
                label: item.typeName || item.name || `类型${index}` 
              }
            })
          ]
        }
        
        console.log('处理后的用户类型选项:', userTypeOptions.value)
    } catch (error) {
        console.error('获取用户类型列表失败:', error)
        // 保留默认选项
      }
    }

    // 处理地区选择变化
    const handleRegionChange = (value) => {
      console.log('地区选择变化:', value)
      updateFullAddress()
    }

    // 更新完整地址
    const updateFullAddress = () => {
      if (state.userForm.region && state.userForm.region.length > 0) {
        // 查找选中的地区标签
        const selectedLabels = []
        let currentOptions = regionOptions.value
        
        state.userForm.region.forEach((code) => {
          const option = currentOptions.find(opt => opt.value === code)
          if (option) {
            selectedLabels.push(option.label)
            currentOptions = option.children || []
          }
        })
        
        // 组合完整地址，并去掉空格
        state.userForm.address = [
          ...selectedLabels,
          state.userForm.addressDetail
        ].filter(Boolean).join('').replace(/\s+/g, '')
        
        console.log('更新后的完整地址:', state.userForm.address)
      }
    }

    // 解析地址为省市区和详细地址
    const parseAddress = (fullAddress) => {
      if (!fullAddress) return
      
      console.log('解析地址:', fullAddress)
      // 尝试匹配省市区
      const found = []
      let remainingAddress = fullAddress
      let currentLevel = regionOptions.value
      
      // 尝试从省开始匹配
      while (currentLevel && currentLevel.length > 0) {
        let matched = false
        
        for (const option of currentLevel) {
          if (remainingAddress.startsWith(option.label)) {
            found.push(option.value)
            remainingAddress = remainingAddress.substring(option.label.length).trim()
            currentLevel = option.children || []
            matched = true
            break
          }
        }
        
        if (!matched) break
      }
      
      // 根据匹配到的级别进行处理
      if (found.length > 0) {
        state.userForm.region = found
        state.userForm.addressDetail = remainingAddress
        
        // 如果只匹配到省或市，将剩余内容作为详细地址
        if (found.length < 3) {
          console.log(`只匹配到${found.length}级地址，剩余内容作为详细地址`)
        }
      } else {
        // 如果无法匹配，将整个地址放入详细地址
        console.log('无法匹配任何省市区，将整个地址放入详细地址')
        state.userForm.addressDetail = fullAddress
      }
      
      console.log('解析结果:', {
        region: state.userForm.region,
        addressDetail: state.userForm.addressDetail
      })
    }

    // 获取用户详情
    const fetchUserDetail = async (userId) => {
      if (!userId) return
      
      loading.value = true
      try {
        console.log('开始获取用户ID为', userId, '的详细信息')
        const res = await getUserDetail(userId)
        console.log('获取到的用户详情数据:', res)
        
        const data = res.data || res
        
        if (data) {
          // 编辑模式，填充表单
          state.userForm.idCardNo = data.idCardNo || ''
          state.userForm.username = data.username || ''
          state.userForm.phone = data.phone || ''
          state.userForm.meterNo = data.meterNo || data.meterId || ''
          
          // 处理用户类型，将字符串值转为数字
          if (typeof data.userType === 'number') {
            state.userForm.userType = data.userType
          } else if (data.userType === '居民' || data.userType === '居民用户') {
            state.userForm.userType = 0
          } else if (data.userType === '商业' || data.userType === '商业用户') {
            state.userForm.userType = 1
          } else {
            state.userForm.userType = 0 // 默认居民
          }
          
          // 解析地址
          if (data.address) {
            console.log('开始解析地址:', data.address)
            parseAddress(data.address)
          }
          
          // 确保表单数据已更新
          console.log('表单数据已更新:', state.userForm)
          
          // 更新表单后强制渲染
          nextTick(() => {
            if (formRef.value) {
              formRef.value.validateField([])
            }
          })
        } else {
          console.warn('未获取到用户数据或数据为空')
          ElMessage.warning('未获取到用户数据')
        }
      } catch (error) {
        console.error('获取用户详情失败:', error)
        ElMessage.error('获取用户详情失败: ' + (error.message || '未知错误'))
      } finally {
        loading.value = false
      }
    }

    // 初始化表单
    const initForm = async () => {
      // 首先获取用户类型列表
      await fetchUserTypeList()
      
      // 从路由参数获取用户ID (优先级高于props)
      const routeUserId = route.params.id
      const targetUserId = routeUserId || props.userId
      
      if (targetUserId) {
        isEditMode.value = true
        console.log('编辑模式, 用户ID:', targetUserId)
        await fetchUserDetail(targetUserId)
      } else {
        isEditMode.value = false
        console.log('创建模式')
        // 创建模式不需要加载数据，使用默认值
      }
    }

    // 提交表单
    const submitForm = async () => {
      if (!formRef.value) return
      
      await formRef.value.validate(async (valid) => {
        if (valid) {
          try {
            // 提交前更新完整地址
            updateFullAddress()
            console.log('提交前表单数据:', state.userForm)
            
            // 准备提交的数据
            const submitData = { ...state.userForm }
            // 移除region字段，后端不需要
            delete submitData.region
            delete submitData.addressDetail
            
            // 获取用户类型的中文名称
            const userTypeOption = userTypeOptions.value.find(item => item.value === state.userForm.userType)
            submitData.userType = userTypeOption ? userTypeOption.label : '居民'
            
            console.log('准备提交的数据:', submitData)
            
            loading.value = true
            // 根据是否是编辑模式判断调用创建还是编辑接口
            const routeUserId = route.params.id
            const targetUserId = routeUserId || props.userId
            
            if (targetUserId) {
              submitData.id = targetUserId
              const result = await editUser(submitData)
              console.log('编辑用户结果:', result)
              ElMessage.success('编辑用户成功')
            } else {
              const result = await createUser(submitData)
              console.log('创建用户结果:', result)
              ElMessage.success('创建用户成功')
            }
            
            emit('submit-success')
          } catch (error) {
            console.error('提交表单失败:', error)
            ElMessage.error(`提交失败: ${error.message || '未知错误'}`)
          } finally {
            loading.value = false
          }
        } else {
          ElMessage.warning('请完善表单信息')
          return false
        }
      })
    }

    // 重置表单
    const resetForm = () => {
      if (formRef.value) {
        formRef.value.resetFields()
      }
    }

    onMounted(() => {
      initForm()
    })

    return {
      formRef,
      regionOptions,
      userTypeOptions,
      isEditMode,
      loading,
      ...toRefs(state),
      rules,
      handleRegionChange,
      submitForm,
      resetForm
    }
  }
}
</script>

<style scoped>
.user-form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.user-form {
  margin-top: 16px;
}

.form-button-group {
  margin-top: 24px;
  text-align: right;
}
</style> 