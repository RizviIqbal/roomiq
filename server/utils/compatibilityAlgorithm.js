/**
 * Weighted Compatibility Scoring Algorithm
 *
 * Each trait has a weight based on how much it typically impacts cohabitation.
 * Source of weights: informed by roommate conflict research patterns.
 *
 * Score range: 0 - 100
 */

const WEIGHTS = {
  sleepSchedule:    25,   // Highest — mismatched sleep = daily friction
  cleanlinessLevel: 20,   // High — major source of conflict
  noiseTolerance:   15,   // High — directly linked to sleep/study
  guestPolicy:      15,   // Medium-high — privacy and comfort
  smokingPolicy:    10,   // Hard constraint for many people
  petPolicy:        8,    // Hard constraint for allergies
  studyHabits:      5,    // Lower — more flexible
  foodSharing:      2     // Lowest — easily negotiated
};

const scoreSleeepSchedule = (a, b) => {
  if (a === b) return 1;
  if (a === "flexible" || b === "flexible") return 0.6;
  // early_bird vs night_owl = worst mismatch
  return 0;
};

const scoreCleanliness = (a, b) => {
  const diff = Math.abs(a - b);
  if (diff === 0) return 1;
  if (diff === 1) return 0.75;
  if (diff === 2) return 0.4;
  return 0;
};

const scoreNoiseTolerance = (a, b) => {
  const levels = { silent: 0, low: 1, moderate: 2, high: 3 };
  const diff = Math.abs(levels[a] - levels[b]);
  if (diff === 0) return 1;
  if (diff === 1) return 0.7;
  if (diff === 2) return 0.3;
  return 0;
};

const scoreGuestPolicy = (a, b) => {
  const levels = { never: 0, rarely: 1, sometimes: 2, often: 3 };
  const diff = Math.abs(levels[a] - levels[b]);
  if (diff === 0) return 1;
  if (diff === 1) return 0.7;
  if (diff === 2) return 0.3;
  return 0;
};

const scoreSmokingPolicy = (a, b) => {
  if (a === b) return 1;
  if (a === "no_smoking" || b === "no_smoking") return 0; // Hard constraint
  return 0.5;
};

const scorePetPolicy = (a, b) => {
  if (a === b) return 1;
  if (a === "no_pets" || b === "no_pets") return 0; // Hard constraint
  return 0.7;
};

const scoreStudyHabits = (a, b) => {
  if (a === b) return 1;
  if (a === "mixed" || b === "mixed") return 0.7;
  return 0.4;
};

const scoreFoodSharing = (a, b) => {
  return a === b ? 1 : 0.3;
};

/**
 * Calculate compatibility score between two users
 * @param {Object} profileA - compatibilityProfile of user A
 * @param {Object} profileB - compatibilityProfile of user B
 * @returns {Object} { score: Number (0-100), breakdown: Object }
 */
const calculateCompatibility = (profileA, profileB) => {

  const breakdown = {
    sleepSchedule:    scoreSleeepSchedule(profileA.sleepSchedule,    profileB.sleepSchedule),
    cleanlinessLevel: scoreCleanliness(profileA.cleanlinessLevel,    profileB.cleanlinessLevel),
    noiseTolerance:   scoreNoiseTolerance(profileA.noiseTolerance,   profileB.noiseTolerance),
    guestPolicy:      scoreGuestPolicy(profileA.guestPolicy,         profileB.guestPolicy),
    smokingPolicy:    scoreSmokingPolicy(profileA.smokingPolicy,     profileB.smokingPolicy),
    petPolicy:        scorePetPolicy(profileA.petPolicy,             profileB.petPolicy),
    studyHabits:      scoreStudyHabits(profileA.studyHabits,         profileB.studyHabits),
    foodSharing:      scoreFoodSharing(profileA.foodSharing,         profileB.foodSharing)
  };

  let totalScore = 0;
  let totalWeight = 0;

  for (const [trait, rawScore] of Object.entries(breakdown)) {
    const weight = WEIGHTS[trait];
    totalScore  += rawScore * weight;
    totalWeight += weight;
  }

  const finalScore = Math.round((totalScore / totalWeight) * 100);

  return {
    score: finalScore,
    breakdown,
    label: finalScore >= 80 ? "Excellent Match"
         : finalScore >= 60 ? "Good Match"
         : finalScore >= 40 ? "Moderate Match"
         : "Poor Match"
  };
};

module.exports = { calculateCompatibility };
