// ofd.js 类型声明
declare module '*/ofd-core/ofd' {
  export interface ParseOfdOptions {
    ofd: File | ArrayBuffer | string;
    success?: (res: OfdDocumentResult[]) => void;
    fail?: (error: any) => void;
  }

  export interface OfdDocumentResult {
    doc: string;
    document: any;
    pages: OfdPage[];
    tpls: any;
    stampAnnot?: any;
    fontResObj: any;
    drawParamResObj: any;
    multiMediaResObj: any;
    [key: string]: any;
  }

  export interface OfdPage {
    [pageId: string]: {
      json: any;
      xml: string;
      stamp?: any[];
      annotation?: any[];
    };
  }

  export function parseOfdDocument(options: ParseOfdOptions): void;
  export function renderOfd(screenWidth: number, ofd: OfdDocumentResult): HTMLDivElement[];
  export function renderOfdByScale(ofd: OfdDocumentResult): HTMLDivElement[];
  export function setPageScale(scale: number): void;
  export function getPageScale(): number;
  export function digestCheck(options: any): boolean;
  export function calPageBox(screenWidth: number, document: any, page: any): { x: number; y: number; w: number; h: number };
  export function calPageBoxScale(document: any, page: any): { x: number; y: number; w: number; h: number };
  export function renderPage(pageDiv: HTMLDivElement, page: any, tpls: any, fontResObj: any, drawParamResObj: any, multiMediaResObj: any): void;
}

// jszip-utils 类型声明
declare module 'jszip-utils' {
  export function getBinaryContent(
    url: string,
    callback: (err: Error | null, data: ArrayBuffer) => void
  ): void;
}

// ofd-xml-parser 类型声明
declare module 'ofd-xml-parser' {
  interface ParseOptions {
    attributeNamePrefix?: string;
    ignoreAttributes?: boolean;
    parseNodeValue?: boolean;
    trimValues?: boolean;
    [key: string]: any;
  }

  export function parse(xmlContent: string, options?: ParseOptions): any;
  export default { parse };
}

// @lapo/asn1js 类型声明
declare module '@lapo/asn1js' {
  export default class ASN1 {
    static decode(input: Uint8Array | string, offset?: number): ASN1;
    typeName(): string;
    content(maxLength?: number): string | null;
    sub: ASN1[] | null;
    stream: any;
    header: number;
    length: number;
    tag: { tagConstructed: boolean; tagNumber: number };
  }
}

declare module '@lapo/asn1js/hex' {
  export default class Hex {
    static decode(hex: string): Uint8Array;
    static encode(data: Uint8Array): string;
  }
}

declare module '@lapo/asn1js/base64' {
  export default class Base64 {
    static decode(base64: string): Uint8Array;
    static encode(data: Uint8Array): string;
    static unarmor(armored: string): Uint8Array;
  }
}

// sm-crypto 类型声明
declare module 'sm-crypto' {
  export const sm2: {
    generateKeyPairHex(): { publicKey: string; privateKey: string };
    doEncrypt(msg: string, publicKey: string, cipherMode?: number): string;
    doDecrypt(encryptData: string, privateKey: string, cipherMode?: number): string;
    doSignature(msg: string, privateKey: string, options?: any): string;
    doVerifySignature(msg: string, signHex: string, publicKey: string, options?: any): boolean;
  };
  export const sm3: (input: string | Uint8Array) => string;
  export const sm4: {
    encrypt(inArray: Uint8Array, key: Uint8Array): Uint8Array;
    decrypt(inArray: Uint8Array, key: Uint8Array): Uint8Array;
  };
}

// jsrsasign 类型声明
declare module 'jsrsasign' {
  export const KJUR: any;
  export const KEYUTIL: any;
  export const X509: any;
  export const RSAKey: any;
  export const ASN1HEX: any;
  export const crypto: any;
}

declare module 'jsrsasign-util' {
  export function readFileHexByBin(path: string): string;
  export function readFile(path: string): string;
  export function saveFile(path: string, data: string): void;
}

// liteofd 类型声明（保留兼容）
declare module 'liteofd' {
  export interface OfdDocument {
    files: any;
    pages: XmlData[];
    signatures?: XmlData;
    outlines?: XmlData;
    annots?: XmlData;
    [key: string]: any;
  }

  export interface XmlData {
    [key: string]: any;
  }

  export class LiteOfd {
    constructor();
    parse(file: File | ArrayBuffer | string): Promise<OfdDocument>;
    render(container?: HTMLElement, pageWrapStyle?: string, pageIndexes?: number[]): HTMLDivElement;
    renderPage(pageIndex: number, pageWrapStyle?: string): HTMLDivElement;
    getCurrentPageIndex(): number;
    getTotalPages(): number;
    nextPage(): void;
    prevPage(): void;
    gotoPage(pageIndex: number): void;
    scrollToPage(pageIndex: number): void;
    zoomIn(step?: number): void;
    zoomOut(step?: number): void;
    resetZoom(): void;
    searchText(keyword: string): any;
    getContent(page?: number): string;
    executeAction(action: any): void;
    toggleRenderTextLayer(renderTextLayer: boolean): void;
  }

  export default LiteOfd;
}
