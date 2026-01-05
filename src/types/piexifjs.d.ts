declare module 'piexifjs' {
  export function dump(exifObj: Record<string, unknown>): string;
  export function insert(exifStr: string, jpegDataUrl: string): string;
  export const ImageIFD: {
    Artist: number;
    Copyright: number;
    Software: number;
    DateTime: number;
  };
  export const ExifIFD: {
    DateTimeOriginal: number;
    DateTimeDigitized: number;
  };
}
