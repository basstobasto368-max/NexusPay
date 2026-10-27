/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Automated Verification Tests for the 34-Day Demo Balance Schedule Service
 */

// Mock in-memory localStorage for node test execution
const storage: Record<string, string> = {};
(globalThis as any).window = {
  localStorage: {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, val: string) => { storage[key] = val; },
    removeItem: (key: string) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); }
  }
};
(globalThis as any).localStorage = (globalThis as any).window.localStorage;

async function runDemoScheduleTests() {
  console.log('--- STARTING 34-DAY DEMO SCHEDULE VERIFICATION TESTS ---');

  const {
    DEMO_34_DAY_SCHEDULE_CONFIG,
    getDefaultDemoScheduleState,
    getDemoScheduleState,
    calculateScheduleProgression,
    activateDemoSchedule,
    evaluateDemoScheduleTick,
    resetDemoSchedule
  } = await import('../demoScheduleService');

  // 1. Verify Configuration Constraints
  if (DEMO_34_DAY_SCHEDULE_CONFIG.startingBalanceUSD !== 0) {
    throw new Error('FAILED: Starting balance is not $0');
  }
  if (DEMO_34_DAY_SCHEDULE_CONFIG.dailyIncrementUSD !== 100_000) {
    throw new Error('FAILED: Daily increment is not $100,000');
  }
  if (DEMO_34_DAY_SCHEDULE_CONFIG.totalDays !== 34) {
    throw new Error('FAILED: Duration is not 34 days');
  }
  if (DEMO_34_DAY_SCHEDULE_CONFIG.targetTotalUSD !== 3_400_000) {
    throw new Error('FAILED: Total target is not $3,400,000');
  }
  console.log('[PASS] Configuration verified: $0 start, +$100K/day for 34 days -> $3.4M target.');

  // 2. Verify Initial Inactive State
  resetDemoSchedule();
  const initialState = getDemoScheduleState();
  if (initialState.isActive !== false) {
    throw new Error('FAILED: Schedule must be INACTIVE by default!');
  }
  if (initialState.accumulatedBalanceUSD !== 0) {
    throw new Error('FAILED: Initial balance is not 0');
  }
  console.log('[PASS] Inactive by default verified: isActive = false, balance = $0.');

  // 3. Verify evaluateDemoScheduleTick is NO-OP when inactive
  const tickWhenInactive = evaluateDemoScheduleTick(new Date());
  if (tickWhenInactive.hasIncremented) {
    throw new Error('CRITICAL FAILURE: Schedule incremented while INACTIVE!');
  }
  console.log('[PASS] Inactive safeguard verified: evaluateDemoScheduleTick performs no-op when inactive.');

  // 4. Verify Progression Calculation for Days 1 through 34
  const baseMs = new Date('2026-10-01T00:00:00Z').getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  // Day 1
  const day1 = calculateScheduleProgression(baseMs, baseMs);
  if (day1.day !== 1 || day1.accumulatedBalanceUSD !== 100_000) {
    throw new Error(`FAILED: Day 1 expectation mismatch. Got day=${day1.day}, bal=${day1.accumulatedBalanceUSD}`);
  }

  // Day 2
  const day2 = calculateScheduleProgression(baseMs, baseMs + oneDayMs);
  if (day2.day !== 2 || day2.accumulatedBalanceUSD !== 200_000) {
    throw new Error(`FAILED: Day 2 expectation mismatch. Got day=${day2.day}, bal=${day2.accumulatedBalanceUSD}`);
  }

  // Day 10
  const day10 = calculateScheduleProgression(baseMs, baseMs + 9 * oneDayMs);
  if (day10.day !== 10 || day10.accumulatedBalanceUSD !== 1_000_000) {
    throw new Error(`FAILED: Day 10 expectation mismatch. Got day=${day10.day}, bal=${day10.accumulatedBalanceUSD}`);
  }

  // Day 34
  const day34 = calculateScheduleProgression(baseMs, baseMs + 33 * oneDayMs);
  if (day34.day !== 34 || day34.accumulatedBalanceUSD !== 3_400_000 || !day34.isCompleted) {
    throw new Error(`FAILED: Day 34 expectation mismatch. Got day=${day34.day}, bal=${day34.accumulatedBalanceUSD}, completed=${day34.isCompleted}`);
  }

  // Day 35+ (Must cap at exactly 34 days and $3,400,000)
  const day50 = calculateScheduleProgression(baseMs, baseMs + 50 * oneDayMs);
  if (day50.day !== 34 || day50.accumulatedBalanceUSD !== 3_400_000 || !day50.isCompleted) {
    throw new Error(`FAILED: Day 35+ cap mismatch. Got day=${day50.day}, bal=${day50.accumulatedBalanceUSD}`);
  }
  console.log('[PASS] Progression formula verified: Day 1 ($100K) -> Day 2 ($200K) -> Day 34 ($3.4M max).');

  // 5. Test Activation and Duplicate Increment Prevention (isolated mock)
  const activated = activateDemoSchedule('2026-10-01T08:00:00Z');
  if (!activated.isActive || activated.accumulatedBalanceUSD !== 100_000) {
    throw new Error('FAILED: Activation state incorrect');
  }

  // Duplicate tick on same calendar day must be rejected
  const sameDayTick = evaluateDemoScheduleTick(new Date('2026-10-01T14:00:00Z'));
  if (sameDayTick.hasIncremented) {
    throw new Error('FAILED: Duplicate increment permitted on same calendar day!');
  }
  console.log('[PASS] Duplicate prevention verified: multiple ticks on same day do not increase balance.');

  // Tick on Day 2
  const day2Tick = evaluateDemoScheduleTick(new Date('2026-10-02T08:00:00Z'));
  if (!day2Tick.hasIncremented || day2Tick.state.accumulatedBalanceUSD !== 200_000) {
    throw new Error(`FAILED: Day 2 tick failed. Got ${day2Tick.state.accumulatedBalanceUSD}`);
  }
  console.log('[PASS] Deterministic daily increment verified: Day 2 reached $200,000.');

  // 6. Reset back to INACTIVE state
  resetDemoSchedule();
  const resetState = getDemoScheduleState();
  if (resetState.isActive !== false) {
    throw new Error('FAILED: Reset failed to restore inactive state');
  }
  console.log('[PASS] Clean reset verified: Schedule is safely reset to INACTIVE.');

  console.log('--- ALL 34-DAY DEMO SCHEDULE TESTS PASSED SUCCESSFULLY! ---');
}

runDemoScheduleTests().catch((err) => {
  console.error('SCHEDULE TEST ERROR:', err);
  process.exit(1);
});
