import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

const validatePassword = (value) => {
  if (!value || value.length < 8) {
    return 'Le mot de passe doit contenir au moins 8 caracteres.'
  }
  if (!/[A-Z]/.test(value)) {
    return 'Le mot de passe doit contenir au moins une majuscule.'
  }
  if (!/[0-9]/.test(value)) {
    return 'Le mot de passe doit contenir au moins un chiffre.'
  }
  return ''
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [confirmError, setConfirmError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const pwdError = validatePassword(password)
    if (pwdError) {
      setPasswordError(pwdError)
      return
    }
    if (password !== confirm) {
      setConfirmError('Les mots de passe ne correspondent pas.')
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
    setTimeout(() => navigate('/activate'), 1200)
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
                onChange={(e) => {
                  const next = e.target.value
                  setPassword(next)
                  setPasswordError(validatePassword(next))
                  if (confirm && next !== confirm) {
                    setConfirmError('Les mots de passe ne correspondent pas.')
                  } else {
                    setConfirmError('')
                  }
                }}
                required
              />
              {passwordError ? (
                <div className="text-danger small mt-1">{passwordError}</div>
              ) : null}
            </div>
            <div className="mb-3">
              <label className="form-label">Confirmer le mot de passe</label>
              <input
                type="password"
                className="form-control"
                value={confirm}
                onChange={(e) => {
                  const next = e.target.value
                  setConfirm(next)
                  if (password && next !== password) {
                    setConfirmError('Les mots de passe ne correspondent pas.')
                  } else {
                    setConfirmError('')
                  }
                }}
                required
              />
              {confirmError ? (
                <div className="text-danger small mt-1">{confirmError}</div>
              ) : null}
            </div>
            {error ? <div className="alert alert-danger py-2">{error}</div> : null}
            {success ? <div className="alert alert-success py-2">{success}</div> : null}
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading || Boolean(passwordError || confirmError)}
            >
              {loading ? 'Creation...' : 'Creer le compte'}
            </button>
          </form>
          <div className="small text-muted mt-3">
            Deja un compte ? <Link to="/login">Se connecter</Link>
          </div>
          <div className="small mt-2">
            <Link to="/activate">Activer un compte</Link>
          </div>
          <div className="small mt-2">
            <Link to="/">Retour a l'accueil</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
