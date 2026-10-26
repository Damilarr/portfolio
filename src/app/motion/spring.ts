export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass?: number;
}

export const SNAPPY: SpringConfig = { stiffness: 380, damping: 32 };
export const BOUNCY: SpringConfig = { stiffness: 260, damping: 17 };
export const GENTLE: SpringConfig = { stiffness: 170, damping: 22 };

const raf: typeof requestAnimationFrame = (cb) =>
  (
    (window as any).__zone_symbol__requestAnimationFrame ||
    requestAnimationFrame
  )(cb);

const running = new Set<Spring>();
let frame = 0;
let lastTime = 0;

function tick(now: number): void {
  const dt = Math.min((now - lastTime) / 1000, 1 / 20);
  lastTime = now;
  running.forEach((spring) => spring.step(dt));
  frame = running.size ? raf(tick) : 0;
}

export class Spring {
  value: number;
  target: number;
  velocity = 0;

  private readonly mass: number;

  constructor(
    initial: number,
    private config: SpringConfig,
    private onUpdate: (value: number) => void
  ) {
    this.value = this.target = initial;
    this.mass = config.mass ?? 1;
  }

  get settled(): boolean {
    return !running.has(this);
  }

  set(target: number, config?: SpringConfig): void {
    if (config) this.config = config;
    this.target = target;
    if (running.has(this)) return;
    running.add(this);
    if (!frame) {
      lastTime = performance.now();
      frame = raf(tick);
    }
  }

  jump(value: number): void {
    this.value = this.target = value;
    this.velocity = 0;
    running.delete(this);
    this.onUpdate(value);
  }

  stop(): void {
    running.delete(this);
  }

  step(dt: number): void {
    const { stiffness, damping } = this.config;
    for (let left = dt; left > 0; left -= 1 / 240) {
      const h = Math.min(left, 1 / 240);
      const force =
        -stiffness * (this.value - this.target) - damping * this.velocity;
      this.velocity += (force / this.mass) * h;
      this.value += this.velocity * h;
    }
    if (
      Math.abs(this.velocity) < 0.002 &&
      Math.abs(this.value - this.target) < 0.001
    ) {
      this.value = this.target;
      this.velocity = 0;
      running.delete(this);
    }
    this.onUpdate(this.value);
  }
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function hasFinePointer(): boolean {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}
