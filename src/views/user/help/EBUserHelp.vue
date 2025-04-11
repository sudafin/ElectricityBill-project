<template>
  <EBPageLayout>
    <template #header>
      <div class="eb-help-header">
        <!-- 移除标题元素 -->
      </div>
    </template>

    <div class="help-container">
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
          <span class="hot-label">热门问题：</span>
          <el-tag
            v-for="(tag, index) in hotQuestions"
            :key="index"
            class="hot-tag"
            @click="searchQuery = tag; searchHelp()"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <el-row :gutter="20" class="main-content">
        <!-- 左侧导航 -->
        <el-col :span="6">
          <el-card class="nav-card">
            <template #header>
              <div class="nav-header">
                <h3>帮助分类</h3>
              </div>
            </template>
            <el-menu
              :default-active="activeCategory"
              class="help-menu"
              @select="handleCategorySelect"
            >
              <el-menu-item index="account">
                <el-icon><User /></el-icon>
                <span>账户管理</span>
              </el-menu-item>
              <el-menu-item index="payment">
                <el-icon><Money /></el-icon>
                <span>电费缴纳</span>
              </el-menu-item>
              <el-menu-item index="usage">
                <el-icon><DataAnalysis /></el-icon>
                <span>用电分析</span>
              </el-menu-item>
              <el-menu-item index="notification">
                <el-icon><Bell /></el-icon>
                <span>通知设置</span>
              </el-menu-item>
              <el-menu-item index="security">
                <el-icon><Lock /></el-icon>
                <span>安全问题</span>
              </el-menu-item>
              <el-menu-item index="billing">
                <el-icon><Ticket /></el-icon>
                <span>账单查询</span>
              </el-menu-item>
              <el-menu-item index="smart-meter">
                <el-icon><Monitor /></el-icon>
                <span>智能电表</span>
              </el-menu-item>
              <el-menu-item index="energy-saving">
                <el-icon><Sunny /></el-icon>
                <span>节能建议</span>
              </el-menu-item>
              <el-menu-item index="contact">
                <el-icon><Service /></el-icon>
                <span>联系我们</span>
              </el-menu-item>
            </el-menu>
          </el-card>

          <el-card class="contact-card">
            <template #header>
              <div class="contact-header">
                <h3>联系客服</h3>
              </div>
            </template>
            <div class="contact-content">
              <div class="contact-item">
                <el-icon><Phone /></el-icon>
                <span>客服热线：400-123-4567</span>
              </div>
              <div class="contact-item">
                <el-icon><Message /></el-icon>
                <span>邮箱：support@ebill.com</span>
              </div>
              <div class="contact-item">
                <el-icon><Clock /></el-icon>
                <span>工作时间：周一至周日 8:00-22:00</span>
              </div>
              <el-button type="primary" class="contact-btn" @click="showFeedbackDialog">
                <el-icon><Edit /></el-icon>
                反馈问题
              </el-button>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧内容 -->
        <el-col :span="18">
          <el-card v-if="searchResults.length > 0" class="search-results-card">
            <template #header>
              <div class="results-header">
                <h3>搜索结果</h3>
                <el-button text @click="clearSearch">清除搜索</el-button>
              </div>
            </template>
            <div class="search-results">
              <div
                v-for="(result, index) in searchResults"
                :key="index"
                class="result-item"
                @click="selectFaq(result)"
              >
                <h4 class="result-title">{{ result.question }}</h4>
                <p class="result-preview">{{ result.answer.substring(0, 100) }}...</p>
                <div class="result-category">
                  <el-tag size="small" :type="getCategoryType(result.category)">
                    {{ getCategoryName(result.category) }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-card>

          <el-card v-else class="faq-card">
            <template #header>
              <div class="faq-header">
                <h3>{{ getCategoryName(activeCategory) }}</h3>
              </div>
            </template>
            <div class="faq-content">
              <el-collapse accordion>
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
                      <el-link
                        v-for="(link, linkIndex) in faq.links"
                        :key="linkIndex"
                        :href="link.url"
                        target="_blank"
                        type="primary"
                        class="faq-link"
                      >
                        {{ link.text }}
                      </el-link>
                    </div>
                    <div class="faq-feedback">
                      <span>这个回答对您有帮助吗？</span>
                      <el-button text type="primary" @click="submitFeedback(faq.id, true)">
                        <el-icon><Star /></el-icon> 有帮助
                      </el-button>
                      <el-button text type="danger" @click="submitFeedback(faq.id, false)">
                        <el-icon><CircleClose /></el-icon> 没帮助
                      </el-button>
                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </el-card>

          <el-card class="guide-card">
            <template #header>
              <div class="guide-header">
                <h3>操作指南</h3>
              </div>
            </template>
            <div class="guide-content">
              <el-tabs v-model="activeGuide" tab-position="left" class="guide-tabs">
                <el-tab-pane
                  v-for="(guide, index) in guides"
                  :key="index"
                  :label="guide.title"
                  :name="guide.id"
                >
                  <div class="guide-container">
                    <div class="guide-steps">
                      <el-steps :active="guide.steps.length" direction="vertical" space="20px">
                        <el-step
                          v-for="(step, stepIndex) in guide.steps"
                          :key="stepIndex"
                          :title="step.title"
                          :description="step.description"
                        >
                          <template #icon>
                            <el-icon><component :is="step.icon" /></el-icon>
                          </template>
                        </el-step>
                      </el-steps>
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 反馈问题对话框 -->
    <el-dialog
      v-model="feedbackDialogVisible"
      title="问题反馈"
      width="60%"
      destroy-on-close
    >
      <EBFeedbackForm ref="feedbackFormRef" />
    </el-dialog>
  </EBPageLayout>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Search,
  User,
  Money,
  DataAnalysis,
  Bell,
  Lock,
  Service,
  Phone,
  Message,
  Clock,
  ChatDotRound,
  Star,
  CircleClose,
  Picture,
  Plus,
  Setting,
  Refresh,
  Download,
  Upload,
  Edit,
  Ticket,
  Monitor,
  Sunny,
  VideoPlay,
  Link,
  Connection,
  Notification,
  Position,
  Promotion,
  Printer,
  CreditCard,
  OfficeBuilding,
  MessageBox
} from '@element-plus/icons-vue';
import { EBPageLayout, EBFeedbackForm } from '@/components';
import { 
  searchHelp as apiSearchHelp, 
  getCategoryFAQs, 
  submitFeedback, 
  submitFeedbackForm, 
  getHotQuestions, 
  getAllCategories,
  getOperationGuide
} from '@/api/user/help';

// 页面状态管理
const activeTab = ref('faqs');
const searchQuery = ref('');
const activeCategoryId = ref(null);
const feedbackForm = ref({
  title: '',
  content: '',
  category: '',
  contact: '',
  email: '',
  phone: '',
  attachments: []
});
const loading = ref(false);
const searchLoading = ref(false);
const submitting = ref(false);

// 数据存储
const helpCategories = ref([]);
const hotQuestions = ref([]);
const categoryFAQs = ref([]);
const searchResults = ref([]);
const operationGuides = ref([]);

// 初始化页面数据
const initPageData = async () => {
  loading.value = true;
  try {
    // 获取所有帮助类别
    const categoriesResponse = await getAllCategories();
    if (categoriesResponse.code === 200) {
      helpCategories.value = categoriesResponse.data || [];
      
      // 设置默认选中第一个类别
      if (helpCategories.value.length > 0) {
        activeCategoryId.value = helpCategories.value[0].id;
        await loadCategoryFAQs(activeCategoryId.value);
      }
    }
    
    // 获取热门问题
    const hotQuestionsResponse = await getHotQuestions({ limit: 5 });
    if (hotQuestionsResponse.code === 200) {
      hotQuestions.value = hotQuestionsResponse.data || [];
    }
    
    // 获取操作指南
    await loadOperationGuides();
  } catch (error) {
    console.error('初始化帮助中心数据失败:', error);
    ElMessage.error('加载帮助中心数据失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 加载类别FAQ
const loadCategoryFAQs = async (categoryId) => {
  loading.value = true;
  try {
    const response = await getCategoryFAQs(categoryId);
    if (response.code === 200) {
      categoryFAQs.value = response.data || [];
    } else {
      categoryFAQs.value = [];
      ElMessage.warning(response.message || '获取FAQ列表失败');
    }
  } catch (error) {
    console.error('获取FAQ列表失败:', error);
    ElMessage.error('获取FAQ列表失败，请稍后重试');
    categoryFAQs.value = [];
  } finally {
    loading.value = false;
  }
};

// 加载操作指南
const loadOperationGuides = async () => {
  try {
    const response = await getOperationGuide();
    if (response.code === 200) {
      operationGuides.value = response.data || [];
    }
  } catch (error) {
    console.error('获取操作指南失败:', error);
    ElMessage.error('获取操作指南失败，请稍后重试');
  }
};

// 切换类别
const handleCategoryChange = (categoryId) => {
  activeCategoryId.value = categoryId;
  loadCategoryFAQs(categoryId);
};

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

// 提交FAQ反馈
const submitFAQFeedback = async (faqId, isHelpful) => {
  try {
    const response = await submitFeedback({
      faqId,
      isHelpful,
      additionalComment: ''
    });
    
    if (response.code === 200) {
      ElMessage.success(isHelpful ? '感谢您的反馈！' : '感谢您的反馈，我们会努力改进');
    } else {
      ElMessage.warning(response.message || '反馈提交失败');
    }
  } catch (error) {
    console.error('提交反馈失败:', error);
    ElMessage.error('提交反馈失败，请稍后重试');
  }
};

// 提交反馈表单
const handleSubmitFeedback = async () => {
  // 表单验证
  if (!feedbackForm.value.title.trim()) {
    ElMessage.warning('请输入反馈标题');
    return;
  }
  
  if (!feedbackForm.value.content.trim()) {
    ElMessage.warning('请输入反馈内容');
    return;
  }
  
  if (!feedbackForm.value.category) {
    ElMessage.warning('请选择反馈类别');
    return;
  }
  
  submitting.value = true;
  try {
    const response = await submitFeedbackForm(feedbackForm.value);
    
    if (response.code === 200) {
      ElMessage.success('反馈提交成功，感谢您的建议');
      // 清空表单
      Object.keys(feedbackForm.value).forEach(key => {
        if (key === 'attachments') {
          feedbackForm.value[key] = [];
        } else {
          feedbackForm.value[key] = '';
        }
      });
      // 切换回FAQ标签页
      activeTab.value = 'faqs';
    } else {
      ElMessage.warning(response.message || '反馈提交失败');
    }
  } catch (error) {
    console.error('提交反馈表单失败:', error);
    ElMessage.error('提交反馈失败，请稍后重试');
  } finally {
    submitting.value = false;
  }
};

// 处理文件上传
const handleFileUpload = (file) => {
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    ElMessage.warning('文件大小不能超过5MB!');
    return false;
  }
  
  feedbackForm.value.attachments.push(file);
  return false; // 阻止自动上传
};

// 移除上传的文件
const handleRemoveFile = (file) => {
  const index = feedbackForm.value.attachments.indexOf(file);
  if (index !== -1) {
    feedbackForm.value.attachments.splice(index, 1);
  }
};

// 查看操作指南详情
const viewGuideDetail = (guide) => {
  // 这里可以显示详细的操作指南，例如打开一个弹窗或导航到详情页
  ElMessage.info(`正在查看：${guide.title}`);
};

// 分类导航
const activeCategory = ref('account');

// 操作指南
const activeGuide = ref('payment-guide');

// 在线客服对话框改为反馈对话框
const feedbackDialogVisible = ref(false);
const feedbackFormRef = ref(null);

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
  }
]);

// 根据当前选中的分类过滤FAQ
const filteredFaqs = computed(() => {
  return faqs.value.filter(faq => faq.category === activeCategory.value);
});

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
      },
      {
        title: '步骤6：查看支付结果',
        description: '支付完成后，系统会显示支付结果，您可以查看或下载电子收据。',
        icon: 'Download'
      }
    ],
    image: '/images/guides/payment-guide.png'
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
      },
      {
        title: '步骤5：查看节电建议',
        description: '根据系统提供的节电建议，优化您的用电方式。',
        icon: 'Setting'
      }
    ],
    image: '/images/guides/analysis-guide.png'
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
      },
      {
        title: '步骤5：设置通知偏好',
        description: '选择您希望接收的通知类型和方式。',
        icon: 'Bell'
      },
      {
        title: '步骤6：保存更改',
        description: '完成修改后，点击"保存"按钮应用更改。',
        icon: 'Upload'
      }
    ],
    image: '/images/guides/profile-guide.png'
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
      },
      {
        title: '步骤5：导出或打印账单',
        description: '点击"导出"或"打印"按钮，将账单保存为电子文档或打印纸质版。',
        icon: 'Printer'
      }
    ],
    image: '/images/guides/billing-guide.png'
  },
  {
    id: 'meter-guide',
    title: '智能电表指南',
    steps: [
      {
        title: '步骤1：查看电表信息',
        description: '在"智能电表"页面查看您的电表基本信息和实时数据。',
        icon: 'Monitor'
      },
      {
        title: '步骤2：设置用电阈值',
        description: '设置每日/每月用电量阈值，超过时系统将发送提醒。',
        icon: 'Setting'
      },
      {
        title: '步骤3：查看用电记录',
        description: '查看历史用电记录，了解您的用电趋势和变化。',
        icon: 'DataAnalysis'
      },
      {
        title: '步骤4：报告电表异常',
        description: '如发现电表数据异常，可通过系统报告故障。',
        icon: 'Warning'
      },
      {
        title: '步骤5：远程抄表',
        description: '了解系统如何自动远程抄表，免去人工抄表的烦恼。',
        icon: 'Connection'
      }
    ],
    image: '/images/guides/meter-guide.png'
  },
  {
    id: 'notification-guide',
    title: '通知设置指南',
    steps: [
      {
        title: '步骤1：进入通知设置页面',
        description: '在个人中心选择"通知设置"选项，进入设置页面。',
        icon: 'Bell'
      },
      {
        title: '步骤2：设置账单通知',
        description: '开启或关闭账单生成、缴费截止日提醒等通知。',
        icon: 'Notification'
      },
      {
        title: '步骤3：设置用电提醒',
        description: '设置用电量超过阈值时的提醒方式和条件。',
        icon: 'Warning'
      },
      {
        title: '步骤4：选择通知方式',
        description: '选择您偏好的通知方式，如短信、邮件或APP推送。',
        icon: 'Message'
      },
      {
        title: '步骤5：设置通知时间',
        description: '设置您希望接收通知的时间段，避免在休息时间打扰您。',
        icon: 'Clock'
      }
    ],
    image: '/images/guides/notification-guide.png'
  },
  {
    id: 'energy-guide',
    title: '节能建议指南',
    steps: [
      {
        title: '步骤1：查看用电分析',
        description: '查看系统生成的用电分析报告，了解您的用电情况。',
        icon: 'DataAnalysis'
      },
      {
        title: '步骤2：获取节能建议',
        description: '查看基于您的用电习惯生成的个性化节能建议。',
        icon: 'Sunny'
      },
      {
        title: '步骤3：了解峰谷电价',
        description: '了解当地峰谷电价政策，合理安排用电时间。',
        icon: 'Money'
      },
      {
        title: '步骤4：设置节能目标',
        description: '设置每月的节能目标，系统将追踪您的完成情况。',
        icon: 'Setting'
      },
      {
        title: '步骤5：查看节能成果',
        description: '定期查看您的节能成果和节约的电费金额。',
        icon: 'Star'
      }
    ],
    image: '/images/guides/energy-guide.png'
  }
]);

// 获取FAQ数据
const fetchFaqs = async () => {
  loading.value = true;
  try {
    // 这里应该从API获取数据，但为了演示，我们使用本地数据
    faqs.value = [
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
        links: [
          { text: '账单查询指南', url: '#/help/guide/billing' }
        ]
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
        links: [
          { text: '下载移动APP', url: '#/help/app-download' }
        ]
      },
      {
        id: 10,
        question: '有哪些实用的节能建议？',
        answer: '我们根据用户用电习惯，总结了以下节能建议：<br>1. 使用高能效电器：购买电器时优先选择能效等级高的产品<br>2. 合理设置空调温度：夏季不低于26℃，冬季不高于20℃<br>3. 避开用电高峰：尽量在电力负荷较低的时段使用大功率电器<br>4. 及时关闭待机设备：完全关闭不使用的电器而非待机状态<br>5. 充分利用自然光：减少白天照明用电',
        category: 'energy-saving',
        links: [
          { text: '更多节能技巧', url: '#/help/energy-tips' }
        ]
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
        links: [
          { text: '查看分时电价表', url: '#/help/time-price' }
        ]
      }
    ];
  } catch (error) {
    ElMessage.error('获取帮助信息失败');
    faqs.value = []; // 使用空数组防止错误
  } finally {
    loading.value = false;
  }
};

// 处理分类选择
const handleCategorySelect = (key) => {
  activeCategory.value = key;
  clearSearch();
};

// 清除搜索结果
const clearSearch = () => {
  searchQuery.value = '';
  searchResults.value = [];
};

// 选择FAQ
const selectFaq = (faq) => {
  activeCategory.value = faq.category;
  clearSearch();
  // 这里可以添加逻辑来自动展开选中的FAQ
};

// 显示反馈问题对话框
const showFeedbackDialog = () => {
  feedbackDialogVisible.value = true;
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
  }
});

onMounted(() => {
  initPageData();
});
</script>

<style scoped>
.eb-help-header {
  padding: 5px 0;
  min-height: 5px; /* 为了保持最小高度 */
}

.search-section {
  margin-bottom: 30px;
}

.search-input {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.hot-questions {
  margin-top: 10px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.hot-label {
  margin-right: 10px;
  color: #606266;
}

.hot-tag {
  margin: 5px;
  cursor: pointer;
}

.main-content {
  margin-bottom: 30px;
}

.nav-card,
.contact-card,
.faq-card,
.guide-card,
.search-results-card {
  margin-bottom: 20px;
}

.help-menu {
  border-right: none;
}

/* 添加以下样式确保菜单项中的文字显示 */
.help-menu .el-menu-item {
  display: flex;
  align-items: center;
}

.help-menu .el-menu-item span {
  display: inline-block;
  margin-left: 8px;
}

.contact-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.contact-btn {
  margin-top: 10px;
}

.faq-question {
  font-weight: 500;
}

.faq-answer {
  padding: 10px 0;
  color: #606266;
  line-height: 1.6;
}

.faq-links {
  margin-top: 15px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.faq-link {
  margin-left: 5px;
}

.faq-feedback {
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.guide-card {
  margin-bottom: 20px;
}

.guide-tabs {
  height: 500px;
}

.guide-container {
  display: flex;
  width: 100%;
  height: 100%;
  padding: 20px;
}

.guide-steps {
  flex: 1;
  padding-right: 30px;
  overflow-y: auto;
  max-height: 460px;
  scrollbar-width: thin;
}

.guide-steps::-webkit-scrollbar {
  width: 6px;
}

.guide-steps::-webkit-scrollbar-thumb {
  background-color: #dcdfe6;
  border-radius: 3px;
}

.guide-steps::-webkit-scrollbar-track {
  background-color: #f5f7fa;
  border-radius: 3px;
}

.guide-steps :deep(.el-step) {
  padding-bottom: 35px;
}

.guide-steps :deep(.el-step__title) {
  font-size: 17px;
  font-weight: 500;
  line-height: 24px;
  margin-bottom: 8px;
}

.guide-steps :deep(.el-step__description) {
  font-size: 14px;
  line-height: 1.8;
  color: #606266;
  padding-right: 20px;
}

.guide-steps :deep(.el-step__icon) {
  background-color: #ecf5ff;
  color: #409eff;
}

.guide-steps :deep(.el-step__line) {
  margin-top: 12px;
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.result-item {
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.result-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.result-title {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #303133;
}

.result-preview {
  margin: 0 0 10px 0;
  color: #606266;
  font-size: 14px;
}

.result-category {
  text-align: right;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 500px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.chat-message {
  display: flex;
  gap: 10px;
  max-width: 80%;
}

.user-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.system-message {
  align-self: flex-start;
}

.message-content {
  background-color: #f4f4f5;
  padding: 10px 15px;
  border-radius: 8px;
  position: relative;
}

.user-message .message-content {
  background-color: #ecf5ff;
}

.message-sender {
  font-weight: 500;
  margin-bottom: 5px;
  font-size: 14px;
}

.message-text {
  word-break: break-word;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  text-align: right;
}

.chat-input {
  padding: 15px;
  border-top: 1px solid #ebeef5;
  display: flex;
  gap: 10px;
}

.chat-input .el-textarea {
  flex: 1;
}
</style> 