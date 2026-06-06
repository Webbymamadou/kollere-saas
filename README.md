# 🚖 Versé (Kollëré) - SaaS B2B de Gestion de Flotte VTC (Dakar)

Bienvenue sur le projet **Versé** (également appelé **Kollëré**), une plateforme web SaaS B2B hautement sécurisée conçue pour les propriétaires de flottes de taxis et VTC en Afrique de l'Ouest (Dakar, Sénégal). 

Ce document sert de guide d'onboarding complet pour installer, configurer et exécuter l'ensemble de l'architecture découplée avec **XAMPP**, **Node.js** et **Python**.

---

## 📐 Architecture Découplée

Pour garantir une clarté maximale, une sécurité robuste et une indépendance technologique, le projet est structuré en trois composants distincts sous le dossier racine `verse-saas/` :

```
verse-saas/
├── backend/            # API REST sécurisée - Laravel (PHP 8+)
├── frontend/           # Interface utilisateur Dashboard & Portail Mobile - React (Vite / Tailwind CSS)
└── automation/         # Tâches de fond asynchrones & Relances WhatsApp - Python (Scripts & venv)
```

---

## 🛠️ Configuration & Exécution du PHP

Puisque vous utilisez **XAMPP** sur Windows, PHP est déjà installé sur votre machine dans le dossier `C:\xampp\php\`. Vous avez **deux options** pour exécuter le PHP du backend Laravel :

### Option A : Lancer le serveur intégré de Laravel (Recommandé & Le plus simple)
Vous n'avez pas besoin de déplacer le projet ou de configurer Apache. Vous pouvez lancer le serveur léger de développement de Laravel directement depuis ce dossier en utilisant le fichier `php.exe` de XAMPP :

```bash
# Aller dans le dossier backend
cd backend

# Démarrer le serveur avec le PHP de XAMPP
C:\xampp\php\php.exe artisan serve
```
L'API Laravel sera instantanément disponible à l'adresse : `http://127.0.0.1:8000`.

### Option B : Utiliser le serveur Apache de XAMPP
Si vous souhaitez absolument servir l'API via le serveur Apache de XAMPP :

1. Ouvrez le fichier de configuration des hôtes virtuels de XAMPP (avec les droits administrateur) :
   `C:\xampp\apache\conf\extra\httpd-vhosts.conf`
2. Ajoutez la configuration suivante à la fin du fichier :
   ```apache
   <VirtualHost *:80>
       ServerAdmin webmaster@verse.local
       DocumentRoot "C:/Users/user/Documents/Demo/DevOps (Week)/Verse_SaaS/verse-saas/backend/public"
       ServerName api.verse.local
       ErrorLog "logs/verse-api-error.log"
       CustomLog "logs/verse-api-access.log" common
       <Directory "C:/Users/user/Documents/Demo/DevOps (Week)/Verse_SaaS/verse-saas/backend/public">
           Options Indexes FollowSymLinks MultiViews
           AllowOverride All
           Require all granted
       </Directory>
   </VirtualHost>
   ```
3. Ajoutez `127.0.0.1   api.verse.local` dans votre fichier Windows `C:\Windows\System32\drivers\etc\hosts`.
4. Ouvrez le **Panneau de configuration XAMPP** et cliquez sur **Start** à côté d'**Apache**. L'API est accessible à l'adresse : `http://api.verse.local`.

---

## 🚀 Guide de Démarrage Rapide

### 1. Le Frontend (React + Vite)
```bash
# Se rendre dans le dossier frontend
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement local
npm run dev
```

### 2. Le Backend (Laravel API)
```bash
# Se rendre dans le dossier backend
cd backend

# Copier le fichier de configuration locale
copy .env.example .env

# Installer les dépendances Laravel (exige Composer)
composer install

# Générer la clé d'application de sécurité
C:\xampp\php\php.exe artisan key:generate
```

### 3. L'Automatisation (Python)
```bash
# Se rendre dans le dossier automation
cd automation

# Activer l'environnement virtuel Python
.\venv\Scripts\activate

# Si les dépendances ne sont pas installées
pip install -r requirements.txt

# Lancer le script de relance manuellement
python relance_vtc.py
```
