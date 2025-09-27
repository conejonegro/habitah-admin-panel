"use client";

import { useEffect, useMemo, useState } from "react";
import { getDb } from "@/lib/firebase";

export default function InquilinosPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [edificios, setEdificios] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({
    nombre: "",
    email: "",
    edificioRefId: "",
    depaId: "",
    cuotaMensual: "",
    activo: true,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const db = await getDb();
        const { collection, getDocs, orderBy, query, limit } = await import(
          "firebase/firestore"
        );
        const snap = await getDocs(
          query(
            collection(db, "usuarios"),
            // Solo activos primero; si no existe el campo, igual listará todo
            // Puedes quitar `where` si prefieres ver todos.
            // where("activo", "==", true),
            orderBy("nombre"),
            limit(100)
          )
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

  // Cargar lista de edificios para el selector
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
        if (active) setEdificios(rows);
      } catch (e) {
        // Si no existe la colección o no hay permisos, solo ignora y deja vacío
        console.warn("No se pudo cargar edificios", e);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const displayValue = (v) => {
    if (!v) return "—";
    // Si es referencia de Firestore, usa su id o path
    if (typeof v === "object") {
      // Firestore DocumentReference suele tener `.id` y `.path`
      const id = v.id || v.path || v._key?.path?.segments?.join("/");
      return id || "—";
    }
    return String(v);
  };

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    if (!term) return items;
    return items.filter((u) =>
      [u.nombre, u.email, displayValue(u.edificioRef), u.depaId, u.uId]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [items, q]);

  const startEdit = (u) => {
    setEditingId(u.id);
    setDraft({
      nombre: u.nombre || "",
      email: u.email || "",
      edificioRefId: u.edificioRef?.id || "",
      depaId: u.depaId || "",
      cuotaMensual: u.cuotaMensual != null ? String(u.cuotaMensual) : "",
      activo: u.activo !== false,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id) => {
    try {
      const db = await getDb();
      const { doc, updateDoc, serverTimestamp } = await import("firebase/firestore");
      await updateDoc(doc(db, "usuarios", id), {
        nombre: draft.nombre,
        email: draft.email,
        edificioRef: draft.edificioRefId ? doc(db, "edificios", draft.edificioRefId) : null,
        depaId: draft.depaId || null,
        cuotaMensual: draft.cuotaMensual === "" ? null : Number(draft.cuotaMensual),
        activo: Boolean(draft.activo),
        updatedAt: serverTimestamp(),
      });
      // Refrescar en memoria
      setItems((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                nombre: draft.nombre,
                email: draft.email,
                edificioRef: draft.edificioRefId ? { id: draft.edificioRefId } : null,
                depaId: draft.depaId || null,
                cuotaMensual: draft.cuotaMensual === "" ? null : Number(draft.cuotaMensual),
                activo: Boolean(draft.activo),
              }
            : u
        )
      );
      setEditingId(null);
    } catch (e) {
      console.error(e);
      alert("No se pudo guardar cambios.");
    }
  };

  const deleteUser = async (id) => {
    if (!confirm("¿Eliminar este inquilino? Esta acción no se puede deshacer.")) return;
    try {
      const db = await getDb();
      const { doc, deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "usuarios", id));
      setItems((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      console.error(e);
      alert("No se pudo eliminar.");
    }
  };

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
        </div>
        <div className="flex items-center gap-3">
          <div className="relative max-w-sm">
            <input
              type="search"
              placeholder="Buscar inquilinos..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700"
            />
          </div>
          <a
            href="/inquilinos/nuevo"
            className="inline-flex items-center rounded-lg bg-emerald-600 text-white px-4 py-2 text-base font-medium hover:bg-emerald-700"
          >
            + Nuevo inquilino
          </a>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-base font-medium text-gray-500">Nombre</th>
              <th className="px-4 py-3 text-left text-base font-medium text-gray-500">Email</th>
              <th className="px-4 py-3 text-left text-base font-medium text-gray-500">Edificio</th>
              <th className="px-4 py-3 text-left text-base font-medium text-gray-500">Depa</th>
              <th className="px-4 py-3 text-left text-base font-medium text-gray-500">Cuota mensual</th>
              <th className="px-4 py-3 text-left text-base font-medium text-gray-500">uId</th>
              <th className="px-4 py-3 text-left text-base font-medium text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-950">
            {loading && (
              <tr>
                <td className="px-4 py-6 text-base text-gray-500" colSpan={6}>
                  Cargando...
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-base text-gray-500" colSpan={6}>
                  No hay inquilinos.
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((u) => {
                const isEditing = editingId === u.id;
                return (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-4 py-3 text-base font-medium">
                      {isEditing ? (
                        <input
                          value={draft.nombre}
                          onChange={(e) => setDraft((d) => ({ ...d, nombre: e.target.value }))}
                          className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-2 py-1"
                        />
                      ) : (
                        u.nombre || "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-base text-gray-700 dark:text-gray-300">
                      {isEditing ? (
                        <input
                          type="email"
                          value={draft.email}
                          onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                          className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-2 py-1"
                        />
                      ) : (
                        u.email || "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-base text-gray-700 dark:text-gray-300">
                      {isEditing ? (
                        <select
                          value={draft.edificioRefId}
                          onChange={(e) => setDraft((d) => ({ ...d, edificioRefId: e.target.value }))}
                          className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-2 py-1"
                        >
                          <option value="">—</option>
                          {edificios.map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.nombre || e.id}
                            </option>
                          ))}
                        </select>
                      ) : (
                        displayValue(u.edificioRef)
                      )}
                    </td>
                    <td className="px-4 py-3 text-base text-gray-700 dark:text-gray-300">
                      {isEditing ? (
                        <input
                          value={draft.depaId}
                          onChange={(e) => setDraft((d) => ({ ...d, depaId: e.target.value }))}
                          className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-2 py-1"
                        />
                      ) : (
                        u.depaId || "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-base">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={draft.cuotaMensual}
                          onChange={(e) => setDraft((d) => ({ ...d, cuotaMensual: e.target.value }))}
                          className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-2 py-1"
                        />
                      ) : u.cuotaMensual != null ? (
                        `$${u.cuotaMensual}`
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-base text-gray-500">{u.uId || u.id}</td>
                    <td className="px-4 py-3 text-base">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                            <input
                              type="checkbox"
                              checked={draft.activo}
                              onChange={(e) => setDraft((d) => ({ ...d, activo: e.target.checked }))}
                            />
                            Activo
                          </label>
                          <button
                            onClick={() => saveEdit(u.id)}
                            className="rounded bg-emerald-600 text-white px-3 py-1 hover:bg-emerald-700"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="rounded bg-gray-200 dark:bg-gray-800 px-3 py-1"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${u.activo !== false ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-700"}`}
                          >
                            {u.activo !== false ? "Activo" : "Inactivo"}
                          </span>
                          <button
                            onClick={() => startEdit(u)}
                            className="rounded bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-3 py-1 hover:opacity-90"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="rounded bg-red-600 text-white px-3 py-1 hover:bg-red-700"
                          >
                            Borrar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
