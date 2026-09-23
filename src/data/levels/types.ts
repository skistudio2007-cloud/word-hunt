import { Direction } from '../../types';

export interface CompactWord {
  w: string;
  c: string;
  d?: string;
  e?: string;
  s: number[];
  ec: number[];
  dir: string;
}

export interface CompactLevel {
  l: number;
  s: number;
  t: string;
  sz: number;
  g: string[];
  w: CompactWord[];
}
