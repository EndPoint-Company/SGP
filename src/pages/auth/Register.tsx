import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from "../../layouts/AuthLayout";
import { RegisterForm } from '../../features/auth/components/RegisterForm';
import { authService } from '../../features/auth/services/authService'; // Importando o serviço
import signUpVector from '../../assets/img.jpg';
import { AlertTriangle } from 'lucide-react';

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
};

export default function Register() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // A View delega toda a complexidade para o serviço
      await authService.registerStudent(data);
      
      console.log('Aluno registrado com sucesso.');
      navigate('/login'); 
    } catch (err) {
      // Exibe apenas a mensagem de erro processada pelo serviço
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro inesperado.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      imageUrl={signUpVector}
      imageAlt="Ilustração de cadastro"
      imagePosition="left"
    >
      {error && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-red-100 text-red-800 p-4 rounded-lg shadow-lg z-10">
          <AlertTriangle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <h2 className="text-3xl font-bold text-gray-900">Cadastre-se</h2>
      <RegisterForm onSubmit={handleRegisterSubmit} isLoading={isLoading} />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">ou</span>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-gray-600">
        Já possui uma conta?{' '}
        <Link to="/login" className="font-medium text-blue-600 hover:underline">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  );
}