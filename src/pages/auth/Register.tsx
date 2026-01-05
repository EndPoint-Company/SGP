import React from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { RegisterForm } from "../../features/auth/components/RegisterForm";
import { useRegisterForm } from "../../features/auth/hooks/useRegisterForm";

export default function Register() {
  const { handleRegister, error, isLoading } = useRegisterForm();

  return (
    <AuthLayout
      title="Criar nova conta"
      subtitle={
        <>
          Já possui uma conta?{" "}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Faça login aqui
          </Link>
        </>
      }
    >
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
    </AuthLayout>
  );
}