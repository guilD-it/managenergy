import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login({ email: email.trim(), password })
    setLoading(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    navigate('/consommations')
  }

  return (
    <div className="auth-page d-flex align-items-center justify-content-center flex-grow-1">
      <div className="card auth-card shadow-sm border-0">
        <div className="card-body p-4">
          <h2 className="h4 fw-bold mb-3">Connexion</h2>
          <p className="text-muted small">
            Accedez a votre espace pour gerer vos consommations.
          </p>
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Mot de passe</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error ? <div className="alert alert-danger py-2">{error}</div> : null}
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
          <div className="small text-muted mt-3">
            Pas de compte ? <Link to="/register">Creer un compte</Link>
          </div>
          <div className="small mt-2">
            <Link to="/">Retour a l'accueil</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
