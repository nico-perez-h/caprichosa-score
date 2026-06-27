import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { getOrCreateProfile, updateProfileName } from '../services/profileService';
import { useAuth } from './AuthContext';

const USER_PROFILE_STORAGE_KEY = '@caprichosa_score_user_profile';
const DEFAULT_PLAYER_NAME = 'Jugador local';

type UserProfileContextValue = {
  playerName: string;
  isLoadingProfile: boolean;
  savePlayerName: (name: string) => Promise<void>;
  resetPlayerName: () => Promise<void>;
};

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { user, isLoadingSession } = useAuth();

  const [playerName, setPlayerName] = useState(DEFAULT_PLAYER_NAME);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (isLoadingSession) {
        return;
      }

      setIsLoadingProfile(true);

      try {
        if (user) {
          const profile = await getOrCreateProfile({
            userId: user.id,
            email: user.email ?? null,
          });

          setPlayerName(profile.player_name);
          return;
        }

        const storedName = await AsyncStorage.getItem(USER_PROFILE_STORAGE_KEY);

        setPlayerName(storedName ?? DEFAULT_PLAYER_NAME);
      } catch (error) {
        console.log('Error cargando perfil:', error);
        setPlayerName(DEFAULT_PLAYER_NAME);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    loadProfile();
  }, [user, isLoadingSession]);

  async function savePlayerName(name: string) {
    const cleanName = name.trim() || DEFAULT_PLAYER_NAME;

    setPlayerName(cleanName);

    if (user) {
      await updateProfileName({
        userId: user.id,
        playerName: cleanName,
      });

      return;
    }

    await AsyncStorage.setItem(USER_PROFILE_STORAGE_KEY, cleanName);
  }

  async function resetPlayerName() {
    setPlayerName(DEFAULT_PLAYER_NAME);

    if (user) {
      await updateProfileName({
        userId: user.id,
        playerName: DEFAULT_PLAYER_NAME,
      });

      return;
    }

    await AsyncStorage.removeItem(USER_PROFILE_STORAGE_KEY);
  }

  const value: UserProfileContextValue = {
    playerName,
    isLoadingProfile,
    savePlayerName,
    resetPlayerName,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);

  if (!context) {
    throw new Error(
      'useUserProfile debe usarse dentro de UserProfileProvider'
    );
  }

  return context;
}