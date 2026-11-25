"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

export function AidSearch({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    router.push(term ? `/aides?search=${encodeURIComponent(term)}` : "/aides");
  }

  return <form className={`aid-search${compact ? " aid-search-compact" : ""}`} onSubmit={submit} role="search">
    <label className="visually-hidden" htmlFor={compact ? "aid-search-compact" : "aid-search-home"}>Rechercher une aide</label>
    <input id={compact ? "aid-search-compact" : "aid-search-home"} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Une aide, un sujet, un organisme…" />
    <button type="submit">Rechercher</button>
  </form>;
}
