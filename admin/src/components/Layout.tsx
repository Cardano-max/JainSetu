import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  HeartIcon,
  BuildingStorefrontIcon,
  UserGroupIcon,
  MapPinIcon,
  ShoppingBagIcon,
  BriefcaseIcon,
  NewspaperIcon,
  MegaphoneIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Users', href: '/users', icon: UsersIcon },
  { name: 'Events', href: '/events', icon: CalendarIcon },
  { name: 'Donations', href: '/donations', icon: HeartIcon },
  { name: 'Businesses', href: '/businesses', icon: BuildingStorefrontIcon },
  { name: 'Matrimony', href: '/matrimony', icon: UserGroupIcon },
  { name: 'Tirth', href: '/tirth', icon: MapPinIcon },
  { name: 'Store', href: '/store', icon: ShoppingBagIcon },
  { name: 'Jobs', href: '/jobs', icon: BriefcaseIcon },
  { name: 'Posts', href: '/posts', icon: NewspaperIcon },
  { name: 'Announcements', href: '/announcements', icon: MegaphoneIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-saffron-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">J</span>
                </div>
                <span className="font-bold text-gray-900">JainSetu Admin</span>
              </div>
              <button onClick={() => setSidebarOpen(false)}>
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    isActive ? 'sidebar-link-active' : 'sidebar-link'
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-white border-r border-gray-200">
          <div className="flex items-center gap-2 p-4 border-b">
            <div className="w-10 h-10 bg-gradient-to-br from-saffron-400 to-saffron-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 block">JainSetu</span>
              <span className="text-xs text-gray-500">Admin Panel</span>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  isActive ? 'sidebar-link-active' : 'sidebar-link'
                }
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="font-medium text-gray-600">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => setSidebarOpen(true)}>
              <Bars3Icon className="w-6 h-6 text-gray-500" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-saffron-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">J</span>
              </div>
              <span className="font-bold text-gray-900">JainSetu</span>
            </div>
            <div className="w-6" />
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
