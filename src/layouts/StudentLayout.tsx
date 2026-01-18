import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  Calendar,
  Menu,
  LogOut,
  User as UserIcon
} from "lucide-react";
import { useAuth } from "../features/auth/hooks/useAuth";
import { useUserData } from "../contexts/UserDataProvider";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // 1. Hook de Autenticação e Dados
  const { user, logout } = useAuth();
  const { findAlunoById } = useUserData();

  // 2. Busca dados reais do perfil
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

  return (
    <div className="flex h-screen bg-white">
      <aside
        className={`bg-white flex flex-col border-r border-gray-200 transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="px-4 pt-4 pb-2 flex flex-col gap-3">
          {collapsed ? (
            <>
              <div className="flex justify-center">
                <button
                  onClick={() => setCollapsed(false)}
                  className="text-gray-500 hover:text-gray-800"
                >
                  <Menu size={20} />
                </button>
              </div>
              <div className="flex justify-center mt-2">
                {/* Avatar Dinâmico (Colapsado) */}
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <UserIcon size={20} />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Avatar Dinâmico (Expandido) */}
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <UserIcon size={20} />
                  </div>
                )}
                <div className="leading-tight overflow-hidden">
                  <h2 className="font-semibold text-sm truncate max-w-[120px]" title={displayName}>
                    {displayName}
                  </h2>
                  <p className="text-xs text-gray-500">Paciente</p>
                </div>
              </div>
              <button
                onClick={() => setCollapsed(true)}
                className="text-gray-500 hover:text-gray-800"
              >
                <Menu size={20} />
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <nav className="flex flex-col gap-1">
            {navItems.map(({ label, icon: Icon, to }) => {
              const active = isActive(to);
              return (
                <Link
                  key={label}
                  to={to}
                  className={`flex items-center px-3 py-2.5 rounded-md text-sm transition-all ${
                    active
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } ${collapsed ? "justify-center" : "gap-3"}`}
                >
                  <Icon
                    size={18}
                    className={active ? "text-blue-600" : "text-gray-500"}
                  />
                  {!collapsed && <span className="truncate">{label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-4 py-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`flex items-center px-3 py-2.5 rounded-md text-sm transition-all cursor-pointer w-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <LogOut size={18} className="text-gray-500" />
            {!collapsed && "Sair"}
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-gray-50 p-8 overflow-y-auto rounded-tl-2xl">
        {children}
      </main>
    </div>
  );
}