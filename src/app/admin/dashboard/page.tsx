"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckSquare, Loader2, Sparkles, Users } from "lucide-react";

type DashboardStats = {
  upcomingEvents: number;
  activeStaff: number;
  masterTasks: number;
  pendingTasks: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      const response = await fetch("/api/admin/dashboard");
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "No se pudo cargar el resumen.");
        return;
      }

      setStats(payload);
    }

    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bienvenida, Duena</h1>
        <p className="mt-2 text-gray-400">Aqui tienes un resumen de la logistica de hoy.</p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Calendar className="text-blue-400" />}
          label="Eventos Proximos"
          value={stats ? String(stats.upcomingEvents) : "..."}
          trend="Desde hoy en adelante"
        />
        <StatCard
          icon={<Users className="text-purple-400" />}
          label="Staff Activo"
          value={stats ? String(stats.activeStaff) : "..."}
          trend="Disponibles para asignar"
        />
        <StatCard
          icon={<CheckSquare className="text-green-400" />}
          label="Tareas Master"
          value={stats ? String(stats.masterTasks) : "..."}
          trend="Listas para inyectar"
        />
        <StatCard
          icon={<Sparkles className="text-yellow-400" />}
          label="Backlog Pendiente"
          value={stats ? String(stats.pendingTasks) : "..."}
          trend="Tareas de eventos por cerrar"
        />
      </div>

      <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-white/10 bg-white/5 p-8">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
            {stats ? (
              <Sparkles className="text-gray-500" />
            ) : (
              <Loader2 className="animate-spin text-gray-500" />
            )}
          </div>
          <p className="font-medium italic text-gray-500">
            El orden es el lenguaje secreto de la diversion.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/[0.07]"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-[#0a0a0b] shadow-inner">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
      <div className="text-xs font-medium text-gray-400">{trend}</div>
    </motion.div>
  );
}
