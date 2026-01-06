<template>
  <div class="flex items-center gap-2">
    <div class="flex-1 h-2 bg-ink-200 dark:bg-ink-600 rounded-full overflow-hidden">
      <div
        :class="['h-full', getStatusColor(), 'transition-all duration-300 ease-out']"
        :style="{ width: `${progress}%` }"
      />
    </div>
    <span class="text-xs text-ink-500 dark:text-ink-400 w-16 text-right">{{ getStatusText() }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  progress: number;
  status: 'pending' | 'converting' | 'completed' | 'failed';
}>();

const getStatusColor = () => {
  switch (props.status) {
    case 'completed':
      return 'bg-bamboo-500 dark:bg-bamboo-400';
    case 'failed':
      return 'bg-vermillion-500 dark:bg-vermillion-400';
    case 'converting':
      return 'bg-ink-700 dark:bg-ink-300';
    default:
      return 'bg-ink-300 dark:bg-ink-500';
  }
};

const getStatusText = () => {
  switch (props.status) {
    case 'completed':
      return '完成';
    case 'failed':
      return '失败';
    case 'converting':
      return '转换中...';
    default:
      return '等待中';
  }
};
</script>
