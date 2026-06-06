import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  AlertCircle, 
  CheckCircle, 
  Home, 
  FileText, 
  AlertTriangle, 
  ShieldCheck, 
  Volume2, 
  Mic, 
  Square, 
  Play, 
  Trash2, 
  Zap, 
  Sun, 
  Moon,
  Settings,
  MapPin,
  BatteryCharging,
  ClipboardList,
  X,
  Activity
} from 'lucide-react';
import { getFromDb, saveToDb } from '../utils/mockDb';

// Pure helper functions declared outside the render cycle to comply with React hook purity rules
const generateUniqueId = (prefix) => {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

const getFormattedDateTime = () => {
  const now = new Date();
  return now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR').substring(0, 5);
};

const getIsoTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

const generateMockReference = (method) => {
  const randVal = Math.floor(100000 + Math.random() * 900000).toString(36).toUpperCase();
  if (method === 'cash') return `CASH_REC_${randVal}`;
  if (method === 'wave') return `WAVE_TR_${randVal}`;
  return `OM_TX_${randVal}`;
};

export default function DriverPortal() {
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'declare', 'chat', 'sos', 'history'
  
  const [driver, setDriver] = useState(() => {
    const driverId = localStorage.getItem('verse_auth_driver_id');
    const role = localStorage.getItem('verse_auth_role');
    if (role !== 'driver' || !driverId) return null;
    const drivers = getFromDb('drivers', []);
    return drivers.find(d => d.id === driverId) || null;
  });

  const [vehicle, setVehicle] = useState(() => {
    const driverId = localStorage.getItem('verse_auth_driver_id');
    const role = localStorage.getItem('verse_auth_role');
    if (role !== 'driver' || !driverId) return null;
    const drivers = getFromDb('drivers', []);
    const foundDriver = drivers.find(d => d.id === driverId);
    if (!foundDriver) return null;
    const vehicles = getFromDb('vehicles', []);
    return vehicles.find(v => v.id === foundDriver.vehicle_id) || null;
  });

  const [payments, setPayments] = useState(() => getFromDb('payments', []));
  const [incidents, setIncidents] = useState(() => getFromDb('incidents', []));
  const [audits, setAudits] = useState(() => getFromDb('audits', []));
  
  // Custom styling settings
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();

  // Form states (Declaration)
  const [mileage, setMileage] = useState('');
  const [amount, setAmount] = useState('15000');
  const [paymentMethod, setPaymentMethod] = useState('wave'); // 'wave', 'orange_money', 'cash'
  const [ref, setRef] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [isReceiptSelected, setIsReceiptSelected] = useState(false);
  const [error, setError] = useState('');
  
  // Income update state
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [customIncomeInput, setCustomIncomeInput] = useState('');
  
  // Confirmation step before final submission
  const [showConfirmRecap, setShowConfirmRecap] = useState(false);
  const [successOverlay, setSuccessOverlay] = useState(false);

  // Simulated Voice Recorder states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState(null); // mock audio blob
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Dynamic GPS simulation states
  const [gpsActive, setGpsActive] = useState(true);
  const [gpsMode, setGpsMode] = useState('performance'); // 'performance' or 'eco'
  const [distanceTraveled, setDistanceTraveled] = useState(124.5);
  const [gpsPositionText, setGpsPositionText] = useState('Dakar Plateau');
  const [gpsCoordinates, setGpsCoordinates] = useState({ lat: 14.6928, lng: -17.4467 });
  const [lastGpsTime, setLastGpsTime] = useState('À l\'instant');

  // In-App real-time toast notifications
  const [toastNotification, setToastNotification] = useState(null);
  
  // Notification Drawer state
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [mockNotifications, setMockNotifications] = useState([
    { id: 1, title: '🔧 Maintenance requise', message: 'Vidange moteur à prévoir dans 500 km.', time: 'Il y a 2h', type: 'warning', read: false },
    { id: 2, title: '💰 Versement validé', message: 'Votre dépôt de 15 000 FCFA du 2026-06-05 a été approuvé.', time: 'Hier', type: 'success', read: false }
  ]);

  // Dev Tools panel state
  const [showDevPanel, setShowDevPanel] = useState(false);

  // Speech helper
  const [voiceLang, setVoiceLang] = useState('fr'); // 'fr' or 'wo'

  // Notification helper declared early for useEffect dependencies
  const addNewNotification = (title, message, type = 'info') => {
    const newNotif = {
      id: generateUniqueId('notif'),
      title,
      message,
      time: 'À l\'instant',
      type,
      read: false
    };
    setMockNotifications(prev => [newNotif, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  // Pre-fill mileage on tab focus or change (deferred setState to prevent cascading render warnings)
  useEffect(() => {
    if (vehicle) {
      const timer = setTimeout(() => {
        setMileage((vehicle.current_mileage + 120).toString());
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [vehicle, activeTab]);

  // Toast helper
  const triggerToast = (title, message, iconType = 'info') => {
    setToastNotification({ title, message, type: iconType });
    setTimeout(() => setToastNotification(null), 5000);
  };

  // Redirect to login if auth is missing
  useEffect(() => {
    const driverId = localStorage.getItem('verse_auth_driver_id');
    const role = localStorage.getItem('verse_auth_role');

    if (role !== 'driver' || !driverId) {
      navigate('/driver/login');
    }
  }, [navigate]);

  // Audio recording timer simulation
  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      setRecordingSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  // Dynamic GPS Tracker Simulator (Ticks distance and coordinates)
  useEffect(() => {
    if (!gpsActive) return;

    // Tick coordinates and distance every 10 seconds
    const intervalTime = gpsMode === 'performance' ? 10000 : 20000;
    
    const dakarStops = [
      { name: 'Dakar Plateau', lat: 14.6928, lng: -17.4467 },
      { name: 'Médina', lat: 14.6881, lng: -17.4533 },
      { name: 'Mermoz', lat: 14.7112, lng: -17.4761 },
      { name: 'Ouakam', lat: 14.7231, lng: -17.4892 },
      { name: 'Les Almadies', lat: 14.7478, lng: -17.5255 },
      { name: 'Grand Yoff', lat: 14.7350, lng: -17.4502 },
      { name: 'Pikine', lat: 14.7523, lng: -17.3895 }
    ];

    let stopIndex = 0;

    const interval = setInterval(() => {
      // Tick distance slightly
      setDistanceTraveled(prev => parseFloat((prev + 0.15).toFixed(2)));
      
      // Rotate stops
      stopIndex = (stopIndex + 1) % dakarStops.length;
      const nextStop = dakarStops[stopIndex];
      setGpsPositionText(nextStop.name);
      setGpsCoordinates({ lat: nextStop.lat, lng: nextStop.lng });
      
      const now = new Date();
      setLastGpsTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`);
      
      // Update local storage mileage dynamically in vehicle to simulate travel
      if (vehicle) {
        const vehiclesList = getFromDb('vehicles', []);
        const updatedVehiclesList = vehiclesList.map(v => {
          if (v.id === vehicle.id) {
            const newMil = v.current_mileage + 1;
            return { ...v, current_mileage: newMil };
          }
          return v;
        });
        saveToDb('vehicles', updatedVehiclesList);
        
        // Find current matching vehicle to sync view
        const currentVeh = updatedVehiclesList.find(v => v.id === vehicle.id);
        if (currentVeh) setVehicle(currentVeh);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [gpsActive, gpsMode, vehicle]);

  // Listen for storage updates (notifications, approvals)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'verse_payments' && driver) {
        try {
          const newVal = JSON.parse(e.newValue || '[]');
          const myLatestPayment = newVal.find(p => p.driver_name === driver.name);
          if (myLatestPayment) {
            setPayments(newVal);
            if (myLatestPayment.status === 'approved') {
              triggerToast("💰 Versement Validé !", `Le propriétaire a approuvé votre dépôt de ${myLatestPayment.amount.toLocaleString()} FCFA.`, 'success');
              // Add real-time notification
              addNewNotification('💰 Versement validé', `Votre dépôt de ${myLatestPayment.amount.toLocaleString()} FCFA a été validé.`);
            } else if (myLatestPayment.status === 'rejected') {
              triggerToast("❌ Versement Rejeté !", `Veuillez contacter le propriétaire. Motif : référence incorrecte.`, 'error');
              addNewNotification('❌ Versement refusé', `Le dépôt de ${myLatestPayment.amount.toLocaleString()} FCFA a été rejeté.`);
            }
          }
        } catch (err) {
          console.error(err);
        }
      }
      
      if (e.key === 'verse_vehicles' && vehicle) {
        try {
          const newVal = JSON.parse(e.newValue || '[]');
          const myVeh = newVal.find(v => v.id === vehicle.id);
          if (myVeh) {
            setVehicle(myVeh);
            const driven = myVeh.current_mileage - myVeh.last_oil_change_mileage;
            if (driven >= 4500) {
              triggerToast("🔧 Rappel d'Entretien", "Vidange de moteur requise bientôt (limite de 5 000 km approchée).", 'warning');
              addNewNotification('🔧 Maintenance requise', 'Vidange moteur à prévoir bientôt.');
            }
          }
        } catch (err) {
          console.error(err);
        }
      }

      if (e.key === 'verse_incidents') {
        try {
          setIncidents(JSON.parse(e.newValue || '[]'));
        } catch (err) {
          console.error(err);
        }
      }

      if (e.key === 'verse_audits') {
        try {
          setAudits(JSON.parse(e.newValue || '[]'));
        } catch (err) {
          console.error(err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [driver, vehicle]);

  const handleLogout = () => {
    localStorage.removeItem('verse_auth_role');
    localStorage.removeItem('verse_auth_driver_id');
    navigate('/driver/login');
  };

  // Simulated mobile receipt screenshot scan
  const handleSimulateUpload = () => {
    setIsReceiptSelected(true);
    const mockRef = generateMockReference(paymentMethod);
    setRef(mockRef);
    setReceiptUrl('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600');
    triggerToast("📸 Reçu enregistré", "Prévisualisation prête dans le récapitulatif.", 'success');
  };

  // Text-To-Speech assistant
  const speakGuide = (textFr, textWo) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const speakText = voiceLang === 'wo' ? textWo : textFr;
      const utterance = new SpeechSynthesisUtterance(speakText);
      utterance.lang = voiceLang === 'wo' ? 'en-US' : 'fr-FR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Handle odometer check and recap verification
  const handleOpenRecap = (e) => {
    e.preventDefault();
    setError('');

    if (!mileage || !amount || (!ref && paymentMethod !== 'cash')) {
      setError("Veuillez remplir tous les champs requis.");
      speakGuide("Veuillez remplir tous les champs requis pour déclarer.", "Mettez yé bindal sa kilométrage ak sa khaliss.");
      setTimeout(() => setError(''), 4000);
      return;
    }

    const mileageNum = parseInt(mileage);
    const lastMileage = vehicle.current_mileage;

    if (mileageNum <= lastMileage) {
      setError(`Kilométrage incorrect : ${mileageNum} km doit être supérieur à l'ancien index (${lastMileage} km).`);
      speakGuide(
        `Le kilométrage entré de ${mileageNum} kilomètres est inférieur ou égal à l'ancien enregistré de ${lastMileage} kilomètres.`,
        `Kilométrage bi dangua dioum. Lim bi dougueul wara eup ${lastMileage} kilomètres.`
      );
      setTimeout(() => setError(''), 5000);
      return;
    }

    setShowConfirmRecap(true);
  };

  // Submit payment declaration
  const handleConfirmSubmit = () => {
    const mileageNum = parseInt(mileage);
    const currentPayments = getFromDb('payments', []);

    // Check duplicate references
    if (ref) {
      const refExists = currentPayments.some(p => p.transaction_reference.toLowerCase() === ref.trim().toLowerCase());
      if (refExists) {
        setError(`Référence de transaction déjà déclarée : ${ref}`);
        setShowConfirmRecap(false);
        setTimeout(() => setError(''), 5000);
        return;
      }
    }

    const newPayment = {
      id: generateUniqueId('p'),
      vehicle_id: vehicle.id,
      driver_name: driver.name,
      date: getIsoTodayDate(),
      amount: parseFloat(amount),
      status: 'pending',
      transaction_reference: ref.trim().toUpperCase() || generateMockReference('cash'),
      receipt_image: receiptUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
      submitted_at: getFormattedDateTime(),
      odometer: mileageNum
    };

    const updatedPayments = [newPayment, ...currentPayments];
    setPayments(updatedPayments);
    saveToDb('payments', updatedPayments);

    const updatedVehicle = { ...vehicle, pending_mileage: mileageNum };
    setVehicle(updatedVehicle);

    const vehiclesList = getFromDb('vehicles', []);
    const updatedVehiclesList = vehiclesList.map(v => v.id === vehicle.id ? { ...v, pending_mileage: mileageNum } : v);
    saveToDb('vehicles', updatedVehiclesList);

    // Save security audit log
    const currentAudits = getFromDb('audits', []);
    const newAudit = {
      id: generateUniqueId('au'),
      date: getFormattedDateTime(),
      type: 'payment_declared',
      driver_name: driver.name,
      details: `Déclaration de versement de ${parseFloat(amount).toLocaleString()} FCFA (${paymentMethod.toUpperCase()})`
    };
    const updatedAudits = [newAudit, ...currentAudits];
    setAudits(updatedAudits);
    saveToDb('audits', updatedAudits);

    // Show success overlay
    setShowConfirmRecap(false);
    setSuccessOverlay(true);
    
    // Reset inputs
    setRef('');
    setIsReceiptSelected(false);
    setReceiptUrl('');

    setTimeout(() => {
      setSuccessOverlay(false);
      setActiveTab('home');
    }, 2200);
  };

  // Submit quick template messages
  const triggerQuickMessage = (messageText) => {
    const currentIncidents = getFromDb('incidents', []);
    
    const newReport = {
      id: generateUniqueId('msg'),
      driver_name: driver.name,
      vehicle_plate: vehicle.license_plate,
      type: 'other',
      description: `[Message rapide] ${messageText}`,
      date: getFormattedDateTime(),
      status: 'resolved'
    };

    const updatedIncidents = [newReport, ...currentIncidents];
    setIncidents(updatedIncidents);
    saveToDb('incidents', updatedIncidents);

    // Save audit log
    const currentAudits = getFromDb('audits', []);
    const newAudit = {
      id: generateUniqueId('au'),
      date: getFormattedDateTime(),
      type: 'message_quick',
      driver_name: driver.name,
      details: `Message rapide envoyé : "${messageText}"`
    };
    saveToDb('audits', [newAudit, ...currentAudits]);

    triggerToast("💬 Message Envoyé !", `Notification transmise : "${messageText}".`, 'success');
  };

  // SOS Critical Incident Trigger
  const handleTriggerSOS = (category) => {
    const currentIncidents = getFromDb('incidents', []);
    const categoryLabels = {
      accident: 'Accident routier grave',
      engine: 'Panne mécanique complète',
      police: 'Contrôle Police / Fourrière',
      security: 'Agression / Problème de sécurité',
      medical: 'Urgence médicale'
    };

    const newSOS = {
      id: generateUniqueId('sos'),
      driver_name: driver.name,
      vehicle_plate: vehicle.license_plate,
      type: category === 'medical' || category === 'security' ? 'other' : category === 'police' ? 'police' : category === 'engine' ? 'engine' : 'accident',
      description: `🚨 [ALERTE SOS CHAUFFEUR] Catégorie : ${categoryLabels[category]}. Position GPS : ${gpsPositionText} (${gpsCoordinates.lat.toFixed(4)}, ${gpsCoordinates.lng.toFixed(4)}).`,
      date: getFormattedDateTime(),
      status: 'pending'
    };

    const updatedIncidents = [newSOS, ...currentIncidents];
    setIncidents(updatedIncidents);
    saveToDb('incidents', updatedIncidents);

    // Save audit log
    const currentAudits = getFromDb('audits', []);
    const newAudit = {
      id: generateUniqueId('au'),
      date: getFormattedDateTime(),
      type: 'sos_alert',
      driver_name: driver.name,
      details: `ALERTE SOS LANCDÉE : ${categoryLabels[category]} depuis ${gpsPositionText}`
    };
    setAudits([newAudit, ...currentAudits]);
    saveToDb('audits', [newAudit, ...currentAudits]);

    triggerToast("🚨 ALERTE SOS ACTIVÉE !", "Le propriétaire et les services d'assistance ont reçu votre position GPS.", 'error');
    
    setTimeout(() => {
      if (window.confirm("🚨 SOS : Voulez-vous lancer un appel d'urgence téléphonique immédiat au propriétaire ?")) {
        window.open('tel:771234567');
      }
    }, 800);
  };

  // Simulated Voice Recorder controls
  const startRecording = () => {
    setRecordingSeconds(0);
    setIsRecording(true);
    setRecordedAudio(null);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setRecordedAudio({
      duration: recordingSeconds,
      url: '#'
    });
  };

  const sendVoiceMessage = () => {
    if (recordedAudio) {
      // Save audit log
      const currentAudits = getFromDb('audits', []);
      const newAudit = {
        id: generateUniqueId('au'),
        date: getFormattedDateTime(),
        type: 'voice_message',
        driver_name: driver.name,
        details: `Message vocal envoyé au propriétaire (${recordedAudio.duration} secondes)`
      };
      setAudits([newAudit, ...currentAudits]);
      saveToDb('audits', [newAudit, ...currentAudits]);

      triggerToast("🎤 Message vocal envoyé", `Fichier de ${recordedAudio.duration} secondes transmis au propriétaire.`, 'success');
      setRecordedAudio(null);
    }
  };

  // Save/Edit Custom Daily Earnings
  const handleSaveIncome = (e) => {
    e.preventDefault();
    if (!customIncomeInput || isNaN(customIncomeInput)) {
      triggerToast("Erreur", "Saisissez un montant valide.", "error");
      return;
    }

    const driversList = getFromDb('drivers', []);
    const updatedDrivers = driversList.map(d => {
      if (d.id === driver.id) {
        return { ...d, daily_income: parseFloat(customIncomeInput) };
      }
      return d;
    });
    saveToDb('drivers', updatedDrivers);
    
    // Sync view state
    const currentDrv = updatedDrivers.find(d => d.id === driver.id);
    if (currentDrv) setDriver(currentDrv);
    
    setIsEditingIncome(false);
    triggerToast("Revenu Enregistré !", `Revenu journalier mis à jour à ${parseFloat(customIncomeInput).toLocaleString()} FCFA.`, 'success');
  };

  // DEVELOPER TOOLS ACTION SIMULATORS
  const devApproveLatestPayment = () => {
    const currentPayments = getFromDb('payments', []);
    const myPayment = currentPayments.find(p => p.driver_name === driver.name && p.status === 'pending');
    if (!myPayment) {
      alert("Aucun versement en attente ('pending') trouvé pour ce chauffeur à valider.");
      return;
    }
    const updatedPayments = currentPayments.map(p => p.id === myPayment.id ? { ...p, status: 'approved' } : p);
    saveToDb('payments', updatedPayments);
    setPayments(updatedPayments);
    triggerToast("💰 Versement Validé !", `Le propriétaire a approuvé votre dépôt de ${myPayment.amount.toLocaleString()} FCFA.`, 'success');
    addNewNotification('💰 Versement validé', `Votre dépôt de ${myPayment.amount.toLocaleString()} FCFA a été validé.`, 'success');
  };

  const devRejectLatestPayment = () => {
    const currentPayments = getFromDb('payments', []);
    const myPayment = currentPayments.find(p => p.driver_name === driver.name && p.status === 'pending');
    if (!myPayment) {
      alert("Aucun versement en attente ('pending') trouvé pour ce chauffeur à rejeter.");
      return;
    }
    const updatedPayments = currentPayments.map(p => p.id === myPayment.id ? { ...p, status: 'rejected' } : p);
    saveToDb('payments', updatedPayments);
    setPayments(updatedPayments);
    triggerToast("❌ Versement Rejeté !", `Veuillez contacter le propriétaire. Motif : référence incorrecte.`, 'error');
    addNewNotification('❌ Versement refusé', `Le dépôt de ${myPayment.amount.toLocaleString()} FCFA a été rejeté par le propriétaire.`, 'error');
  };

  const devTriggerOilChangeWarning = () => {
    if (vehicle) {
      const updatedVehicle = { ...vehicle, current_mileage: vehicle.last_oil_change_mileage + 4800 };
      setVehicle(updatedVehicle);
      const vehiclesList = getFromDb('vehicles', []);
      const updatedList = vehiclesList.map(v => v.id === vehicle.id ? updatedVehicle : v);
      saveToDb('vehicles', updatedList);
      triggerToast("🔧 Rappel d'Entretien", "Vidange de moteur requise bientôt (limite de 5 000 km approchée).", 'warning');
      addNewNotification('🔧 Maintenance requise', 'Vidange moteur à prévoir bientôt (limite approchée).', 'warning');
    }
  };

  const devSimulateMagicLinkExpiry = () => {
    alert("Simulation : Déconnexion et redirection avec jeton expiré.");
    localStorage.removeItem('verse_auth_role');
    localStorage.removeItem('verse_auth_driver_id');
    navigate('/driver/login?token=expired_token_mock');
  };

  const devResetDatabase = () => {
    if (window.confirm("Réinitialiser le localStorage aux valeurs de départ ?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Calculations for current daily status
  const todayStr = new Date().toISOString().split('T')[0];
  const myPaymentsToday = payments.filter(p => p.driver_name === driver.name && p.date === todayStr);
  const isPaidToday = myPaymentsToday.some(p => p.status === 'approved');
  const isPendingToday = myPaymentsToday.some(p => p.status === 'pending');
  const amountPaidToday = myPaymentsToday.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.amount, 0);

  // Read current active notifications
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      // Mark all read
      setUnreadCount(0);
      setMockNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-0 sm:p-6 select-none font-sans relative overflow-hidden transition-colors duration-300 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Decorative backdrop light blobs */}
      {darkMode ? (
        <div className="absolute top-1/4 left-1/3 w-[450px] h-[450px] bg-[#6D4AFF]/10 rounded-full blur-[140px] pointer-events-none"></div>
      ) : (
        <div className="absolute top-1/4 left-1/3 w-[450px] h-[450px] bg-[#6D4AFF]/5 rounded-full blur-[110px] pointer-events-none"></div>
      )}

      {/* --- IN-APP TOAST SYSTEM --- */}
      {toastNotification && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-xs border rounded-3xl p-4 shadow-2xl z-50 flex gap-3.5 animate-sms-toast text-white ${
          toastNotification.type === 'success' 
            ? 'bg-emerald-950 border-emerald-500/30' 
            : toastNotification.type === 'error'
              ? 'bg-red-950 border-red-500/30'
              : toastNotification.type === 'warning'
                ? 'bg-amber-950 border-amber-500/30'
                : 'bg-slate-900 border-white/10'
        }`}>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
            toastNotification.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
            toastNotification.type === 'error' ? 'bg-red-500/20 text-red-400' :
            toastNotification.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
            'bg-[#6D4AFF]/20 text-[#6D4AFF]'
          }`}>
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-[12px] font-black leading-tight">{toastNotification.title}</h5>
            <p className="text-[10px] text-slate-350 font-bold leading-normal mt-0.5">{toastNotification.message}</p>
          </div>
        </div>
      )}

      {/* Smartphone frame container */}
      <div className={`w-full h-full min-h-screen sm:min-h-[740px] sm:max-w-[390px] overflow-hidden sm:shadow-2xl relative flex flex-col sm:border-[8px] transition-all duration-300 ${
        darkMode 
          ? 'bg-[#090D16] sm:border-slate-850 sm:rounded-[50px] shadow-black/90' 
          : 'bg-[#F8FAFC] sm:border-slate-300 sm:rounded-[50px] shadow-slate-300/40'
      }`}>
        
        {/* Smartphone Top Notch */}
        <div className={`hidden sm:flex h-5.5 w-32 mx-auto rounded-b-2xl absolute top-0 left-1/2 -translate-x-1/2 z-40 items-center justify-center ${
          darkMode ? 'bg-slate-800' : 'bg-slate-200'
        }`}>
          <span className="w-3 h-3 rounded-full bg-black/95 block mr-3"></span>
          <span className="w-8 h-1 rounded bg-black/20 block"></span>
        </div>

        {/* Status Bar */}
        <div className={`pt-3 sm:pt-6 px-5 pb-2.5 flex justify-between items-center text-[10px] font-mono z-30 font-extrabold ${
          darkMode ? 'bg-slate-900/40 text-slate-400' : 'bg-slate-100/40 text-slate-500'
        }`}>
          <span>20:01</span>
          <div className="flex gap-1.5 items-center">
            <BatteryCharging className="w-4 h-4 text-emerald-500" />
            <span>Orange SN 4G</span>
            <div className={`w-5.5 h-2.5 border rounded-sm p-0.5 flex ${darkMode ? 'border-slate-700' : 'border-slate-300'}`}>
              <div className="bg-emerald-500 h-full w-4/5 rounded-2xs"></div>
            </div>
          </div>
        </div>

        {/* Custom App Header */}
        <div className={`border-b px-5 py-4 flex justify-between items-center z-30 transition-colors ${
          darkMode ? 'bg-slate-900/60 border-white/5 backdrop-blur-md' : 'bg-white border-slate-150 shadow-sm'
        }`}>
          <div>
            <span className={`text-[8.5px] block font-extrabold uppercase tracking-widest ${darkMode ? 'text-slate-450' : 'text-slate-500'}`}>Chauffeur Actif</span>
            <h3 className={`text-sm font-black flex items-center gap-1.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {driver.name} 
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <button
              onClick={toggleNotifications}
              className={`w-9 h-9 rounded-2xl border flex items-center justify-center transition-all cursor-pointer relative ${
                darkMode ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-250 text-slate-700'
              }`}
            >
              <Zap className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-extrabold font-mono text-[8px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dark Mode Switcher */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`w-9 h-9 rounded-2xl border flex items-center justify-center transition-all cursor-pointer ${
                darkMode ? 'bg-white/5 border-white/10 text-amber-300' : 'bg-slate-100 border-slate-250 text-[#6D4AFF]'
              }`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Notification Drawer Block */}
        {showNotifications && (
          <div className={`absolute top-[11%] inset-x-0 mx-4 border rounded-3xl p-4 shadow-2xl z-40 animate-fade-in ${
            darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex justify-between items-center pb-2 border-b border-white/5 mb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Notifications récentes</span>
              <button onClick={() => setShowNotifications(false)}>
                <X className="w-4.5 h-4.5 text-slate-400 hover:text-white" />
              </button>
            </div>
            
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {mockNotifications.map(n => (
                <div key={n.id} className={`p-2.5 rounded-xl border flex gap-3 ${
                  darkMode ? 'bg-slate-950/50 border-white/5' : 'bg-slate-50 border-slate-100'
                }`}>
                  <span className="text-base">
                    {n.type === 'success' ? '🟢' : n.type === 'warning' ? '🔧' : '✉️'}
                  </span>
                  <div className="flex-1">
                    <h6 className="text-[11px] font-black leading-snug">{n.title}</h6>
                    <p className={`text-[9.5px] leading-snug mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{n.message}</p>
                    <span className="text-[8px] text-slate-500 block mt-1 font-mono">{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Smartphone Screen Body */}
        <div className={`flex-1 overflow-y-auto relative p-4 pb-24 flex flex-col transition-colors ${
          darkMode ? 'bg-[#060A12]' : 'bg-[#F1F5F9]'
        }`}>
          
          {/* --- DECLARATION FINAL ANIMATED SUCCESS OVERLAY --- */}
          {successOverlay && (
            <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col items-center justify-center text-center p-6 animate-fadeIn">
              <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mb-6 animate-scaleUp">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-black text-white">Versement Déclaré !</h3>
              <p className="text-xs text-slate-400 mt-2.5 max-w-[220px] mx-auto font-bold leading-relaxed">
                Votre déclaration a été envoyée. Le propriétaire va valider la référence sous peu.
              </p>
              <div className="w-16 h-1 bg-emerald-500/20 rounded-full overflow-hidden mt-8">
                <div className="bg-emerald-400 h-full rounded-full animate-progressFill"></div>
              </div>
            </div>
          )}

          {/* --- CONFIRMATION DECLARATION DRAWER MODAL --- */}
          {showConfirmRecap && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
              <div className={`border rounded-3xl w-full max-w-xs overflow-hidden shadow-2xl p-5 space-y-4 animate-fade-in ${
                darkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}>
                <div className="text-center space-y-1">
                  <h4 className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-slate-900'}`}>Valider l'envoi</h4>
                  <p className={`text-[10px] ${darkMode ? 'text-slate-450' : 'text-slate-500'} font-bold`}>Vérifiez vos données avant la signature électronique.</p>
                </div>

                <div className={`p-4 rounded-2xl text-[11px] space-y-3 font-bold ${
                  darkMode ? 'bg-slate-950 text-slate-300' : 'bg-slate-50 text-slate-600'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Immatriculation :</span>
                    <strong className="text-amber-400 uppercase">{vehicle.license_plate}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Odomètre saisi :</span>
                    <strong className={darkMode ? 'text-white' : 'text-slate-900 font-mono'}>{parseInt(mileage).toLocaleString()} km</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Montant versement :</span>
                    <strong className="text-emerald-500 text-xs font-black">{parseFloat(amount).toLocaleString()} FCFA</strong>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-200/10 pt-2.5">
                    <span className="text-slate-500">Opérateur :</span>
                    <span className="capitalize font-black flex items-center gap-1">
                      {paymentMethod === 'wave' ? '🟦 Wave' : paymentMethod === 'orange_money' ? '🟧 Orange Money' : '🟩 Espèces'}
                    </span>
                  </div>
                  {ref && (
                    <div className="flex flex-col gap-1 border-t border-slate-200/10 pt-2.5">
                      <span className="text-slate-500">Numéro de Transaction :</span>
                      <span className="font-mono text-[10px] text-slate-400 break-all bg-black/20 p-1.5 rounded">{ref}</span>
                    </div>
                  )}
                  {isReceiptSelected && (
                    <div className="border-t border-slate-200/10 pt-2.5">
                      <span className="text-slate-550 block mb-1.5">Aperçu du reçu joint :</span>
                      <img src={receiptUrl} alt="Reçu joint" className="w-full h-24 object-cover rounded-xl border border-white/5 shadow-inner" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2.5 pt-2">
                  <button
                    onClick={handleConfirmSubmit}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-3.5 rounded-2xl transition-all cursor-pointer text-center active:scale-95 shadow-md shadow-emerald-600/15"
                  >
                    Confirmer et Signer
                  </button>
                  <button
                    onClick={() => setShowConfirmRecap(false)}
                    className={`w-full text-xs font-black py-3 rounded-2xl transition-all cursor-pointer text-center border ${
                      darkMode 
                        ? 'bg-slate-800 hover:bg-slate-700 border-white/5 text-slate-300' 
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-250 text-slate-650'
                    }`}
                  >
                    Corriger les saisies
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ----------------- TAB: HOME (ACCUEIL) ----------------- */}
          {activeTab === 'home' && (
            <div className="space-y-5 flex-1 flex flex-col justify-between">
              
              <div className="space-y-5">
                
                {/* Visual Status Banner Card */}
                {isPaidToday ? (
                  <div className="bg-emerald-500/10 border-2 border-emerald-500/25 rounded-3xl p-4.5 text-center space-y-1.5 flex flex-col items-center">
                    <span className="text-3xl animate-bounce">🟢</span>
                    <h4 className="text-[12.5px] font-black text-emerald-400 uppercase tracking-widest">Versement Journalier : VALIDÉ</h4>
                    <p className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-600'} font-bold`}>
                      Votre versement requis pour aujourd'hui a été approuvé. Bon repos !
                    </p>
                  </div>
                ) : isPendingToday ? (
                  <div className="bg-amber-500/10 border-2 border-amber-500/25 rounded-3xl p-4.5 text-center space-y-1.5 flex flex-col items-center animate-pulse">
                    <span className="text-3xl">⏳</span>
                    <h4 className="text-[12.5px] font-black text-amber-400 uppercase tracking-widest font-black">EN ATTENTE DE VÉRIFICATION</h4>
                    <p className={`text-[10px] ${darkMode ? 'text-slate-450' : 'text-slate-600'} font-bold`}>
                      Le reçu a été transmis. En attente de confirmation par le propriétaire.
                    </p>
                  </div>
                ) : (
                  <div className="bg-red-500/10 border-2 border-red-500/25 rounded-3xl p-4.5 text-center space-y-1.5 flex flex-col items-center">
                    <span className="text-3xl animate-pulse">🔴</span>
                    <h4 className="text-[12.5px] font-black text-red-400 uppercase tracking-widest font-black">VERSEMENT REQUIS AUJOURD'HUI</h4>
                    <p className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-600'} font-bold`}>
                      Versement attendu de 15 000 FCFA non encore validé pour la journée.
                    </p>
                  </div>
                )}

                {/* Premium Hero Vehicle Card */}
                <div className="relative rounded-3xl overflow-hidden shadow-xl border border-white/5 aspect-[16/10] flex flex-col justify-end p-4 group">
                  {/* Vehicle Image Background with Overlay */}
                  <img 
                    src={vehicle.vehicle_image} 
                    alt={vehicle.brand_model} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                  
                  {/* Card Content Overlay */}
                  <div className="relative z-10 flex justify-between items-end">
                    <div className="space-y-1 text-white">
                      <span className="text-[8.5px] font-extrabold uppercase bg-amber-500 text-slate-950 px-2 py-0.5 rounded tracking-widest font-mono">
                        {vehicle.brand_model}
                      </span>
                      <h4 className="text-xl font-black uppercase font-mono tracking-wider">
                        {vehicle.license_plate}
                      </h4>
                    </div>
                    
                    <div className="text-right text-slate-350 text-[10px] font-bold font-mono bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#6D4AFF] animate-pulse" />
                      <span>{vehicle.current_mileage.toLocaleString()} KM</span>
                    </div>
                  </div>
                </div>

                {/* Revolut-style Financial Widgets Row */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className={`p-3 rounded-2xl border text-center space-y-0.5 ${
                    darkMode ? 'bg-[#0E1522] border-white/5' : 'bg-white border-slate-200'
                  }`}>
                    <span className="text-[8.5px] text-slate-500 uppercase tracking-wider block font-black">Dû Aujourd'hui</span>
                    <strong className="text-xs font-black text-red-400 block font-mono">15 000 F</strong>
                  </div>
                  <div className={`p-3 rounded-2xl border text-center space-y-0.5 ${
                    darkMode ? 'bg-[#0E1522] border-white/5' : 'bg-white border-slate-200'
                  }`}>
                    <span className="text-[8.5px] text-slate-500 uppercase tracking-wider block font-black">Déposé (Validé)</span>
                    <strong className="text-xs font-black text-emerald-400 block font-mono">{amountPaidToday.toLocaleString()} F</strong>
                  </div>
                  
                  {/* Daily Income customizable widget */}
                  <div 
                    onClick={() => {
                      setCustomIncomeInput(driver.daily_income || '0');
                      setIsEditingIncome(true);
                    }}
                    className={`p-3 rounded-2xl border text-center space-y-0.5 cursor-pointer hover:border-[#6D4AFF]/40 transition-all active:scale-95 ${
                      darkMode ? 'bg-[#0E1522] border-white/5' : 'bg-white border-slate-200'
                    }`}
                  >
                    <span className="text-[8.5px] text-slate-500 uppercase tracking-wider block font-black flex items-center justify-center gap-0.5">
                      Recette Jour 📝
                    </span>
                    <strong className="text-xs font-black text-purple-400 block font-mono">{(driver.daily_income || 0).toLocaleString()} F</strong>
                  </div>
                </div>

                {/* Dynamic income edit modal pop */}
                {isEditingIncome && (
                  <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form 
                      onSubmit={handleSaveIncome}
                      className={`border rounded-3xl w-full max-w-xs p-5 space-y-4 animate-fade-in ${
                        darkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
                      }`}
                    >
                      <h4 className="text-xs font-black uppercase tracking-wider">Saisir Recette du Jour (Yango / Uber / Heetch)</h4>
                      <p className="text-[9.5px] text-slate-400">Enregistrez vos gains réels du jour pour votre propre suivi.</p>
                      
                      <div className="relative">
                        <input 
                          type="number"
                          value={customIncomeInput}
                          onChange={(e) => setCustomIncomeInput(e.target.value)}
                          className={`w-full border-2 rounded-xl px-4 py-3.5 text-sm font-mono font-bold focus:outline-none focus:border-[#6D4AFF] text-center ${
                            darkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-slate-50 border-slate-250 text-slate-800'
                          }`}
                          placeholder="42500"
                        />
                        <span className="absolute right-4 top-3.5 text-[10px] text-slate-500 font-bold font-mono">FCFA</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 bg-[#6D4AFF] hover:bg-[#5636E5] text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer text-center"
                        >
                          Enregistrer
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingIncome(false)}
                          className="flex-1 bg-slate-800 text-slate-300 text-xs font-bold py-3 rounded-xl transition-all cursor-pointer text-center border border-white/5"
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* 1-Hand Grid of Giant Quick Actions */}
                <div className="space-y-2.5">
                  <span className="text-[9.5px] text-slate-550 uppercase font-extrabold tracking-widest block text-center">Actions Chauffeur</span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => {
                        speakGuide("Déclarer versement. Choisissez Wave, Orange Money ou Espèces. Prenez une photo du reçu.", "Dougal sa versement. Tannal Wave walla Orange Money. Natafal reçu bi.");
                        setActiveTab('declare');
                      }}
                      className="py-4.5 rounded-3xl bg-[#6D4AFF] hover:bg-[#5636E5] text-white flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-lg shadow-[#6D4AFF]/10 border border-[#6D4AFF]/20"
                    >
                      <span className="text-2xl">💰</span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-white">Déclarer Dépôt</span>
                    </button>

                    <button 
                      onClick={() => {
                        setPaymentMethod('wave');
                        handleSimulateUpload();
                        setActiveTab('declare');
                      }}
                      className="py-4.5 rounded-3xl bg-blue-650 hover:bg-blue-600 text-white flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-lg shadow-blue-600/10 border border-blue-500/20"
                    >
                      <span className="text-2xl">📸</span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-white">Envoyer Reçu</span>
                    </button>

                    <button 
                      onClick={() => {
                        setActiveTab('chat');
                        // Trigger active voice recording directly
                        setTimeout(() => startRecording(), 300);
                      }}
                      className="py-4.5 rounded-3xl bg-emerald-650 hover:bg-emerald-600 text-white flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-lg shadow-emerald-650/10 border border-emerald-500/20"
                    >
                      <span className="text-2xl">🎤</span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-white">Message Vocal</span>
                    </button>

                    <button 
                      onClick={() => window.open('tel:771234567')}
                      className="py-4.5 rounded-3xl bg-amber-600 hover:bg-amber-500 text-white flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-lg shadow-amber-600/10 border border-amber-500/20"
                    >
                      <span className="text-2xl">📞</span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-white">Appeler Patron</span>
                    </button>

                    <button 
                      onClick={() => window.open('https://wa.me/221771234567')}
                      className="py-4.5 rounded-3xl bg-teal-650 hover:bg-teal-600 text-white flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-lg shadow-teal-600/10 border border-teal-500/20"
                    >
                      <span className="text-2xl">💬</span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-white">WhatsApp</span>
                    </button>

                    <button 
                      onClick={() => {
                        setGpsActive(!gpsActive);
                        triggerToast(
                          gpsActive ? "📍 Partage GPS Éteint" : "📍 GPS Partagé en temps réel",
                          gpsActive ? "La position ne sera plus mise à jour automatiquement." : "Position partagée avec le propriétaire.",
                          'info'
                        );
                      }}
                      className={`py-4.5 rounded-3xl flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border ${
                        gpsActive
                          ? 'bg-purple-950 border-purple-500/35 text-purple-400 shadow-lg'
                          : 'bg-white/[0.02] border-slate-200/20 text-slate-400'
                      }`}
                    >
                      <span className={`text-2xl ${gpsActive ? 'animate-pulse' : ''}`}>📍</span>
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        {gpsActive ? "GPS Actif" : "Partager GPS"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Permanent SOS Giant Red Card */}
                <button 
                  onClick={() => setActiveTab('sos')}
                  className="w-full py-5.5 rounded-3xl bg-red-650 hover:bg-red-600 text-white flex items-center justify-center gap-4 transition-all active:scale-95 cursor-pointer shadow-xl shadow-red-650/20 border-2 border-red-500/30 animate-pulse"
                >
                  <span className="text-3xl">🚨</span>
                  <div className="text-left">
                    <span className="text-xs font-black uppercase tracking-widest block text-white">BOUTON D'URGENCE / SOS</span>
                    <span className="text-[9px] text-red-200 block font-bold">Signaler immédiatement un accident, panne ou contrôle de police.</span>
                  </div>
                </button>

                {/* Simulated GPS Interactive Widget */}
                <div className={`p-4.5 rounded-3xl border space-y-3.5 transition-colors ${
                  darkMode ? 'bg-[#0E1522] border-white/5' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-4.5 h-4.5 text-[#6D4AFF] ${gpsActive ? 'animate-bounce' : ''}`} />
                      <span className="text-[10.5px] font-black uppercase tracking-wider">Suivi GPS du Véhicule</span>
                    </div>
                    
                    {/* Eco / Performance Mode */}
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setGpsMode(gpsMode === 'performance' ? 'eco' : 'performance')}
                        className={`text-[8.5px] font-black px-2 py-0.5 rounded-md ${
                          gpsMode === 'performance'
                            ? 'bg-purple-900/40 text-purple-400 border border-purple-500/30'
                            : 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        ⚡ {gpsMode === 'performance' ? 'Vitesse 10s' : 'Eco 20s'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-0.5">
                      <span className="text-[8.5px] text-slate-500 uppercase font-black block">Position Active</span>
                      <strong className={`text-[12.5px] font-black block ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                        {gpsPositionText}
                      </strong>
                      <span className="text-[8px] text-slate-450 font-mono block">
                        Lat: {gpsCoordinates.lat.toFixed(4)} • Lng: {gpsCoordinates.lng.toFixed(4)}
                      </span>
                    </div>

                    <div className="space-y-0.5 text-right">
                      <span className="text-[8.5px] text-slate-500 uppercase font-black block">Distance du jour</span>
                      <strong className="text-sm font-black text-amber-400 block font-mono">
                        {distanceTraveled} KM
                      </strong>
                      <span className="text-[8px] text-slate-500 block font-mono">
                        Mis à jour : {lastGpsTime}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-[8.5px] text-slate-500 font-bold border-t border-slate-200/10 pt-2.5 flex items-center justify-between">
                    <span>Statut : {gpsActive ? '🟢 Transmission en cours (Simulée)' : '🔴 Suspendue'}</span>
                    <button 
                      onClick={() => {
                        setDistanceTraveled(124.5);
                        triggerToast("GPS", "Indicateur de distance réinitialisé.", "info");
                      }}
                      className="text-[#6D4AFF] underline font-extrabold hover:text-white"
                    >
                      Réinitialiser KM
                    </button>
                  </div>
                </div>

              </div>

              {/* Simple vehicle signature */}
              <div className="text-center pt-5 border-t border-slate-200/10 flex justify-between items-center text-[9px] text-slate-500 font-bold">
                <span>Chauffeur : {driver.name}</span>
                <span>Vehicule : {vehicle.brand_model} ({vehicle.license_plate})</span>
              </div>

            </div>
          )}

          {/* ----------------- TAB: DECLARER (FORMULAIRE) ----------------- */}
          {activeTab === 'declare' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Voice Guide Speech Bubble */}
              <div className="flex items-start gap-3 bg-[#6D4AFF]/5 border border-[#6D4AFF]/15 p-4 rounded-3xl relative">
                <button 
                  type="button"
                  onClick={() => speakGuide(
                    "Sélectionnez Wave, Orange Money ou Espèces. Prenez une photo du reçu de paiement. Entrez le kilométrage de la voiture et validez.",
                    "Tannal Wave walla Orange Money. Natafal reçu bi. Bindal kilométrage auto bi ba paré cuqal bouton vert bi."
                  )}
                  className="w-10 h-10 rounded-full bg-[#6D4AFF]/10 hover:bg-[#6D4AFF]/20 text-[#6D4AFF] flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Volume2 className="w-5.5 h-5.5" />
                </button>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black text-[#6D4AFF] uppercase tracking-wider">🔊 Aide Vocale / Guidage</p>
                    <div className="flex gap-1">
                      <button 
                        type="button"
                        onClick={() => setVoiceLang('fr')}
                        className={`text-[8.5px] font-black px-1.5 py-0.5 rounded-md ${
                          voiceLang === 'fr' ? 'bg-[#6D4AFF] text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        FR
                      </button>
                      <button 
                        type="button"
                        onClick={() => setVoiceLang('wo')}
                        className={`text-[8.5px] font-black px-1.5 py-0.5 rounded-md ${
                          voiceLang === 'wo' ? 'bg-[#6D4AFF] text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        WO 🇸🇳
                      </button>
                    </div>
                  </div>
                  <div className={`text-[9.5px] font-semibold leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-750'} space-y-1 mt-1`}>
                    {voiceLang === 'wo' ? (
                      <p>Tannal Wave walla Orange Money. Natafal reçu bi. Bindal kilométrage auto bi.</p>
                    ) : (
                      <p>Choisis ton opérateur. Prends en photo le reçu. Saisis ton kilométrage de fin de journée.</p>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-xs p-3 rounded-2xl flex gap-2 font-bold animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              <form onSubmit={handleOpenRecap} className="space-y-4.5">
                
                {/* 1. Payment Operator selector (Wave, OM, Cash) */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest block text-center">1. Moyen de versement</label>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'wave', label: 'Wave', color: 'bg-blue-500/15 border-blue-500/50 text-blue-400' },
                      { id: 'orange_money', label: 'Orange M.', color: 'bg-orange-500/15 border-orange-500/50 text-orange-400' },
                      { id: 'cash', label: 'Espèces', color: 'bg-emerald-500/15 border-emerald-500/50 text-emerald-450' }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(mode.id);
                          if (mode.id === 'cash') {
                            setRef('');
                            setIsReceiptSelected(true);
                            setReceiptUrl('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600');
                          } else {
                            setIsReceiptSelected(false);
                            setRef('');
                          }
                        }}
                        className={`py-4 rounded-2xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 text-[11px] font-black ${
                          paymentMethod === mode.id
                            ? `${mode.color} shadow-md border-2`
                            : 'bg-white/[0.02] border-slate-200/20 text-slate-450 hover:text-white'
                        }`}
                      >
                        {mode.id === 'wave' ? '🟦' : mode.id === 'orange_money' ? '🟧' : '💵'}
                        <span className="mt-1">{mode.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Receipt capture / upload */}
                {paymentMethod !== 'cash' && (
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest block text-center">2. Reçu de paiement (Capture)</label>
                    
                    {isReceiptSelected ? (
                      <div 
                        onClick={handleSimulateUpload}
                        className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4.5 flex items-center justify-between cursor-pointer hover:bg-emerald-500/15 transition-all"
                      >
                        <div className="space-y-0.5">
                          <span className="text-[10.5px] text-emerald-400 font-black uppercase tracking-wide flex items-center gap-1.5">
                            <ShieldCheck className="w-4.5 h-4.5" /> 📸 Reçu enregistré !
                          </span>
                          <span className="text-[8.5px] text-slate-450 block font-mono">ID Réf : {ref}</span>
                        </div>
                        <span className="text-[9px] bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-1.5 rounded-lg uppercase">Remplacer</span>
                      </div>
                    ) : (
                      <div 
                        onClick={handleSimulateUpload}
                        className={`border-2 border-dashed rounded-2xl p-6.5 text-center cursor-pointer transition-all hover:bg-slate-50/15 flex flex-col items-center justify-center gap-2.5 ${
                          darkMode ? 'border-white/10 hover:border-[#6D4AFF]/50 bg-white/[0.01]' : 'border-slate-300 hover:border-[#6D4AFF]/40 bg-slate-50'
                        }`}
                      >
                        <span className="text-3xl animate-pulse">📸</span>
                        <span className="text-[11px] font-black uppercase tracking-wider block text-slate-350">
                          Prendre le reçu en photo
                        </span>
                        <span className="text-[8.5px] text-slate-500 block font-semibold">
                          (Appuyez pour simuler une photo)
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Mileage Input */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest block text-center">3. Kilométrage actuel (Tableau de bord)</label>
                  
                  <div className="relative">
                    <input 
                      type="number" 
                      value={mileage}
                      onChange={(e) => setMileage(e.target.value)}
                      className={`w-full border-2 rounded-2xl px-4 py-4 text-sm font-mono font-bold focus:outline-none focus:border-[#6D4AFF] text-center tracking-widest min-h-[56px] ${
                        darkMode 
                          ? 'bg-slate-950 border-white/10 text-white' 
                          : 'bg-white border-slate-250 text-slate-800'
                      }`}
                      placeholder={`${vehicle.current_mileage + 120}`}
                    />
                    <span className="absolute right-5 top-4.5 text-[10px] text-slate-500 font-extrabold font-mono">KM</span>
                  </div>
                  <span className="text-[9px] text-slate-500 block text-center font-bold">
                    Dernier kilomètre connu : <strong className="text-slate-400 font-mono">{vehicle.current_mileage.toLocaleString()} km</strong>.
                  </span>
                </div>

                {/* 4. Amount Selection */}
                <div className="space-y-2.5">
                  <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest block text-center">4. Valider le montant à déclarer</label>
                  
                  <div className="relative">
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className={`w-full border-2 rounded-2xl px-4 py-4 text-sm font-mono font-bold focus:outline-none focus:border-[#6D4AFF] text-center min-h-[56px] ${
                        darkMode 
                          ? 'bg-slate-950 border-white/10 text-white' 
                          : 'bg-white border-slate-250 text-slate-800'
                      }`}
                      placeholder="15000"
                    />
                    <span className="absolute right-5 top-4.5 text-[10px] text-slate-500 font-extrabold font-mono">FCFA</span>
                  </div>

                  <div className="flex gap-2 justify-center">
                    {['10000', '15000', '20000'].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val)}
                        className={`text-[9.5px] font-black px-4.5 py-2.5 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                          amount === val
                            ? 'bg-[#6D4AFF] border-[#6D4AFF] text-white shadow-md font-bold'
                            : 'bg-white/[0.02] border-slate-200/30 text-slate-400'
                        }`}
                      >
                        {parseInt(val).toLocaleString()} F
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-4.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/15 cursor-pointer mt-6 active:scale-97 min-h-[56px]"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span className="uppercase tracking-wider">VALIDER LE VERSEMENT</span>
                </button>

              </form>
            </div>
          )}

          {/* ----------------- TAB: CHAT (COMMUNICATION) ----------------- */}
          {activeTab === 'chat' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Voice Guide Speech Bubble */}
              <div className="flex items-start gap-3 bg-[#6D4AFF]/5 border border-[#6D4AFF]/15 p-4 rounded-3xl relative">
                <button 
                  type="button"
                  onClick={() => speakGuide(
                    "Cliquez sur le gros micro pour enregistrer un message vocal au propriétaire, ou appuyez sur un message rapide pour l'envoyer immédiatement.",
                    "Cuqal micro bi ngir vocal walla message rapide yi ngir yone ko boss bi paré."
                  )}
                  className="w-10 h-10 rounded-full bg-[#6D4AFF]/10 hover:bg-[#6D4AFF]/20 text-[#6D4AFF] flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Volume2 className="w-5.5 h-5.5" />
                </button>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black text-[#6D4AFF] uppercase tracking-wider">🔊 Guidage Vocal</p>
                    <div className="flex gap-1">
                      <button 
                        type="button"
                        onClick={() => setVoiceLang('fr')}
                        className={`text-[8.5px] font-black px-1.5 py-0.5 rounded-md ${
                          voiceLang === 'fr' ? 'bg-[#6D4AFF] text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        FR
                      </button>
                      <button 
                        type="button"
                        onClick={() => setVoiceLang('wo')}
                        className={`text-[8.5px] font-black px-1.5 py-0.5 rounded-md ${
                          voiceLang === 'wo' ? 'bg-[#6D4AFF] text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        WO 🇸🇳
                      </button>
                    </div>
                  </div>
                  <p className={`text-[9.5px] font-semibold leading-relaxed ${darkMode ? 'text-slate-350' : 'text-slate-705'}`}>
                    {voiceLang === 'wo' ? "Cuq micro bi ngir dougal vocal, walla émoji yi ngir yone message rapide." : "Parlez directement au patron par vocal ou messages rapides d'un seul clic."}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Discuter avec le Patron</h4>
                <p className={`text-[10px] ${darkMode ? 'text-slate-450' : 'text-slate-500'}`}>Vos messages vocaux et alertes sont audités et visibles sur le tableau de bord.</p>
              </div>

              {/* Simulated Voice Message Recorder (WhatsApp Style) */}
              <div className={`border rounded-3xl p-5 text-center space-y-4.5 transition-colors ${
                darkMode ? 'bg-white/[0.01] border-white/5' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <h5 className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest">Enregistrement Message Vocal</h5>

                {isRecording ? (
                  <div className="space-y-4.5">
                    {/* Audio wave animation */}
                    <div className="flex items-center justify-center gap-1.5 h-10">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((bar) => {
                        // deterministic heights for pure rendering compliance
                        const height = 8 + ((bar * 7) % 24);
                        return (
                          <div 
                            key={bar} 
                            className="w-1 bg-[#6D4AFF] rounded-full transition-all duration-150 animate-pulse" 
                            style={{ height: `${height}px` }}
                          />
                        );
                      })}
                    </div>
                    
                    <div className="text-sm font-black font-mono text-red-500 flex items-center justify-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping mr-1"></span>
                      ENREGISTREMENT : {recordingSeconds}s
                    </div>

                    <button
                      type="button"
                      onClick={stopRecording}
                      className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto cursor-pointer animate-pulse active:scale-90"
                    >
                      <Square className="w-6 h-6 fill-white" />
                    </button>
                  </div>
                ) : recordedAudio ? (
                  <div className="space-y-4">
                    <div className="text-xs font-bold text-slate-450 flex items-center justify-center gap-1.5">
                      🎙️ Message de {recordedAudio.duration}s prêt à l'envoi
                    </div>

                    <div className="flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsPlayingAudio(true);
                          setTimeout(() => setIsPlayingAudio(false), recordedAudio.duration * 1000);
                        }}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center border cursor-pointer active:scale-95 ${
                          isPlayingAudio 
                            ? 'bg-[#6D4AFF]/10 border-[#6D4AFF] text-[#6D4AFF]' 
                            : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
                        }`}
                      >
                        <Play className="w-5 h-5 fill-current" />
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setRecordedAudio(null)}
                        className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center cursor-pointer hover:bg-red-500/20 active:scale-95"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={sendVoiceMessage}
                      className="w-full bg-[#6D4AFF] hover:bg-[#5636E5] text-white font-black text-xs py-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-[#6D4AFF]/10 min-h-[50px]"
                    >
                      <Send className="w-4 h-4" />
                      ENVOYER LE VOCAL
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <p className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-650'} font-semibold leading-relaxed`}>
                      Appuyez sur le micro pour enregistrer votre message. Le propriétaire pourra l'écouter instantanément.
                    </p>

                    <button
                      type="button"
                      onClick={startRecording}
                      className="w-16 h-16 rounded-full bg-[#6D4AFF] text-white flex items-center justify-center mx-auto cursor-pointer hover:bg-[#5636E5] shadow-lg shadow-[#6D4AFF]/15 active:scale-90"
                    >
                      <Mic className="w-7 h-7 text-white" />
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Preset Messages in 1 Click */}
              <div className="space-y-2">
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider block">Messages rapides (Envoi direct)</span>
                
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { text: 'Je suis bien arrivé', icon: '🏁' },
                    { text: 'Véhicule en panne mécanique', icon: '🔧' },
                    { text: 'Au garage pour entretien / vidange', icon: '🏠' },
                    { text: 'Versement effectué sur Mobile Money', icon: '💰' },
                    { text: 'Retard de versement pour aujourd\'hui', icon: '⏳' },
                    { text: 'Contrôle routier de police en cours', icon: '👮' },
                    { text: 'Accident ou accrochage routier', icon: '🚨' }
                  ].map((msg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => triggerQuickMessage(msg.text)}
                      className={`w-full py-4 rounded-2xl border flex items-center gap-3 px-4 text-xs font-bold transition-all active:scale-98 text-left cursor-pointer min-h-[50px] ${
                        darkMode 
                          ? 'bg-white/[0.01] border-white/5 text-slate-200 hover:bg-white/5' 
                          : 'bg-white border-slate-250 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-base">{msg.icon}</span>
                      <span>{msg.text}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ----------------- TAB: SOS (URGENCE) ----------------- */}
          {activeTab === 'sos' && (
            <div className="space-y-4.5 animate-fadeIn">
              
              <div className="space-y-1 text-center">
                <div className="w-14 h-14 bg-red-500/10 border border-red-500/25 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2.5 animate-bounce">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-black text-red-500 uppercase tracking-widest">SIGNALEMENTS SOS D'URGENCE</h4>
                <p className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-600'} font-bold leading-relaxed max-w-[280px] mx-auto`}>
                  Appuyez sur un incident pour notifier instantanément le propriétaire et envoyer votre localisation GPS exacte.
                </p>
              </div>

              {/* SOS Categories list */}
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'accident', label: 'Accident / Collision', desc: 'Accrochage, collision ou dégâts matériels', emoji: '🚗' },
                  { id: 'engine', label: 'Panne mécanique complète', desc: 'Moteur en panne, crevaison ou surchauffe', emoji: '🔧' },
                  { id: 'police', label: 'Contrôle Police / Fourrière', desc: 'Papiers saisis, contrôle routier tendu', emoji: '👮' },
                  { id: 'security', label: 'Agression / Problème de sécurité', desc: 'Vol de caisse, menace ou agression', emoji: '🛡️' },
                  { id: 'medical', label: 'Urgence médicale', desc: 'Blessure chauffeur, malaise passager', emoji: '🚑' }
                ].map((sos) => (
                  <button
                    key={sos.id}
                    type="button"
                    onClick={() => {
                      if (window.confirm(`SOS URGENT : Déclencher l'alerte pour : "${sos.label}" ?`)) {
                        handleTriggerSOS(sos.id);
                        setActiveTab('home');
                      }
                    }}
                    className="w-full bg-red-950/15 hover:bg-red-950/30 border border-red-500/30 rounded-3xl p-4.5 text-left flex items-start gap-4 transition-all active:scale-98 cursor-pointer"
                  >
                    <span className="text-xl bg-red-500/20 p-3 rounded-2xl border border-red-500/25">{sos.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-[11.5px] font-black text-red-200 leading-snug">{sos.label}</h5>
                      <p className="text-[9.5px] text-slate-400 font-bold leading-normal mt-1">{sos.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('home')}
                  className={`w-full text-center text-xs font-black py-4 rounded-2xl border cursor-pointer min-h-[50px] ${
                    darkMode 
                      ? 'bg-slate-900 hover:bg-slate-800 border-white/5 text-slate-350' 
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
                  }`}
                >
                  Annuler / Retour
                </button>
              </div>

            </div>
          )}

          {/* ----------------- TAB: HISTORY (JOURNAL & AUDITS) ----------------- */}
          {activeTab === 'history' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Tracée & Journal Chauffeur</h4>
                <p className={`text-[10px] ${darkMode ? 'text-slate-450' : 'text-slate-500'}`}>Historique complet des déclarations et de sécurité (Audit local).</p>
              </div>

              {/* Payments history list */}
              <div className="space-y-3">
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider block">Déclarations de versement</span>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {payments.filter(p => p.driver_name === driver.name).map(p => (
                    <div key={p.id} className={`p-3 rounded-2xl border flex justify-between items-center ${
                      darkMode ? 'bg-slate-950/50 border-white/5' : 'bg-white border-slate-150'
                    }`}>
                      <div>
                        <strong className="text-xs block">{p.amount.toLocaleString()} FCFA</strong>
                        <span className="text-[8px] text-slate-500 font-mono block mt-0.5">{p.submitted_at} | Réf : {p.transaction_reference}</span>
                      </div>
                      
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-wide border ${
                        p.status === 'approved' 
                          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                          : p.status === 'rejected'
                            ? 'bg-red-500/10 border-red-500/25 text-red-400'
                            : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                      }`}>
                        {p.status === 'approved' ? 'Validé' : p.status === 'rejected' ? 'Rejeté' : 'En attente'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Incidents / SOS logs */}
              <div className="space-y-3 pt-2">
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider block">Incidents & SOS signalés</span>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {incidents.filter(i => i.driver_name === driver.name).map(i => (
                    <div key={i.id} className={`p-3 rounded-2xl border ${
                      darkMode ? 'bg-slate-950/50 border-white/5' : 'bg-white border-slate-150'
                    }`}>
                      <div className="flex justify-between items-center">
                        <strong className="text-[10px] text-red-400 font-black">{i.type.toUpperCase()}</strong>
                        <span className="text-[8px] text-slate-500 font-mono">{i.date}</span>
                      </div>
                      <p className={`text-[9.5px] leading-snug mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-650'}`}>{i.description}</p>
                    </div>
                  ))}
                  {incidents.filter(i => i.driver_name === driver.name).length === 0 && (
                    <span className="text-[9.5px] text-slate-500 font-semibold block text-center py-2">Aucun incident à signaler.</span>
                  )}
                </div>
              </div>

              {/* Security Audit Trail */}
              <div className="space-y-3 pt-2">
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider block">Audit de sécurité d'accès</span>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {audits.filter(au => au.driver_name === driver.name).map(au => (
                    <div key={au.id} className={`p-2.5 rounded-xl text-[9px] font-mono border ${
                      darkMode ? 'bg-black/30 border-white/5 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}>
                      <div className="flex justify-between">
                        <span className="font-bold text-[#6D4AFF]">{au.type.toUpperCase()}</span>
                        <span className="text-[8px] text-slate-500">{au.date}</span>
                      </div>
                      <p className="mt-0.5 font-sans font-bold">{au.details}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* --- SMARTPHONE TAB BAR NAVIGATION --- */}
        <div className={`absolute bottom-[30px] inset-x-0 border-t py-2 px-5 flex justify-between items-center z-30 backdrop-blur-md transition-colors ${
          darkMode ? 'bg-slate-900/90 border-white/5' : 'bg-white/95 border-slate-200 shadow-lg'
        }`}>
          
          {[
            { id: 'home', label: 'Accueil', icon: Home },
            { id: 'declare', label: 'Versement', icon: FileText },
            { id: 'chat', label: 'Message', icon: Mic },
            { id: 'history', label: 'Logs', icon: ClipboardList },
            { id: 'sos', label: 'SOS', icon: AlertTriangle, urgent: true }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            let activeColor = isActive ? 'text-[#6D4AFF]' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white';
            if (item.urgent) {
              activeColor = isActive ? 'text-red-500' : 'text-red-400/80 hover:text-red-500';
            }

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setShowConfirmRecap(false);
                }}
                className={`flex flex-col items-center gap-0.5 cursor-pointer transition-all active:scale-90 ${activeColor}`}
              >
                <Icon className={`w-5 h-5 ${item.urgent && !isActive ? 'animate-pulse' : ''}`} />
                <span className="text-[8px] font-black uppercase tracking-wider">{item.label}</span>
              </button>
            );
          })}

        </div>

        {/* Developer tools toggle indicator */}
        <div className="absolute bottom-[3px] inset-x-0 z-35 flex justify-center">
          <button 
            onClick={() => setShowDevPanel(!showDevPanel)}
            className={`text-[8px] font-black uppercase px-3.5 py-0.5 rounded-full border transition-all ${
              darkMode 
                ? 'bg-slate-900 border-white/10 text-purple-400 hover:bg-slate-800' 
                : 'bg-slate-100 border-slate-250 text-purple-600 hover:bg-slate-200'
            }`}
          >
            ⚙️ Outils de démo (Simulateur)
          </button>
        </div>

        {/* Smartphone Home Indicator Bar */}
        <div className={`py-1.5 flex justify-center items-center z-30 mt-auto transition-colors ${
          darkMode ? 'bg-slate-950' : 'bg-slate-100'
        }`}>
          <span className={`w-28 h-1 rounded-full block ${darkMode ? 'bg-slate-700' : 'bg-slate-450'}`}></span>
        </div>

        {/* --- DEVELOPER TOOLS MODAL DRAWER --- */}
        {showDevPanel && (
          <div className="absolute inset-x-0 bottom-0 bg-slate-950/95 border-t border-purple-500/30 text-white rounded-t-3xl p-5 z-50 animate-fadeIn space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <div className="flex items-center gap-1.5">
                <Settings className="w-5 h-5 text-purple-400" />
                <h4 className="text-xs font-black uppercase tracking-widest text-purple-400">Developer Tools / Simulators</h4>
              </div>
              <button onClick={() => setShowDevPanel(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">
              Utilisez les raccourcis suivants pour simuler les actions du propriétaire sur le Web Dashboard et observer la réactivité temps réel sur l'application mobile Chauffeur.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button 
                onClick={devApproveLatestPayment}
                className="bg-emerald-900/40 border border-emerald-500/30 text-emerald-450 text-[10px] font-black py-2.5 rounded-xl cursor-pointer hover:bg-emerald-900/60 transition-all text-center"
              >
                👍 Valider Versement
              </button>

              <button 
                onClick={devRejectLatestPayment}
                className="bg-red-900/40 border border-red-500/30 text-red-450 text-[10px] font-black py-2.5 rounded-xl cursor-pointer hover:bg-red-900/60 transition-all text-center"
              >
                👎 Rejeter Versement
              </button>

              <button 
                onClick={devTriggerOilChangeWarning}
                className="bg-amber-900/40 border border-amber-500/30 text-amber-400 text-[10px] font-black py-2.5 rounded-xl cursor-pointer hover:bg-amber-900/60 transition-all text-center col-span-2"
              >
                🔧 Simuler Proche Alerte Vidange (+4800 km)
              </button>

              <button 
                onClick={devSimulateMagicLinkExpiry}
                className="bg-purple-900/40 border border-purple-500/30 text-purple-400 text-[10px] font-black py-2.5 rounded-xl cursor-pointer hover:bg-purple-900/60 transition-all text-center"
              >
                🔗 Simuler Jeton Magic Link Expiré
              </button>

              <button 
                onClick={devResetDatabase}
                className="bg-slate-900 border border-white/10 text-slate-300 text-[10px] font-black py-2.5 rounded-xl cursor-pointer hover:bg-slate-800 transition-all text-center"
              >
                🔄 Reset LocalStorage DB
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Switch links */}
      <div className="flex gap-4">
        <button 
          onClick={() => navigate('/dashboard')} 
          className={`mt-6 text-xs font-black transition-all cursor-pointer border px-4 py-3 rounded-2xl shadow-md active:scale-95 ${
            darkMode 
              ? 'bg-slate-900 hover:bg-slate-850 border-white/10 text-slate-350' 
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-650 shadow-slate-100'
          }`}
        >
          Dashboard Propriétaire (Web) 🖥️
        </button>
        
        <button 
          onClick={handleLogout}
          className={`mt-6 text-xs font-black transition-all cursor-pointer border px-4 py-3 rounded-2xl shadow-md active:scale-95 text-red-400 ${
            darkMode 
              ? 'bg-slate-900 hover:bg-slate-850 border-white/10' 
              : 'bg-white hover:bg-slate-50 border-slate-200 shadow-slate-100'
          }`}
        >
          Se Déconnecter 🚪
        </button>
      </div>

    </div>
  );
}
