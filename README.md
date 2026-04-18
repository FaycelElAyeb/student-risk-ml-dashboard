# Student Risk ML Dashboard

Application fullstack fonctionnelle avec :
- **Frontend** : React + Vite
- **Backend** : Node.js + Express
- **API ML** : Python FastAPI + scikit-learn
- **Données** : simulées (synthetic data)
- **Fonctionnalités** : prédiction du risque étudiant, couleurs automatiques, score de probabilité, alertes prioritaires

## 1) Structure

```text
student-risk-ml-dashboard/
├── frontend/
├── backend/
├── ml-service/
└── README.md
```

## 2) Lancer en local

### ML API
```bash
cd ml-service
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Backend
```bash
cd backend
npm install
cp .env.example .env        # Windows PowerShell: copy .env.example .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env        # Windows PowerShell: copy .env.example .env
npm run dev
```

## 3) URLs

- Frontend : `http://localhost:5173`
- Backend : `http://localhost:4000/api/dashboard`
- ML API : `http://localhost:8000/docs`

## 4) Ce que fait le projet

- génère une cohorte d'étudiants simulés
- envoie chaque profil au modèle ML
- récupère :
  - niveau de risque (`Low`, `Medium`, `High`)
  - confiance (%)
  - probabilités détaillées
- affiche le tout dans un dashboard moderne

## 5) Variables utilisées

### Frontend `.env`
```env
VITE_API_URL=http://localhost:4000/api
```

### Backend `.env`
```env
PORT=4000
ML_API_URL=http://localhost:8000
```

## 6) Déploiement AWS simple

Tu peux déployer sur une seule EC2 avec :
- Nginx pour servir le frontend buildé
- Node.js pour le backend
- Uvicorn pour l'API ML
- PM2 pour garder les services actifs

### Build frontend
```bash
cd frontend
npm install
npm run build
```

### Exemples PM2
```bash
pm2 start index.js --name backend --cwd /home/ubuntu/student-risk-ml-dashboard/backend
pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name ml-api --cwd /home/ubuntu/student-risk-ml-dashboard/ml-service
pm2 save
```

## 7) Améliorations possibles

- brancher une vraie base de données
- remplacer Logistic Regression par RandomForest
- sauvegarder le modèle entraîné
- ajouter authentification admin
- exporter les rapports en PDF/Excel
