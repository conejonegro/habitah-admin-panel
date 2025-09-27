"use client";

import { useEffect, useState, use as useUnwrap } from "react";
import { getDb } from "@/lib/firebase";

export default function DetalleNotificacionPage({ params }) {
  const { id } = useUnwrap(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    edificioRef: "",
    depaId: "",
    estado: "",
  });
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const db = await getDb();
        const { doc, getDoc } = await import("firebase/firestore");
        const snap = await getDoc(doc(db, "notificaciones", id));
        if (active) setData(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  // Sincronizar formulario cuando llega el documento
  useEffect(() => {
    if (!data) return;
    const edificioId = typeof data.edificioRef === "object" ? data.edificioRef?.id : data.edificioRef || "";
    setForm({
      nombre: data.nombre || "",
      descripcion: data.descripcion || "",
      edificioRef: edificioId || "",
      depaId: data.depaId || "",
      estado: data.estado || "Borrador",
    });
  }, [data]);

  const handleSave = async () => {
    if (!id) return;
    setSaveError("");
    if (!form.nombre || !form.descripcion || !form.edificioRef) {
      setSaveError("Completa nombre, descripción y edificio.");
      return;
    }
    setSaving(true);
    try {
      const db = await getDb();
      const { doc: docRef, updateDoc, serverTimestamp } = await import("firebase/firestore");
      const ref = docRef(db, "notificaciones", id);
      await updateDoc(ref, {
        nombre: form.nombre,
        descripcion: form.descripcion,
        depaId: form.depaId || null,
        estado: form.estado || "Borrador",
        edificioRef: docRef(db, "edificios", form.edificioRef),
        updatedAt: serverTimestamp(),
      });
      // Refrescar estado local
      setData((prev) => ({
        ...prev,
        nombre: form.nombre,
        descripcion: form.descripcion,
        depaId: form.depaId || null,
        estado: form.estado || "Borrador",
        edificioRef: { id: form.edificioRef },
      }));
      setEditMode(false);
    } catch (e) {
      console.error(e);
      setSaveError("No se pudo guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        Cargando...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        No encontrada.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <a
        href="/notificaciones"
        className="inline-flex items-center gap-2 text-base text-gray-700 dark:text-gray-300 hover:underline"
      >
        <span aria-hidden>←</span>
        Volver a notificaciones
      </a>
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            {!editMode ? (
              <>
                <h2 className="text-2xl font-semibold">{data.nombre}</h2>
                <p className="mt-1 text-base text-gray-600 dark:text-gray-400">ID: {data.id}</p>
              </>
            ) : (
              <div className="space-y-2">
                <label className="block text-base font-medium">Nombre</label>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  type="text"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700"
                />
              </div>
            )}
          </div>
          <span className="rounded-full bg-gray-100 dark:bg-gray-900 px-3 py-1 text-base h-fit">
            {editMode ? (
              <select
                value={form.estado}
                onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value }))}
                className="rounded-md border border-gray-200 dark:border-gray-800 bg-transparent px-2 py-1 text-base"
              >
                <option value="Borrador">Borrador</option>
                <option value="Programada">Programada</option>
                <option value="Enviada">Enviada</option>
                <option value="Archivada">Archivada</option>
              </select>
            ) : (
              data.estado || "—"
            )}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-base text-gray-500">Edificio</p>
            {!editMode ? (
              <p className="text-base">
                {(() => {
                  const v = data.edificioRef;
                  if (!v) return "—";
                  if (typeof v === "object") return v.id || v.path || "—";
                  return String(v);
                })()}
              </p>
            ) : (
              <select
                value={form.edificioRef}
                onChange={(e) => setForm((f) => ({ ...f, edificioRef: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700"
              >
                <option value="">Selecciona un edificio</option>
                <option value="TORRE-LERDO">TORRE-LERDO</option>
                <option value="TORRE-A">TORRE-A</option>
                <option value="TORRE-B">TORRE-B</option>
              </select>
            )}
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-base text-gray-500">Depa ID</p>
            {!editMode ? (
              <p className="text-base">{data.depaId || "—"}</p>
            ) : (
              <input
                value={form.depaId}
                onChange={(e) => setForm((f) => ({ ...f, depaId: e.target.value }))}
                type="text"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700"
              />
            )}
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-base text-gray-500">Creada</p>
            <p className="text-base">
              {data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : "—"}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <label className="block text-base font-medium mb-1">Descripción</label>
          {!editMode ? (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 text-base leading-relaxed">
              {data.descripcion}
            </div>
          ) : (
            <textarea
              rows={6}
              value={form.descripcion}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700"
            />
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <a href="/notificaciones" className="text-base text-gray-600 hover:underline">
            Volver a listado
          </a>
          {!editMode ? (
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-4 py-2 text-base hover:opacity-90"
            >
              Editar
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setEditMode(false);
                  // Restaurar desde data
                  const edificioId = typeof data.edificioRef === "object" ? data.edificioRef?.id : data.edificioRef || "";
                  setForm({
                    nombre: data.nombre || "",
                    descripcion: data.descripcion || "",
                    edificioRef: edificioId || "",
                    depaId: data.depaId || "",
                    estado: data.estado || "Borrador",
                  });
                }}
                className="rounded-lg border border-gray-200 dark:border-gray-800 px-4 py-2 text-base hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="rounded-lg bg-emerald-600 text-white px-4 py-2 text-base font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </>
          )}
        </div>
        {saveError && (
          <p className="mt-2 text-base text-red-600 dark:text-red-500">{saveError}</p>
        )}
      </div>
    </div>
  );
}
