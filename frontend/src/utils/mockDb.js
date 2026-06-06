const initialVehicles = [
  { 
    id: 'v1', 
    license_plate: 'DK-3421-A', 
    brand_model: 'Peugeot 301', 
    current_mileage: 48900, 
    last_oil_change_mileage: 44100, 
    status: 'active', 
    driver_id: 'd1',
    vehicle_image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80' // Silver sedan
  },
  { 
    id: 'v2', 
    license_plate: 'DK-8854-B', 
    brand_model: 'Toyota Corolla', 
    current_mileage: 125600, 
    last_oil_change_mileage: 124900, 
    status: 'active', 
    driver_id: 'd2',
    vehicle_image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&auto=format&fit=crop&q=80' // Blue sedan
  },
  { 
    id: 'v3', 
    license_plate: 'DK-9921-C', 
    brand_model: 'Hyundai Accent', 
    current_mileage: 83200, 
    last_oil_change_mileage: 78500, 
    status: 'maintenance', 
    driver_id: 'd3',
    vehicle_image: 'https://images.unsplash.com/photo-1605558158382-95993a8e9725?w=600&auto=format&fit=crop&q=80' // White sedan
  }
];

const initialDrivers = [
  { id: 'd1', name: 'Moussa Diop', phone: '771234567', pin_code: '1234', status: 'active', vehicle_id: 'v1', magic_token: 'mt_moussa_8a7b9c2d3e4f', daily_income: 42500 },
  { id: 'd2', name: 'Amadou Sow', phone: '779876543', pin_code: '5678', status: 'active', vehicle_id: 'v2', magic_token: 'mt_amadou_1e2f3g4h5i6j', daily_income: 38000 },
  { id: 'd3', name: 'Ibrahima Ndiaye', phone: '764532109', pin_code: '0000', status: 'active', vehicle_id: 'v3', magic_token: 'mt_ibrahima_9x8y7z6w5v4u', daily_income: 0 }
];

const initialPayments = [
  { id: 'p1', vehicle_id: 'v1', driver_name: 'Moussa Diop', date: '2026-06-05', amount: 15000, status: 'approved', transaction_reference: 'WAVE_TR_98273A', receipt_image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400', submitted_at: '2026-06-05 21:05', odometer: 48780 },
  { id: 'p2', vehicle_id: 'v2', driver_name: 'Amadou Sow', date: '2026-06-05', amount: 15000, status: 'approved', transaction_reference: 'WAVE_TR_88231B', receipt_image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400', submitted_at: '2026-06-05 21:12', odometer: 125480 }
];

const initialIncidents = [
  { id: 'i1', driver_name: 'Ibrahima Ndiaye', vehicle_plate: 'DK-9921-C', type: 'engine', description: 'Voyant moteur allumé et perte de puissance', date: '2026-06-05 14:30', status: 'pending' }
];

const initialAudits = [
  { id: 'au1', date: '2026-06-05 07:12', type: 'login', driver_name: 'Moussa Diop', details: 'Connexion réussie via Magic Link' },
  { id: 'au2', date: '2026-06-05 21:05', type: 'payment_declared', driver_name: 'Moussa Diop', details: 'Déclaration versement 15,000 FCFA (Wave)' }
];

export const getFromDb = (key, fallback) => {
  const data = localStorage.getItem(`verse_${key}`);
  if (data) return JSON.parse(data);
  
  // Use correct initial values as robust fallbacks to prevent empty arrays from poisoning the database
  const fallbacks = {
    vehicles: initialVehicles,
    drivers: initialDrivers,
    payments: initialPayments,
    incidents: initialIncidents,
    audits: initialAudits
  };
  
  const defaultFallback = fallbacks[key] !== undefined ? fallbacks[key] : fallback;
  localStorage.setItem(`verse_${key}`, JSON.stringify(defaultFallback));
  return defaultFallback;
};

export const saveToDb = (key, data) => {
  localStorage.setItem(`verse_${key}`, JSON.stringify(data));
};

export const initDb = () => {
  getFromDb('vehicles', initialVehicles);
  getFromDb('drivers', initialDrivers);
  getFromDb('payments', initialPayments);
  getFromDb('incidents', initialIncidents);
  getFromDb('audits', initialAudits);
};

// Eagerly initialize the database on module import to ensure it is populated
initDb();
