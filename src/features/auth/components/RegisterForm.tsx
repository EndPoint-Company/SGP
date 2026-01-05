import React from "react";
import { useForm } from "react-hook-form";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { User, Mail, Lock } from "lucide-react";
import type { RegisterFormData } from "../types";

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => void;
  isLoading: boolean;
}

export function RegisterForm({ onSubmit, isLoading }: RegisterFormProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>();
  const password = watch("password");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
      <div className="space-y-1">
        <Input
          icon={<User className="h-5 w-5 text-gray-400" />}
          placeholder="Nome completo"
          {...register("name", { required: "Nome é obrigatório" })}
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <Input
          icon={<Mail className="h-5 w-5 text-gray-400" />}
          type="email"
          placeholder="Email institucional"
          {...register("email", { 
            required: "Email é obrigatório",
            pattern: { value: /^\S+@\S+$/i, message: "Email inválido" }
          })}
        />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-1">
        <Input
          icon={<Lock className="h-5 w-5 text-gray-400" />}
          type="password"
          placeholder="Senha"
          {...register("password", { 
            required: "Senha é obrigatória",
            minLength: { value: 6, message: "Mínimo 6 caracteres" }
          })}
        />
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>

      <div className="space-y-1">
        <Input
          icon={<Lock className="h-5 w-5 text-gray-400" />}
          type="password"
          placeholder="Confirmar senha"
          {...register("confirmPassword", { 
            validate: value => value === password || "As senhas não coincidem"
          })}
        />
        {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full py-3">
        {isLoading ? "Aguarde..." : "Cadastrar"}
      </Button>
    </form>
  );
}