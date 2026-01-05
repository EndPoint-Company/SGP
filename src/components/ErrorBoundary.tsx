import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
          <h1 className="text-2xl font-bold mb-2">Ops! Algo correu mal.</h1>
          <p className="text-gray-600 mb-6">Ocorreu um erro inesperado na aplicação.</p>
          <Button onClick={() => window.location.reload()}>Recarregar Página</Button>
        </div>
      );
    }
    return this.props.children;
  }
}