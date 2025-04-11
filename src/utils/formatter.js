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