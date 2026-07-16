/**
 * Focus Timer - App Controller
 *
 * Wires the timer state machine to the DOM by managing event listeners
 * and the setInterval that drives the countdown.
 */

import {
  createInitialState,
  start,
  pause,
  reset,
  tick,
  setDuration,
  validateDuration,
} from './timer.js';
import { render } from './renderer.js';

/**
 * Initializes the focus timer application.
 *
 * - Creates initial state
 * - Gets DOM element references
 * - Sets up event listeners for buttons and duration input
 * - Manages the interval for ticking
 * - Renders the initial state
 */
export function init() {
  let state = createInitialState();
  let intervalId = null;

  // DOM references
  const startBtn = document.getElementById('start-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const resetBtn = document.getElementById('reset-btn');
  const durationInput = document.getElementById('duration-input');

  /**
   * Tick callback: decrements the timer, re-renders, and clears
   * the interval if the state transitions to idle (timer completed).
   */
  function handleTick() {
    state = tick(state);
    render(state);
    if (state.status === 'idle') {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  /**
   * Start button click handler: transitions state to running,
   * starts the 1-second interval, and re-renders.
   */
  startBtn.addEventListener('click', () => {
    state = start(state);
    intervalId = setInterval(handleTick, 1000);
    render(state);
  });

  /**
   * Pause button click handler: transitions state to paused,
   * clears the interval, and re-renders.
   */
  pauseBtn.addEventListener('click', () => {
    state = pause(state);
    clearInterval(intervalId);
    intervalId = null;
    render(state);
  });

  /**
   * Reset button click handler: transitions state to idle,
   * clears the interval immediately, and re-renders.
   */
  resetBtn.addEventListener('click', () => {
    state = reset(state);
    clearInterval(intervalId);
    intervalId = null;
    render(state);
  });

  /**
   * Duration input change handler: validates the input value,
   * updates state if valid, otherwise retains the previous value.
   * Re-renders in both cases.
   */
  durationInput.addEventListener('change', () => {
    const value = Number(durationInput.value);
    if (validateDuration(value)) {
      state = setDuration(state, value);
    } else {
      // Reject invalid value: restore input to previous valid duration
      durationInput.value = state.durationMinutes;
    }
    render(state);
  });

  // Initial render
  render(state);
}
