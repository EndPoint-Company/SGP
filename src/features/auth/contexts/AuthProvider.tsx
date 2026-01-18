import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { auth } from '../../../services/firebase';
import { AuthContext } from '../contexts/AuthContextDefinition';
import type { AuthContextType, UserRole } from '../contexts/AuthContextDefinition';
// Importamos o serviço em vez de acessar o banco diretamente
import { userService } from '../../../services/userService';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  // A lógica complexa foi movida para o Service
  const checkUserRole = async (uid: string): Promise<UserRole> => {
    return await userService.getUserRole(uid);
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Chama o serviço para descobrir o papel
      const userRole = await checkUserRole(firebaseUser.uid);
      
      setUser(firebaseUser);
      setRole(userRole);
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setRole(null);
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRole = await checkUserRole(firebaseUser.uid);
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

  const value = { 
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