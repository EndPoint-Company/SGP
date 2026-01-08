import React from 'react';

type ImageColumnProps = {
  imageUrl: string;
  imageAlt: string;
};

function ImageColumn({ imageUrl, imageAlt }: ImageColumnProps) {
  return (
    <div className="hidden lg:flex flex-col justify-center w-3/5 p-4">
      <h1 className="text-2xl font-bold text-gray-800 px-8">
        Tecnologia a serviço do <span className="text-blue-600">cuidado</span>, da{' '}
        <span className="text-blue-600">organização</span> e do{' '}
        <span className="text-blue-600">bem-estar</span> universitário.
      </h1>
      <img src={imageUrl} alt={imageAlt} className="mt-5 w-full h-auto" />
    </div>
  );
}

type AuthLayoutProps = {
  children: React.ReactNode;
  title: string;
  subtitle: React.ReactNode;
  imageUrl: string;
  imageAlt: string;
  imagePosition?: 'left' | 'right';
};

export function AuthLayout({
  children,
  title,
  subtitle,
  imageUrl,
  imageAlt,
  imagePosition = 'left',
}: AuthLayoutProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex w-full max-w-6xl overflow-hidden gap-x-20">
        {imagePosition === 'left' && <ImageColumn imageUrl={imageUrl} imageAlt={imageAlt} />}
        
        <div className="w-full lg:w-2/5 p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            <div className="mt-2 text-sm text-gray-600">{subtitle}</div>
          </div>
          {children}
        </div>

        {imagePosition === 'right' && <ImageColumn imageUrl={imageUrl} imageAlt={imageAlt} />}
      </div>
    </div>
  );
}

export default AuthLayout; // Adicionado export default para as páginas