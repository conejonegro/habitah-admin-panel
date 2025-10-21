"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getDb } from "@/lib/firebase";

export default function EdificioDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    let active = true;
    if (!id) return;
    (async () => {
      try {
        const db = await getDb();
        const { doc, getDoc } = await import("firebase/firestore");
        const snap = await getDoc(doc(db, "edificios", id));
        const val = snap.exists() ? { id: snap.id, ...snap.data() } : null;
        if (!active) return;
        setData(val);
        setForm(val ? {
          nombre: val.nombre || "",
          code: val.code || "",
          admin: val.admin || "",
          condoId: val.condoId || "",
          direccion: {
            street: val.direccion?.street || "",
            numero: val.direccion?.numero ?? "",
            Ciudad: val.direccion?.Ciudad || "",
            estado: val.direccion?.estado || "",
            codigo_postal: val.direccion?.codigo_postal || "",
          },
          active: val.active !== false,
        } : null);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  const onChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const onDirChange = (field, value) => setForm((f) => ({ ...f, direccion: { ...f.direccion, [field]: value }}));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form) return;
    try {
      setSaving(true);
      const db = await getDb();
      const { doc, updateDoc, serverTimestamp } = await import("firebase/firestore");
      await updateDoc(doc(db, "edificios", id), {
        nombre: form.nombre,
        code: form.code,
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
        updatedAt: serverTimestamp(),
      });
      alert("Guardado");
    } catch (e) {
      console.error(e);
      alert("No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="w-full max-w-none px-16 text-[16px] text-black space-y-6 bg-white">
      <div className="flex items-center gap-3">
        <a href="/edificios" className="inline-flex items-center gap-2 text-base text-black hover:underline">
          <span aria-hidden>←</span>
          Volver a edificios
        </a>
        <h1 className="text-xl font-semibold">Detalle de edificio</h1>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : !data ? (
        <div>No encontrado</div>
      ) : (
        <form onSubmit={handleSave} className="max-w-3xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm">Nombre</span>
              <input
                value={form.nombre}
                onChange={(e) => onChange("nombre", e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm">Código</span>
              <input
                value={form.code}
                onChange={(e) => onChange("code", e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300"
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
            <div className="text-sm text-black/70">{briefDireccion(form?.direccion)}</div>
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!form.active}
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
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
            <a href="/edificios" className="text-base hover:underline">Volver</a>
          </div>
        </form>
      )}
    </div>
  );
}

