import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-body p-5">
              <div className="badge bg-info text-dark mb-3">Managenergy</div>
              <h1 className="display-6 fw-bold">Suivez vos consommations</h1>
              <p className="text-muted mt-3">
                Centralisez les donnees, gerez vos consommations et analysez
                l'evolution avec des graphiques clairs.
              </p>
              <div className="d-flex gap-3 mt-4 flex-wrap">
                {user ? (
                  <>
                    <Link className="btn btn-primary" to="/consommations">
                      Acceder au dashboard
                    </Link>
                    <Link className="btn btn-outline" to="/graphiques">
                      Voir les graphiques
                    </Link>
                  </>
                ) : (
                  <>
                    <Link className="btn btn-primary" to="/login">
                      Se connecter
                    </Link>
                    <Link className="btn btn-outline" to="/register">
                      S'inscrire
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
