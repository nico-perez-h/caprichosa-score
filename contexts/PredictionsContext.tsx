import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

const PREDICTIONS_STORAGE_KEY = 'caprichosa-score-predictions';

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
  deletePrediction: (matchId: string) => void;
};

const PredictionsContext = createContext<PredictionsContextValue | undefined>(
  undefined
);

type PredictionsProviderProps = {
  children: ReactNode;
};

export function PredictionsProvider({ children }: PredictionsProviderProps) {
  const [predictions, setPredictions] = useState<PredictionsByMatch>({});

  useEffect(() => {
    async function loadPredictions() {
      try {
        const storedPredictions = await AsyncStorage.getItem(
          PREDICTIONS_STORAGE_KEY
        );

        if (storedPredictions) {
          const parsedPredictions = JSON.parse(
            storedPredictions
          ) as PredictionsByMatch;

          setPredictions(parsedPredictions);
        }
      } catch {
        setPredictions({});
      }
    }

    loadPredictions();
  }, []);

  function persistPredictions(updatedPredictions: PredictionsByMatch) {
    AsyncStorage.setItem(
      PREDICTIONS_STORAGE_KEY,
      JSON.stringify(updatedPredictions)
    ).catch(() => {});
  }

  function getPrediction(matchId: string) {
    return predictions[matchId] ?? null;
  }

  function savePrediction(prediction: Prediction) {
    setPredictions((currentPredictions) => {
      const updatedPredictions = {
        ...currentPredictions,
        [prediction.matchId]: prediction,
      };

      persistPredictions(updatedPredictions);

      return updatedPredictions;
    });
  }

  function deletePrediction(matchId: string) {
    setPredictions((currentPredictions) => {
      const updatedPredictions = {
        ...currentPredictions,
      };

      delete updatedPredictions[matchId];

      persistPredictions(updatedPredictions);

      return updatedPredictions;
    });
  }

  return (
    <PredictionsContext.Provider
      value={{
        predictions,
        getPrediction,
        savePrediction,
        deletePrediction,
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