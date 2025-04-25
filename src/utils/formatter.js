/**
 * 金额格式化
 * @param {number|string} amount - 金额数值
 * @param {string} [currency='¥'] - 货币符号
 * @param {number} [decimals=2] - 小数位数
 * @returns {string} 格式化后的金额字符串
 */
export function formatMoney(amount, currency = '¥', decimals = 2) {
  const num = parseFloat(amount);
  if (isNaN(num)) return '0.00';
  
  return `${currency}${num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * 数字格式化
 * @param {number|string} num - 需要格式化的数字
 * @param {number} [decimals=0] - 小数位数
 * @param {string} [thousandsSep=','] - 千分位分隔符
 * @returns {string} 格式化后的数字字符串
 */
export function formatNumber(num, decimals = 0, thousandsSep = ',') {
  const number = parseFloat(num);
  if (isNaN(number)) return '0';
  
  const fixed = number.toFixed(decimals);
  return fixed.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
}

/**
 * 电量格式化
 * @param {number|string} usage - 用电量
 * @param {string} [unit='kWh'] - 单位
 * @returns {string} 格式化后的电量字符串
 */
export function formatElectricityUsage(usage, unit = 'kWh') {
  return `${formatNumber(usage, 2)} ${unit}`;
}

/**
 * 百分比格式化
 * @param {number|string} value - 百分比值
 * @param {number} [decimals=2] - 小数位数
 * @returns {string} 格式化后的百分比字符串
 */
export function formatPercentage(value, decimals = 2) {
  const num = parseFloat(value);
  if (isNaN(num)) return '0%';
  
  return `${num.toFixed(decimals)}%`;
}

/**
 * 日期格式化
 * @param {Date|number|string} date - 日期对象或时间戳
 * @param {string} [format='YYYY-MM-DD'] - 格式化模板
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day);
}

/**
 * 电费账单状态格式化
 * @param {string} status - 账单状态代码
 * @returns {string} 格式化后的账单状态
 */
export function formatBillStatus(status) {
  const statusMap = {
    'unpaid': '待缴费',
    'paid': '已缴费',
    'overdue': '已逾期',
    'processing': '处理中',
    'cancelled': '已取消'
  };
  
  return statusMap[status] || status;
}

/**
 * 用电类型格式化
 * @param {string} type - 用电类型代码
 * @returns {string} 格式化后的用电类型
 */
export function formatElectricityType(type) {
  const typeMap = {
    'residential': '居民用电',
    'commercial': '商业用电',
    'industrial': '工业用电',
    'agricultural': '农业用电'
  };
  
  return typeMap[type] || type;
}

/**
 * 格式化时长（例如，将小时数转换为易读格式）
 * @param {number} hours - 小时数
 * @returns {string} 格式化后的时长字符串
 */
export function formatDuration(hours) {
  if (hours === null || hours === undefined || isNaN(hours)) {
    return '--';
  }
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} 分钟`;
  }
  if (hours < 24) {
    return `${hours.toFixed(1)} 小时`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = (hours % 24).toFixed(1);
  return `${days} 天 ${remainingHours} 小时`;
}

/**
 * 格式化反馈类型
 * @param {string} type - 反馈类型代码 (e.g., 'complaint', 'suggestion', 'question')
 * @returns {string} 格式化后的反馈类型名称
 */
export function formatFeedbackType(type) {
  const typeMap = {
    complaint: '投诉',
    suggestion: '建议',
    question: '问题',
    // Add other types if needed
  };
  return typeMap[type?.toLowerCase()] || type || '未知类型';
}

/**
 * 格式化反馈状态
 * @param {string} status - 反馈状态代码 (e.g., 'pending', 'processed', 'closed')
 * @returns {string} 格式化后的反馈状态名称
 */
export function formatFeedbackStatus(status) {
  const statusMap = {
    pending: '待处理',
    processed: '已处理',
    closed: '已关闭',
    // Add other statuses if needed
  };
  return statusMap[status?.toLowerCase()] || status || '未知状态';
}

/**
 * 格式化对账审批状态
 * @param {string} status - 对账状态代码 (e.g., 'pending', 'completed')
 * @returns {string} 格式化后的对账状态名称
 */
export function formatReconciliationStatus(status) {
  const statusMap = {
    pending: '待处理',
    completed: '已完成',
    // Add other statuses if needed
  };
  return statusMap[status?.toLowerCase()] || status || '未知状态';
}

/**
 * 格式化支付状态
 * @param {string} status - 支付状态代码 (e.g., 'pending', 'success', 'failed', 'unpaid', 'paid')
 * @returns {string} 格式化后的支付状态名称
 */
export function formatPaymentStatus(status) {
  const statusMap = {
    pending: '待支付',
    success: '成功',
    failed: '失败',
    unpaid: '未支付', // From eb_reconciliation
    paid: '已支付',   // From eb_reconciliation
    // Add other statuses like 'refunded' if needed
  };
  return statusMap[status?.toLowerCase()] || status || '未知状态';
}

/**
 * 格式化用户类型
 * @param {string} type - 用户类型代码 (e.g., '居民用户', '商业用户')
 * @returns {string} 格式化后的用户类型名称
 */
export function formatUserType(type) {
    // Assuming the type string directly comes from the DB like '居民用户'
    // If it were codes like 'residential', a map would be needed:
    // const typeMap = {
    //     'residential': '居民用户',
    //     'commercial': '商业用户'
    // };
    // return typeMap[type] || type || '未知类型';
    return type || '未知类型';
}