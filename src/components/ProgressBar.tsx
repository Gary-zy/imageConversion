interface ProgressBarProps {
  progress: number;
  status: 'pending' | 'converting' | 'completed' | 'failed';
}

export default function ProgressBar({ progress, status }: ProgressBarProps) {
  const getStatusColor = () => {
    switch (status) {
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
    switch (status) {
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

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getStatusColor()} transition-all duration-300 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-16 text-right">{getStatusText()}</span>
    </div>
  );
}
