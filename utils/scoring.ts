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

function getGoalDifference(homeScore: number, awayScore: number) {
  return homeScore - awayScore;
}

export function calculatePredictionPoints(
  match: Match,
  prediction: Prediction | null
) {
  if (!prediction) {
    return null;
  }

  if (match.status !== 'Finalizado') {
    return null;
  }

  if (
    match.actualHomeScore === undefined ||
    match.actualAwayScore === undefined
  ) {
    return null;
  }

  const predictedHomeScore = prediction.homeScore;
  const predictedAwayScore = prediction.awayScore;
  const actualHomeScore = match.actualHomeScore;
  const actualAwayScore = match.actualAwayScore;

  const isExactScore =
    predictedHomeScore === actualHomeScore &&
    predictedAwayScore === actualAwayScore;

  if (isExactScore) {
    return 9;
  }

  const predictionOutcome = getOutcome(predictedHomeScore, predictedAwayScore);
  const actualOutcome = getOutcome(actualHomeScore, actualAwayScore);

  const hasCorrectOutcome = predictionOutcome === actualOutcome;

  if (!hasCorrectOutcome) {
    return 0;
  }

  const predictionGoalDifference = getGoalDifference(
    predictedHomeScore,
    predictedAwayScore
  );

  const actualGoalDifference = getGoalDifference(
    actualHomeScore,
    actualAwayScore
  );

  const hasCorrectGoalDifference =
    predictionGoalDifference === actualGoalDifference;

  if (hasCorrectGoalDifference) {
    return 4;
  }

  return 3;
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