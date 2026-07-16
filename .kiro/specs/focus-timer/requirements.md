# Requirements Document

## Introduction

A simple static focus timer web application that helps users maintain concentration through timed work sessions. The app displays a large countdown timer, allows users to set a custom duration (defaulting to 25 minutes), and provides Start, Pause, and Reset controls. The timer operates in three clear states: Idle, Running, and Paused.

## Glossary

- **Timer_App**: The focus timer web application that manages countdown sessions
- **Countdown_Display**: The large visual element showing remaining time in minutes and seconds
- **Duration_Input**: The input field where users specify the desired timer duration in minutes
- **Start_Button**: The control that begins or resumes the countdown
- **Pause_Button**: The control that temporarily halts the countdown
- **Reset_Button**: The control that stops the countdown and returns the timer to its initial state
- **Idle_State**: The state when the timer is not running and no session is active
- **Running_State**: The state when the timer is actively counting down
- **Paused_State**: The state when the timer has been temporarily halted mid-session

## Requirements

### Requirement 1: Display Countdown Timer

**User Story:** As a user, I want to see a large countdown display, so that I can easily read the remaining time at a glance.

#### Acceptance Criteria

1. THE Countdown_Display SHALL show the remaining time in MM:SS format, where MM is the zero-padded minutes (00-99) and SS is the zero-padded seconds (00-59)
2. WHILE in Running_State, THE Countdown_Display SHALL decrement the displayed time by one second on each update, updating once per second
3. WHILE in Idle_State, THE Countdown_Display SHALL show the configured duration as the initial countdown value with seconds set to 00
4. WHILE in Paused_State, THE Countdown_Display SHALL show the remaining time at the moment the timer was paused without any further updates

### Requirement 2: Configure Timer Duration

**User Story:** As a user, I want to set the timer duration in minutes, so that I can customize my focus session length.

#### Acceptance Criteria

1. THE Duration_Input SHALL accept only whole numbers of minutes within the range of 1 to 120
2. THE Duration_Input SHALL default to 25 minutes when the Timer_App is first loaded
3. WHILE in Idle_State, THE Duration_Input SHALL be editable by the user
4. WHILE in Running_State, THE Duration_Input SHALL be locked and non-editable
5. WHILE in Paused_State, THE Duration_Input SHALL be locked and non-editable
6. WHEN the user changes the Duration_Input value while in Idle_State, THE Countdown_Display SHALL update to reflect the new duration
7. IF the user enters a value outside the range of 1 to 120 or a non-whole-number value into the Duration_Input, THEN THE Duration_Input SHALL reject the value and retain the previous valid duration

### Requirement 3: Start the Timer

**User Story:** As a user, I want to start the timer, so that I can begin my focus session.

#### Acceptance Criteria

1. WHEN the user activates the Start_Button while in Idle_State, THE Timer_App SHALL transition to Running_State and begin counting down from the configured duration
2. WHEN the user activates the Start_Button while in Paused_State, THE Timer_App SHALL transition to Running_State and resume counting down from the remaining time
3. WHILE in Running_State, THE Start_Button SHALL be disabled
4. IF the user activates the Start_Button while in Idle_State and the Duration_Input value is less than 1 minute, THEN THE Timer_App SHALL remain in Idle_State and not begin counting down

### Requirement 4: Pause the Timer

**User Story:** As a user, I want to pause the timer, so that I can temporarily stop the countdown without losing my progress.

#### Acceptance Criteria

1. WHEN the user activates the Pause_Button while in Running_State, THE Timer_App SHALL transition to Paused_State and stop the countdown, preserving the remaining time value
2. WHILE in Idle_State, THE Pause_Button SHALL be disabled and not respond to user activation
3. WHILE in Paused_State, THE Pause_Button SHALL be disabled and not respond to user activation
4. WHILE in Running_State, THE Pause_Button SHALL be enabled and available for user activation

### Requirement 5: Reset the Timer

**User Story:** As a user, I want to reset the timer, so that I can stop the current session and start fresh.

#### Acceptance Criteria

1. WHEN the user activates the Reset_Button while in Running_State, THE Timer_App SHALL transition to Idle_State and reset the Countdown_Display to the current Duration_Input value in MM:SS format
2. WHEN the user activates the Reset_Button while in Paused_State, THE Timer_App SHALL transition to Idle_State and reset the Countdown_Display to the current Duration_Input value in MM:SS format
3. WHILE in Idle_State, THE Reset_Button SHALL be disabled
4. WHEN the user activates the Reset_Button while in Running_State or Paused_State, THE Timer_App SHALL stop the active countdown within 100 milliseconds of activation

### Requirement 6: Timer Completion

**User Story:** As a user, I want the timer to indicate when my focus session is complete, so that I know the session has ended.

#### Acceptance Criteria

1. WHEN the countdown reaches zero while in Running_State, THE Countdown_Display SHALL show 00:00
2. WHEN the countdown reaches zero while in Running_State, THE Timer_App SHALL transition to Idle_State
3. WHEN the countdown reaches zero, THE Duration_Input SHALL become editable again
