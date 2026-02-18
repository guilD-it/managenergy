import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    const result = await register({ email: email.trim(), password })
    setLoading(false)

    if (!result.ok) {
      setError(result.message)
      return
    }

    setSuccess(result.message)
    setTimeout(() => navigate('/login'), 1200)
  }

  return (
    <div className="auth-page d-flex align-items-center justify-content-center flex-grow-1">
      <div className="card auth-card shadow-sm border-0">
        <div className="card-body p-4">
          <h2 className="h4 fw-bold mb-3">Inscription</h2>
          <p className="text-muted small">
            Creez votre compte pour commencer le suivi.
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
            <div className="mb-3">
              <label className="form-label">Confirmer le mot de passe</label>
              <input
                type="password"
                className="form-control"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            {error ? <div className="alert alert-danger py-2">{error}</div> : null}
            {success ? <div className="alert alert-success py-2">{success}</div> : null}
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? 'Creation...' : 'Creer le compte'}
            </button>
          </form>
          <div className="small text-muted mt-3">
            Deja un compte ? <Link to="/login">Se connecter</Link>
          </div>
          <div className="small mt-2">
            <Link to="/">Retour a l'accueil</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
