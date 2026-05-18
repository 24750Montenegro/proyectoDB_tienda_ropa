import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { DashboardPage } from './pages/DashboardPage.jsx'
import { ProductsPage } from './pages/ProductsPage.jsx'
import { ProductDetailPage } from './pages/ProductDetailPage.jsx'
import { CategoriesPage } from './pages/CategoriesPage.jsx'
import { SalesPage } from './pages/SalesPage.jsx'
import { SaleDetailPage } from './pages/SaleDetailPage.jsx'
import { ReportsPage } from './pages/ReportsPage.jsx'
import { UsersPage } from './pages/UsersPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="productos" element={<ProductsPage />} />
        <Route path="productos/:id" element={<ProductDetailPage />} />
        <Route
          path="categorias"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'EMPLEADO']}>
              <CategoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="ventas"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'EMPLEADO', 'AUDITOR']}>
              <SalesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="ventas/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'EMPLEADO', 'AUDITOR']}>
              <SaleDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="reportes"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'EMPLEADO', 'AUDITOR']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="usuarios"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
