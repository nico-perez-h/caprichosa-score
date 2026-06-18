import type { Prediction } from '../contexts/PredictionsContext';
import type { Match } from '../types/match';

type MatchOutcome = 'home' | 'away' | 'draw';

function getOutcome(homeScore: number, awayScore: number): MatchOutcome {
  if (homeScore > awayScore) {
    return 'home';
  }

  if (awayScore > homeScore) {
    return 'away';
  }

  return 'draw';
}

export function calculatePredictionPoints(
  match: Match,
  prediction: Prediction | null
) {
  if (
    !prediction ||
    match.actualHomeScore === undefined ||
    match.actualAwayScore === undefined
  ) {
    return null;
  }

  const exactScore =
    prediction.homeScore === match.actualHomeScore &&
    prediction.awayScore === match.actualAwayScore;

  if (exactScore) {
    return 3;
  }

  const predictionOutcome = getOutcome(
    prediction.homeScore,
    prediction.awayScore
  );

  const actualOutcome = getOutcome(match.actualHomeScore, match.actualAwayScore);

  if (predictionOutcome === actualOutcome) {
    return 1;
  }

  return 0;
}

export function calculateTotalPredictionPoints(
  matches: Match[],
  predictions: Record<string, Prediction>
) {
  return matches.reduce((totalPoints, match) => {
    const prediction = predictions[match.id] ?? null;
    const points = calculatePredictionPoints(match, prediction);

    return totalPoints + (points ?? 0);
  }, 0);
}