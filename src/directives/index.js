import { vCapsule } from './capsuleButton';

// 导出所有指令
export {
  vCapsule
};

// 定义自定义指令
const directives = {
  install(app) {
    // 胶囊按钮指令
    app.directive('capsule', {
      mounted(el) {
        // 添加capsule-button类
        el.classList.add('capsule-button');
      }
    });
  }
};

export default directives; 