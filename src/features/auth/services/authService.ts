import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../../services/firebase";
import type { UserRole } from "../contexts/AuthContextDefinition";

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

// Interface auxiliar para tipar o erro do Firebase minimamente
interface FirebaseError {
  code?: string;
  message?: string;
}

export const authService = {
  async registerStudent(data: RegisterDTO): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: data.name });

      const alunoRef = doc(db, "Alunos", user.uid);
      
      await setDoc(alunoRef, {
        id: user.uid,
        nome: data.name,
        email: data.email,
        role: "student" as UserRole,
        createdAt: new Date().toISOString(),
        avatarUrl: ""
      });

    } catch (error: unknown) { // CORRIGIDO: Usando unknown em vez de any
      // Fazemos o cast seguro verificando se é um objeto
      const firebaseError = error as FirebaseError;
      
      if (firebaseError.code === 'auth/email-already-in-use') {
        throw new Error('Este e-mail já está cadastrado.');
      }
      if (firebaseError.code === 'auth/weak-password') {
        throw new Error('A senha deve ter pelo menos 6 caracteres.');
      }
      
      console.error("Erro detalhado:", error);
      throw new Error('Falha ao criar conta. Tente novamente.');
    }
  }
};