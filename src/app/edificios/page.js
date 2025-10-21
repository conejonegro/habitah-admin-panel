"use client";

import { useEffect, useMemo, useState } from "react";
import { getDb } from "@/lib/firebase";

export default function EdificiosPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const db = await getDb();
        const { collection, getDocs, orderBy, query } = await import(
          "firebase/firestore"
        );
        const snap = await getDocs(query(collection(db, "edificios"), orderBy("nombre")));
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

  const briefDireccion = (d) => {
    if (!d || typeof d !== "object") return "—";
    const street = d.street || "";
    const numero = d.numero != null ? String(d.numero) : "";
    const ciudad = d.Ciudad || d.ciudad || "";
    const estado = d.estado || "";
    const cp = d.codigo_postal || d.cp || "";
    const line1 = [street, numero].filter(Boolean).join(" ");
    const line2 = [ciudad, estado].filter(Boolean).join(", ");
    const line3 = cp ? `CP ${cp}` : "";
    return [line1, line2, line3].filter(Boolean).join(" · ");
  };

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    if (!term) return items;
    return items.filter((e) =>
      [
        e.nombre,
        e.code,
        e.admin,
        e.condoId,
        briefDireccion(e.direccion),
        e.id,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [items, q]);

  return (
    <div className="w-full max-w-none px-16 text-[16px] text-black space-y-6 bg-white">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="inline-flex items-center gap-2 text-base text-black hover:underline">
            <span aria-hidden>←</span>
            Volver
          </a>
          <h1 className="text-xl font-semibold">Edificios</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative max-w-sm">
            <input
              type="search"
              placeholder="Buscar edificios..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300 text-black placeholder:text-gray-500"
            />
          </div>
          <a
            href="/edificios/nuevo"
            className="inline-flex items-center rounded-lg bg-emerald-600 text-white px-4 py-2 text-base font-medium hover:bg-emerald-700"
          >
            + Nuevo edificio
          </a>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-black">
            <tr>
              <th className="px-4 py-3 text-left text-base font-medium text-black">Nombre</th>
              <th className="px-4 py-3 text-left text-base font-medium text-black">Código</th>
              <th className="px-4 py-3 text-left text-base font-medium text-black">Admin</th>
              <th className="px-4 py-3 text-left text-base font-medium text-black">Condominio</th>
              <th className="px-4 py-3 text-left text-base font-medium text-black">Dirección</th>
              <th className="px-4 py-3 text-left text-base font-medium text-black">Activo</th>
              <th className="px-4 py-3 text-left text-base font-medium text-black">Creado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading && (
              <tr>
                <td className="px-4 py-6 text-base text-black" colSpan={8}>
                  Cargando...
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-base text-black" colSpan={8}>
                  No hay edificios.
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-base font-medium text-black">{e.nombre || "—"}</td>
                  <td className="px-4 py-3 text-base text-black">{e.code || e.id || "—"}</td>
                  <td className="px-4 py-3 text-base text-black">{e.admin || "—"}</td>
                  <td className="px-4 py-3 text-base text-black">{e.condoId || "—"}</td>
                  <td className="px-4 py-3 text-base text-black">{briefDireccion(e.direccion)}</td>
                  <td className="px-4 py-3 text-base">
                    <span className={`rounded-full px-2 py-1 text-base ${e.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-700"}`}>
                      {e.active ? "Sí" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-base text-black">{e.createdAt?.toDate ? e.createdAt.toDate().toLocaleString() : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <a
                      className="text-base text-black hover:underline"
                      href={`/edificios/${encodeURIComponent(e.id)}`}
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
