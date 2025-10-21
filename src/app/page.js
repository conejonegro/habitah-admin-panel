import {
  BuildingOfficeIcon,
  UserGroupIcon,
  CreditCardIcon,
  TicketIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-semibold text-gray-900">
              Menu
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <BellIcon className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </button>
            {/* User Avatar */}
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              <img 
                src="https://randomuser.me/api/portraits/women/44.jpg" 
                alt="Usuario" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <a
              href="/edificios"
              className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center"
            >
              <BuildingOfficeIcon className="h-8 w-8 text-gray-700 mb-2" />
              <span className="text-sm font-medium text-gray-900">Edificios</span>
            </a>
            <a
              href="/inquilinos"
              className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center"
            >
              <UserGroupIcon className="h-8 w-8 text-gray-700 mb-2" />
              <span className="text-sm font-medium text-gray-900">Inquilinos</span>
            </a>
            <a
              href="/cobros"
              className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center"
            >
              <CreditCardIcon className="h-8 w-8 text-gray-700 mb-2" />
              <span className="text-sm font-medium text-gray-900">Cobros</span>
            </a>
            <a
              href="/tickets"
              className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center"
            >
              <TicketIcon className="h-8 w-8 text-gray-700 mb-2" />
              <span className="text-sm font-medium text-gray-900">Tickets</span>
            </a>
            <a
              href="/notificaciones"
              className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center"
            >
              <BellIcon className="h-8 w-8 text-gray-700 mb-2" />
              <span className="text-sm font-medium text-gray-900">Notificaciones</span>
            </a>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-12">
          <h2 className="text-xl font-medium text-gray-900 mb-6">Resumen del mes</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-900 tracking-tight leading-none">Rentas cobradas</h3>
                <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <p className="text-2xl font-semibold text-gray-900 mb-1">$245,320</p>
              <p className="text-sm text-green-600">+8.2% vs. mes anterior</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-900 tracking-tight leading-none">Rentas pendientes</h3>
                <div className="w-8 h-8 bg-yellow-50 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                </div>
              </div>
              <p className="text-2xl font-semibold text-gray-900 mb-1">$120,000</p>
              <p className="text-sm text-yellow-600">14 días del mes • 7 días vencidas</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-900 tracking-tight leading-none">Tickets abiertos</h3>
                <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
              </div>
              <p className="text-2xl font-semibold text-gray-900 mb-1">23</p>
              <p className="text-sm text-red-600">+3 nuevos hoy</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-900 tracking-tight leading-none">Pagos pendientes</h3>
                <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                </div>
              </div>
              <p className="text-2xl font-semibold text-gray-900 mb-1">41</p>
              <p className="text-sm text-gray-500">Vencen esta semana</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-900 tracking-tight leading-none">Notificaciones</h3>
                <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
              </div>
              <p className="text-2xl font-semibold text-gray-900 mb-1">8</p>
              <p className="text-sm text-gray-500">Programadas por edificio</p>
            </div>
          </div>
        </div>

        {/* Auth Status */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Autenticación pendiente
              </h3>
              <p className="text-sm text-gray-600">
                Integración con Firebase Auth en desarrollo. Aquí se mostrará la información del administrador.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}