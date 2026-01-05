import React from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { LoginForm } from "../../features/auth/components/LoginForm";
import { useLoginForm } from "../../features/auth/hooks/useLoginForm";

export default function Login() {
  const { handleLogin, error, isSubmitting } = useLoginForm();

  return (
    <AuthLayout
      title="Entrar na sua conta"
      subtitle={
        <>
          Ou{" "}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            crie uma nova conta gratuitamente
          </Link>
        </>
      }
    >
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <LoginForm onSubmit={handleLogin} isLoading={isSubmitting} />
    </AuthLayout>
  );
}