"use client";

import { useEffect, useMemo, useState } from "react";
import { getDb } from "@/lib/firebase";

export default function CobrosPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all"); // all | paid | pending

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const db = await getDb();
        const { collection, getDocs, orderBy, query, limit } = await import(
          "firebase/firestore"
        );
        const snap = await getDocs(
          query(collection(db, "payments"), orderBy("dueDate", "desc"), limit(200))
        );
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (active) setItems(rows);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const formatDate = (ts) => {
    if (!ts) return "—";
    const date = ts?.toDate ? ts.toDate() : new Date(ts);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString();
  };

  const formatAmount = (n) => {
    if (n == null || Number.isNaN(Number(n))) return "—";
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: "MXN" }).format(
        Number(n)
      );
    } catch {
      return `$${Number(n).toFixed(2)}`;
    }
  };

  const displayRef = (ref) => {
    if (!ref) return "—";
    return ref.id || ref.path || "—";
  };

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    return items
      .filter((p) => {
        if (status === "paid") return p.isPaid === true;
        if (status === "pending") return p.isPaid !== true;
        return true;
      })
      .filter((p) => {
        if (!term) return true;
        const values = [
          p.id,
          p.email,
          p.unidadId,
          displayRef(p.edificioRef),
          p.notes,
          p.masked,
          p.last4,
          String(p.amount),
        ].filter(Boolean);
        return values.some((v) => String(v).toLowerCase().includes(term));
      });
  }, [items, q, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-base text-gray-700 dark:text-gray-300 hover:underline"
          >
            <span aria-hidden>←</span>
            Volver
          </a>
          <h1 className="text-xl font-semibold">Cobros</h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-base"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="paid">Pagados</option>
          </select>
          <input
            type="search"
            placeholder="Buscar..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full sm:w-64 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-base font-medium text-gray-500">Usuario</th>
              <th className="px-4 py-3 text-left text-base font-medium text-gray-500">Edificio</th>
              <th className="px-4 py-3 text-left text-base font-medium text-gray-500">Unidad</th>
              <th className="px-4 py-3 text-left text-base font-medium text-gray-500">Monto</th>
              <th className="px-4 py-3 text-left text-base font-medium text-gray-500">Vence</th>
              <th className="px-4 py-3 text-left text-base font-medium text-gray-500">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-950">
            {loading && (
              <tr>
                <td className="px-4 py-6 text-base text-gray-500" colSpan={7}>
                  Cargando...
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-base text-gray-500" colSpan={7}>
                  No hay cobros.
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-4 py-3 text-base">
                    <div className="flex flex-col">
                      <span className="font-medium">{p.email || p.userId || "—"}</span>
                      <span className="text-gray-500 text-sm">{p.masked || p.last4 ? `**** ${p.last4 || ""}` : ""}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-base text-gray-700 dark:text-gray-300">{displayRef(p.edificioRef)}</td>
                  <td className="px-4 py-3 text-base text-gray-700 dark:text-gray-300">{p.unidadId || "—"}</td>
                  <td className="px-4 py-3 text-base">{formatAmount(p.amount)}</td>
                  <td className="px-4 py-3 text-base text-gray-600 dark:text-gray-400">{formatDate(p.dueDate)}</td>
                  <td className="px-4 py-3 text-base">
                    <span className={`rounded-full px-2 py-1 text-base ${p.isPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
                      {p.isPaid ? "Pagado" : "Pendiente"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      className="text-base text-gray-900 dark:text-gray-100 hover:underline"
                      href={`/cobros/${encodeURIComponent(p.id)}`}
                    >
                      Ver detalle
                    </a>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

