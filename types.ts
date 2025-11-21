export enum GameState {
  MENU = 0,
  CHARGING = 1,
  FLYING = 2,
  STOPPED = 3,
}

export interface Environment {
  name: string;
  sky: string;
  ground: string;
  groundDetail: string;
  decoType: 'building' | 'tree' | 'mountain' | 'palm';
  decoColor: string;
}

export interface Dog {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  angle: number;
}

export interface Obstacle {
  x: number;
  y: number;
  type: 'boost' | 'slow' | 'trampoline';
  hit: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface FloatingText {
  text: string;
  x: number;
  y: number;
  life: number;
  dy: number;
}

export interface RunHistory {
  id: number;
  distance: number;
  timestamp: string;
}