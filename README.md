# Managenergy

Application web de suivi des consommations energetiques par utilisateur.

Le projet contient :
- un backend API en Django REST (`backend/`)
- un frontend React/Vite (`frontend/dashboard/`)

## Fonctionnalites principales

- Authentification (inscription, activation, connexion, deconnexion)
- CRUD des consommations
- Gestion des alertes par categorie
- Notifications (lues / non lues)
- Graphiques (jour/mois) avec filtres
- Generation de donnees de test via endpoint API

## Outils utilises

### Backend
- Python 3
- Django 6
- Django REST Framework
- django-cors-headers
- PostgreSQL (via `psycopg2-binary`)
- python-dotenv

### Frontend
- React 19
- Vite
- React Router
- Bootstrap 5
- Chart.js + react-chartjs-2

## Arborescence

- `backend/` : API Django + modeles + migrations
- `frontend/dashboard/` : application React

## Prerequis

- Python 3.11+
- Node.js 20+
- npm 10+
- PostgreSQL

## Installation

## 1) Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Copier la configuration d'environnement :

```bash
cp .env.template .env
```

Adapter les variables DB dans `backend/.env` :
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`

Appliquer les migrations :

```bash
python manage.py migrate
```

Lancer le backend :

```bash
python manage.py runserver
```

## 2) Frontend

```bash
cd frontend/dashboard
npm install
```

Creer/adapter `frontend/dashboard/.env` :

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Commandes utiles

### Backend
```bash
python manage.py makemigrations
python manage.py migrate
```

### Frontend
```bash
npm run dev
npm run build
npm run preview
npm run lint
```

