// 组件导出
export { OfdPreview } from './components/OfdPreview';
export { OfdProcessor } from './components/OfdProcessor';
export type { OfdProcessorProps } from './components/OfdProcessor';

// 工具类导出
export { OfdConverter, packBlobsToZip, validateOfdFile } from './utils/OfdConverter';

// 类型导出
export type {
  OfdTargetFormat,
  OfdPageRange,
  OfdToImageOptions,
  OfdToPdfOptions,
  ProgressCallback,
} from './types';
