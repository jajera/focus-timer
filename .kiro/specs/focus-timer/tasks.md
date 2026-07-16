# Implementation Plan: Focus Timer

## Overview

A static focus timer web application implemented as vanilla HTML/CSS/JS with no build tools or frameworks. The implementation follows an incremental approach: set up project structure, implement the core timer state machine, build the DOM rendering layer, wire everything together, and validate with property-based and unit tests using Vitest and fast-check.

## Tasks

- [ ] 1. Set up project structure and testing infrastructure
  - [ ] 1.1 Create the base HTML file with embedded CSS and placeholder structure
    - Create `index.html` with the countdown display element, duration input field, and Start/Pause/Reset buttons
    - Include basic CSS styling for a clean, centered layout with a large countdown display
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

  - [ ] 1.2 Initialize the project with Vitest and fast-check
    - Create `package.json` with vitest and fast-check as dev dependencies
    - Create `vitest.config.js` with appropriate configuration
    - _Requirements: Testing infrastructure_

- [ ] 2. Implement timer state machine logic
  - [ ] 2.1 Create the timer state module with core data model and state transitions
    - Create `src/timer.js` exporting pure functions: `createInitialState()`, `start(state)`, `pause(state)`, `reset(state)`, `tick(state)`, `setDuration(state, minutes)`, `validateDuration(value)`, and `formatTime(remainingSeconds)`
    - `createInitialState()` returns `{ status: 'idle', durationMinutes: 25, remainingSeconds: 1500 }`
    - `start()` transitions idle/paused → running (no-op if already running)
    - `pause()` transitions running → paused (no-op otherwise)
    - `reset()` transitions running/paused → idle with `remainingSeconds = durationMinutes * 60`
    - `tick()` decrements `remainingSeconds` by 1 when running; transitions to idle when reaching 0; no-op in other states
    - `setDuration()` updates duration and resets `remainingSeconds` only in idle state
    - `validateDuration()` returns true for integers 1–120, false otherwise
    - `formatTime()` converts seconds to zero-padded `MM:SS` string
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.6, 2.7, 3.1, 3.2, 4.1, 5.1, 5.2, 6.1, 6.2_

  - [ ]* 2.2 Write property test for time formatting
    - **Property 1: Time formatting produces valid MM:SS**
    - **Validates: Requirements 1.1**

  - [ ]* 2.3 Write property test for tick in running state
    - **Property 2: Tick in running state decrements and completes**
    - **Validates: Requirements 1.2, 6.1, 6.2**

  - [ ]* 2.4 Write property test for tick in non-running state
    - **Property 3: Tick in non-running state is a no-op**
    - **Validates: Requirements 1.4**

  - [ ]* 2.5 Write property test for duration validation
    - **Property 4: Duration validation accepts valid and rejects invalid**
    - **Validates: Requirements 2.1, 2.7**

  - [ ]* 2.6 Write property test for setDuration in idle state
    - **Property 5: setDuration in idle state synchronizes remainingSeconds**
    - **Validates: Requirements 1.3, 2.6**

  - [ ]* 2.7 Write property test for start transitions
    - **Property 6: Start transitions to running preserving time**
    - **Validates: Requirements 3.1, 3.2**

  - [ ]* 2.8 Write property test for pause preservation
    - **Property 7: Pause preserves remaining time**
    - **Validates: Requirements 4.1**

  - [ ]* 2.9 Write property test for reset restoration
    - **Property 8: Reset restores idle with full duration**
    - **Validates: Requirements 5.1, 5.2**

- [ ] 3. Checkpoint - Verify state machine logic
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement DOM rendering and event handling
  - [ ] 4.1 Create the DOM renderer module
    - Create `src/renderer.js` that exports a `render(state)` function
    - Updates the countdown display text with formatted time from state
    - Enables/disables Start, Pause, Reset buttons based on state status (per the button state table in design)
    - Locks/unlocks the duration input based on state (editable only in idle)
    - _Requirements: 1.1, 1.3, 1.4, 2.3, 2.4, 2.5, 3.3, 4.2, 4.3, 4.4, 5.3_

  - [ ] 4.2 Create the app controller that wires state machine to DOM
    - Create `src/app.js` that initializes state, sets up event listeners, and manages the interval
    - Start button click: calls `start()`, starts `setInterval(tick, 1000)`, re-renders
    - Pause button click: calls `pause()`, clears interval, re-renders
    - Reset button click: calls `reset()`, clears interval, re-renders
    - Duration input change: validates input, calls `setDuration()` if valid, otherwise retains previous value, re-renders
    - Tick callback: calls `tick()`, re-renders, clears interval if state transitions to idle (completion)
    - _Requirements: 2.6, 2.7, 3.1, 3.2, 4.1, 5.1, 5.2, 5.4, 6.1, 6.2, 6.3_

  - [ ] 4.3 Integrate modules into index.html
    - Add `<script type="module">` imports in `index.html` to load `src/app.js`
    - Ensure the app initializes on DOMContentLoaded with default state (25 minutes)
    - Verify the countdown displays "25:00" on initial load
    - _Requirements: 1.3, 2.2_

- [ ] 5. Checkpoint - Verify full integration
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Write unit tests for edge cases and integration behavior
  - [ ]* 6.1 Write unit tests for initial state and button states
    - Test initial state defaults to 25 minutes idle
    - Test button enabled/disabled states match the design state table for all three states
    - Test duration input is editable only in idle state
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 3.3, 4.2, 4.3, 4.4, 5.3_

  - [ ]* 6.2 Write unit tests for edge cases
    - Test start is rejected when duration < 1 (guard against invalid state)
    - Test timer completion makes input editable (transitions to idle)
    - Test reset clears interval promptly (within 100ms requirement)
    - _Requirements: 3.4, 5.4, 6.3_

- [ ] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The app is a single HTML file with JS modules — no build step required for the app itself
- Vitest is used only for testing; the production app has zero dependencies

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8", "2.9"] },
    { "id": 3, "tasks": ["4.1"] },
    { "id": 4, "tasks": ["4.2"] },
    { "id": 5, "tasks": ["4.3"] },
    { "id": 6, "tasks": ["6.1", "6.2"] }
  ]
}
```
