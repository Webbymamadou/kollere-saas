import sys
import requests
import pg8000
import config

def connect_db():
    try:
        conn = pg8000.connect(
            host=config.DB_HOST,
            port=int(config.DB_PORT),
            database=config.DB_DATABASE,
            user=config.DB_USERNAME,
            password=config.DB_PASSWORD
        )
        return conn
    except Exception as e:
        print(f"Erreur de connexion PostgreSQL : {e}")
        sys.exit(1)

def check_oil_changes(conn):
    query = """
        SELECT v.id, v.license_plate, v.brand_model, v.current_mileage, v.last_oil_change_mileage, u.phone, u.name
        FROM vehicles v
        JOIN users u ON v.user_id = u.id
        WHERE (v.current_mileage - v.last_oil_change_mileage) >= 4500;
    """
    cur = conn.cursor()
    try:
        cur.execute(query)
        return cur.fetchall()
    finally:
        cur.close()

def send_maintenance_alert(owner_name, owner_phone, license_plate, brand_model, current_mileage, last_change):
    distance_driven = current_mileage - last_change
    url = f"{config.WHATSAPP_API_URL}/waInstance{config.WHATSAPP_INSTANCE}/sendMessage/{config.WHATSAPP_TOKEN}"
    
    message = (
        f"Bonjour {owner_name},\n\n"
        f"⚠️ ALERTE ENTRETIEN VERSÉ ⚠️\n\n"
        f"Votre véhicule {brand_model} ({license_plate}) a parcouru {distance_driven} km depuis sa dernière vidange.\n"
        f"Kilométrage actuel : {current_mileage} km.\n"
        f"Dernière vidange à : {last_change} km.\n\n"
        f"Veuillez planifier une vidange rapidement afin d'éviter d'endommager le moteur de votre actif.\n\n"
        f"Merci pour votre confiance !"
    )
    
    payload = {
        "chatId": f"{owner_phone}@c.us",
        "message": message
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        if response.status_code == 200:
            print(f"Alerte maintenance envoyée avec succès à {owner_name} ({owner_phone}) pour {license_plate}")
        else:
            print(f"Échec de l'envoi de l'alerte à {owner_name} : {response.text}")
    except Exception as e:
        print(f"Erreur d'appel API WhatsApp pour {owner_name} : {e}")

def main():
    print("Démarrage du script quotidien d'analyse d'usure kilométrique...")
    conn = connect_db()
    try:
        vehicles_to_alert = check_oil_changes(conn)
        if not vehicles_to_alert:
            print("Aucun véhicule ne nécessite d'alerte vidange aujourd'hui.")
            return
            
        for _, plate, model, current, last_change, phone, name in vehicles_to_alert:
            send_maintenance_alert(name, phone, plate, model, current, last_change)
    finally:
        conn.close()
        print("Fin du script d'analyse.")

if __name__ == "__main__":
    main()
