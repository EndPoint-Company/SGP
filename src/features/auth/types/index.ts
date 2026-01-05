// src/features/auth/types/index.ts

export type LoginFormInputs = {
  email: string;
  password: string;
};

export type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
};