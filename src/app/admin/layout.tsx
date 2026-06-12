"use client";

import { useEffect } from "react";
import {
  Calendar,
  CheckSquare,
  FileText,
  LayoutDashboard,
  LogOut,
  PlugZap,
  SlidersHorizontal,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";

import { supabase } from "@/lib/supabase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        window.location.replace("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0b] text-white lg:flex-row">
      <aside className="flex border-b border-white/5 bg-[#0a0a0b] lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 p-4 lg:p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-500 to-blue-500 shadow-lg shadow-purple-500/20">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="hidden text-xl font-bold tracking-tight sm:inline">Fantasia</span>
        </div>

        <nav className="flex flex-1 items-center gap-2 overflow-x-auto px-2 py-3 lg:mt-4 lg:block lg:space-y-2 lg:px-4 lg:py-0">
          <NavLink href="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavLink href="/admin/events" icon={<Calendar size={20} />} label="Eventos" />
          <NavLink href="/admin/integrations" icon={<PlugZap size={20} />} label="Integraciones" />
          <div className="hidden px-2 pb-2 pt-4 text-xs font-semibold uppercase tracking-wider text-gray-500 lg:block">
            Catalogos
          </div>
          <NavLink href="/admin/staff" icon={<Users size={20} />} label="Personal / Staff" />
          <NavLink href="/admin/tasks" icon={<CheckSquare size={20} />} label="Tareas Maestras" />
          <NavLink href="/admin/questionnaire-rules" icon={<SlidersHorizontal size={20} />} label="Reglas Cuestionario" />
          <NavLink href="/admin/guidelines-notices" icon={<FileText size={20} />} label="Lineamientos y Avisos" />
        </nav>

        <div className="hidden border-t border-white/5 p-4 lg:block">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-gray-400 transition-all hover:bg-red-500/5 hover:text-red-400"
          >
            <LogOut size={20} />
            <span className="font-medium">Cerrar Sesion</span>
          </button>
        </div>
      </aside>

      <main className="flex flex-1 flex-col">
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/5 bg-[#0a0a0b]/70 px-4 backdrop-blur-md sm:px-8">
          <div className="text-sm text-gray-400">Panel de Administracion</div>
          <div className="flex items-center gap-4">
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/login";
              }}
              className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs font-medium text-gray-300 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-200 lg:hidden"
            >
              <LogOut size={16} />
              Salir
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/20 text-xs font-bold text-purple-400">
              AD
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

function NavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-gray-400 transition-all hover:bg-white/5 hover:text-white lg:px-4"
      title={label}
    >
      <span className="text-purple-500/80 transition-transform group-hover:scale-110">
        {icon}
      </span>
      <span className="hidden font-medium sm:inline">{label}</span>
    </Link>
  );
}
