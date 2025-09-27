"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getDb } from "@/lib/firebase";

export default function TicketDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [ticket, setTicket] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [closeNote, setCloseNote] = useState("");
  const [closing, setClosing] = useState(false);
  const [closeError, setCloseError] = useState("");

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      try {
        const db = await getDb();
        const { doc, getDoc, collection, getDocs, orderBy, query } = await import(
          "firebase/firestore"
        );
        const ref = doc(db, "tickets_mantenimiento", id);
        const snap = await getDoc(ref);
        const data = snap.exists() ? { id: snap.id, ...snap.data() } : null;
        if (active) setTicket(data);

        // Mensajes del ticket
        const msnap = await getDocs(
          query(collection(db, "tickets_mantenimiento", id, "mensajes"), orderBy("createdAt", "asc"))
        );
        const mrows = msnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (active) setMensajes(mrows);
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

  const handleSend = async () => {
    setError("");
    if (!text.trim() || !id) return;
    setSending(true);
    try {
      const db = await getDb();
      const { addDoc, collection, serverTimestamp } = await import(
        "firebase/firestore"
      );
      const payload = {
        text: text.trim(),
        createdAt: serverTimestamp(),
        senderId: "admin-panel",
        senderName: "Administrador",
        senderRole: "admin",
      };
      await addDoc(collection(db, "tickets_mantenimiento", id, "mensajes"), payload);
      setText("");
      // Añadir optimistamente
      setMensajes((prev) => [...prev, { ...payload, id: Math.random().toString(36).slice(2) }]);
    } catch (e) {
      console.error(e);
      setError("No se pudo enviar el mensaje.");
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    setCloseError("");
    if (!id) return;
    setClosing(true);
    try {
      const db = await getDb();
      const { doc, updateDoc, serverTimestamp, addDoc, collection } = await import(
        "firebase/firestore"
      );

      // Actualizar estado del ticket a cerrado
      await updateDoc(doc(db, "tickets_mantenimiento", id), {
        status: "cerrado",
        fechaActualizacion: serverTimestamp(),
      });

      // Mensaje de sistema opcional con nota de cierre
      const text = closeNote?.trim()
        ? `Ticket cerrado por Admin. Nota: ${closeNote.trim()}`
        : "Ticket cerrado por Admin.";
      const sysMsg = {
        text,
        createdAt: serverTimestamp(),
        senderId: "admin-panel",
        senderName: "Administrador",
        senderRole: "admin",
      };
      await addDoc(collection(db, "tickets_mantenimiento", id, "mensajes"), sysMsg);

      // Actualización local optimista
      setTicket((prev) => ({
        ...prev,
        status: "cerrado",
        fechaActualizacion: new Date(),
      }));
      setMensajes((prev) => [
        ...prev,
        { ...sysMsg, id: Math.random().toString(36).slice(2) },
      ]);
      setCloseNote("");
    } catch (e) {
      console.error(e);
      setCloseError("No se pudo cerrar el ticket.");
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <a href="/tickets" className="inline-flex items-center gap-2 text-base text-gray-700 dark:text-gray-300 hover:underline">
          <span aria-hidden>←</span>
          Volver a tickets
        </a>
        <p className="text-base text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="space-y-4">
        <a href="/tickets" className="inline-flex items-center gap-2 text-base text-gray-700 dark:text-gray-300 hover:underline">
          <span aria-hidden>←</span>
          Volver a tickets
        </a>
        <p className="text-base text-gray-600">Ticket no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <a href="/tickets" className="inline-flex items-center gap-2 text-base text-gray-700 dark:text-gray-300 hover:underline">
        <span aria-hidden>←</span>
        Volver a tickets
      </a>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">{ticket.titulo || ticket.id}</h2>
            <p className="mt-1 text-base text-gray-600 dark:text-gray-400">{ticket.descripcion || "Sin descripción"}</p>
          </div>
          <div className="text-right space-y-2">
            <div>
              <span className="rounded-full bg-gray-100 dark:bg-gray-900 px-2 py-1 text-base">{ticket.status || "—"}</span>
            </div>
            <div className="text-base text-gray-600 dark:text-gray-400">{ticket.categoria || "—"} · {ticket.prioridad || "—"}</div>
            {ticket.status !== "cerrado" && (
              <button
                type="button"
                disabled={closing}
                onClick={handleClose}
                className="w-full inline-flex items-center justify-center rounded-lg bg-red-600 text-white px-3 py-2 text-base font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {closing ? "Cerrando..." : "Cerrar ticket"}
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-base text-gray-700 dark:text-gray-300">
          <div><span className="text-gray-500">Creado:</span> {formatDate(ticket.fechaCreacion)}</div>
          <div><span className="text-gray-500">Actualizado:</span> {formatDate(ticket.fechaActualizacion)}</div>
          <div><span className="text-gray-500">Usuario:</span> {ticket.userName || ticket.userEmail || ticket.userId || "—"}</div>
          <div><span className="text-gray-500">Asignado a:</span> {ticket.asignadoA || "—"}</div>
          <div><span className="text-gray-500">Imágenes:</span> {Array.isArray(ticket.imagenes) ? ticket.imagenes.length : 0}</div>
          <div><span className="text-gray-500">Notas:</span> {Array.isArray(ticket.notas) ? ticket.notas.length : 0}</div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h3 className="text-lg font-semibold mb-4">Mensajes</h3>
        <div className="space-y-3">
          {mensajes.length === 0 && (
            <p className="text-base text-gray-600 dark:text-gray-400">Sin mensajes.</p>
          )}
          {mensajes.map((m) => (
            <div key={m.id} className="rounded-lg border border-gray-200 dark:border-gray-800 p-3">
              <div className="flex items-center justify-between text-base">
                <div className="text-gray-800 dark:text-gray-100">{m.senderName || m.senderId || "—"} <span className="text-gray-500">({m.senderRole || "—"})</span></div>
                <div className="text-gray-500">{m.createdAt?.toDate ? m.createdAt.toDate().toLocaleString() : "—"}</div>
              </div>
              <p className="mt-2 text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{m.text || ""}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe un mensaje"
            className="flex-1 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700"
          />
          <button
            type="button"
            disabled={sending || !text.trim()}
            onClick={handleSend}
            className="inline-flex items-center rounded-lg bg-emerald-600 text-white px-4 py-2 text-base font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            {sending ? "Enviando..." : "Enviar"}
          </button>
        </div>
        {error && <p className="mt-2 text-base text-red-600 dark:text-red-500">{error}</p>}
      </div>

      {ticket.status !== "cerrado" && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-lg font-semibold mb-3">Cerrar ticket</h3>
          <p className="text-base text-gray-600 dark:text-gray-400 mb-3">Agrega una nota de cierre (opcional). Se registrará como mensaje del sistema.</p>
          <textarea
            rows={3}
            value={closeNote}
            onChange={(e) => setCloseNote(e.target.value)}
            placeholder="Motivo o nota de cierre"
            className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700"
          />
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={closing}
              onClick={handleClose}
              className="inline-flex items-center rounded-lg bg-red-600 text-white px-4 py-2 text-base font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {closing ? "Cerrando..." : "Cerrar ticket"}
            </button>
          </div>
          {closeError && <p className="mt-2 text-base text-red-600 dark:text-red-500">{closeError}</p>}
        </div>
      )}
    </div>
  );
}
