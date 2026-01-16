## FitHub - WebApplication2025 
Applicazione web per la gestione di allenamenti, piani fitness e community.
## Come Avviare il Progetto
## ⚙️ Variabili di Ambiente 
Per agevolare la configurazione, sono state utilizzate

⚠️ La Gemini API KEY è necessaria per f# Main Application Configuration
spring.application.name=FitHub-Spring
| Variabile | Descrizione | Default |
|-----------|-------------|---------|
| DB_URL | URL JDBC del database PostgreSQL | jdbc:postgresql://localhost:5432/FitHub |
| DB_USERNAME | Username del database | postgres |
| DB_PASSWORD | Password del database | abacus |
| GEMINI_API_KEY | API Key per Google Gemini AI | dummy |
### Database
usare il file dump in FitHub-db
### Frontend (Angular)
```bash
cd FitHub-ng
npm install
npm install --save-dev @types/leaflet
```
## Test
Abbiamo creato alcuni utenti di test per facilitare il test del sistema.
| Email | Password | descrizione |
|-------|----------|-------|
| antonio@fithub.it | pass123 | utente normale |
| alessandro@fithub.it | pass123 | utente admin |
| irene@fithub.it | pass123 | utente normale |
| simone@fithub.it | pass123 | utente bannato |
Per registrarsi come amministratore abbiamo messo un button in fondo alla home
