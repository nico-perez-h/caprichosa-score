import { createContext, ReactNode, useContext, useState } from 'react';

export type Prediction = {
  matchId: string;
  homeScore: number;
  awayScore: number;
};

type PredictionsByMatch = Record<string, Prediction>;

type PredictionsContextValue = {
  predictions: PredictionsByMatch;
  getPrediction: (matchId: string) => Prediction | null;
  savePrediction: (prediction: Prediction) => void;
};

const PredictionsContext = createContext<PredictionsContextValue | undefined>(
  undefined
);

type PredictionsProviderProps = {
  children: ReactNode;
};

export function PredictionsProvider({ children }: PredictionsProviderProps) {
  const [predictions, setPredictions] = useState<PredictionsByMatch>({});

  function getPrediction(matchId: string) {
    return predictions[matchId] ?? null;
  }

  function savePrediction(prediction: Prediction) {
    setPredictions((currentPredictions) => ({
      ...currentPredictions,
      [prediction.matchId]: prediction,
    }));
  }

  return (
    <PredictionsContext.Provider
      value={{
        predictions,
        getPrediction,
        savePrediction,
      }}
    >
      {children}
    </PredictionsContext.Provider>
  );
}

export function usePredictions() {
  const context = useContext(PredictionsContext);

  if (!context) {
    throw new Error('usePredictions debe usarse dentro de PredictionsProvider');
  }

  return context;
}