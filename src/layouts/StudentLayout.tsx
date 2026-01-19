import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  Calendar,
  Menu,
  LogOut,
  User as UserIcon,
  X 
} from "lucide-react";
import { useAuth } from "../features/auth/hooks/useAuth";
import { useUserData } from "../contexts/UserDataProvider";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const { user, logout } = useAuth();
  const { findAlunoById } = useUserData();

  const studentProfile = user ? findAlunoById(user.uid) : null;
  const displayName = studentProfile?.nome || user?.displayName || "Aluno";
  const avatarUrl = studentProfile?.avatarUrl;

  const navItems = [
    { label: "Início", icon: Home, to: "/student/home" },
    { label: "Atendimentos", icon: LayoutDashboard, to: "/student/appointments" },
    { label: "Agenda", icon: Calendar, to: "/student/schedule" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleNavClick = () => {
    setIsMobileOpen(false);
  };

  const UserAvatar = ({ size = "md" }: { size?: "sm" | "md" }) => {
    const sizeClasses = size === "md" ? "w-9 h-9" : "w-8 h-8";
    const iconSize = size === "md" ? 20 : 18;
    
    return avatarUrl ? (
      <img src={avatarUrl} alt="Avatar" className={`${sizeClasses} rounded-full object-cover border border-gray-200`} />
    ) : (
      <div className={`${sizeClasses} rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200`}>
        <UserIcon size={iconSize} />
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center px-4 z-40 justify-between">
        <button 
          onClick={() => setIsMobileOpen(true)} 
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md"
        >
          <Menu size={24} />
        </button>
        <span className="font-bold text-xl text-blue-600">SGP</span>
        <div>
          <UserAvatar size="sm" />
        </div> 
      </div>

      {/* BACKDROP */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[90] md:hidden animate-in fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          bg-white flex flex-col border-r border-gray-200 transition-all duration-300
          fixed inset-y-0 left-0 z-[100] h-full
          ${isMobileOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"}
          
          /* CORREÇÃO PRINCIPAL: */
          /* No Mobile (padrão): width é sempre w-64 */
          /* No Desktop (md): width alterna entre w-20 e w-64 */
          w-64 md:relative md:translate-x-0 md:shadow-none
          ${collapsed ? "md:w-20" : "md:w-64"}
        `}
      >
        <div className="px-4 pt-4 pb-2 flex flex-col gap-3">
          
          {/* CORREÇÃO DE LAYOUT:
            Em vez de usar condicional JS {collapsed ? ... : ...}, usamos CSS Classes.
            Isso garante que no Mobile, mesmo se collapsed=true, mostramos o layout expandido.
          */}

          {/* 1. Layout Expandido (Visível no Mobile OU Desktop Expandido) */}
          <div className={`items-center justify-between ${collapsed ? "flex md:hidden" : "flex"}`}>
              <div className="flex items-center gap-2">
                 <UserAvatar />
                 <div className="leading-tight overflow-hidden">
                    <h2 className="font-semibold text-sm truncate max-w-[120px]" title={displayName}>
                      {displayName}
                    </h2>
                    <p className="text-xs text-gray-500">Paciente</p>
                  </div>
              </div>

              {/* Botão Colapsar (Só Desktop) */}
              <button
                  onClick={() => setCollapsed(true)}
                  className="hidden md:block text-gray-500 hover:text-gray-800 p-1 rounded hover:bg-gray-100"
              >
                  <Menu size={20} />
              </button>

              {/* Botão Fechar (Só Mobile) */}
              <button
                  onClick={() => setIsMobileOpen(false)}
                  className="md:hidden text-gray-500 hover:text-gray-800 p-1 rounded hover:bg-gray-100"
              >
                  <X size={20} />
              </button>
          </div>

          {/* 2. Layout Colapsado (Visível APENAS no Desktop Colapsado) */}
          <div className={`flex-col items-center gap-4 mt-1 ${collapsed ? "hidden md:flex" : "hidden"}`}>
              <button
                  onClick={() => setCollapsed(false)}
                  className="text-gray-500 hover:text-gray-800 p-2 rounded hover:bg-gray-100"
              >
                  <Menu size={20} />
              </button>
              <UserAvatar />
          </div>

        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <nav className="flex flex-col gap-1">
            {navItems.map(({ label, icon: Icon, to }) => {
              const active = isActive(to);
              return (
                <Link
                  key={label}
                  to={to}
                  onClick={handleNavClick}
                  className={`flex items-center px-3 py-2.5 rounded-md text-sm transition-all gap-3 ${
                    active
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } ${collapsed ? "md:justify-center" : ""}`}
                >
                  <Icon
                    size={18}
                    className={active ? "text-blue-600" : "text-gray-500"}
                  />
                  {/* CORREÇÃO: Texto escondido via CSS no Desktop Colapsado, mas visível no Mobile */}
                  <span className={`truncate ${collapsed ? "md:hidden" : "block"}`}>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-4 py-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`flex items-center px-3 py-2.5 rounded-md text-sm transition-all cursor-pointer w-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 gap-3 ${
              collapsed ? "md:justify-center" : ""
            }`}
          >
            <LogOut size={18} className="text-gray-500" />
            <span className={`truncate ${collapsed ? "md:hidden" : "block"}`}>Sair</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-gray-50 p-4 md:p-8 overflow-y-auto pt-20 md:pt-8 w-full">
        {children}
      </main>
    </div>
  );
}