"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link,
  List,
  ListOrdered,
  Loader2,
  Save,
  Trash2,
  Underline,
} from "lucide-react";

import { AdminToast } from "@/components/admin/AdminToast";
import { sanitizeGuidelinesHtml } from "@/lib/guidelines-notices";

const emptyHtml = "";

type GuidelinesPayload = {
  html: string;
  hasContent: boolean;
  updated_at: string | null;
};

export default function GuidelinesNoticesPage() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(emptyHtml);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const adminFetch = useCallback(async (path: string, init?: RequestInit) => {
    const response = await fetch(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error ?? "Ocurrio un error.");
    }

    return payload;
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadGuidelines() {
      setLoading(true);
      setError(null);

      try {
        const payload = (await adminFetch("/api/admin/guidelines-notices")) as GuidelinesPayload;
        const safeHtml = sanitizeGuidelinesHtml(payload.html ?? "");

        if (!ignore) {
          setHtml(safeHtml);
          setUpdatedAt(payload.updated_at);

          if (editorRef.current) {
            editorRef.current.innerHTML = safeHtml;
          }
        }
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "No se pudieron cargar los lineamientos y avisos.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadGuidelines();

    return () => {
      ignore = true;
    };
  }, [adminFetch]);

  function syncEditorHtml() {
    setHtml(editorRef.current?.innerHTML ?? "");
  }

  function runCommand(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncEditorHtml();
  }

  function setHeading(level: "h2" | "h3" | "p") {
    runCommand("formatBlock", `<${level}>`);
  }

  function createLink() {
    const url = window.prompt("URL del enlace");

    if (!url) {
      return;
    }

    runCommand("createLink", url);
  }

  async function saveGuidelines() {
    setSaving(true);
    setError(null);

    try {
      const safeHtml = sanitizeGuidelinesHtml(editorRef.current?.innerHTML ?? html);
      const payload = (await adminFetch("/api/admin/guidelines-notices", {
        method: "PUT",
        body: JSON.stringify({ html: safeHtml }),
      })) as GuidelinesPayload;
      const savedHtml = sanitizeGuidelinesHtml(payload.html ?? "");

      setHtml(savedHtml);
      setUpdatedAt(payload.updated_at);

      if (editorRef.current) {
        editorRef.current.innerHTML = savedHtml;
      }

      setToastMessage(
        payload.hasContent
          ? "Lineamientos y avisos guardados."
          : "Lineamientos y avisos limpiados.",
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudieron guardar los lineamientos y avisos.",
      );
    } finally {
      setSaving(false);
    }
  }

  function clearGuidelines() {
    setHtml(emptyHtml);

    if (editorRef.current) {
      editorRef.current.innerHTML = emptyHtml;
      editorRef.current.focus();
    }
  }

  const lastSavedLabel = updatedAt
    ? new Date(updatedAt).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })
    : "Sin guardado previo";

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-300">Configuracion</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Lineamientos y Avisos</h1>
          <p className="mt-2 text-gray-400">
            Captura el contenido que se puede anexar al PDF operativo de tareas.
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-gray-300">
          {lastSavedLabel}
        </div>
      </header>

      <section className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
        <div className="flex flex-col gap-3 border-b border-white/10 bg-white/[0.04] p-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            <ToolbarButton label="Negritas" onClick={() => runCommand("bold")}>
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="Cursivas" onClick={() => runCommand("italic")}>
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="Subrayado" onClick={() => runCommand("underline")}>
              <Underline className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="Titulo" onClick={() => setHeading("h2")}>
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="Subtitulo" onClick={() => setHeading("h3")}>
              <Heading3 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="Parrafo" onClick={() => setHeading("p")}>
              P
            </ToolbarButton>
            <ToolbarButton label="Lista" onClick={() => runCommand("insertUnorderedList")}>
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="Lista numerada" onClick={() => runCommand("insertOrderedList")}>
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="Enlace" onClick={createLink}>
              <Link className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <div className="flex gap-2 sm:justify-end">
            <button
              type="button"
              onClick={clearGuidelines}
              disabled={loading || saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 px-3 text-sm font-semibold text-gray-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Limpiar
            </button>
            <button
              type="button"
              onClick={saveGuidelines}
              disabled={loading || saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar
            </button>
          </div>
        </div>

        {error ? (
          <div className="m-4 rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <div className="p-4">
          {loading ? (
            <div className="grid min-h-72 place-items-center rounded-md border border-white/10 bg-zinc-950">
              <Loader2 className="h-7 w-7 animate-spin text-cyan-300" />
            </div>
          ) : (
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onBlur={syncEditorHtml}
              className="guidelines-editor min-h-[420px] rounded-md border border-white/10 bg-zinc-950 px-4 py-4 text-white outline-none transition empty:before:text-gray-600 focus:border-cyan-300"
              data-placeholder="Escribe los lineamientos y avisos..."
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </div>
      </section>

      <style jsx>{`
        .guidelines-editor:empty::before {
          content: attr(data-placeholder);
        }

        .guidelines-editor :global(h2) {
          margin: 0.4rem 0 0.75rem;
          font-size: 1.35rem;
          font-weight: 700;
          line-height: 1.25;
        }

        .guidelines-editor :global(h3) {
          margin: 0.4rem 0 0.6rem;
          font-size: 1.1rem;
          font-weight: 700;
          line-height: 1.3;
        }

        .guidelines-editor :global(p),
        .guidelines-editor :global(div) {
          margin: 0 0 0.75rem;
          line-height: 1.7;
        }

        .guidelines-editor :global(ul),
        .guidelines-editor :global(ol) {
          margin: 0.5rem 0 0.85rem;
          padding-left: 1.6rem;
        }

        .guidelines-editor :global(ul) {
          list-style-type: disc;
        }

        .guidelines-editor :global(ol) {
          list-style-type: decimal;
        }

        .guidelines-editor :global(li) {
          display: list-item;
          margin: 0.25rem 0;
          line-height: 1.6;
        }

        .guidelines-editor :global(a) {
          color: #67e8f9;
          text-decoration: underline;
        }
      `}</style>
      <AdminToast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}

function ToolbarButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className="grid h-10 min-w-10 place-items-center rounded-md border border-white/10 px-3 text-sm font-semibold text-gray-300 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-100"
      title={label}
    >
      {children}
    </button>
  );
}
