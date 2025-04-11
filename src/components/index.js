import EBTable from './EBTable.vue';
import EBSearchFilter from './EBSearchFilter.vue';
import EBPagination from './EBPagination.vue';
import EBBatchActions from './EBBatchActions.vue';
import EBPageLayout from '../layouts/EBPageLayout.vue';
import EBSidebar from './EBAdminSidebar.vue';
import EBButton from './EBButton.vue';
import EBFeedbackForm from './EBFeedbackForm.vue';
import EBCard from './EBCard.vue';
import EBFilterBar from './EBFilterBar.vue';

// 导出所有组件
export {
  EBTable,
  EBSearchFilter,
  EBPagination,
  EBBatchActions,
  EBPageLayout,
  EBSidebar,
  EBButton,
  EBFeedbackForm,
  EBCard,
  EBFilterBar
};

// 批量注册组件
export default {
  // 当组件被注册时，会调用install方法
  install(app) {
    app.component('EBTable', EBTable);
    app.component('EBSearchFilter', EBSearchFilter);
    app.component('EBPagination', EBPagination);
    app.component('EBBatchActions', EBBatchActions);
    app.component('EBPageLayout', EBPageLayout);
    app.component('EBSidebar', EBSidebar);
    app.component('EBButton', EBButton);
    app.component('EBFeedbackForm', EBFeedbackForm);
    app.component('EBCard', EBCard);
    app.component('EBFilterBar', EBFilterBar);
  }
}; 