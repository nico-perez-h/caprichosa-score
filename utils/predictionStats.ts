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

export function calculatePredictionStats(
  matches: Match[],
  predictions: Record<string, Prediction>
) {
  let totalPoints = 0;
  let totalPredictions = 0;
  let pendingPredictions = 0;
  let finishedPredictions = 0;
  let exactHits = 0;
  let outcomeHits = 0;
  let failedPredictions = 0;

  matches.forEach((match) => {
    const prediction = predictions[match.id];

    if (!prediction) {
      return;
    }

    totalPredictions += 1;

    if (match.status !== 'Finalizado') {
      pendingPredictions += 1;
      return;
    }

    if (
      match.actualHomeScore === undefined ||
      match.actualAwayScore === undefined
    ) {
      pendingPredictions += 1;
      return;
    }

    const actualHomeScore = match.actualHomeScore;
    const actualAwayScore = match.actualAwayScore;

    finishedPredictions += 1;

    const isExactScore =
      prediction.homeScore === actualHomeScore &&
      prediction.awayScore === actualAwayScore;

    if (isExactScore) {
      exactHits += 1;
      totalPoints += 3;
      return;
    }

    const predictionOutcome = getOutcome(
      prediction.homeScore,
      prediction.awayScore
    );

    const actualOutcome = getOutcome(actualHomeScore, actualAwayScore);

    if (predictionOutcome === actualOutcome) {
      outcomeHits += 1;
      totalPoints += 1;
      return;
    }

    failedPredictions += 1;
  });

  const successfulPredictions = exactHits + outcomeHits;

  const accuracy =
    finishedPredictions > 0
      ? Math.round((successfulPredictions / finishedPredictions) * 100)
      : 0;

  return {
    totalPoints,
    totalPredictions,
    pendingPredictions,
    finishedPredictions,
    exactHits,
    outcomeHits,
    failedPredictions,
    accuracy,
  };
}