// src/features/auth/contexts/AuthProvider.tsx
import React, { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../../services/firebase';
import { userService } from '../../../services/userService';
import { AuthContext } from './AuthContextDefinition';
import type { AuthContextType, UserRole } from './AuthContextDefinition';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Implementação da função checkUserRole exigida pela interface.
   * Ela delega a lógica para o userService.
   */
  const checkUserRole = useCallback(async (uid: string): Promise<UserRole> => {
    return await userService.getUserRole(uid);
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      const userRole = await userService.getUserRole(firebaseUser.uid);
      setUser(firebaseUser);
      setRole(userRole);
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        const userRole = await userService.getUserRole(firebaseUser.uid);
        setUser(firebaseUser);
        setRole(userRole);
      } else {
        setUser(null);
        setRole(null);
      }
      setIsLoading(false);
    });
    
    return unsubscribe;
  }, []);

  // Adicionado 'checkUserRole' ao objeto value para satisfazer a interface AuthContextType
  const value: AuthContextType = { 
    user, 
    role,
    isLoading,
    checkUserRole, 
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}