"use client";

import { useState } from "react";
import { getDb } from "@/lib/firebase";

export default function NuevoEdificioPage() {
  const [form, setForm] = useState({
    nombre: "",
    code: "",
    admin: "",
    condoId: "",
    direccion: {
      street: "",
      numero: "",
      Ciudad: "",
      estado: "",
      codigo_postal: "",
    },
    active: true,
  });
  const [saving, setSaving] = useState(false);

  const onChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const onDirChange = (field, value) =>
    setForm((f) => ({ ...f, direccion: { ...f.direccion, [field]: value } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.code) {
      alert("Nombre y Código son obligatorios");
      return;
    }
    try {
      setSaving(true);
      const db = await getDb();
      const { doc, setDoc, getDoc, serverTimestamp } = await import("firebase/firestore");
      const code = (form.code || "").trim().toUpperCase();
      if (!code) {
        alert("Código inválido");
        setSaving(false);
        return;
      }
      const ref = doc(db, "edificios", code);
      const exists = await getDoc(ref);
      if (exists.exists()) {
        alert("Ya existe un edificio con ese código");
        setSaving(false);
        return;
      }
      const payload = {
        nombre: form.nombre,
        code,
        admin: form.admin || null,
        condoId: form.condoId || null,
        direccion: {
          street: form.direccion.street || null,
          numero: form.direccion.numero === "" ? null : Number(form.direccion.numero),
          Ciudad: form.direccion.Ciudad || null,
          estado: form.direccion.estado || null,
          codigo_postal: form.direccion.codigo_postal || null,
        },
        active: !!form.active,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(ref, payload);
      window.location.href = `/edificios/${encodeURIComponent(code)}`;
    } catch (e) {
      console.error(e);
      alert("No se pudo crear el edificio");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-none px-16 text-[16px] text-black space-y-6 bg-white">
      <div className="flex items-center gap-3">
        <a href="/edificios" className="inline-flex items-center gap-2 text-base text-black hover:underline">
          <span aria-hidden>←</span>
          Volver a edificios
        </a>
        <h1 className="text-xl font-semibold">Nuevo edificio</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm">Nombre *</span>
            <input
              value={form.nombre}
              onChange={(e) => onChange("nombre", e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300"
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm">Código *</span>
            <input
              value={form.code}
              onChange={(e) => onChange("code", e.target.value.toUpperCase())}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="EJ. TORRE-LERDO"
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm">Admin</span>
            <input
              value={form.admin}
              onChange={(e) => onChange("admin", e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm">Condominio (condoId)</span>
            <input
              value={form.condoId}
              onChange={(e) => onChange("condoId", e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300"
            />
          </label>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-medium">Dirección</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm">Calle</span>
              <input
                value={form.direccion.street}
                onChange={(e) => onDirChange("street", e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm">Número</span>
              <input
                type="number"
                value={form.direccion.numero}
                onChange={(e) => onDirChange("numero", e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm">Ciudad</span>
              <input
                value={form.direccion.Ciudad}
                onChange={(e) => onDirChange("Ciudad", e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm">Estado</span>
              <input
                value={form.direccion.estado}
                onChange={(e) => onDirChange("estado", e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300"
              />
            </label>
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm">Código Postal</span>
              <input
                value={form.direccion.codigo_postal}
                onChange={(e) => onDirChange("codigo_postal", e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300"
              />
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => onChange("active", e.target.checked)}
            />
            Activo
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-emerald-600 text-white px-4 py-2 text-base font-medium hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <a href="/edificios" className="text-base hover:underline">Cancelar</a>
        </div>
      </form>
    </div>
  );
}
