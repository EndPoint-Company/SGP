import React from 'react';

// Define que o componente pode receber um 'icon' e todas as props de um input normal
export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', icon, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          // Posiciona o ícone à esquerda dentro do container
          <span className="absolute left-3 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          // Adiciona padding à esquerda no input somente se houver um ícone
          aria-invalid={props['aria-invalid'] || !!icon}
          className={`w-full border border-gray-300 rounded-md py-2 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${icon ? 'pl-10 pr-3' : 'px-3'} ${className}`}
          // ESSENCIAL: Repassa todas as outras props (value, onChange, etc.)
          // para o input, o que corrige o problema da digitação.
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';