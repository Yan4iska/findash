import { Navigate, createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout/Layout.js';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute.js';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage.js';
import { LoginPage } from './pages/auth/LoginPage.js';
import { RegisterPage } from './pages/auth/RegisterPage.js';
import { CategoriesPage } from './pages/categories/CategoriesPage.js';
import { DashboardPage } from './pages/dashboard/DashboardPage.js';
import { ForecastPage } from './pages/forecast/ForecastPage.js';
import { TransactionFormPage } from './pages/transactions/TransactionFormPage.js';
import { TransactionsPage } from './pages/transactions/TransactionsPage.js';
import { useAuthStore } from './stores/authStore.js';

function RootRedirect() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/transactions', element: <TransactionsPage /> },
      { path: '/transactions/new', element: <TransactionFormPage /> },
      { path: '/transactions/:id/edit', element: <TransactionFormPage /> },
      { path: '/categories', element: <CategoriesPage /> },
      { path: '/analytics', element: <AnalyticsPage /> },
      { path: '/forecast', element: <ForecastPage /> },
    ],
  },
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '*',
    element: <RootRedirect />,
  },
]);
