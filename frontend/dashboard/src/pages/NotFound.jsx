import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container py-5">
      <div className="card border-0 shadow-sm">
        <div className="card-body p-5 text-center">
          <h1 className="h4 fw-bold">Page introuvable</h1>
          <p className="text-muted">Retournez a l'accueil pour continuer.</p>
          <Link to="/" className="btn btn-primary mt-2">
            Aller a l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
