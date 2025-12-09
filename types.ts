import { Vector3 } from 'three';

export enum AppState {
  WAITING = 'WAITING',
  BLOWING = 'BLOWING',
  FINISHED = 'FINISHED'
}

export interface CandleData {
  id: number;
  position: [number, number, number]; // cakePosition
  rotation: [number, number, number];
  color: string;
}

export interface Particle {
  id: string;
  position: Vector3;
  velocity: Vector3;
  life: number;
  maxLife: number;
  scale: number;
}
