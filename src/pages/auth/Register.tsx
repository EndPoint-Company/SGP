import React, { useState } from 'react';
// Supondo que você está a usar react-router-dom para navegação
import { Link, useNavigate } from 'react-router-dom'; 
// Importações do Firebase - certifique-se que os caminhos estão corretos
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore"; 
import { auth, db } from "../../services/firebase"; // Caminho para a sua configuração do Firebase

// Importações dos seus componentes de UI e assets
import { AuthLayout } from "../../layouts/AuthLayout";
import { RegisterForm } from '../../features/auth/components/RegisterForm';
import signUpVector from '../../assets/img.jpg'; // Verifique se este caminho está correto
import { AlertTriangle } from 'lucide-react'; // Ícone para o alerta

// Define a "forma" dos dados que o formulário irá enviar.
// Isto ajuda a evitar erros e melhora a autocompletação do código.
type RegisterFormData = {
  name: string;
  email: string;
  password: string;
};

// O componente principal da página de Registo
export default function Register() {
  // Estado para guardar a mensagem de erro a ser exibida na UI
  const [error, setError] = useState<string | null>(null);
  // Estado para controlar o feedback de loading (ex: desativar o botão durante o envio)
  const [isLoading, setIsLoading] = useState(false);
  // Hook do react-router-dom para navegar para outras páginas
  const navigate = useNavigate();

  // Função que é chamada quando o formulário de registo é submetido
  const handleRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true); // Inicia o estado de loading
    setError(null);     // Limpa erros anteriores

    try {
      // Passo 1: Criar o utilizador no Firebase Authentication com email e senha
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Passo 2: Atualizar o perfil do utilizador no Authentication para adicionar o nome
      await updateProfile(user, {
        displayName: data.name,
      });
      
      // Passo 3: Guardar os dados do utilizador na coleção "Alunos" no Firestore.
      const userDocRef = doc(db, "Alunos", user.uid); 
      await setDoc(userDocRef, {
        uid: user.uid,
        // CORREÇÃO: Alterado de 'name' para 'nome' para corresponder à sua estrutura de dados.
        nome: data.name,
        email: data.email,
        createdAt: new Date(),
      });
      
      console.log('Utilizador criado e dados guardados na coleção Alunos:', user.uid);
      
      // Após o sucesso, redireciona o utilizador para a página de login
      navigate('/login');

    } catch (err: unknown) {
      // Bloco para tratar os erros que podem ocorrer
      let errorMessage = 'Ocorreu um erro inesperado ao criar a conta.';
      
      // Verifica o tipo de erro retornado pelo Firebase para dar uma mensagem específica
      if (typeof err === 'object' && err !== null && 'code' in err) {
        const firebaseError = err as { code: string };
        if (firebaseError.code === 'auth/email-already-in-use') {
          errorMessage = 'Este endereço de email já está em uso por outra conta.';
        } else if (firebaseError.code === 'auth/weak-password') {
          errorMessage = 'A senha é muito fraca. Utilize pelo menos 6 caracteres.';
        } else if (firebaseError.code === 'auth/invalid-email') {
            errorMessage = 'O formato do email fornecido é inválido.';
        }
      }
      
      setError(errorMessage); // Define a mensagem de erro para ser exibida na UI
      console.error("Erro no registo:", err); // Exibe o erro completo na consola para depuração

    } finally {
      // Este bloco é executado sempre, quer haja sucesso ou erro.
      // Garante que o estado de loading é desativado.
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      imageUrl={signUpVector}
      imageAlt="Ilustração de uma pessoa a registar-se num site"
      imagePosition="left"
    >
      {/* Exibe o componente de alerta apenas se houver uma mensagem de erro no estado */}
      {error && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-red-100 text-red-800 p-4 rounded-lg shadow-lg z-10 animate-pulse">
          <AlertTriangle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <h2 className="text-3xl font-bold text-gray-900">Cadastre-se</h2>
      
      {/* Renderiza o componente do formulário, passando a função de submissão e o estado de loading */}
      <RegisterForm onSubmit={handleRegisterSubmit} isLoading={isLoading} />

      {/* Divisor "ou" */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">ou</span>
        </div>
      </div>

      {/* Link para a página de login */}
      <p className="mt-6 text-center text-sm text-gray-600">
        Já possui uma conta?{' '}
        <Link to="/login" className="font-medium text-blue-600 hover:underline">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  );
}
