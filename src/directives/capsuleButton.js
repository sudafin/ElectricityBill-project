// 胶囊按钮指令
export const vCapsule = {
  // 在元素挂载时添加类名
  mounted(el) {
    if (el.tagName === 'BUTTON' || el.classList.contains('el-button')) {
      el.classList.add('capsule-button');
    }
  }
}; 