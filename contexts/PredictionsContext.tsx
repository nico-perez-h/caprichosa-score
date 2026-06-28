import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import {
  deleteUserPrediction,
  getUserPredictions,
  upsertUserPrediction,
} from '@/services/predictionsService';
import { useAuth } from './AuthContext';

const PREDICTIONS_STORAGE_KEY = 'caprichosa-score-predictions';

export type Prediction = {
  matchId: string;
  homeScore: number;
  awayScore: number;
};

type PredictionsByMatch = Record<string, Prediction>;

type PredictionsContextValue = {
  predictions: PredictionsByMatch;
  isLoadingPredictions: boolean;
  getPrediction: (matchId: string) => Prediction | null;
  savePrediction: (prediction: Prediction) => Promise<void>;
  deletePrediction: (matchId: string) => Promise<void>;
  clearPredictions: () => Promise<void>;
};

const PredictionsContext = createContext<PredictionsContextValue | undefined>(
  undefined
);

type PredictionsProviderProps = {
  children: ReactNode;
};

function mapPredictionsListToRecord(predictionsList: Prediction[]) {
  return predictionsList.reduce<PredictionsByMatch>((accumulator, prediction) => {
    accumulator[prediction.matchId] = prediction;

    return accumulator;
  }, {});
}

export function PredictionsProvider({ children }: PredictionsProviderProps) {
  const { user, isLoadingSession } = useAuth();

  const [predictions, setPredictions] = useState<PredictionsByMatch>({});
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(true);

  useEffect(() => {
    async function loadPredictions() {
      if (isLoadingSession) {
        return;
      }

      setIsLoadingPredictions(true);

      try {
        if (user) {
          const userPredictions = await getUserPredictions(user.id);

          const mappedPredictions = userPredictions.map((prediction) => ({
            matchId: prediction.match_id,
            homeScore: prediction.home_score,
            awayScore: prediction.away_score,
          }));

          setPredictions(mapPredictionsListToRecord(mappedPredictions));
          return;
        }

        const storedPredictions = await AsyncStorage.getItem(
          PREDICTIONS_STORAGE_KEY
        );

        if (storedPredictions) {
          const parsedPredictions = JSON.parse(
            storedPredictions
          ) as PredictionsByMatch;

          setPredictions(parsedPredictions);
          return;
        }

        setPredictions({});
      } catch (error) {
        console.log('Error cargando predicciones:', error);
        setPredictions({});
      } finally {
        setIsLoadingPredictions(false);
      }
    }

    loadPredictions();
  }, [user, isLoadingSession]);

  function persistLocalPredictions(updatedPredictions: PredictionsByMatch) {
    AsyncStorage.setItem(
      PREDICTIONS_STORAGE_KEY,
      JSON.stringify(updatedPredictions)
    ).catch(() => {});
  }

  function getPrediction(matchId: string) {
    return predictions[matchId] ?? null;
  }

  async function savePrediction(prediction: Prediction) {
    setPredictions((currentPredictions) => {
      const updatedPredictions = {
        ...currentPredictions,
        [prediction.matchId]: prediction,
      };

      if (!user) {
        persistLocalPredictions(updatedPredictions);
      }

      return updatedPredictions;
    });

    if (user) {
      await upsertUserPrediction({
        userId: user.id,
        matchId: prediction.matchId,
        homeScore: prediction.homeScore,
        awayScore: prediction.awayScore,
      });
    }
  }

  async function deletePrediction(matchId: string) {
    setPredictions((currentPredictions) => {
      const updatedPredictions = {
        ...currentPredictions,
      };

      delete updatedPredictions[matchId];

      if (!user) {
        persistLocalPredictions(updatedPredictions);
      }

      return updatedPredictions;
    });

    if (user) {
      await deleteUserPrediction({
        userId: user.id,
        matchId,
      });
    }
  }

  async function clearPredictions() {
    setPredictions({});

    if (user) {
      const deletePromises = Object.keys(predictions).map((matchId) =>
        deleteUserPrediction({
          userId: user.id,
          matchId,
        })
      );

      await Promise.all(deletePromises);
      return;
    }

    await AsyncStorage.removeItem(PREDICTIONS_STORAGE_KEY);
  }

  return (
    <PredictionsContext.Provider
      value={{
        predictions,
        isLoadingPredictions,
        getPrediction,
        savePrediction,
        deletePrediction,
        clearPredictions,
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