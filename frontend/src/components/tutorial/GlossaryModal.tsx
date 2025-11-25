"use client";

import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import type { GlossaryEntry } from "@/lib/fheEducation";

interface GlossaryModalProps {
  isVisible: boolean;
  onClose: () => void;
  entries: GlossaryEntry[];
}

export const GlossaryModal = ({ isVisible, onClose, entries }: GlossaryModalProps) => {
  useLockBodyScroll(isVisible);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const filteredEntries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return entries;
    }

    return entries.filter((entry) =>
      `${entry.term} ${entry.definition}`.toLowerCase().includes(normalized)
    );
  }, [entries, query]);

  if (!isVisible || !mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[80vh] w-full max-w-2xl flex-col rounded-3xl border border-slate-800/70 bg-slate-950/90 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex flex-none items-center justify-between border-b border-slate-800/50 px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">FHE Glossary</h3>
            <p className="text-xs text-slate-400">Key terms you should know.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-slate-800/70 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-slate-600/60 hover:text-slate-200"
          >
            Close
          </button>
        </header>

        <div className="flex-none px-6 py-4">
          <div className="flex items-center gap-3 rounded-xl border border-slate-800/70 bg-slate-900/40 px-3 py-2.5">
            <span className="text-lg text-slate-500">🔍</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search terms..."
              className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-2.5">
            {filteredEntries.length === 0 ? (
              <p className="rounded-xl border border-slate-800/60 bg-slate-900/60 px-4 py-8 text-center text-sm text-slate-500">
                No matching terms found.
              </p>
            ) : (
              filteredEntries.map((entry) => (
                <div
                  key={entry.term}
                  className="group rounded-xl border border-slate-800/40 bg-slate-900/20 px-4 py-3 transition-all hover:border-slate-700/50 hover:bg-slate-900/40"
                >
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-sky-500/90">
                    {entry.term}
                  </p>
                  <p className="text-sm leading-relaxed text-slate-300 group-hover:text-slate-200">
                    {entry.definition}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom fade to indicate scrolling */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-950 to-transparent rounded-b-3xl" />
      </div>
    </div>,
    document.body
  );
};
