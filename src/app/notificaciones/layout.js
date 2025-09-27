export const metadata = {
  title: "Notificaciones | Habitah Admin",
};

export default function NotificacionesLayout({ children }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Notificaciones</h1>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
            Envía avisos a inquilinos por edificio o segmento.
          </p>
        </div>
        <a
          href="/notificaciones/nueva"
          className="inline-flex items-center rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-4 py-2 text-base font-medium hover:opacity-90"
        >
          Nueva notificación
        </a>
      </header>
      {children}
    </section>
  );
}
