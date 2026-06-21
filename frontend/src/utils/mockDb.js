const initialVehicles = [];

const initialDrivers = [];

const initialPayments = [];

const initialIncidents = [];

const initialDocuments = [];

const initialAudits = [];

export const getFromDb = (key, fallback) => {
  const data = localStorage.getItem(`verse_${key}`);
  if (data) return JSON.parse(data);
  
  // Utiliser les valeurs initiales correctes comme solutions de repli robustes pour éviter que des tableaux vides ne corrompent la base de données
  const fallbacks = {
    vehicles: initialVehicles,
    drivers: initialDrivers,
    payments: initialPayments,
    incidents: initialIncidents,
    audits: initialAudits,
    documents: initialDocuments
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
  getFromDb('documents', initialDocuments);
};

// Initialiser la base de données immédiatement lors de l'importation du module pour s'assurer qu'elle est remplie
initDb();
