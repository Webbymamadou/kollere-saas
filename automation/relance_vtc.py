import sys
import requests
import pg8000
from datetime import date
import config

def connect_db():
    try:
        # pg8000 exige que le port soit un entier
        conn = pg8000.connect(
            host=config.DB_HOST,
            port=int(config.DB_PORT),
            database=config.DB_DATABASE,
            user=config.DB_USERNAME,
            password=config.DB_PASSWORD
        )
        return conn
    except Exception as e:
        print(f"Erreur de connexion à la base PostgreSQL : {e}")
        sys.exit(1)

def get_late_drivers(conn):
    today = date.today().isoformat()
    query = """
        SELECT d.name, d.phone, v.license_plate
        FROM drivers d
        JOIN vehicles v ON d.vehicle_id = v.id
        WHERE d.status = 'active'
          AND NOT EXISTS (
              SELECT 1 FROM payments p
              WHERE p.vehicle_id = v.id
                AND p.payment_date = %s
          );
    """
    # pg8000 renvoie un curseur standard
    cur = conn.cursor()
    try:
        cur.execute(query, (today,))
        return cur.fetchall()
    finally:
        cur.close()

def send_whatsapp_reminder(name, phone, license_plate):
    # Envoi de la relance via GreenAPI
    url = f"{config.WHATSAPP_API_URL}/waInstance{config.WHATSAPP_INSTANCE}/sendMessage/{config.WHATSAPP_TOKEN}"
    message = (
        f"Bonjour {name},\n\n"
        f"Ceci est un rappel automatique de Versé. Nous n'avons pas reçu votre déclaration de versement "
        f"du jour pour le véhicule {license_plate}.\n\n"
        f"Veuillez soumettre vos kilomètres et votre reçu Wave/Orange Money dès que possible en vous connectant ici :\n"
        f"http://verse.local/driver/login\n\n"
        f"Merci et bonne soirée !"
    )
    
    payload = {
        "chatId": f"{phone}@c.us",
        "message": message
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        if response.status_code == 200:
            print(f"Relance WhatsApp envoyée avec succès à {name} ({phone})")
        else:
            print(f"Échec de l'envoi WhatsApp à {name} : {response.text}")
    except Exception as e:
        print(f"Erreur d'appel API WhatsApp pour {name} : {e}")

def main():
    print("Démarrage du script de relance des chauffeurs en retard à 22h00...")
    conn = connect_db()
    try:
        late_drivers = get_late_drivers(conn)
        if not late_drivers:
            print("Tous les chauffeurs ont effectué leur déclaration aujourd'hui. Aucune relance à faire.")
            return
            
        for name, phone, plate in late_drivers:
            send_whatsapp_reminder(name, phone, plate)
    finally:
        conn.close()
        print("Fin du script de relance.")

if __name__ == "__main__":
    main()
