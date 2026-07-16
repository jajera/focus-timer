import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { formatTime, validateDuration, setDuration, tick, start, pause, reset } from '../src/timer.js';

/**
 * Feature: focus-timer, Property 1: Time formatting produces valid MM:SS
 * Validates: Requirements 1.1
 */
describe('Feature: focus-timer, Property 1: Time formatting produces valid MM:SS', () => {
  it('should produce a valid MM:SS string for any remainingSeconds in 0-7200', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 7200 }), (remainingSeconds) => {
        const result = formatTime(remainingSeconds);

        // Verify the output matches the pattern: at least 2 digits for minutes, colon, exactly 2 digits for seconds
        // Minutes portion is zero-padded to minimum 2 digits (can be 3 for 100+ minutes)
        expect(result).toMatch(/^\d{2,3}:\d{2}$/);

        // Verify minutes portion equals Math.floor(remainingSeconds / 60) zero-padded to at least 2 digits
        const expectedMinutes = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
        // Verify seconds portion equals remainingSeconds % 60 zero-padded to 2 digits
        const expectedSeconds = String(remainingSeconds % 60).padStart(2, '0');

        const colonIndex = result.lastIndexOf(':');
        const minutesPart = result.slice(0, colonIndex);
        const secondsPart = result.slice(colonIndex + 1);
        expect(minutesPart).toBe(expectedMinutes);
        expect(secondsPart).toBe(expectedSeconds);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Feature: focus-timer, Property 4: Duration validation accepts valid and rejects invalid', () => {
  /**
   * **Validates: Requirements 2.1, 2.7**
   *
   * For any numeric value, the duration validation function SHALL accept the value
   * if and only if it is a whole number in the range 1–120 (inclusive).
   * For any value outside this range or any non-integer, the validation SHALL reject it.
   */

  it('accepts all integers in the range 1–120', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 120 }),
        (value) => {
          expect(validateDuration(value)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects integers outside the range 1–120', () => {
    const outOfRange = fc.oneof(
      fc.integer({ min: -1000, max: 0 }),
      fc.integer({ min: 121, max: 10000 })
    );

    fc.assert(
      fc.property(outOfRange, (value) => {
        expect(validateDuration(value)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('rejects non-integer (floating point) numbers', () => {
    const nonInteger = fc.double({ min: -1000, max: 1000, noNaN: true, noDefaultInfinity: true })
      .filter((v) => !Number.isInteger(v));

    fc.assert(
      fc.property(nonInteger, (value) => {
        expect(validateDuration(value)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('rejects non-number values (strings, booleans, null, undefined)', () => {
    const nonNumber = fc.oneof(
      fc.string(),
      fc.boolean(),
      fc.constant(null),
      fc.constant(undefined)
    );

    fc.assert(
      fc.property(nonNumber, (value) => {
        expect(validateDuration(value)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Feature: focus-timer, Property 5: setDuration in idle state synchronizes remainingSeconds', () => {
  /**
   * **Validates: Requirements 1.3, 2.6**
   *
   * For any TimerState with status 'idle' and any valid duration value (integer 1–120),
   * calling setDuration(minutes) SHALL update durationMinutes to the new value
   * and set remainingSeconds to minutes * 60.
   */
  it('setDuration updates durationMinutes and synchronizes remainingSeconds in idle state', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 120 }),
        fc.integer({ min: 0, max: 7200 }),
        fc.integer({ min: 1, max: 120 }),
        (durationMinutes, remainingSeconds, newDuration) => {
          const state = { status: 'idle', durationMinutes, remainingSeconds };
          const result = setDuration(state, newDuration);

          expect(result.durationMinutes).toBe(newDuration);
          expect(result.remainingSeconds).toBe(newDuration * 60);
          expect(result.status).toBe('idle');
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: focus-timer, Property 2: Tick in running state decrements and completes
 * Validates: Requirements 1.2, 6.1, 6.2
 */
describe('Feature: focus-timer, Property 2: Tick in running state decrements and completes', () => {
  it('tick decrements remainingSeconds by 1 when running with remainingSeconds > 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 7200 }),
        fc.integer({ min: 1, max: 120 }),
        (remainingSeconds, durationMinutes) => {
          const state = { status: 'running', durationMinutes, remainingSeconds };
          const result = tick(state);

          expect(result.remainingSeconds).toBe(remainingSeconds - 1);
          expect(result.status).toBe('running');
          expect(result.durationMinutes).toBe(durationMinutes);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('tick transitions to idle when remainingSeconds becomes 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 120 }),
        (durationMinutes) => {
          const state = { status: 'running', durationMinutes, remainingSeconds: 1 };
          const result = tick(state);

          expect(result.remainingSeconds).toBe(0);
          expect(result.status).toBe('idle');
          expect(result.durationMinutes).toBe(durationMinutes);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: focus-timer, Property 3: Tick in non-running state is a no-op
 * Validates: Requirements 1.4
 */
describe('Feature: focus-timer, Property 3: Tick in non-running state is a no-op', () => {
  it('tick returns identical state when status is idle', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 120 }),
        fc.integer({ min: 0, max: 7200 }),
        (durationMinutes, remainingSeconds) => {
          const state = { status: 'idle', durationMinutes, remainingSeconds };
          const result = tick(state);

          expect(result).toEqual(state);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('tick returns identical state when status is paused', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 120 }),
        fc.integer({ min: 0, max: 7200 }),
        (durationMinutes, remainingSeconds) => {
          const state = { status: 'paused', durationMinutes, remainingSeconds };
          const result = tick(state);

          expect(result).toEqual(state);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: focus-timer, Property 6: Start transitions to running preserving time
 * Validates: Requirements 3.1, 3.2
 */
describe('Feature: focus-timer, Property 6: Start transitions to running preserving time', () => {
  it('start transitions idle to running with remainingSeconds unchanged', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 120 }),
        fc.integer({ min: 1, max: 7200 }),
        (durationMinutes, remainingSeconds) => {
          const state = { status: 'idle', durationMinutes, remainingSeconds };
          const result = start(state);

          expect(result.status).toBe('running');
          expect(result.remainingSeconds).toBe(remainingSeconds);
          expect(result.durationMinutes).toBe(durationMinutes);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('start transitions paused to running with remainingSeconds unchanged', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 120 }),
        fc.integer({ min: 1, max: 7200 }),
        (durationMinutes, remainingSeconds) => {
          const state = { status: 'paused', durationMinutes, remainingSeconds };
          const result = start(state);

          expect(result.status).toBe('running');
          expect(result.remainingSeconds).toBe(remainingSeconds);
          expect(result.durationMinutes).toBe(durationMinutes);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: focus-timer, Property 7: Pause preserves remaining time
 * Validates: Requirements 4.1
 */
describe('Feature: focus-timer, Property 7: Pause preserves remaining time', () => {
  it('pause transitions running to paused with remainingSeconds identical', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 120 }),
        fc.integer({ min: 1, max: 7200 }),
        (durationMinutes, remainingSeconds) => {
          const state = { status: 'running', durationMinutes, remainingSeconds };
          const result = pause(state);

          expect(result.status).toBe('paused');
          expect(result.remainingSeconds).toBe(remainingSeconds);
          expect(result.durationMinutes).toBe(durationMinutes);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: focus-timer, Property 8: Reset restores idle with full duration
 * Validates: Requirements 5.1, 5.2
 */
describe('Feature: focus-timer, Property 8: Reset restores idle with full duration', () => {
  it('reset transitions running to idle with remainingSeconds = durationMinutes * 60', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 120 }),
        fc.integer({ min: 1, max: 7200 }),
        (durationMinutes, remainingSeconds) => {
          const state = { status: 'running', durationMinutes, remainingSeconds };
          const result = reset(state);

          expect(result.status).toBe('idle');
          expect(result.remainingSeconds).toBe(durationMinutes * 60);
          expect(result.durationMinutes).toBe(durationMinutes);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('reset transitions paused to idle with remainingSeconds = durationMinutes * 60', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 120 }),
        fc.integer({ min: 1, max: 7200 }),
        (durationMinutes, remainingSeconds) => {
          const state = { status: 'paused', durationMinutes, remainingSeconds };
          const result = reset(state);

          expect(result.status).toBe('idle');
          expect(result.remainingSeconds).toBe(durationMinutes * 60);
          expect(result.durationMinutes).toBe(durationMinutes);
        }
      ),
      { numRuns: 100 }
    );
  });
});
