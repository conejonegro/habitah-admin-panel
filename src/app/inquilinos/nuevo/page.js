"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDb } from "@/lib/firebase";
import { listEdificiosBasic } from "@/lib/data/edificios";

export default function NuevoInquilinoPage() {
  const router = useRouter();
  const [uId, setUId] = useState("");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [edificioRef, setEdificioRef] = useState("");
  const [depaId, setDepaId] = useState("");
  const [cuotaMensual, setCuotaMensual] = useState("");
  const [activo, setActivo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [edificios, setEdificios] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await listEdificiosBasic();
        if (active) setEdificios(list);
      } catch (e) {
        console.warn("No se pudieron cargar edificios", e);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleSubmit = async () => {
    setError("");
    if (!uId || !nombre || !email || !edificioRef) {
      setError("Completa uId, nombre, email y edificio.");
      return;
    }
    setLoading(true);
    try {
      const db = await getDb();
      const { doc, setDoc, serverTimestamp, getDoc, collection } = await import(
        "firebase/firestore"
      );

      // Validar si ya existe un usuario con ese uId
      const ref = doc(db, "usuarios", uId);
      const exists = await getDoc(ref);
      if (exists.exists()) {
        setError("Ya existe un inquilino con ese uId.");
        return;
      }

      await setDoc(ref, {
        uId,
        nombre,
        email,
        // Guardamos referencia al documento del edificio: /edificios/{edificioRef}
        edificioRef: doc(db, "edificios", edificioRef),
        depaId: depaId || null,
        cuotaMensual: cuotaMensual === "" ? null : Number(cuotaMensual),
        activo: Boolean(activo),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      router.push("/inquilinos");
    } catch (e) {
      console.error(e);
      setError("No se pudo guardar. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-none px-16 text-[16px] text-black space-y-6 bg-white">
      <a href="/inquilinos" className="inline-flex items-center gap-2 text-base text-black hover:underline">
        <span aria-hidden>←</span>
        Volver a inquilinos
      </a>

      <div className="rounded-xl border border-gray-200 p-5">
        <h2 className="text-xl font-semibold">Alta de inquilino</h2>
        <p className="mt-1 text-base text-black/70">
          Registra un inquilino activo con su información básica.
        </p>

        <form className="mt-6 space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-base font-medium mb-1">uId (Google)</label>
              <input
                value={uId}
                onChange={(e) => setUId(e.target.value)}
                required
                type="text"
                placeholder="UID de Firebase Auth"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300 text-black placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-base font-medium mb-1">Nombre</label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                type="text"
                placeholder="Nombre del inquilino"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300 text-black placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-base font-medium mb-1">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                placeholder="correo@ejemplo.com"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300 text-black placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-base font-medium mb-1">Edificio</label>
              <select
                value={edificioRef}
                onChange={(e) => setEdificioRef(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300 text-black"
              >
                <option value="">Selecciona un edificio</option>
                {edificios.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre || e.code || e.id}
                  </option>
                ))}
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
                placeholder="p.ej. A-302"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300 text-black placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-base font-medium mb-1">Cuota mensual (MXN)</label>
              <input
                value={cuotaMensual}
                onChange={(e) => setCuotaMensual(e.target.value)}
                type="number"
                min="0"
                step="0.01"
                placeholder="p.ej. 3500"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300 text-black placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="activo"
              type="checkbox"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="activo" className="text-base">Activo</label>
          </div>

          {error && (
            <p className="text-base text-red-600">{error}</p>
          )}

          <div className="flex items-center justify-end gap-3">
            <a href="/inquilinos" className="text-base text-black/70 hover:underline">
              Cancelar
            </a>
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="inline-flex items-center rounded-lg bg-gray-900 text-white px-4 py-2 text-base font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
