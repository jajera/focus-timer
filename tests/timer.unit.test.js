import { describe, it, expect } from 'vitest';
import { createInitialState, start, pause, reset, setDuration } from '../src/timer.js';

/**
 * Derives the expected UI control states from a timer state.
 * This mirrors the button state table from the design:
 *
 * | State   | Start   | Pause    | Reset    | Duration Input |
 * |---------|---------|----------|----------|----------------|
 * | idle    | Enabled | Disabled | Disabled | Editable       |
 * | running | Disabled| Enabled  | Enabled  | Locked         |
 * | paused  | Enabled | Disabled | Enabled  | Locked         |
 */
function getButtonStates(state) {
  switch (state.status) {
    case 'idle':
      return {
        startEnabled: true,
        pauseEnabled: false,
        resetEnabled: false,
        durationEditable: true,
      };
    case 'running':
      return {
        startEnabled: false,
        pauseEnabled: true,
        resetEnabled: true,
        durationEditable: false,
      };
    case 'paused':
      return {
        startEnabled: true,
        pauseEnabled: false,
        resetEnabled: true,
        durationEditable: false,
      };
    default:
      throw new Error(`Unknown status: ${state.status}`);
  }
}

describe('Initial state defaults', () => {
  it('createInitialState returns status idle with 25 minutes duration', () => {
    const state = createInitialState();

    expect(state.status).toBe('idle');
    expect(state.durationMinutes).toBe(25);
    expect(state.remainingSeconds).toBe(1500);
  });
});

describe('Button states for idle state', () => {
  it('start is enabled, pause is disabled, reset is disabled, duration is editable', () => {
    const state = createInitialState();
    const buttons = getButtonStates(state);

    expect(buttons.startEnabled).toBe(true);
    expect(buttons.pauseEnabled).toBe(false);
    expect(buttons.resetEnabled).toBe(false);
    expect(buttons.durationEditable).toBe(true);
  });
});

describe('Button states for running state', () => {
  it('start is disabled, pause is enabled, reset is enabled, duration is locked', () => {
    const idleState = createInitialState();
    const runningState = start(idleState);
    const buttons = getButtonStates(runningState);

    expect(runningState.status).toBe('running');
    expect(buttons.startEnabled).toBe(false);
    expect(buttons.pauseEnabled).toBe(true);
    expect(buttons.resetEnabled).toBe(true);
    expect(buttons.durationEditable).toBe(false);
  });
});

describe('Button states for paused state', () => {
  it('start is enabled, pause is disabled, reset is enabled, duration is locked', () => {
    const idleState = createInitialState();
    const runningState = start(idleState);
    const pausedState = pause(runningState);
    const buttons = getButtonStates(pausedState);

    expect(pausedState.status).toBe('paused');
    expect(buttons.startEnabled).toBe(true);
    expect(buttons.pauseEnabled).toBe(false);
    expect(buttons.resetEnabled).toBe(true);
    expect(buttons.durationEditable).toBe(false);
  });
});

describe('Duration input editability per state', () => {
  it('duration input is editable in idle state', () => {
    const state = createInitialState();
    const buttons = getButtonStates(state);

    expect(buttons.durationEditable).toBe(true);
  });

  it('duration input is locked in running state', () => {
    const state = start(createInitialState());
    const buttons = getButtonStates(state);

    expect(buttons.durationEditable).toBe(false);
  });

  it('duration input is locked in paused state', () => {
    const state = pause(start(createInitialState()));
    const buttons = getButtonStates(state);

    expect(buttons.durationEditable).toBe(false);
  });

  it('setDuration only works in idle state (confirms editability semantics)', () => {
    const idleState = createInitialState();
    const updated = setDuration(idleState, 10);
    expect(updated.durationMinutes).toBe(10);
    expect(updated.remainingSeconds).toBe(600);

    // setDuration is no-op in running state
    const runningState = start(idleState);
    const noChangeRunning = setDuration(runningState, 10);
    expect(noChangeRunning.durationMinutes).toBe(25);

    // setDuration is no-op in paused state
    const pausedState = pause(start(idleState));
    const noChangePaused = setDuration(pausedState, 10);
    expect(noChangePaused.durationMinutes).toBe(25);
  });

  it('duration input becomes editable again after reset from running', () => {
    const state = reset(start(createInitialState()));
    const buttons = getButtonStates(state);

    expect(state.status).toBe('idle');
    expect(buttons.durationEditable).toBe(true);
  });

  it('duration input becomes editable again after reset from paused', () => {
    const state = reset(pause(start(createInitialState())));
    const buttons = getButtonStates(state);

    expect(state.status).toBe('idle');
    expect(buttons.durationEditable).toBe(true);
  });
});
