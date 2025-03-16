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
              <el-button type="primary" class="contact-btn" @click="showChatDialog">
                <el-icon><ChatDotRound /></el-icon>
                在线咨询
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
              <el-tabs v-model="activeGuide">
                <el-tab-pane
                  v-for="(guide, index) in guides"
                  :key="index"
                  :label="guide.title"
                  :name="guide.id"
                >
                  <div class="guide-steps">
                    <el-steps :active="guide.steps.length" direction="vertical">
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
                  <div v-if="guide.image" class="guide-image">
                    <el-image :src="guide.image" fit="contain">
                      <template #error>
                        <div class="image-error">
                          <el-icon><Picture /></el-icon>
                          <span>加载图片失败</span>
                        </div>
                      </template>
                    </el-image>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 在线客服对话框 -->
    <el-dialog
      v-model="chatDialogVisible"
      title="在线客服"
      width="60%"
      destroy-on-close
    >
      <div class="chat-container">
        <div class="chat-messages" ref="chatMessagesRef">
          <div
            v-for="(message, index) in chatMessages"
            :key="index"
            class="chat-message"
            :class="{ 'user-message': message.isUser, 'system-message': !message.isUser }"
          >
            <div class="message-avatar">
              <el-avatar :icon="message.isUser ? User : Service" :size="40"></el-avatar>
            </div>
            <div class="message-content">
              <div class="message-sender">{{ message.isUser ? '您' : '客服' }}</div>
              <div class="message-text">{{ message.content }}</div>
              <div class="message-time">{{ message.time }}</div>
            </div>
          </div>
        </div>
        <div class="chat-input">
          <el-input
            v-model="chatInput"
            placeholder="请输入您的问题"
            :rows="3"
            type="textarea"
            @keyup.enter="sendMessage"
          ></el-input>
          <el-button type="primary" @click="sendMessage" :disabled="!chatInput.trim()">
            发送
          </el-button>
        </div>
      </div>
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
  Upload
} from '@element-plus/icons-vue';
import { EBPageLayout } from '@/components';

// 搜索相关
const searchQuery = ref('');
const searchResults = ref([]);
const hotQuestions = ref([
  '如何缴纳电费',
  '忘记密码怎么办',
  '如何查看用电分析',
  '电费计算方式'
]);

// 分类导航
const activeCategory = ref('account');

// 操作指南
const activeGuide = ref('payment-guide');

// 在线客服
const chatDialogVisible = ref(false);
const chatInput = ref('');
const chatMessages = ref([
  {
    content: '您好，我是电费缴纳系统的智能客服助手，有什么可以帮助您的吗？',
    isUser: false,
    time: formatTime(new Date())
  }
]);
const chatMessagesRef = ref(null);

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
const loading = ref(false);

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
    image: 'https://example.com/payment-guide.png'
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
    image: 'https://example.com/analysis-guide.png'
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
    image: 'https://example.com/profile-guide.png'
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
  clearSearch();
  // 这里可以添加逻辑来自动展开选中的FAQ
};

// 提交FAQ反馈
const submitFeedback = (faqId, isHelpful) => {
  // 模拟提交反馈
  setTimeout(() => {
    ElMessage.success('感谢您的反馈！');
  }, 500);
};

// 显示在线客服对话框
const showChatDialog = () => {
  chatDialogVisible.value = true;
  nextTick(() => {
    scrollToBottom();
  });
};

// 发送消息
const sendMessage = () => {
  if (!chatInput.value.trim()) return;
  
  // 添加用户消息
  chatMessages.value.push({
    content: chatInput.value,
    isUser: true,
    time: formatTime(new Date())
  });
  
  const userQuestion = chatInput.value;
  chatInput.value = '';
  
  // 滚动到底部
  nextTick(() => {
    scrollToBottom();
    
    // 模拟客服回复
    setTimeout(() => {
      chatMessages.value.push({
        content: getAutoReply(userQuestion),
        isUser: false,
        time: formatTime(new Date())
      });
      
      nextTick(() => {
        scrollToBottom();
      });
    }, 1000);
  });
};

// 滚动聊天窗口到底部
const scrollToBottom = () => {
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
  }
};

// 格式化时间
function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// 获取自动回复
function getAutoReply(question) {
  // 简单的关键词匹配
  const keywords = {
    '缴费': '您可以在"电费缴纳"页面进行缴费，支持多种支付方式。需要详细指导可以查看"电费缴纳指南"。',
    '密码': '如果您忘记密码，可以通过"忘记密码"功能重置。在登录页面点击"忘记密码"，按照提示操作即可。',
    '用电分析': '用电分析功能可以帮助您了解用电趋势和习惯，在"用电分析"页面可以查看详细数据和节电建议。',
    '退款': '如需申请退款，请在"缴费记录"中找到相应的缴费记录，点击"申请退款"按钮，按照提示操作即可。',
    '账单': '您可以在"电费概览"页面查看当前账单和历史账单信息。',
    '联系': '您可以通过客服热线400-123-4567或发送邮件至support@ebill.com与我们联系。'
  };
  
  // 检查问题中是否包含关键词
  for (const [key, reply] of Object.entries(keywords)) {
    if (question.includes(key)) {
      return reply;
    }
  }
  
  // 默认回复
  return '感谢您的咨询。您的问题可能需要更专业的解答，建议您拨打客服热线400-123-4567获取帮助，或者查看我们的帮助文档获取更多信息。';
}

// 获取分类名称
const getCategoryName = (category) => {
  const categories = {
    'account': '账户管理',
    'payment': '电费缴纳',
    'usage': '用电分析',
    'notification': '通知设置',
    'security': '安全问题',
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
  fetchFaqs();
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

.guide-steps {
  margin-bottom: 20px;
}

.guide-image {
  margin-top: 20px;
  text-align: center;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;
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