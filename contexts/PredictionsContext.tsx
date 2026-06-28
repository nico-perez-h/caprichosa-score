import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { getCurrentGroup } from '@/services/groupsService';
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
  activeGroupId: string | null;
  getPrediction: (matchId: string) => Prediction | null;
  savePrediction: (prediction: Prediction) => Promise<void>;
  deletePrediction: (matchId: string) => Promise<void>;
  clearPredictions: () => Promise<void>;
  reloadPredictions: () => Promise<void>;
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
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(true);

  const loadPredictions = useCallback(async () => {
    if (isLoadingSession) {
      return;
    }

    setIsLoadingPredictions(true);

    try {
      if (user) {
        const currentGroup = await getCurrentGroup();

        if (!currentGroup) {
          setActiveGroupId(null);
          setPredictions({});
          return;
        }

        setActiveGroupId(currentGroup.id);

        const userPredictions = await getUserPredictions({
          userId: user.id,
          groupId: currentGroup.id,
        });

        const mappedPredictions = userPredictions.map((prediction) => ({
          matchId: prediction.match_id,
          homeScore: prediction.home_score,
          awayScore: prediction.away_score,
        }));

        setPredictions(mapPredictionsListToRecord(mappedPredictions));
        return;
      }

      setActiveGroupId(null);

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
      setActiveGroupId(null);
      setPredictions({});
    } finally {
      setIsLoadingPredictions(false);
    }
  }, [user, isLoadingSession]);

  useEffect(() => {
    loadPredictions();
  }, [loadPredictions]);

  function persistLocalPredictions(updatedPredictions: PredictionsByMatch) {
    AsyncStorage.setItem(
      PREDICTIONS_STORAGE_KEY,
      JSON.stringify(updatedPredictions)
    ).catch(() => {});
  }

  async function getCurrentActiveGroupId() {
    if (activeGroupId) {
      return activeGroupId;
    }

    const currentGroup = await getCurrentGroup();

    if (!currentGroup) {
      throw new Error('Debes seleccionar un grupo para guardar predicciones.');
    }

    setActiveGroupId(currentGroup.id);

    return currentGroup.id;
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
      const groupId = await getCurrentActiveGroupId();

      await upsertUserPrediction({
        userId: user.id,
        groupId,
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
      const groupId = await getCurrentActiveGroupId();

      await deleteUserPrediction({
        userId: user.id,
        groupId,
        matchId,
      });
    }
  }

  async function clearPredictions() {
    setPredictions({});

    if (user) {
      const groupId = await getCurrentActiveGroupId();

      const deletePromises = Object.keys(predictions).map((matchId) =>
        deleteUserPrediction({
          userId: user.id,
          groupId,
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
        activeGroupId,
        getPrediction,
        savePrediction,
        deletePrediction,
        clearPredictions,
        reloadPredictions: loadPredictions,
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