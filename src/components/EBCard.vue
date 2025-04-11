<template>
  <div class="eb-card" :class="{ 'with-shadow': shadow, 'with-border': border }">
    <div v-if="$slots.header" class="eb-card__header">
      <slot name="header"></slot>
    </div>
    <div class="eb-card__body">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="eb-card__footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  shadow: {
    type: Boolean,
    default: true
  },
  border: {
    type: Boolean,
    default: true
  }
});
</script>

<style scoped>
.eb-card {
  background-color: #fff;
  border-radius: 4px;
  transition: all 0.3s;
}

.eb-card.with-shadow {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.eb-card.with-border {
  border: 1px solid #ebeef5;
}

.eb-card__header {
  padding: 18px 20px;
  border-bottom: 1px solid #ebeef5;
}

.eb-card__body {
  padding: 20px;
}

.eb-card__footer {
  padding: 18px 20px;
  border-top: 1px solid #ebeef5;
}
</style> 