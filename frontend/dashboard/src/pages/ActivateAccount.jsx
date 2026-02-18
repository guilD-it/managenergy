import { useState } from 'react'
import { Link } from 'react-router-dom'
import { activateAccount } from '../api/energyApi.js'

export default function ActivateAccount() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await activateAccount({ email: email.trim() })
      setSuccess('Compte active. Vous pouvez vous connecter.')
    } catch (err) {
      setError(err.data?.detail || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page d-flex align-items-center justify-content-center flex-grow-1">
      <div className="card auth-card shadow-sm border-0">
        <div className="card-body p-4">
          <h2 className="h4 fw-bold mb-3">Activation du compte</h2>
          <p className="text-muted small">
            Entrez l'adresse email pour activer le compte.
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
            {error ? <div className="alert alert-danger py-2">{error}</div> : null}
            {success ? (
              <div className="alert alert-success py-2">{success}</div>
            ) : null}
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? 'Activation...' : 'Activer le compte'}
            </button>
          </form>
          <div className="small mt-3">
            <Link to="/login">Retour a la connexion</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
