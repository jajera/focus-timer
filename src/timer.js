/**
 * Focus Timer - Core State Machine
 *
 * Pure functions for managing timer state transitions.
 * No side effects, no dependencies, no DOM interaction.
 */

/**
 * Creates the initial timer state with default values.
 * @returns {{ status: 'idle', durationMinutes: number, remainingSeconds: number }}
 */
export function createInitialState() {
  return {
    status: 'idle',
    durationMinutes: 25,
    remainingSeconds: 1500,
  };
}

/**
 * Transitions idle/paused → running. No-op if already running.
 * @param {{ status: string, durationMinutes: number, remainingSeconds: number }} state
 * @returns {{ status: string, durationMinutes: number, remainingSeconds: number }}
 */
export function start(state) {
  if (state.status === 'running') {
    return state;
  }
  return { ...state, status: 'running' };
}

/**
 * Transitions running → paused. No-op if idle or already paused.
 * @param {{ status: string, durationMinutes: number, remainingSeconds: number }} state
 * @returns {{ status: string, durationMinutes: number, remainingSeconds: number }}
 */
export function pause(state) {
  if (state.status !== 'running') {
    return state;
  }
  return { ...state, status: 'paused' };
}

/**
 * Transitions running/paused → idle with remainingSeconds reset to durationMinutes * 60.
 * No-op if already idle.
 * @param {{ status: string, durationMinutes: number, remainingSeconds: number }} state
 * @returns {{ status: string, durationMinutes: number, remainingSeconds: number }}
 */
export function reset(state) {
  if (state.status === 'idle') {
    return state;
  }
  return {
    ...state,
    status: 'idle',
    remainingSeconds: state.durationMinutes * 60,
  };
}

/**
 * Decrements remainingSeconds by 1 when running.
 * Transitions to idle when reaching 0.
 * No-op in idle or paused states.
 * @param {{ status: string, durationMinutes: number, remainingSeconds: number }} state
 * @returns {{ status: string, durationMinutes: number, remainingSeconds: number }}
 */
export function tick(state) {
  if (state.status !== 'running') {
    return state;
  }
  const newRemaining = state.remainingSeconds - 1;
  if (newRemaining <= 0) {
    return { ...state, status: 'idle', remainingSeconds: 0 };
  }
  return { ...state, remainingSeconds: newRemaining };
}

/**
 * Updates duration and resets remainingSeconds only in idle state.
 * No-op in running or paused states.
 * @param {{ status: string, durationMinutes: number, remainingSeconds: number }} state
 * @param {number} minutes
 * @returns {{ status: string, durationMinutes: number, remainingSeconds: number }}
 */
export function setDuration(state, minutes) {
  if (state.status !== 'idle') {
    return state;
  }
  return {
    ...state,
    durationMinutes: minutes,
    remainingSeconds: minutes * 60,
  };
}

/**
 * Validates that a duration value is a whole number between 1 and 120 inclusive.
 * @param {*} value
 * @returns {boolean}
 */
export function validateDuration(value) {
  if (typeof value !== 'number') {
    return false;
  }
  if (!Number.isInteger(value)) {
    return false;
  }
  return value >= 1 && value <= 120;
}

/**
 * Converts remaining seconds to a zero-padded MM:SS string.
 * @param {number} remainingSeconds
 * @returns {string}
 */
export function formatTime(remainingSeconds) {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${mm}:${ss}`;
}
