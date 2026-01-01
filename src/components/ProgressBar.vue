<template>
  <div class="flex items-center gap-2">
    <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        :class="['h-full', getStatusColor(), 'transition-all duration-300 ease-out']"
        :style="{ width: `${progress}%` }"
      />
    </div>
    <span class="text-xs text-gray-500 w-16 text-right">{{ getStatusText() }}</span>
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
      return 'bg-green-500';
    case 'failed':
      return 'bg-red-500';
    case 'converting':
      return 'bg-primary-500';
    default:
      return 'bg-gray-300';
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
