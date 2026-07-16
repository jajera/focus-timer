/**
 * Focus Timer - DOM Renderer
 *
 * Updates the DOM to reflect the current timer state.
 * Expects the HTML structure from index.html to be present.
 */

import { formatTime } from './timer.js';

/**
 * Renders the current timer state to the DOM.
 *
 * - Updates countdown display text with formatted MM:SS time
 * - Enables/disables Start, Pause, Reset buttons based on state status
 * - Locks/unlocks duration input (editable only in idle)
 *
 * Button state table:
 * | State   | Start   | Pause    | Reset    | Duration Input |
 * |---------|---------|----------|----------|----------------|
 * | idle    | Enabled | Disabled | Disabled | Editable       |
 * | running | Disabled| Enabled  | Enabled  | Locked         |
 * | paused  | Enabled | Disabled | Enabled  | Locked         |
 *
 * @param {{ status: 'idle' | 'running' | 'paused', durationMinutes: number, remainingSeconds: number }} state
 */
export function render(state) {
  const countdownDisplay = document.getElementById('countdown-display');
  const durationInput = document.getElementById('duration-input');
  const startBtn = document.getElementById('start-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const resetBtn = document.getElementById('reset-btn');

  // Update countdown display
  countdownDisplay.textContent = formatTime(state.remainingSeconds);

  // Update button states based on current status
  switch (state.status) {
    case 'idle':
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      resetBtn.disabled = true;
      durationInput.disabled = false;
      break;

    case 'running':
      startBtn.disabled = true;
      pauseBtn.disabled = false;
      resetBtn.disabled = false;
      durationInput.disabled = true;
      break;

    case 'paused':
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      resetBtn.disabled = false;
      durationInput.disabled = true;
      break;
  }
}
