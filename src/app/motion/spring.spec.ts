import { BOUNCY, SNAPPY, Spring } from './spring';

const settle = (spring: Spring, timeout = 3000) =>
  new Promise<void>((resolve, reject) => {
    const started = Date.now();
    const check = () => {
      if (spring.settled) return resolve();
      if (Date.now() - started > timeout)
        return reject(new Error('never settled'));
      setTimeout(check, 30);
    };
    check();
  });

describe('Spring', () => {
  it('moves to its target and comes to rest exactly on it', async () => {
    const seen: number[] = [];
    const spring = new Spring(0, SNAPPY, (v) => seen.push(v));
    spring.set(100);
    await settle(spring);

    expect(spring.value).toBe(100);
    expect(spring.velocity).toBe(0);
    expect(seen.length).toBeGreaterThan(5);
    expect(seen[seen.length - 1]).toBe(100);
  });

  it('overshoots when bouncy', async () => {
    let peak = 0;
    const spring = new Spring(0, BOUNCY, (v) => (peak = Math.max(peak, v)));
    spring.set(1);
    await settle(spring);
    expect(peak).toBeGreaterThan(1.05);
  });

  it('keeps its momentum when the target changes mid-flight', async () => {
    const spring = new Spring(0, SNAPPY, () => {});
    spring.set(100);
    await new Promise((resolve) => setTimeout(resolve, 80));
    const velocity = spring.velocity;
    spring.set(0);
    expect(spring.velocity).toBe(velocity);
    expect(velocity).toBeGreaterThan(0);
    await settle(spring);
    expect(spring.value).toBe(0);
  });

  it('jumps without animating', () => {
    const updates: number[] = [];
    const spring = new Spring(0, SNAPPY, (v) => updates.push(v));
    spring.jump(42);
    expect(spring.value).toBe(42);
    expect(spring.settled).toBeTrue();
    expect(updates).toEqual([42]);
  });
});
