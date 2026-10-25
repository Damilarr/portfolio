import { withViewTransition } from './view-transition';

describe('withViewTransition', () => {
  const original = (document as any).startViewTransition;

  afterEach(() => ((document as any).startViewTransition = original));

  it('just applies the update where the browser has no view transitions', async () => {
    (document as any).startViewTransition = undefined;
    const update = jasmine.createSpy('update');
    await withViewTransition(update);
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('runs the update inside a transition when the browser has them', async () => {
    let finish!: () => void;
    const start = jasmine
      .createSpy('startViewTransition')
      .and.callFake((cb: () => void) => {
        cb();
        return { finished: new Promise<void>((resolve) => (finish = resolve)) };
      });
    (document as any).startViewTransition = start;
    const update = jasmine.createSpy('update');

    const done = withViewTransition(update);
    expect(start).toHaveBeenCalled();
    expect(update).toHaveBeenCalledTimes(1);
    finish();
    await done;
  });

  it('settles even when the browser skips the animation', async () => {
    (document as any).startViewTransition = (cb: () => void) => {
      cb();
      return { finished: Promise.reject(new Error('skipped')) };
    };
    await expectAsync(withViewTransition(() => {})).toBeResolved();
  });
});
