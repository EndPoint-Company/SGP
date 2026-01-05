import React from "react";
import { Loader2 } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50"
      role="alert" 
      aria-busy="true"
      aria-label="A carregar conteúdo"
    >
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <p className="text-sm font-medium text-gray-600 animate-pulse">
        A carregar o sistema...
      </p>
    </div>
  );
}