import os
from dotenv import load_dotenv

# Charger les variables d'environnement (.env du backend ou local)
env_path = os.path.join(os.path.dirname(__file__), '..', 'backend', '.env')
if os.path.exists(env_path):
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

# Configuration PostgreSQL
DB_HOST = os.getenv('DB_HOST', '127.0.0.1')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_DATABASE = os.getenv('DB_DATABASE', 'verse_db')
DB_USERNAME = os.getenv('DB_USERNAME', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'root')

# Configuration WhatsApp API (GreenAPI / Twilio)
WHATSAPP_API_URL = os.getenv('WHATSAPP_API_URL', 'https://api.green-api.com')
WHATSAPP_INSTANCE = os.getenv('WHATSAPP_INSTANCE', '')
WHATSAPP_TOKEN = os.getenv('WHATSAPP_TOKEN', '')
