import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: number;
  username: string;
  role: string;
  created_at: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const TOKEN_KEY = '@auth_token';
const USER_KEY = '@user_data';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      const storedUser = await AsyncStorage.getItem(USER_KEY);
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Trata diferentes formatos de erro
        let errorMessage = 'Erro no login';
        
        if (errorData.message) {
          // Formato simples: { message: "..." }
          errorMessage = errorData.message;
        } else if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          // Formato com array: { errors: [{ msg: "..." }, ...] }
          errorMessage = errorData.errors.map((error: any) => error.msg || error.message).join('. ');
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      await AsyncStorage.setItem(TOKEN_KEY, data.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);
      
      router.replace('/dashboard');
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Trata diferentes formatos de erro
        let errorMessage = 'Erro no cadastro';
        
        if (errorData.message) {
          // Formato simples: { message: "..." }
          errorMessage = errorData.message;
        } else if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          // Formato com array: { errors: [{ msg: "..." }, ...] }
          errorMessage = errorData.errors.map((error: any) => error.msg || error.message).join('. ');
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      await AsyncStorage.setItem(TOKEN_KEY, data.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);
      
      router.replace('/dashboard');
    } catch (error) {
      console.error('Erro no cadastro:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
      
      setToken(null);
      setUser(null);
      
      router.replace('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 