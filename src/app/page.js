export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <main className="mx-auto max-w-6xl px-6 py-12 text-[17px] sm:text-[18px]">
        {/* Encabezado */}
        <section className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Bienvenido, Administrador
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Panel de control de Habitah. Gestiona edificios, cobros y tickets.
          </p>
        </section>

        {/* Acciones rápidas */}
        <section className="mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <a
              href="#"
              className="rounded-lg border border-gray-200 dark:border-gray-800 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
            >
              Edificios
            </a>
            <a
              href="/inquilinos"
              className="rounded-lg border border-gray-200 dark:border-gray-800 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
            >
              Inquilinos
            </a>
            <a
              href="/cobros"
              className="rounded-lg border border-gray-200 dark:border-gray-800 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
            >
              Cobros
            </a>
            <a
              href="/tickets"
              className="rounded-lg border border-gray-200 dark:border-gray-800 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
            >
              Tickets
            </a>
            <a
              href="/notificaciones"
              className="rounded-lg border border-gray-200 dark:border-gray-800 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
            >
              Notificaciones
            </a>
          </div>
        </section>

        {/* KPIs */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <p className="text-base text-gray-500 dark:text-gray-400">Rentas cobradas (mes)</p>
              <p className="mt-2 text-2xl font-semibold">$245,320</p>
              <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">+8.2% vs. mes anterior</p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <p className="text-base text-gray-500 dark:text-gray-400">Tickets abiertos</p>
              <p className="mt-2 text-2xl font-semibold">23</p>
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">+3 nuevos hoy</p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <p className="text-base text-gray-500 dark:text-gray-400">Pagos pendientes</p>
              <p className="mt-2 text-2xl font-semibold">41</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Vencen esta semana</p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <p className="text-base text-gray-500 dark:text-gray-400">Notificaciones programadas</p>
              <p className="mt-2 text-2xl font-semibold">8</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Por edificio</p>
            </div>
          </div>
        </section>

        {/* Placeholder de sesión (Firebase) */}
        <section className="mt-12">
          <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-800 p-5">
            <p className="text-base text-gray-600 dark:text-gray-400">
              Sesión: pendiente de integrar con Firebase Auth.
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
              Mostraremos aquí el nombre del administrador y último inicio de sesión.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
