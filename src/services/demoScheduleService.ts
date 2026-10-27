/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TASK 1: Prepared 34-Day Demo Balance Schedule Service (INACTIVE BY DEFAULT)
 * 
 * STRICT COMPLIANCE RULES:
 * - This schedule is prepared for demonstration and testing ONLY.
 * - STATUS: STRICTLY INACTIVE by default (isActive = false).
 * - Starting demo balance for this schedule: $0.
 * - Daily increment: $100,000 / day.
 * - Duration: exactly 34 days (Day 1: $100K -> Day 34: $3,400,000).
 * - Deterministic, calendar-based calculation preventing duplicate increments on reload/restart.
 * - All figures are explicitly labeled SIMULATED / DEMO.
 * - MUST NOT be activated until explicitly requested by the user.
 */

export interface DemoScheduleRecord {
  day: number;
  date: string; // YYYY-MM-DD
  amountAddedUSD: number;
  accumulatedTotalUSD: number;
  label: string;
}

export interface DemoScheduleConfig {
  scheduleId: string;
  totalDays: number;
  dailyIncrementUSD: number;
  targetTotalUSD: number;
  startingBalanceUSD: number;
}

export interface DemoScheduleState {
  isActive: boolean; // MUST REMAIN FALSE UNTIL USER EXPLICITLY REQUESTS ACTIVATION
  startDateISO: string | null;
  lastProcessedDate: string | null; // YYYY-MM-DD
  currentDay: number; // 0 to 34
  accumulatedBalanceUSD: number; // 0 to 3,400,000
  isCompleted: boolean;
  history: DemoScheduleRecord[];
}

export const DEMO_34_DAY_SCHEDULE_CONFIG: Readonly<DemoScheduleConfig> = Object.freeze({
  scheduleId: 'demo_schedule_34_days_v1',
  totalDays: 34,
  dailyIncrementUSD: 100_000,
  targetTotalUSD: 3_400_000,
  startingBalanceUSD: 0
});

const STORAGE_KEY_SCHEDULE_STATE = 'nexora_demo_34_day_schedule_state_v1';

/**
 * Returns the default unactivated state.
 * Notice: isActive is FALSE by default.
 */
export function getDefaultDemoScheduleState(): DemoScheduleState {
  return {
    isActive: false, // Inactive by default
    startDateISO: null,
    lastProcessedDate: null,
    currentDay: 0,
    accumulatedBalanceUSD: 0,
    isCompleted: false,
    history: []
  };
}

/**
 * Loads current persisted schedule state without changing or activating it.
 */
export function getDemoScheduleState(): DemoScheduleState {
  if (typeof window === 'undefined' || !window.localStorage) {
    return getDefaultDemoScheduleState();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SCHEDULE_STATE);
    if (!raw) return getDefaultDemoScheduleState();
    const parsed = JSON.parse(raw);
    return {
      isActive: Boolean(parsed.isActive),
      startDateISO: parsed.startDateISO || null,
      lastProcessedDate: parsed.lastProcessedDate || null,
      currentDay: typeof parsed.currentDay === 'number' ? parsed.currentDay : 0,
      accumulatedBalanceUSD: typeof parsed.accumulatedBalanceUSD === 'number' ? parsed.accumulatedBalanceUSD : 0,
      isCompleted: Boolean(parsed.isCompleted),
      history: Array.isArray(parsed.history) ? parsed.history : []
    };
  } catch {
    return getDefaultDemoScheduleState();
  }
}

/**
 * Deterministically calculates what the day number and balance should be
 * for any given reference timestamp, based on a start timestamp.
 */
export function calculateScheduleProgression(
  startTimestampMs: number,
  currentTimestampMs: number,
  config: DemoScheduleConfig = DEMO_34_DAY_SCHEDULE_CONFIG
): {
  day: number;
  accumulatedBalanceUSD: number;
  isCompleted: boolean;
} {
  if (currentTimestampMs < startTimestampMs) {
    return {
      day: 0,
      accumulatedBalanceUSD: config.startingBalanceUSD,
      isCompleted: false
    };
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  // Day 1 starts on day of activation (day index 1)
  const elapsedDays = Math.floor((currentTimestampMs - startTimestampMs) / msPerDay) + 1;
  const clampedDay = Math.min(config.totalDays, Math.max(0, elapsedDays));
  const accumulatedBalanceUSD = clampedDay * config.dailyIncrementUSD;
  const isCompleted = clampedDay >= config.totalDays;

  return {
    day: clampedDay,
    accumulatedBalanceUSD,
    isCompleted
  };
}

/**
 * Activates the schedule ONLY when explicitly requested.
 * (Will NOT be called unless user explicitly triggers it).
 */
export function activateDemoSchedule(
  customStartDateISO?: string,
  config: DemoScheduleConfig = DEMO_34_DAY_SCHEDULE_CONFIG
): DemoScheduleState {
  const startDate = customStartDateISO ? new Date(customStartDateISO) : new Date();
  const todayYMD = startDate.toISOString().slice(0, 10);

  const initialRecord: DemoScheduleRecord = {
    day: 1,
    date: todayYMD,
    amountAddedUSD: config.dailyIncrementUSD,
    accumulatedTotalUSD: config.dailyIncrementUSD,
    label: `Simulated Demo Grant: Day 1 of ${config.totalDays} (+$${config.dailyIncrementUSD.toLocaleString()})`
  };

  const newState: DemoScheduleState = {
    isActive: true,
    startDateISO: startDate.toISOString(),
    lastProcessedDate: todayYMD,
    currentDay: 1,
    accumulatedBalanceUSD: config.dailyIncrementUSD,
    isCompleted: false,
    history: [initialRecord]
  };

  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(STORAGE_KEY_SCHEDULE_STATE, JSON.stringify(newState));
  }

  return newState;
}

/**
 * Check and advance schedule if active and a new day has arrived.
 * If the schedule is NOT active (default), this is a NO-OP.
 */
export function evaluateDemoScheduleTick(
  now: Date = new Date(),
  config: DemoScheduleConfig = DEMO_34_DAY_SCHEDULE_CONFIG
): {
  hasIncremented: boolean;
  state: DemoScheduleState;
  incrementAmountUSD: number;
} {
  const state = getDemoScheduleState();

  // STRICT REQUIREMENT: If inactive, do nothing
  if (!state.isActive || !state.startDateISO || state.isCompleted) {
    return {
      hasIncremented: false,
      state,
      incrementAmountUSD: 0
    };
  }

  const todayYMD = now.toISOString().slice(0, 10);

  // Prevent duplicate increments on the same calendar day
  if (state.lastProcessedDate === todayYMD) {
    return {
      hasIncremented: false,
      state,
      incrementAmountUSD: 0
    };
  }

  const startMs = new Date(state.startDateISO).getTime();
  const nowMs = now.getTime();
  const progression = calculateScheduleProgression(startMs, nowMs, config);

  if (progression.day <= state.currentDay) {
    return {
      hasIncremented: false,
      state,
      incrementAmountUSD: 0
    };
  }

  // Calculate increment for the newly advanced day(s)
  const previousBalance = state.accumulatedBalanceUSD;
  const newBalance = progression.accumulatedBalanceUSD;
  const delta = newBalance - previousBalance;

  const newRecords: DemoScheduleRecord[] = [];
  for (let d = state.currentDay + 1; d <= progression.day; d++) {
    newRecords.push({
      day: d,
      date: todayYMD,
      amountAddedUSD: config.dailyIncrementUSD,
      accumulatedTotalUSD: d * config.dailyIncrementUSD,
      label: `Simulated Demo Grant: Day ${d} of ${config.totalDays} (+$${config.dailyIncrementUSD.toLocaleString()})`
    });
  }

  const updatedState: DemoScheduleState = {
    ...state,
    currentDay: progression.day,
    accumulatedBalanceUSD: newBalance,
    lastProcessedDate: todayYMD,
    isCompleted: progression.isCompleted,
    history: [...state.history, ...newRecords]
  };

  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(STORAGE_KEY_SCHEDULE_STATE, JSON.stringify(updatedState));
  }

  return {
    hasIncremented: true,
    state: updatedState,
    incrementAmountUSD: delta
  };
}

/**
 * Resets the demo schedule back to inactive initial state.
 */
export function resetDemoSchedule(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(STORAGE_KEY_SCHEDULE_STATE);
  }
}
