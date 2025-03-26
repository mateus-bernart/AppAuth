import {StyleSheet, Text, View} from 'react-native';
import React, {
  createContext,
  use,
  useContext,
  useEffect,
  useState,
} from 'react';
import {storageGet, storageSet} from '../services/storage';
import Axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const axios = Axios.create({
  baseURL: 'http://172.16.1.131:8000/api',
  //interceptor -> token storage para enviar para api
});

type Session = {
  userId: number;
  userName: string;
  isLogged: boolean;
};

type AuthContextProps = {
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  startSession: (data: Session, token: string) => Promise<void>;
  endSession: () => void;
};

const AuthContext = createContext<AuthContextProps>({
  session: null,
  isLoading: true,
  isAuthenticated: true,
  startSession: () => Promise.resolve(),
  endSession: () => null,
});

const AuthProvider = ({children}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isAuthenticated = !!session;

  const startSession = async (data: Session, token: string): Promise<void> => {
    setIsLoading(true);
    try {
      await storageSet('AcessToken', token);
      await storageSet('UserData', JSON.stringify(data));

      setSession(data);
    } catch (error) {
      console.log('Error fetching userdata:', error);
      endSession();
    } finally {
      setIsLoading(false);
    }
  };

  const endSession = () => {
    setSession(null);
  };

  useEffect(() => {
    const loadSession = async () => {
      const token = await storageGet('AcessToken');
      const user = await storageGet('UserData');

      if (token && user) {
        await startSession(JSON.parse(user), token);
      }

      setIsLoading(false);
    };
    loadSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        isAuthenticated,
        startSession,
        endSession,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  //TODO: verificar se é undefined
  const context = useContext(AuthContext);
  return context;
};

export default AuthProvider;
