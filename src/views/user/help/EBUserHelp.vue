<template>
  <div class="help-page">
      <!-- 搜索框 -->
      <div class="search-section">
        <el-input
          v-model="searchQuery"
          placeholder="请输入您想了解的问题"
          class="search-input"
          clearable
          @keyup.enter="searchHelp"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button @click="searchHelp">搜索</el-button>
          </template>
        </el-input>
        
        <div class="hot-questions">
        <div class="hot-tags">
          <el-tag
            v-for="(tag, index) in hotQuestions.slice(0, 3)"
            :key="index"
            class="hot-tag"
            @click="searchQuery = tag; searchHelp()"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
              </div>

    <!-- 搜索结果区域 -->
    <div v-if="searchResults.length > 0" class="search-results-section">
      <div class="section-header">
                <h3>搜索结果</h3>
        <el-button text type="primary" @click="clearSearch">清除</el-button>
              </div>
      
            <div class="search-results">
              <div
                v-for="(result, index) in searchResults"
                :key="index"
                class="result-item"
                @click="selectFaq(result)"
              >
                <h4 class="result-title">{{ result.question }}</h4>
          <p class="result-preview">{{ result.answer.substring(0, 60) }}...</p>
                <div class="result-category">
                  <el-tag size="small" :type="getCategoryType(result.category)">
                    {{ getCategoryName(result.category) }}
                  </el-tag>
                </div>
              </div>
            </div>
    </div>

    <!-- 主要内容区域 -->
    <div v-else class="main-content">
      <!-- 内容 Tab 控制区域 -->
      <el-tabs v-model="activeTab" class="help-tabs">
        <el-tab-pane label="常见问题" name="faq">
          <!-- 常见问题分类选择 -->
          <el-select 
            v-model="activeCategory" 
            placeholder="选择问题分类" 
            class="category-select"
            @change="handleCategorySelect"
          >
            <el-option label="账户管理" value="account" />
            <el-option label="电费缴纳" value="payment" />
            <el-option label="用电分析" value="usage" />
            <el-option label="通知设置" value="notification" />
            <el-option label="安全问题" value="security" />
            <el-option label="账单查询" value="billing" />
            <el-option label="智能电表" value="smart-meter" />
            <el-option label="节能建议" value="energy-saving" />
          </el-select>
          
          <!-- FAQs 列表 -->
          <div class="faq-list">
            <div class="section-header">
                <h3>{{ getCategoryName(activeCategory) }}</h3>
              </div>
            
            <el-collapse accordion class="faq-collapse">
                <el-collapse-item
                  v-for="(faq, index) in filteredFaqs"
                  :key="index"
                  :name="index"
                >
                  <template #title>
                    <span class="faq-question">{{ faq.question }}</span>
                  </template>
                  <div class="faq-answer">
                    <p v-html="faq.answer"></p>
                    <div v-if="faq.links && faq.links.length > 0" class="faq-links">
                      <span>相关链接：</span>
                    <div class="link-list">
                      <el-link
                        v-for="(link, linkIndex) in faq.links"
                        :key="linkIndex"
                        type="primary"
                        class="faq-link"
                        @click.prevent="handleLinkClick(link)"
                      >
                        {{ link.text }}
                      </el-link>
                    </div>
                    </div>
                    <div class="faq-feedback">
                      <span>这个回答对您有帮助吗？</span>
                    <div class="feedback-buttons">
                      <el-button text type="primary" @click="submitFAQFeedback(faq.id, true)">
                        <el-icon><Star /></el-icon> 有帮助
                      </el-button>
                      <el-button text type="danger" @click="submitFAQFeedback(faq.id, false)">
                        <el-icon><CircleClose /></el-icon> 没帮助
                      </el-button>
                    </div>
                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
        </el-tab-pane>
        
        <el-tab-pane label="操作指南" name="guides">
          <!-- 操作指南选择 -->
          <el-select 
            v-model="activeGuide" 
            placeholder="选择操作指南" 
            class="guide-select"
          >
            <el-option 
              v-for="guide in guides" 
              :key="guide.id" 
              :label="guide.title" 
              :value="guide.id" 
            />
          </el-select>
          
          <!-- 操作指南内容 -->
          <div class="guide-content" v-if="currentGuide">
            <div class="section-header">
              <h3>{{ currentGuide.title }}</h3>
              </div>
            
            <el-timeline class="guide-steps">
              <el-timeline-item
                v-for="(step, index) in currentGuide.steps"
                  :key="index"
                :type="getCategoryType(activeCategory)"
                :icon="step.icon"
                color="#409EFF"
              >
                <h4>{{ step.title }}</h4>
                <p>{{ step.description }}</p>
              </el-timeline-item>
            </el-timeline>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>

    <!-- 联系与反馈卡片 -->
    <div class="contact-card">
      <div class="contact-info">
        <div class="contact-title">联系客服</div>
        <div class="contact-item">
          <el-icon><Phone /></el-icon>
          <span>客服热线：400-123-4567</span>
        </div>
        <div class="contact-item">
          <el-icon><Clock /></el-icon>
          <span>工作时间：周一至周日 8:00-22:00</span>
        </div>
      </div>
      <el-button type="primary" class="contact-btn" @click="showFeedbackDialog">
        <el-icon><Edit /></el-icon>
        问题反馈
      </el-button>
    </div>

    <!-- 反馈问题对话框 -->
    <el-dialog
      v-model="feedbackDialogVisible"
      title="问题反馈"
      width="35%"
      :close-on-click-modal="false"
      top="30vh"
      destroy-on-close
      class="feedback-dialog"
    >
      <el-form 
        ref="feedbackFormRef" 
        :model="feedbackForm" 
        :rules="feedbackRules"
        label-position="top"
        class="feedback-form"
        size="small"
      >
        <el-form-item label="问题类型" prop="category">
          <el-select v-model="feedbackForm.category" placeholder="选择类型" class="form-select">
            <el-option label="账户问题" value="ACCOUNT" />
            <el-option label="电费问题" value="PAYMENT" />
            <el-option label="电表问题" value="METER" />
            <el-option label="系统故障" value="SYSTEM" />
            <el-option label="其他问题" value="OTHER" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="标题" prop="title">
          <el-input  v-model="feedbackForm.title" placeholder="问题标题" />
        </el-form-item>
        
        <el-form-item label="描述" prop="content">
          <el-input
            v-model="feedbackForm.content"
            type="textarea"
            :rows="2"
            placeholder="问题描述"
          />
        </el-form-item>
        
        <el-form-item label="联系方式" prop="contact">
          <el-input v-model="feedbackForm.contact" placeholder="手机号码" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button size="small" @click="feedbackDialogVisible = false">取消</el-button>
          <el-button size="small" type="primary" @click="submitFeedback" :loading="submitting">提交</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Search, User, Money, DataAnalysis, Bell, Lock, 
  Service, Phone, Message, Clock, Star, CircleClose, 
  Edit, Ticket, Monitor, Sunny
} from '@element-plus/icons-vue';

// 页面状态管理
const activeTab = ref('faq');
const searchQuery = ref('');
const activeCategory = ref('account');
const activeGuide = ref('payment-guide');
const feedbackDialogVisible = ref(false);
const submitting = ref(false);

// 反馈表单数据
const feedbackForm = reactive({
  title: '',
  content: '',
  category: '',
  contact: '',
});

// 反馈表单验证规则
const feedbackRules = {
  category: [{ required: true, message: '请选择问题类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入问题标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入问题描述', trigger: 'blur' }],
  contact: [
    { required: true, message: '请输入联系方式', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
};

// 引用
const feedbackFormRef = ref(null);

// 热门问题
const hotQuestions = ref([
  '如何缴纳电费',
  '忘记密码怎么办',
  '电费计算方式',
  '如何查看用电分析',
  '如何设置自动扣款'
]);

// 搜索结果
const searchResults = ref([]);

// FAQ数据
const faqs = ref([
  {
    id: 1,
    question: '如何缴纳电费？',
    answer: '您可以通过以下方式缴纳电费：<br>1. 在线支付：登录系统后，访问"缴纳电费"页面，选择支付方式完成支付<br>2. 自动扣款：在"个人信息"页面设置自动扣款，系统将在账单生成后自动扣款',
    category: 'payment',
    links: [
      { text: '查看缴费指南', url: '#/help/guide/payment' }
    ]
  },
  {
    id: 2,
    question: '忘记密码怎么办？',
    answer: '如果您忘记了登录密码，可以通过以下步骤重置：<br>1. 在登录页面点击"忘记密码"<br>2. 输入您的注册手机号或邮箱<br>3. 获取并输入验证码<br>4. 设置新密码并确认',
    category: 'account',
    links: []
  },
  {
    id: 3, 
    question: '如何查看用电分析？',
    answer: '您可以在"用电分析"页面查看您的用电趋势和分析报告。系统提供月度用电趋势、时段分布、用电类型分布等多种分析维度，并给出节电建议。',
    category: 'usage',
    links: [
      { text: '了解更多用电分析功能', url: '#/help/guide/analysis' }
    ]
  },
  {
    id: 4,
    question: '电费是如何计算的？',
    answer: '电费计算公式为：电费 = 用电量 × 电价 + 附加费用。<br>其中电价根据用户类型、用电时段不同而有所区别。居民用电通常采用阶梯电价，用电量越多，单价越高。详细费率请查看"费率说明"。',
    category: 'payment',
    links: [
      { text: '查看费率说明', url: '#/help/rates' }
    ]
  },
  {
    id: 5,
    question: '如何修改个人信息？',
    answer: '您可以在"个人信息"页面修改您的基本信息、联系方式和通知设置等。点击右上角的"保存修改"按钮即可保存您的更改。',
    category: 'account',
    links: []
  },
  {
    id: 6,
    question: '如何查询历史账单？',
    answer: '您可以在"账单查询"页面查看您的历史账单信息。系统默认显示最近6个月的账单，您可以通过筛选功能查看更早的账单记录。点击账单记录可以查看详细的账单明细。',
    category: 'billing',
    links: []
  },
  {
    id: 7,
    question: '如何导出账单？',
    answer: '在"账单查询"页面，您可以选择需要导出的账单记录，点击"导出"按钮，选择导出格式（PDF或Excel）即可下载账单文件。您也可以在账单详情页面点击"打印"按钮直接打印账单。',
    category: 'billing',
    links: []
  },
  {
    id: 8,
    question: '智能电表显示的数据与实际不符怎么办？',
    answer: '如果您发现智能电表显示的数据与实际情况不符，可以通过以下方式处理：<br>1. 检查电表是否正常工作<br>2. 拍照记录当前电表读数<br>3. 联系客服反馈问题，我们会安排技术人员上门检查',
    category: 'smart-meter',
    links: []
  },
  {
    id: 9,
    question: '如何查看智能电表的实时数据？',
    answer: '您可以通过移动APP随时查看智能电表的实时数据。在APP首页点击"实时监测"，即可查看当前用电情况、历史用电趋势等信息。如果您已安装家庭能源管理系统，还可以查看分设备的用电情况。',
    category: 'smart-meter',
    links: []
  },
  {
    id: 10,
    question: '有哪些实用的节能建议？',
    answer: '我们根据用户用电习惯，总结了以下节能建议：<br>1. 使用高能效电器：购买电器时优先选择能效等级高的产品<br>2. 合理设置空调温度：夏季不低于26℃，冬季不高于20℃<br>3. 避开用电高峰：尽量在电力负荷较低的时段使用大功率电器<br>4. 及时关闭待机设备：完全关闭不使用的电器而非待机状态<br>5. 充分利用自然光：减少白天照明用电',
    category: 'energy-saving',
    links: []
  },
  {
    id: 11,
    question: '如何设置用电超额提醒？',
    answer: '您可以在"通知设置"页面设置用电超额提醒。进入页面后，找到"用电提醒"区域，开启"用电超额提醒"功能，并设置您的月度用电额度和提醒方式（短信/邮件/APP推送）。系统会在您的用电量达到设定额度的80%和100%时发送提醒。',
    category: 'notification',
    links: []
  },
  {
    id: 12,
    question: '如何使用分时电价功能节约电费？',
    answer: '分时电价是指电价根据用电时段不同而有所区别，通常分为峰时、平时和谷时三个时段，峰时电价最高，谷时电价最低。您可以：<br>1. 了解您所在地区的分时电价时段划分<br>2. 将高耗电设备的使用时间尽量安排在电价较低的时段<br>3. 使用智能定时插座，在低谷电价时段自动开启设备',
    category: 'energy-saving',
    links: []
  }
]);

// 操作指南数据
const guides = ref([
  {
    id: 'payment-guide',
    title: '电费缴纳指南',
    steps: [
      {
        title: '步骤1：进入电费缴纳页面',
        description: '在左侧菜单中点击"电费缴纳"选项，进入缴费页面。',
        icon: 'Money'
      },
      {
        title: '步骤2：确认账户信息',
        description: '核对页面上显示的账户信息，确保缴费到正确的账户。',
        icon: 'User'
      },
      {
        title: '步骤3：输入缴费金额',
        description: '输入您想要缴纳的金额，系统会自动显示当前欠费金额。',
        icon: 'Plus'
      },
      {
        title: '步骤4：选择支付方式',
        description: '选择您偏好的支付方式，如支付宝、微信或银行卡。',
        icon: 'Setting'
      },
      {
        title: '步骤5：完成支付',
        description: '点击"立即支付"按钮，按照提示完成支付流程。',
        icon: 'Money'
      }
    ]
  },
  {
    id: 'analysis-guide',
    title: '用电分析指南',
    steps: [
      {
        title: '步骤1：进入用电分析页面',
        description: '在左侧菜单中点击"用电分析"选项，进入分析页面。',
        icon: 'DataAnalysis'
      },
      {
        title: '步骤2：选择分析时间范围',
        description: '在页面顶部选择您想要分析的年份和月份。',
        icon: 'Setting'
      },
      {
        title: '步骤3：查看用电趋势',
        description: '在趋势图中查看您的用电量和电费变化趋势。',
        icon: 'DataAnalysis'
      },
      {
        title: '步骤4：分析用电时段',
        description: '查看不同时段的用电分布，了解您的用电习惯。',
        icon: 'DataAnalysis'
      }
    ]
  },
  {
    id: 'profile-guide',
    title: '个人信息管理指南',
    steps: [
      {
        title: '步骤1：进入个人信息页面',
        description: '在左侧菜单中点击"个人信息"选项，进入信息管理页面。',
        icon: 'User'
      },
      {
        title: '步骤2：编辑个人信息',
        description: '点击"编辑"按钮，修改您的个人信息。',
        icon: 'Setting'
      },
      {
        title: '步骤3：更新联系方式',
        description: '确保您的电话和邮箱等联系方式是最新的。',
        icon: 'Phone'
      },
      {
        title: '步骤4：修改密码',
        description: '在密码管理区域，您可以修改您的登录密码。',
        icon: 'Lock'
      }
    ]
  },
  {
    id: 'billing-guide',
    title: '账单查询指南',
    steps: [
      {
        title: '步骤1：进入账单查询页面',
        description: '在左侧菜单中点击"账单查询"选项，进入账单查询页面。',
        icon: 'Ticket'
      },
      {
        title: '步骤2：选择查询时间范围',
        description: '使用日期选择器选择您要查询的账单时间范围。',
        icon: 'Setting'
      },
      {
        title: '步骤3：筛选账单类型',
        description: '您可以按账单类型、缴费状态等条件筛选账单记录。',
        icon: 'Filter'
      },
      {
        title: '步骤4：查看账单详情',
        description: '点击账单记录可查看详细的账单明细和用电情况。',
        icon: 'Document'
      }
    ]
  }
]);

// 计算当前显示的指南
const currentGuide = computed(() => {
  return guides.value.find(guide => guide.id === activeGuide.value) || guides.value[0];
});

// 根据当前选中的分类过滤FAQ
const filteredFaqs = computed(() => {
  return faqs.value.filter(faq => faq.category === activeCategory.value);
});

// 搜索帮助信息
const searchHelp = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }

  const query = searchQuery.value.toLowerCase();
  searchResults.value = faqs.value.filter(faq => 
    faq.question.toLowerCase().includes(query) || 
    faq.answer.toLowerCase().includes(query)
  );
};

// 清除搜索结果
const clearSearch = () => {
  searchQuery.value = '';
  searchResults.value = [];
};

// 选择FAQ
const selectFaq = (faq) => {
  activeCategory.value = faq.category;
  activeTab.value = 'faq';
  clearSearch();
};

// 提交FAQ反馈
const submitFAQFeedback = (faqId, isHelpful) => {
  ElMessage.success(isHelpful ? '感谢您的反馈！' : '感谢您的反馈，我们会努力改进');
};

// 提交反馈表单
const submitFeedback = async () => {
  if (!feedbackFormRef.value) return;
  
  await feedbackFormRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning('请完善表单信息');
      return;
    }
    
    submitting.value = true;
    
    try {
      // 这里应该是实际的API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      ElMessage.success('反馈提交成功，感谢您的建议');
      feedbackDialogVisible.value = false;
      
      // 重置表单
      feedbackForm.title = '';
      feedbackForm.content = '';
      feedbackForm.category = '';
      feedbackForm.contact = '';
    } catch (error) {
      ElMessage.error('提交失败，请稍后重试');
    } finally {
      submitting.value = false;
    }
  });
};

// 显示反馈对话框
const showFeedbackDialog = () => {
  feedbackDialogVisible.value = true;
};

// 处理分类选择
const handleCategorySelect = (category) => {
  activeCategory.value = category;
};

// 获取分类名称
const getCategoryName = (category) => {
  const categories = {
    'account': '账户管理',
    'payment': '电费缴纳',
    'usage': '用电分析',
    'notification': '通知设置',
    'security': '安全问题',
    'billing': '账单查询',
    'smart-meter': '智能电表',
    'energy-saving': '节能建议',
    'contact': '联系我们'
  };
  return categories[category] || '其他';
};

// 获取分类标签类型
const getCategoryType = (category) => {
  const types = {
    'account': '',
    'payment': 'success',
    'usage': 'info',
    'notification': 'warning',
    'security': 'danger',
    'billing': 'info',
    'smart-meter': 'warning',
    'energy-saving': 'success',
    'contact': ''
  };
  return types[category] || '';
};

// 监听分类变化，更新指南标签
watch(activeCategory, (newCategory) => {
  if (newCategory === 'payment') {
    activeGuide.value = 'payment-guide';
  } else if (newCategory === 'usage') {
    activeGuide.value = 'analysis-guide';
  } else if (newCategory === 'account') {
    activeGuide.value = 'profile-guide';
  } else if (newCategory === 'billing') {
    activeGuide.value = 'billing-guide';
  }
});

// 处理链接点击
const handleLinkClick = (link) => {
  ElMessage.info(`查看内容：${link.text}`);
};

onMounted(() => {
  // 在这里可以加载一些初始数据
});
</script>

<style scoped>
.help-page {
  padding: 16px;
  background-color: #ffffff;
  min-height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 搜索区域样式 */
.search-section {
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
}

.hot-questions {
  margin-top: 12px;
}

.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hot-tag {
  cursor: pointer;
}

/* 搜索结果样式 */
.search-results-section {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  padding: 16px;
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.result-item:hover {
  background-color: #f9f9f9;
}

.result-title {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: #303133;
}

.result-preview {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.5;
}

.result-category {
  text-align: right;
}

/* 主要内容区域样式 */
.main-content {
  flex: 1;
}

.help-tabs {
  width: 100%;
}

.category-select,
.guide-select {
  width: 100%;
  margin-bottom: 16px;
}

.faq-list {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  padding: 16px;
  margin-bottom: 16px;
}

.faq-collapse {
  width: 100%;
}

.faq-question {
  font-weight: 500;
  font-size: 15px;
  color: #303133;
}

.faq-answer {
  padding: 12px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.faq-links {
  margin-top: 12px;
  font-size: 14px;
}

.link-list {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.faq-feedback {
  margin-top: 16px;
  font-size: 14px;
}

.feedback-buttons {
  margin-top: 8px;
  display: flex;
  gap: 12px;
}

/* 操作指南样式 */
.guide-content {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  padding: 16px;
  margin-bottom: 16px;
}

.guide-steps {
  margin-top: 16px;
}

.guide-steps :deep(.el-timeline-item__content) h4 {
  font-weight: 500;
  font-size: 15px;
  color: #303133;
  margin-bottom: 8px;
}

.guide-steps :deep(.el-timeline-item__content) p {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

/* 联系卡片样式 */
.contact-card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.contact-btn {
  width: 100%;
}

/* 反馈表单样式 */
.feedback-dialog {
  border-radius: 8px;
}

.feedback-dialog :deep(.el-dialog) {
  max-width: 320px;
  margin: 0 auto !important;
}

.feedback-form {
  width: 100%;
  margin: 0;
}

.feedback-form :deep(.el-form-item) {
  margin-bottom: 12px;
}

.feedback-form :deep(.el-form-item__label) {
  padding-bottom: 5px;
  line-height: 1.5;
  font-size: 14px;
}

.form-select {
  width: 100%;
}

:deep(.el-dialog__body) {
  padding: 12px 14px;
}

:deep(.el-dialog__header) {
  padding: 8px 10px;
  margin-right: 0;
  box-sizing: border-box;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-dialog__title) {
  font-size: 14px;
}

:deep(.el-dialog__headerbtn) {
  top: 8px;
  right: 8px;
}

:deep(.el-dialog__footer) {
  padding: 6px 10px;
  box-sizing: border-box;
  border-top: 1px solid #f0f0f0;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.dialog-footer .el-button {
  flex: 1;
  margin: 0 4px;
  height: 28px;
  font-size: 12px;
}

/* 适配小屏幕 */
@media screen and (max-width: 480px) {
  .help-page {
    padding: 12px;
  }
  
  .section-header h3 {
    font-size: 15px;
  }
  
  .faq-question {
    font-size: 14px;
  }
  
  .faq-answer {
    font-size: 13px;
  }
}
</style> 