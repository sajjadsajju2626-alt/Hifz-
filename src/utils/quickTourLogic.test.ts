import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampSpotlightRect,
  computeTourCardPosition,
  getNextStepIndex,
  getPrevStepIndex,
  getTourProgressPercent,
  getTourSteps,
  getTourUiStrings,
  toggleTourLanguage,
} from './quickTourLogic';

test('getTourSteps provides complete bilingual steps for every admin role context', () => {
  const contexts = ['principal', 'principal_demo', 'master'] as const;
  for (const ctx of contexts) {
    const steps = getTourSteps(ctx);
    assert.ok(steps.length >= 5, `Expected at least 5 steps for ${ctx}`);
    for (const step of steps) {
      assert.ok(step.id.length > 0);
      assert.ok(step.targetSelector.length > 0);
      assert.ok(step.title.en.trim().length > 0);
      assert.ok(step.title.ml.trim().length > 0);
      assert.ok(step.description.en.trim().length > 0);
      assert.ok(step.description.ml.trim().length > 0);
      assert.ok(step.tip.en.trim().length > 0);
      assert.ok(step.tip.ml.trim().length > 0);
    }
  }

  // Demo mode principal tour includes Ustadh Desk, Schedules Vault, and Parent Portal
  const demoSteps = getTourSteps('principal_demo');
  assert.ok(demoSteps.some((s) => s.view === 'teacher'));
  assert.ok(demoSteps.some((s) => s.view === 'schedules'));
  assert.ok(demoSteps.some((s) => s.view === 'parent'));
});

test('step navigation helpers clamp cleanly at boundaries', () => {
  assert.equal(getNextStepIndex(0, 9), 1);
  assert.equal(getNextStepIndex(8, 9), 8);
  assert.equal(getPrevStepIndex(0, 9), 0);
  assert.equal(getPrevStepIndex(4, 9), 3);
  assert.equal(getTourProgressPercent(0, 10), 10);
  assert.equal(getTourProgressPercent(9, 10), 100);
});

test('language toggle and UI strings switch accurately between Malayalam and English', () => {
  assert.equal(toggleTourLanguage('ml'), 'en');
  assert.equal(toggleTourLanguage('en'), 'ml');

  const mlStrings = getTourUiStrings('ml');
  const enStrings = getTourUiStrings('en');
  assert.equal(mlStrings.stepLabel(2, 9), 'ഘട്ടം 2 / 9');
  assert.equal(enStrings.stepLabel(2, 9), 'Step 2 of 9');
  assert.notEqual(mlStrings.next, enStrings.next);
  assert.notEqual(mlStrings.back, enStrings.back);
  assert.notEqual(mlStrings.skip, enStrings.skip);
});

test('clampSpotlightRect pads and constrains oversized sections within the viewport', () => {
  const clamped = clampSpotlightRect(
    { top: 100, left: 20, width: 1200, height: 1400 },
    1440,
    900,
    8
  );
  assert.ok(clamped.left >= 6);
  assert.ok(clamped.top >= 6);
  assert.ok(clamped.left + clamped.width <= 1440 - 6);
  assert.ok(clamped.height <= Math.round(900 * 0.62));
});

test('computeTourCardPosition places card below top elements and above bottom elements on desktop', () => {
  const below = computeTourCardPosition({
    targetRect: { top: 40, left: 300, width: 420, height: 60 },
    viewportWidth: 1440,
    viewportHeight: 900,
    cardWidth: 380,
    cardHeight: 290,
  });
  assert.equal(below.placement, 'bottom');
  assert.ok(below.top >= 100);
  assert.ok(below.left >= 14);
  assert.ok(below.left + below.width <= 1440 - 14);

  const above = computeTourCardPosition({
    targetRect: { top: 720, left: 300, width: 420, height: 110 },
    viewportWidth: 1440,
    viewportHeight: 900,
    cardWidth: 380,
    cardHeight: 280,
  });
  assert.equal(above.placement, 'top');
  assert.ok(above.top + 280 <= 720);
});

test('computeTourCardPosition keeps card strictly inside 390x844 mobile viewport', () => {
  const mobile = computeTourCardPosition({
    targetRect: { top: 80, left: 12, width: 366, height: 110 },
    viewportWidth: 390,
    viewportHeight: 844,
    cardWidth: 390,
    cardHeight: 310,
  });
  assert.ok(mobile.left >= 10);
  assert.ok(mobile.left + mobile.width <= 390 - 10);
  assert.ok(mobile.top >= 10);
  assert.ok(mobile.top + 310 <= 844 - 10);
});
