"use client";

import { useEffect, useState, use as usePromise } from "react";
import { getDb } from "@/lib/firebase";

export default function CobroDetallePage({ params }) {
  const { id } = usePromise(params);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      try {
        const db = await getDb();
        const { doc, getDoc } = await import("firebase/firestore");
        const snap = await getDoc(doc(db, "payments", id));
        if (!snap.exists()) {
          if (active) setItem(null);
        } else {
          const data = { id: snap.id, ...snap.data() };
          if (active) {
            setItem(data);
            setNotes(data.notes || "");
          }
        }
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

  const markPaid = async (paid) => {
    if (!item) return;
    try {
      setSaving(true);
      const db = await getDb();
      const { doc, updateDoc, serverTimestamp } = await import("firebase/firestore");
      await updateDoc(doc(db, "payments", item.id), {
        isPaid: paid,
        lastPaymentDate: paid ? serverTimestamp() : null,
        updatedAt: serverTimestamp?.() || Date.now(),
      });
      setItem((prev) => ({ ...prev, isPaid: paid, lastPaymentDate: paid ? new Date() : null }));
    } catch (e) {
      console.error(e);
      alert("No se pudo actualizar el estado del pago.");
    } finally {
      setSaving(false);
    }
  };

  const saveNotes = async () => {
    if (!item) return;
    try {
      setSaving(true);
      const db = await getDb();
      const { doc, updateDoc, serverTimestamp } = await import("firebase/firestore");
      await updateDoc(doc(db, "payments", item.id), {
        notes: notes || "",
        updatedAt: serverTimestamp?.() || Date.now(),
      });
      setItem((prev) => ({ ...prev, notes }));
    } catch (e) {
      console.error(e);
      alert("No se pudieron guardar las notas.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <a href="/cobros" className="text-base hover:underline">← Volver</a>
        <div className="text-base text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="space-y-6">
        <a href="/cobros" className="text-base hover:underline">← Volver</a>
        <div className="text-base text-gray-500">Cobro no encontrado.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/cobros" className="inline-flex items-center gap-2 text-base text-gray-700 dark:text-gray-300 hover:underline">
            <span aria-hidden>←</span>
            Volver
          </a>
          <h1 className="text-xl font-semibold">Cobro {item.id}</h1>
        </div>
        <div className="flex items-center gap-2">
          {item.isPaid ? (
            <button
              disabled={saving}
              onClick={() => markPaid(false)}
              className="rounded bg-amber-600 text-white px-4 py-2 text-base font-medium hover:bg-amber-700 disabled:opacity-50"
            >
              Marcar como pendiente
            </button>
          ) : (
            <button
              disabled={saving}
              onClick={() => markPaid(true)}
              className="rounded bg-emerald-600 text-white px-4 py-2 text-base font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              Marcar como pagado
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3 bg-white dark:bg-gray-950">
          <div className="flex items-center justify-between">
            <div className="text-base text-gray-500">Estado</div>
            <div>
              <span className={`rounded-full px-2 py-1 text-base ${item.isPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
                {item.isPaid ? "Pagado" : "Pendiente"}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-base text-gray-500">Monto</div>
            <div className="text-base font-semibold">{formatAmount(item.amount)}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-base text-gray-500">Fecha de vencimiento</div>
            <div className="text-base">{formatDate(item.dueDate)}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-base text-gray-500">Último pago</div>
            <div className="text-base">{formatDate(item.lastPaymentDate)}</div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3 bg-white dark:bg-gray-950">
          <div className="text-base font-semibold">Titular</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-base text-gray-500">Email</div>
            <div className="text-base">{item.email || "—"}</div>
            <div className="text-base text-gray-500">Edificio</div>
            <div className="text-base">{displayRef(item.edificioRef)}</div>
            <div className="text-base text-gray-500">Unidad</div>
            <div className="text-base">{item.unidadId || "—"}</div>
            <div className="text-base text-gray-500">UserId</div>
            <div className="text-base">{item.userId || "—"}</div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3 bg-white dark:bg-gray-950">
          <div className="text-base font-semibold">Método de pago</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-base text-gray-500">AutoPay</div>
            <div className="text-base">{item.autoPay ? "Sí" : "No"}</div>
            <div className="text-base text-gray-500">Terminación</div>
            <div className="text-base">{item.last4 || "—"}</div>
            <div className="text-base text-gray-500">Tarjeta</div>
            <div className="text-base">{item.masked || "—"}</div>
          </div>
          {item.paymentMethod && (
            <pre className="text-xs mt-3 max-h-40 overflow-auto rounded bg-gray-50 dark:bg-gray-900 p-3">
              {JSON.stringify(item.paymentMethod, null, 2)}
            </pre>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3 bg-white dark:bg-gray-950">
          <div className="flex items-center justify-between">
            <div className="text-base font-semibold">Notas</div>
            <button
              disabled={saving}
              onClick={saveNotes}
              className="rounded bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-3 py-1.5 text-base hover:opacity-90 disabled:opacity-50"
            >
              Guardar
            </button>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-base"
            placeholder="Notas del cobro..."
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-2 bg-white dark:bg-gray-950">
        <div className="text-base text-gray-500">IDs y metadatos</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="text-sm text-gray-500">Documento</div>
          <div className="text-sm break-all">{item.id}</div>
          <div className="text-sm text-gray-500">Creado</div>
          <div className="text-sm">{item.createdAt ? formatDate(item.createdAt) : "—"}</div>
        </div>
      </div>
    </div>
  );
}
