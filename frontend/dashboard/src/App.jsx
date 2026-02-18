import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import { DataProvider } from './contexts/DataContext.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import MinimalLayout from './layouts/MinimalLayout.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Consumptions from './pages/Consumptions.jsx'
import ConsumptionForm from './pages/ConsumptionForm.jsx'
import Charts from './pages/Charts.jsx'
import Notifications from './pages/Notifications.jsx'
import NotFound from './pages/NotFound.jsx'

function ProtectedRoute({ children }) {
  const { user, authChecked } = useAuth()
  if (!authChecked) {
    return (
      <div className="container py-5">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">Chargement...</div>
        </div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MinimalLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/connexion" element={<Navigate to="/login" replace />} />
              <Route path="/register" element={<Register />} />
              <Route path="/inscription" element={<Navigate to="/register" replace />} />
            </Route>
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/consommations" element={<Consumptions />} />
              <Route path="/consommations/ajouter" element={<ConsumptionForm />} />
              <Route path="/consommations/:id/modifier" element={<ConsumptionForm />} />
              <Route path="/graphiques" element={<Charts />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  )
}

export default App
