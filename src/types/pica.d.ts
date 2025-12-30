declare module 'pica' {
  interface PicaOptions {
    quality?: number;
    alpha?: boolean;
    unsharpAmount?: number;
    unsharpRadius?: number;
    unsharpThreshold?: number;
  }

  interface Pica {
    resize(
      from: HTMLCanvasElement | HTMLImageElement,
      to: HTMLCanvasElement,
      options?: PicaOptions
    ): Promise<HTMLCanvasElement>;
    toBlob(
      canvas: HTMLCanvasElement,
      mimeType: string,
      quality?: number
    ): Promise<Blob>;
  }

  interface PicaConstructor {
    new (): Pica;
  }

  const Pica: PicaConstructor;
  export default Pica;
}
