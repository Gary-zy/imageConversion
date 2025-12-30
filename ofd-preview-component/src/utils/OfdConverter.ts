import JSZip from 'jszip';
import jsPDF from 'jspdf';
import { OfdToImageOptions, OfdToPdfOptions, OfdPageRange } from '../types';
// 使用 ofd.js 库
import { parseOfdDocument, renderOfd, setPageScale, getPageScale } from '../core/ofd';

interface OfdDocument {
  doc: string;
  document: any;
  pages: any[];
  tpls: any;
  fontResObj: any;
  drawParamResObj: any;
  multiMediaResObj: any;
  [key: string]: any;
}

// 进度回调
type ProgressCallback = (current: number, total: number, status: string) => void;

/**
 * OFD 转换器类
 * 使用 ofd.js 库实现 OFD 解析和渲染
 * 支持 OFD 转 PNG/JPEG/WebP 和 PDF
 */
export class OfdConverter {
  private ofdDocument: OfdDocument | null = null;
  private renderedContainer: HTMLElement | null = null;
  private hasRenderedPreview: boolean = false;
  private currentScale: number = 1;

  constructor() {
    this.ofdDocument = null;
  }

  /**
   * 加载并解析 OFD 文件
   */
  async loadOfd(file: File, onProgress?: ProgressCallback): Promise<void> {
    onProgress?.(1, 4, '正在读取文件...');

    return new Promise((resolve, reject) => {
      onProgress?.(2, 4, '正在解析OFD文档...');

      parseOfdDocument({
        ofd: file,
        success: (res: OfdDocument[]) => {
          if (res && res.length > 0) {
            this.ofdDocument = res[0];
            const pageCount = this.getPageCount();
            onProgress?.(3, 4, `解析完成，共 ${pageCount} 页`);
            onProgress?.(4, 4, '加载完成');
            resolve();
          } else {
            reject(new Error('OFD文件解析失败：无法获取文档内容'));
          }
        },
        fail: (error: any) => {
          console.error('OFD解析失败:', error);
          reject(new Error(`OFD文件解析失败: ${error?.message || '未知错误'}`));
        }
      });
    });
  }

  /**
   * 获取总页数
   */
  getPageCount(): number {
    if (!this.ofdDocument) return 0;
    return this.ofdDocument.pages?.length || 0;
  }

  /**
   * 获取页面尺寸（毫米）
   */
  getPageSize(pageIndex: number): { width: number; height: number } {
    if (!this.ofdDocument || !this.ofdDocument.pages[pageIndex]) {
      return { width: 210, height: 297 }; // 默认 A4
    }

    try {
      const page = this.ofdDocument.pages[pageIndex];
      const pageId = Object.keys(page)[0];
      const pageJson = page[pageId]?.json;

      // 尝试从页面或文档获取尺寸
      let box = null;
      const area = pageJson?.['ofd:Area'];
      if (area) {
        box = area['ofd:PhysicalBox'] || area['ofd:ApplicationBox'] || area['ofd:ContentBox'];
      }

      if (!box && this.ofdDocument.document) {
        const docArea = this.ofdDocument.document['ofd:CommonData']?.['ofd:PageArea'];
        if (docArea) {
          box = docArea['ofd:PhysicalBox'] || docArea['ofd:ApplicationBox'] || docArea['ofd:ContentBox'];
        }
      }

      if (box) {
        const parts = box.split(' ').map(Number);
        if (parts.length >= 4) {
          return { width: parts[2], height: parts[3] };
        }
      }
    } catch (e) {
      console.warn('获取页面尺寸失败:', e);
    }

    return { width: 210, height: 297 };
  }

  /**
   * 渲染文档到容器（用于预览）
   */
  async renderToContainer(
    container: HTMLElement,
    _pageIndex?: number,
    scale: number = 1
  ): Promise<void> {
    if (!this.ofdDocument) {
      throw new Error('请先加载 OFD 文件');
    }

    // 如果已经渲染过且容器相同，不再重新渲染
    if (this.hasRenderedPreview && this.renderedContainer === container) {
      if (_pageIndex !== undefined && _pageIndex > 0) {
        this.scrollToPage(_pageIndex);
      }
      return;
    }

    // 清空容器
    container.innerHTML = '';

    // 获取容器宽度用于计算缩放
    // 优先使用父滚动容器的宽度，如果没有则使用当前容器宽度
    let screenWidth = container.clientWidth;

    // 如果当前容器宽度为 0，尝试向上查找
    if (screenWidth <= 0) {
      let parent = container.parentElement;
      while (parent && screenWidth <= 0) {
        screenWidth = parent.clientWidth;
        parent = parent.parentElement;
      }
    }

    // 如果仍然无法获取有效宽度，使用窗口宽度作为备选
    if (screenWidth <= 0) {
      screenWidth = window.innerWidth * 0.6; // 假设预览区域占窗口 60%
    }


    console.log('renderToContainer - screenWidth:', screenWidth, 'scale:', scale);

    // 使用 ofd.js 渲染所有页面
    const divArray = renderOfd(screenWidth, this.ofdDocument);

    console.log('renderOfd 返回的页面数:', divArray.length);
    console.log('第一个页面的尺寸:', divArray[0]?.style?.width, 'x', divArray[0]?.style?.height);

    // 创建包装容器，应用缩放
    const wrapper = document.createElement('div');
    wrapper.className = 'ofd-pages-wrapper';
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '20px';
    wrapper.style.padding = '20px';
    // 应用缩放到包装容器
    wrapper.style.transform = `scale(${scale})`;
    wrapper.style.transformOrigin = 'top left';
    wrapper.style.width = '100%';

    divArray.forEach((pageDiv: HTMLDivElement, index: number) => {
      pageDiv.setAttribute('data-page-index', String(index));
      pageDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      wrapper.appendChild(pageDiv);
    });

    container.appendChild(wrapper);

    this.renderedContainer = container;
    this.hasRenderedPreview = true;
    this.currentScale = getPageScale();

    // 等待渲染完成
    await this.waitForRender(container);

    // 如果指定了页面索引，滚动到该页
    if (_pageIndex !== undefined && _pageIndex > 0) {
      this.scrollToPage(_pageIndex);
    }
  }

  /**
   * 滚动到指定页面
   */
  scrollToPage(pageIndex: number): void {
    if (!this.renderedContainer) return;

    const pageDiv = this.renderedContainer.querySelector(`[data-page-index="${pageIndex}"]`);
    if (pageDiv) {
      pageDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * 获取当前页面索引
   */
  getCurrentPageIndex(): number {
    if (!this.renderedContainer) return 0;

    const pages = this.renderedContainer.querySelectorAll('[data-page-index]');
    const containerRect = this.renderedContainer.getBoundingClientRect();
    const containerTop = containerRect.top;

    for (let i = 0; i < pages.length; i++) {
      const pageRect = pages[i].getBoundingClientRect();
      if (pageRect.bottom > containerTop + 50) {
        return i;
      }
    }

    return 0;
  }

  /**
   * 等待渲染完成
   */
  private async waitForRender(container: HTMLElement): Promise<void> {
    return new Promise<void>((resolve) => {
      let attempts = 0;
      const maxAttempts = 50;

      const checkRender = () => {
        attempts++;
        const svg = container.querySelector('svg');
        const canvas = container.querySelector('canvas');
        const hasContent = container.children.length > 0 && container.innerHTML.length > 100;

        if (svg || canvas || hasContent) {
          setTimeout(() => resolve(), 200);
        } else if (attempts >= maxAttempts) {
          resolve();
        } else {
          setTimeout(checkRender, 50);
        }
      };
      setTimeout(checkRender, 100);
    });
  }

  /**
   * 渲染指定页面到 Canvas（用于转换）
   */
  async renderToCanvas(
    pageIndex: number,
    scale: number = 1
  ): Promise<HTMLCanvasElement> {
    if (!this.ofdDocument) {
      throw new Error('请先加载 OFD 文件');
    }

    // 创建临时容器用于渲染单个页面
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.visibility = 'hidden';
    document.body.appendChild(container);

    try {
      // 设置缩放比例
      const baseScale = 2; // 基础缩放以获得更高清晰度
      setPageScale(baseScale * scale);

      // 只渲染指定页面
      const page = this.ofdDocument.pages[pageIndex];
      if (!page) {
        throw new Error(`页面 ${pageIndex} 不存在`);
      }

      // 创建临时 ofd 对象只包含一个页面
      const singlePageOfd = {
        ...this.ofdDocument,
        pages: [page]
      };

      const screenWidth = 800 * scale;
      const divArray = renderOfd(screenWidth, singlePageOfd);

      if (divArray.length === 0) {
        throw new Error('渲染页面失败');
      }

      const pageDiv = divArray[0];
      container.appendChild(pageDiv);

      // 等待渲染完成
      await this.waitForRender(container);
      await new Promise(resolve => setTimeout(resolve, 300));

      // 获取页面元素的实际尺寸
      const pageElement = container.querySelector('svg') ||
                          container.querySelector('canvas') ||
                          container.firstElementChild;

      if (!pageElement) {
        throw new Error('未找到渲染的页面元素');
      }

      // 获取元素的实际尺寸
      const rect = pageElement.getBoundingClientRect();
      const elementWidth = rect.width || 794;
      const elementHeight = rect.height || 1123;

      // 将页面内容转换为 Canvas
      const canvas = await this.captureElementToCanvas(
        pageElement as HTMLElement,
        elementWidth,
        elementHeight,
        1
      );

      return canvas;
    } finally {
      if (container.parentNode) {
        document.body.removeChild(container);
      }
      // 恢复原来的缩放
      setPageScale(this.currentScale);
    }
  }

  /**
   * 将元素内容捕获为 Canvas
   */
  private async captureElementToCanvas(
    element: HTMLElement,
    width: number,
    height: number,
    scale: number = 1
  ): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width);
    canvas.height = Math.round(height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('无法创建 Canvas 上下文');
    }

    // 白色背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // 尝试直接绘制 SVG
    const svg = element.tagName === 'svg' ? element : element.querySelector('svg');
    if (svg) {
      try {
        const clonedSvg = svg.cloneNode(true) as SVGElement;

        const originalWidth = svg.getAttribute('width') || svg.getBoundingClientRect().width;
        const originalHeight = svg.getAttribute('height') || svg.getBoundingClientRect().height;

        if (!clonedSvg.getAttribute('viewBox')) {
          clonedSvg.setAttribute('viewBox', `0 0 ${originalWidth} ${originalHeight}`);
        }

        clonedSvg.setAttribute('width', String(Math.round(width)));
        clonedSvg.setAttribute('height', String(Math.round(height)));

        if (!clonedSvg.getAttribute('xmlns')) {
          clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        }

        const svgData = new XMLSerializer().serializeToString(clonedSvg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, width, height);
            URL.revokeObjectURL(url);
            resolve(canvas);
          };
          img.onerror = (err) => {
            URL.revokeObjectURL(url);
            console.warn('SVG 图片加载失败:', err);
            this.tryHtml2Canvas(element, canvas, ctx, width, height, scale)
              .then(resolve)
              .catch(reject);
          };
          img.src = url;
        });
      } catch (e) {
        console.warn('SVG 直接渲染失败:', e);
      }
    }

    // 如果有 canvas 元素，直接复制
    const existingCanvas = element.tagName === 'CANVAS'
      ? element as unknown as HTMLCanvasElement
      : element.querySelector('canvas');
    if (existingCanvas) {
      ctx.drawImage(existingCanvas, 0, 0, width, height);
      return canvas;
    }

    // 尝试使用 html2canvas
    return this.tryHtml2Canvas(element, canvas, ctx, width, height, scale);
  }

  /**
   * 尝试使用 html2canvas 渲染
   */
  private async tryHtml2Canvas(
    element: HTMLElement,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scale: number
  ): Promise<HTMLCanvasElement> {
    try {
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default;

      const renderedCanvas = await html2canvas(element, {
        scale: scale,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        width: element.scrollWidth || width / scale,
        height: element.scrollHeight || height / scale,
      });

      ctx.drawImage(renderedCanvas, 0, 0, width, height);
      return canvas;
    } catch (e) {
      console.warn('html2canvas 渲染失败:', e);
      return canvas;
    }
  }

  /**
   * 解析页面范围
   */
  parsePageRange(
    pages: OfdPageRange,
    currentPage: number,
    totalPages: number,
    customInput?: string
  ): number[] {
    if (pages === 'all') {
      return Array.from({ length: totalPages }, (_, i) => i);
    } else if (pages === 'current') {
      return [currentPage];
    } else if (pages === 'custom' && customInput) {
      return this.parseCustomPages(customInput, totalPages);
    } else if (Array.isArray(pages)) {
      return pages.filter(p => p >= 0 && p < totalPages);
    }
    return [];
  }

  /**
   * 解析自定义页码字符串
   */
  private parseCustomPages(input: string, totalPages: number): number[] {
    const pages: number[] = [];
    const parts = input.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(Number);
        for (let i = start; i <= end; i++) {
          const pageIndex = i - 1;
          if (pageIndex >= 0 && pageIndex < totalPages) {
            pages.push(pageIndex);
          }
        }
      } else {
        const pageIndex = Number(trimmed) - 1;
        if (pageIndex >= 0 && pageIndex < totalPages) {
          pages.push(pageIndex);
        }
      }
    }

    return [...new Set(pages)].sort((a, b) => a - b);
  }

  /**
   * 转换为图片
   */
  async convertToImage(
    options: OfdToImageOptions & { customPagesInput?: string },
    currentPage: number,
    onProgress?: ProgressCallback
  ): Promise<Blob[]> {
    if (!this.ofdDocument) {
      throw new Error('请先加载 OFD 文件');
    }

    const pageIndices = this.parsePageRange(
      options.pages,
      currentPage,
      this.getPageCount(),
      options.customPagesInput
    );

    if (pageIndices.length === 0) {
      throw new Error('没有要转换的页面');
    }

    const blobs: Blob[] = [];
    onProgress?.(0, pageIndices.length, '开始转换...');

    for (let i = 0; i < pageIndices.length; i++) {
      const pageIndex = pageIndices[i];
      onProgress?.(i, pageIndices.length, `正在转换第 ${pageIndex + 1} 页...`);

      const canvas = await this.renderToCanvas(pageIndex, options.scale);

      const mimeType =
        options.format === 'png'
          ? 'image/png'
          : options.format === 'jpeg'
            ? 'image/jpeg'
            : 'image/webp';

      const quality = options.format === 'png' ? undefined : options.quality / 100;

      const blob = await this.canvasToBlob(canvas, mimeType, quality);
      blobs.push(blob);
    }

    onProgress?.(pageIndices.length, pageIndices.length, '转换完成');
    return blobs;
  }

  /**
   * 转换为 PDF
   */
  async convertToPdf(
    options: OfdToPdfOptions,
    onProgress?: ProgressCallback
  ): Promise<Blob> {
    if (!this.ofdDocument) {
      throw new Error('请先加载 OFD 文件');
    }

    const totalPages = this.getPageCount();
    const firstPageSize = this.getPageSize(0);

    const format =
      options.pageSize === 'original'
        ? [firstPageSize.width, firstPageSize.height]
        : options.pageSize;

    const pdf = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: format
    });

    onProgress?.(0, totalPages, '开始生成 PDF...');

    for (let i = 0; i < totalPages; i++) {
      onProgress?.(i, totalPages, `正在处理第 ${i + 1} 页...`);

      const canvas = await this.renderToCanvas(i, 2);
      const imgData = canvas.toDataURL('image/jpeg', options.quality / 100);

      if (i > 0) {
        const pageSize = this.getPageSize(i);
        const pageFormat =
          options.pageSize === 'original'
            ? [pageSize.width, pageSize.height]
            : undefined;
        pdf.addPage(pageFormat, options.orientation);
      }

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    }

    onProgress?.(totalPages, totalPages, 'PDF 生成完成');

    return pdf.output('blob');
  }

  /**
   * Canvas 转 Blob
   */
  private canvasToBlob(
    canvas: HTMLCanvasElement,
    mimeType: string,
    quality?: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('无法创建 Blob'));
          }
        },
        mimeType,
        quality
      );
    });
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.ofdDocument = null;
    this.renderedContainer = null;
    this.hasRenderedPreview = false;
  }
}

/**
 * 打包多个 Blob 为 ZIP
 */
export async function packBlobsToZip(
  blobs: Blob[],
  filenames: string[]
): Promise<Blob> {
  const zip = new JSZip();

  blobs.forEach((blob, index) => {
    zip.file(filenames[index] || `page_${index + 1}`, blob);
  });

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * 验证 OFD 文件
 */
export function validateOfdFile(file: File): { valid: boolean; error?: string } {
  const extension = file.name.toLowerCase().split('.').pop();
  if (extension !== 'ofd') {
    return { valid: false, error: '文件格式不正确,请上传 .ofd 文件' };
  }

  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: '文件过大,最大支持 50MB' };
  }

  return { valid: true };
}
