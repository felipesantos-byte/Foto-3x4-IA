export enum BackgroundType {
  WHITE = 'WHITE',
  BLUE = 'BLUE'
}

export interface ProcessedImage {
  originalUrl: string;
  whiteBgUrl: string | null;
  blueBgUrl: string | null;
}

export interface PrintConfig {
  copiesPerColor: number;
}
