"use client";

import { useMemo, useState } from "react";
import type { GlossaryEntry } from "@/lib/fheEducation";

interface GlossaryModalProps {
  isVisible: boolean;
  onClose: () => void;
  entries: GlossaryEntry[];
}

export const GlossaryModal = ({ isVisible, onClose, entries }: GlossaryModalProps) => {
  const [query, setQuery] = useState("");

  const filteredEntries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return entries;
    }

    return entries.filter((entry) =>
      `${entry.term} ${entry.definition}`.toLowerCase().includes(normalized)
    );
  }, [entries, query]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-3xl rounded-3xl border border-slate-800/70 bg-slate-950/90 p-10 shadow-[0_60px_140px_-60px_rgba(15,23,42,0.9)]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-100">FHE Glossary</h3>
            <p className="text-sm text-slate-400">Skim through the core terminology in seconds.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-slate-800/70 px-3 py-1 text-sm font-semibold text-slate-300 transition hover:border-slate-600/60 hover:text-slate-100"
          >
            Close
          </button>
        </header>

        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-800/70 bg-slate-900/40 px-4 py-3">
          <span className="text-xl">🔍</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search terms (e.g. ciphertext)"
            className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="max-h-[22rem] space-y-4 overflow-y-auto pr-2 text-sm">
          {filteredEntries.length === 0 ? (
            <p className="rounded-2xl border border-slate-800/60 bg-slate-900/60 px-4 py-6 text-center text-slate-400">
              No matching terms found. Try a different keyword.
            </p>
          ) : (
            filteredEntries.map((entry) => (
              <div
                key={entry.term}
                className="rounded-2xl border border-slate-800/60 bg-slate-900/60 px-5 py-4"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                  {entry.term}
                </p>
                <p className="mt-2 text-slate-200">{entry.definition}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
