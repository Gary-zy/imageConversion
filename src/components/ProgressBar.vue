<template>
  <div class="flex items-center gap-2">
    <div class="flex-1 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
      <div
        :class="['h-full', getStatusColor(), 'transition-all duration-300 ease-out']"
        :style="{ width: `${progress}%` }"
      />
    </div>
    <span class="text-xs text-slate-500 dark:text-slate-400 w-16 text-right">{{ getStatusText() }}</span>
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
      return 'bg-emerald-500 dark:bg-emerald-400';
    case 'failed':
      return 'bg-rose-500 dark:bg-rose-400';
    case 'converting':
      return 'bg-slate-700 dark:bg-slate-300';
    default:
      return 'bg-slate-300 dark:bg-slate-500';
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
