const { calculateCompatibility } = require("../utils/compatibilityAlgorithm");

const baseProfile = {
  sleepSchedule:    "early_bird",
  cleanlinessLevel: 5,
  guestPolicy:      "rarely",
  noiseTolerance:   "low",
  smokingPolicy:    "no_smoking",
  petPolicy:        "no_pets",
  studyHabits:      "at_home",
  foodSharing:      false,
};

describe("calculateCompatibility", () => {

  test("identical profiles score 100", () => {
    const result = calculateCompatibility(baseProfile, { ...baseProfile });
    expect(result.score).toBe(100);
    expect(result.label).toBe("Excellent Match");
  });

  test("opposite sleep schedules reduce score significantly", () => {
    const a = { ...baseProfile, sleepSchedule: "early_bird" };
    const b = { ...baseProfile, sleepSchedule: "night_owl" };
    const result = calculateCompatibility(a, b);

    // Sleep schedule is 25% weight and scores 0 when opposite —
    // so max possible score is 75
    expect(result.score).toBeLessThanOrEqual(75);
    expect(result.score).toBeLessThan(100);
  });

  test("flexible sleep schedule scores partial credit (not 0) against either extreme", () => {
    const a = { ...baseProfile, sleepSchedule: "early_bird" };
    const b = { ...baseProfile, sleepSchedule: "flexible" };
    const result = calculateCompatibility(a, b);

    // flexible gives 0.6 partial credit on a 25%-weight trait,
    // so score should be high but not perfect
    expect(result.score).toBeGreaterThan(75);
    expect(result.score).toBeLessThan(100);
  });



  test("cleanliness difference of 1 gives partial credit, not zero", () => {
    const a = { ...baseProfile, cleanlinessLevel: 5 };
    const b = { ...baseProfile, cleanlinessLevel: 4 };
    const result = calculateCompatibility(a, b);

    expect(result.breakdown.cleanlinessLevel).toBe(0.75);
  });

  test("cleanliness difference of 4 (extremes) scores 0", () => {
    const a = { ...baseProfile, cleanlinessLevel: 5 };
    const b = { ...baseProfile, cleanlinessLevel: 1 };
    const result = calculateCompatibility(a, b);

    expect(result.breakdown.cleanlinessLevel).toBe(0);
  });

  test("score is symmetric — order of arguments does not matter", () => {
    const a = { ...baseProfile, sleepSchedule: "night_owl", cleanlinessLevel: 2 };
    const b = { ...baseProfile, sleepSchedule: "early_bird", cleanlinessLevel: 4 };

    const ab = calculateCompatibility(a, b);
    const ba = calculateCompatibility(b, a);

    expect(ab.score).toBe(ba.score);
  });

  test("label thresholds are correctly assigned", () => {
    expect(calculateCompatibility(baseProfile, baseProfile).label).toBe("Excellent Match");

    // Construct a profile that should land in "Poor Match" range but avoid hard blocks
    const opposite = {
      sleepSchedule:    "night_owl",
      cleanlinessLevel: 1,
      guestPolicy:      "often",
      noiseTolerance:   "high",
      smokingPolicy:    "no_smoking",
      petPolicy:        "no_pets",
      studyHabits:      "library",
      foodSharing:      true,
    };
    const result = calculateCompatibility(baseProfile, opposite);
    expect(result.score).toBeLessThan(40);
    expect(result.label).toBe("Poor Match");
  });

  test("returns a breakdown for every weighted trait", () => {
    const result = calculateCompatibility(baseProfile, baseProfile);
    const expectedTraits = [
      "sleepSchedule", "cleanlinessLevel", "noiseTolerance", "guestPolicy",
      "smokingPolicy", "petPolicy", "studyHabits", "foodSharing",
    ];
    expectedTraits.forEach(trait => {
      expect(result.breakdown).toHaveProperty(trait);
    });
  });
});
