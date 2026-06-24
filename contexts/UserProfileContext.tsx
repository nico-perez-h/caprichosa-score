import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

const USER_PROFILE_STORAGE_KEY = 'caprichosa-score-user-profile';

type UserProfile = {
  playerName: string;
};

type UserProfileContextValue = {
  playerName: string;
  savePlayerName: (name: string) => void;
  resetPlayerName: () => void;
};

const defaultProfile: UserProfile = {
  playerName: 'Jugador local',
};

const UserProfileContext = createContext<UserProfileContextValue | undefined>(
  undefined
);

type UserProfileProviderProps = {
  children: ReactNode;
};

export function UserProfileProvider({ children }: UserProfileProviderProps) {
  const [playerName, setPlayerName] = useState(defaultProfile.playerName);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const storedProfile = await AsyncStorage.getItem(
          USER_PROFILE_STORAGE_KEY
        );

        if (!storedProfile) {
          return;
        }

        const parsedProfile = JSON.parse(storedProfile) as UserProfile;

        if (parsedProfile.playerName) {
          setPlayerName(parsedProfile.playerName);
        }
      } catch {
        setPlayerName(defaultProfile.playerName);
      }
    }

    loadUserProfile();
  }, []);

  function savePlayerName(name: string) {
    const cleanName = name.trim() || defaultProfile.playerName;

    setPlayerName(cleanName);

    AsyncStorage.setItem(
      USER_PROFILE_STORAGE_KEY,
      JSON.stringify({
        playerName: cleanName,
      })
    ).catch(() => {});
  }

  function resetPlayerName() {
    setPlayerName(defaultProfile.playerName);
    AsyncStorage.removeItem(USER_PROFILE_STORAGE_KEY).catch(() => {});
  }

  return (
    <UserProfileContext.Provider
      value={{
        playerName,
        savePlayerName,
        resetPlayerName,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);

  if (!context) {
    throw new Error('useUserProfile debe usarse dentro de UserProfileProvider');
  }

  return context;
}