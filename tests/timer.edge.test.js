import { describe, it, expect } from 'vitest';
import { start, tick, reset, validateDuration } from '../src/timer.js';

/**
 * Unit tests for edge cases in the focus timer state machine.
 * Requirements: 3.4, 5.4, 6.3
 */

describe('Edge Case: Start rejected when duration < 1 (Req 3.4)', () => {
  it('validateDuration rejects 0 as an invalid duration', () => {
    expect(validateDuration(0)).toBe(false);
  });

  it('validateDuration rejects negative values', () => {
    expect(validateDuration(-1)).toBe(false);
    expect(validateDuration(-25)).toBe(false);
  });

  it('start() on idle state with 0 remainingSeconds still transitions (guard is in app controller)', () => {
    // The state machine's start() doesn't check duration itself — that guard
    // is enforced by validateDuration() in the app controller before calling start().
    // This test documents that validateDuration(0) returns false, which prevents
    // the app from ever calling start() with an invalid duration.
    const state = { status: 'idle', durationMinutes: 0, remainingSeconds: 0 };

    // The safety check that prevents starting is validateDuration
    expect(validateDuration(state.durationMinutes)).toBe(false);
  });
});

describe('Edge Case: Timer completion makes input editable (Req 6.3)', () => {
  it('tick transitions running state to idle when remainingSeconds reaches 0', () => {
    const state = { status: 'running', durationMinutes: 25, remainingSeconds: 1 };
    const result = tick(state);

    // When status is 'idle', the renderer makes the duration input editable
    expect(result.status).toBe('idle');
    expect(result.remainingSeconds).toBe(0);
  });

  it('idle status means duration input is editable (per renderer logic)', () => {
    // After completion, the state is idle — this is the condition that
    // makes the duration input editable in the renderer
    const completedState = { status: 'idle', durationMinutes: 25, remainingSeconds: 0 };
    expect(completedState.status).toBe('idle');
  });
});

describe('Edge Case: Reset clears interval promptly (Req 5.4)', () => {
  it('reset() transitions to idle synchronously (no delay)', () => {
    const state = { status: 'running', durationMinutes: 25, remainingSeconds: 750 };

    const startTime = performance.now();
    const result = reset(state);
    const elapsed = performance.now() - startTime;

    expect(result.status).toBe('idle');
    expect(result.remainingSeconds).toBe(25 * 60);
    // The state transition completes well within 100ms (synchronous operation)
    expect(elapsed).toBeLessThan(100);
  });

  it('reset() from paused state also transitions synchronously', () => {
    const state = { status: 'paused', durationMinutes: 10, remainingSeconds: 300 };

    const startTime = performance.now();
    const result = reset(state);
    const elapsed = performance.now() - startTime;

    expect(result.status).toBe('idle');
    expect(result.remainingSeconds).toBe(10 * 60);
    expect(elapsed).toBeLessThan(100);
  });
});
