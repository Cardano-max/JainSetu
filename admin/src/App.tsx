import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Events from './pages/Events';
import Donations from './pages/Donations';
import Businesses from './pages/Businesses';
import Matrimony from './pages/Matrimony';
import Tirth from './pages/Tirth';
import Store from './pages/Store';
import Jobs from './pages/Jobs';
import Posts from './pages/Posts';
import Announcements from './pages/Announcements';
import Settings from './pages/Settings';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/events" element={<Events />} />
                <Route path="/donations" element={<Donations />} />
                <Route path="/businesses" element={<Businesses />} />
                <Route path="/matrimony" element={<Matrimony />} />
                <Route path="/tirth" element={<Tirth />} />
                <Route path="/store" element={<Store />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/posts" element={<Posts />} />
                <Route path="/announcements" element={<Announcements />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
