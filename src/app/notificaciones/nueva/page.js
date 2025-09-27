"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getDb } from "@/lib/firebase";
import { initializeApp, getApps, getApp } from "firebase/app";

export default function NuevaNotificacionPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [depaId, setDepaId] = useState("");
  const [edificioRef, setEdificioRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (estado = "Borrador") => {
    setError("");
    if (!nombre || !descripcion || !edificioRef) {
      setError("Completa nombre, descripción y edificio.");
      return;
    }
    setLoading(true);
    try {
      const db = await getDb();
      const { addDoc, collection, serverTimestamp, doc, setDoc, getDoc } = await import(
        "firebase/firestore"
      );
      // Construir ID personalizado: slug del nombre + fecha actual (es-ES)
      const now = new Date();
      const meses = [
        "ene",
        "feb",
        "mar",
        "abr",
        "may",
        "jun",
        "jul",
        "ago",
        "sept",
        "oct",
        "nov",
        "dic",
      ];
      const dia = now.getDate();
      const mes = meses[now.getMonth()];
      const anio = now.getFullYear();

      const slugify = (s) =>
        s
          .toLowerCase()
          .normalize("NFD")
          .replace(/\p{Diacritic}+/gu, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .replace(/-{2,}/g, "-");

      const baseId = `${slugify(nombre)}-${dia}-${mes}-${anio}`;

      // Verificar colisión y ajustar con hora y minuto si existe
      let finalId = baseId;
      const baseRef = doc(db, "notificaciones", baseId);
      const baseSnap = await getDoc(baseRef);
      if (baseSnap.exists()) {
        const hh = String(now.getHours()).padStart(2, "0");
        const mm = String(now.getMinutes()).padStart(2, "0");
        finalId = `${baseId}-${hh}${mm}`;
      }

      const ref = doc(db, "notificaciones", finalId);
      await setDoc(ref, {
        nombre,
        descripcion,
        depaId: depaId || null,
        // Guardamos referencia al documento del edificio: edificios/{edificioRef}
        edificioRef: doc(db, "edificios", edificioRef),
        estado,
        createdAt: serverTimestamp(),
      });
      router.push(`/notificaciones/${finalId}`);
    } catch (e) {
      console.error(e);
      setError("No se pudo guardar. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="text-xl font-semibold">Crear notificación</h2>
        <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
          Redacta el mensaje, selecciona el edificio y guarda o envía.
        </p>

        <form className="mt-6 space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-base font-medium mb-1">Nombre</label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                type="text"
                placeholder="p.ej. Recordatorio de pago - Octubre"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700"
              />
            </div>
            <div>
              <label className="block text-base font-medium mb-1">Edificio</label>
              <select
                value={edificioRef}
                onChange={(e) => setEdificioRef(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700"
              >
                <option value="">Selecciona un edificio</option>
                <option value="TORRE-LERDO">TORRE-LERDO</option>
                <option value="TORRE-A">TORRE-A</option>
                <option value="TORRE-B">TORRE-B</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-base font-medium mb-1">Depa ID</label>
              <input
                value={depaId}
                onChange={(e) => setDepaId(e.target.value)}
                type="text"
                placeholder="p.ej. A-302 (opcional si es general)"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-base font-medium mb-1">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              rows={6}
              placeholder="Escribe el mensaje a enviar..."
              className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700"
            />
          </div>

          {error && (
            <p className="text-base text-red-600 dark:text-red-500">{error}</p>
          )}

          <div className="flex items-center justify-end gap-3">
            <a href="/notificaciones" className="text-base text-gray-600 hover:underline">
              Cancelar
            </a>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit("Borrador")}
              className="inline-flex items-center rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-4 py-2 text-base font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar borrador"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit("Enviada")}
              className="inline-flex items-center rounded-lg bg-emerald-600 text-white px-4 py-2 text-base font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar ahora"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
