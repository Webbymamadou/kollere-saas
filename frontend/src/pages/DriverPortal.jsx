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
  X,
  Activity,
  Car,
  User,
  Phone,
  Camera,
  MessageSquare
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
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'declare', 'chat', 'vehicle', 'profile'
  
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
  
  // Custom styling settings (defaults to light mode)
  const [darkMode, setDarkMode] = useState(false);
  const [showSosDialog, setShowSosDialog] = useState(false);
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
    { id: 2, title: '💰 Versement validé', message: 'Votre dépôt de 15 050 FCFA a été approuvé.', time: 'Hier', type: 'success', read: false }
  ]);

  // Dev Tools panel state
  const [showDevPanel, setShowDevPanel] = useState(false);

  // Speech helper
  const [voiceLang, setVoiceLang] = useState('fr'); // 'fr' or 'wo'

  // Notification helper
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

  // Pre-fill mileage on tab focus
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

  // Dynamic GPS Tracker Simulator
  useEffect(() => {
    if (!gpsActive) return;

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
      setDistanceTraveled(prev => parseFloat((prev + 0.15).toFixed(2)));
      stopIndex = (stopIndex + 1) % dakarStops.length;
      const nextStop = dakarStops[stopIndex];
      setGpsPositionText(nextStop.name);
      setGpsCoordinates({ lat: nextStop.lat, lng: nextStop.lng });
      
      const now = new Date();
      setLastGpsTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`);
      
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
        const currentVeh = updatedVehiclesList.find(v => v.id === vehicle.id);
        if (currentVeh) setVehicle(currentVeh);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [gpsActive, gpsMode, vehicle]);

  // Listen for storage updates (approvals, notifications)
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
              addNewNotification('💰 Versement validé', `Votre dépôt de ${myLatestPayment.amount.toLocaleString()} FCFA a été validé.`);
            } else if (myLatestPayment.status === 'rejected') {
              triggerToast("❌ Versement Rejeté !", `Veuillez contacter le propriétaire.`, 'error');
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
              triggerToast("🔧 Rappel d'Entretien", "Vidange moteur requise bientôt (limite approchée).", 'warning');
              addNewNotification('🔧 Maintenance requise', 'Vidange moteur à prévoir bientôt.');
            }
          }
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

  // Simulated mobile receipt scan
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
        `Le kilométrage entré est inférieur ou égal à l'ancien enregistré de ${lastMileage} kilomètres.`,
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

    if (ref) {
      const refExists = currentPayments.some(p => p.transaction_reference.toLowerCase() === ref.trim().toLowerCase());
      if (refExists) {
        setError(`Référence de transaction déjà déclarée : ${ref}`);
        setShowConfirmRecap(false);
        setTimeout(() => setError(''), 5500);
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
    saveToDb('audits', [newAudit, ...currentAudits]);
    setAudits([newAudit, ...currentAudits]);

    setShowConfirmRecap(false);
    setSuccessOverlay(true);
    
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

    const currentAudits = getFromDb('audits', []);
    const newAudit = {
      id: generateUniqueId('au'),
      date: getFormattedDateTime(),
      type: 'message_quick',
      driver_name: driver.name,
      details: `Message rapide envoyé : "${messageText}"`
    };
    saveToDb('audits', [newAudit, ...currentAudits]);
    setAudits([newAudit, ...currentAudits]);

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

    const currentAudits = getFromDb('audits', []);
    const newAudit = {
      id: generateUniqueId('au'),
      date: getFormattedDateTime(),
      type: 'sos_alert',
      driver_name: driver.name,
      details: `ALERTE SOS LANCÉE : ${categoryLabels[category]} depuis ${gpsPositionText}`
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

      triggerToast("🎤 Message vocal envoyé", `Fichier de ${recordedAudio.duration} secondes transmis.`, 'success');
      setRecordedAudio(null);
    }
  };

  // Save Custom Daily Earnings
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
      alert("Aucun versement en attente ('pending') trouvé pour ce chauffeur.");
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
      alert("Aucun versement en attente ('pending') trouvé pour ce chauffeur.");
      return;
    }
    const updatedPayments = currentPayments.map(p => p.id === myPayment.id ? { ...p, status: 'rejected' } : p);
    saveToDb('payments', updatedPayments);
    setPayments(updatedPayments);
    triggerToast("❌ Versement Rejeté !", `Veuillez contacter le propriétaire.`, 'error');
    addNewNotification('❌ Versement refusé', `Le dépôt de ${myPayment.amount.toLocaleString()} FCFA a été rejeté par le propriétaire.`, 'error');
  };

  const devTriggerOilChangeWarning = () => {
    if (vehicle) {
      const updatedVehicle = { ...vehicle, current_mileage: vehicle.last_oil_change_mileage + 4800 };
      setVehicle(updatedVehicle);
      const vehiclesList = getFromDb('vehicles', []);
      const updatedList = vehiclesList.map(v => v.id === vehicle.id ? updatedVehicle : v);
      saveToDb('vehicles', updatedList);
      triggerToast("🔧 Rappel d'Entretien", "Vidange moteur requise bientôt.", 'warning');
      addNewNotification('🔧 Maintenance requise', 'Vidange moteur à prévoir bientôt.', 'warning');
    }
  };

  const devSimulateMagicLinkExpiry = () => {
    alert("Simulation : Déconnexion et redirection avec jeton expiré.");
    localStorage.removeItem('verse_auth_role');
    localStorage.removeItem('verse_auth_driver_id');
    navigate('/driver/login?token=expired_token_mock');
  };

  const devResetDatabase = () => {
    if (window.confirm("Réinitialiser la base de données locale ?")) {
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

  // Notification toggler
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setUnreadCount(0);
      setMockNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  if (!driver || !vehicle) return null;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-0 sm:p-6 select-none font-sans relative overflow-hidden transition-colors duration-300 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Background blobs (subtle glow) */}
      {darkMode ? (
        <div className="absolute top-1/4 left-1/3 w-[450px] h-[450px] bg-[#6D4AFF]/10 rounded-full blur-[140px] pointer-events-none"></div>
      ) : (
        <div className="absolute top-1/4 left-1/3 w-[450px] h-[450px] bg-[#6D4AFF]/5 rounded-full blur-[110px] pointer-events-none"></div>
      )}

      {/* --- IN-APP TOAST SYSTEM --- */}
      {toastNotification && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-xs border rounded-3xl p-4 shadow-xl z-50 flex gap-3.5 text-slate-800 bg-white border-slate-200 animate-sms-toast`}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-[#6D4AFF]/10 text-[#6D4AFF]">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h5 className="text-[12px] font-bold leading-tight">{toastNotification.title}</h5>
            <p className="text-[10px] text-slate-500 font-semibold leading-normal mt-0.5">{toastNotification.message}</p>
          </div>
        </div>
      )}

      {/* Smartphone frame container */}
      <div className={`w-full h-full min-h-screen sm:min-h-[740px] sm:max-w-[390px] overflow-hidden sm:shadow-2xl relative flex flex-col sm:border-[8px] transition-all duration-300 ${
        darkMode 
          ? 'bg-[#090D16] sm:border-slate-800 sm:rounded-[50px] shadow-black/90 text-white' 
          : 'bg-[#F8FAFC] sm:border-slate-250 sm:rounded-[50px] shadow-slate-300/40 text-[#0F172A]'
      }`}>
        
        {/* Smartphone Top Notch */}
        <div className={`hidden sm:flex h-5.5 w-32 mx-auto rounded-b-2xl absolute top-0 left-1/2 -translate-x-1/2 z-40 items-center justify-center ${
          darkMode ? 'bg-slate-850' : 'bg-slate-200'
        }`}>
          <span className="w-3 h-3 rounded-full bg-black/95 block mr-3"></span>
          <span className="w-8 h-1 rounded bg-black/20 block"></span>
        </div>

        {/* Status Bar */}
        <div className={`pt-3 sm:pt-6 px-5 pb-2.5 flex justify-between items-center text-[10px] font-mono z-30 font-semibold ${
          darkMode ? 'bg-slate-900/40 text-slate-450' : 'bg-slate-100/40 text-slate-500'
        }`}>
          <span>20:01</span>
          <div className="flex gap-1.5 items-center">
            <BatteryCharging className="w-4 h-4 text-emerald-500" />
            <span>Orange SN 4G</span>
            <div className={`w-5.5 h-2.5 border rounded-sm p-0.5 flex ${darkMode ? 'border-slate-700' : 'border-slate-350'}`}>
              <div className="bg-emerald-500 h-full w-4/5 rounded-2xs"></div>
            </div>
          </div>
        </div>

        {/* Custom App Header */}
        <div className={`border-b px-5 py-3.5 flex justify-between items-center z-30 transition-colors ${
          darkMode ? 'bg-slate-900/60 border-white/5 backdrop-blur-md' : 'bg-white border-slate-100 shadow-sm'
        }`}>
          <div className="text-left">
            <span className="text-[8.5px] block font-bold text-slate-400 uppercase tracking-wider">Bonjour</span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {driver ? driver.name.split(' ')[0] : 'Amadou Sow'} 👋
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <button
              onClick={toggleNotifications}
              className={`w-9 h-9 rounded-2xl border flex items-center justify-center transition-all cursor-pointer relative ${
                darkMode ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100'
              }`}
            >
              <Zap className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#22C55E] text-white font-bold font-mono text-[8px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Notification Drawer Block */}
        {showNotifications && (
          <div className={`absolute top-[11%] inset-x-0 mx-4 border rounded-3xl p-4 shadow-xl z-40 animate-fade-in ${
            darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-150 text-slate-800'
          }`}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-white/5 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Notifications</span>
              <button onClick={() => setShowNotifications(false)}>
                <X className="w-4.5 h-4.5 text-slate-400 hover:text-slate-850" />
              </button>
            </div>
            
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {mockNotifications.map(n => (
                <div key={n.id} className={`p-2.5 rounded-xl border flex gap-3 ${
                  darkMode ? 'bg-slate-950/50 border-white/5' : 'bg-slate-50 border-slate-100'
                }`}>
                  <span className="text-base shrink-0 mt-0.5">
                    {n.type === 'success' ? '🟢' : n.type === 'warning' ? '🔧' : '✉️'}
                  </span>
                  <div className="flex-1 text-left">
                    <h6 className="text-[11px] font-bold leading-snug">{n.title}</h6>
                    <p className="text-[9.5px] leading-snug mt-0.5 text-slate-500 dark:text-slate-400">{n.message}</p>
                    <span className="text-[8px] text-slate-400 block mt-1 font-mono">{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Smartphone Screen Body */}
        <div className={`flex-1 overflow-y-auto relative p-4 pb-24 flex flex-col transition-colors ${
          darkMode ? 'bg-[#060A12]' : 'bg-[#F8FAFC]'
        }`}>
          
          {/* --- DECLARATION FINAL ANIMATED SUCCESS OVERLAY --- */}
          {successOverlay && (
            <div className="absolute inset-0 bg-white/95 dark:bg-slate-950/95 z-50 flex flex-col items-center justify-center text-center p-6 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-5 animate-scaleUp">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-md font-bold text-slate-900 dark:text-white">Versement déclaré !</h3>
              <p className="text-xs text-slate-500 mt-2 max-w-[220px] mx-auto font-medium leading-relaxed">
                Votre déclaration a été envoyée. Le propriétaire va valider la référence sous peu.
              </p>
              <div className="w-16 h-1 bg-emerald-100 rounded-full overflow-hidden mt-6">
                <div className="bg-[#22C55E] h-full rounded-full animate-progressFill"></div>
              </div>
            </div>
          )}

          {/* --- CONFIRMATION DECLARATION DRAWER MODAL --- */}
          {showConfirmRecap && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-40 flex items-center justify-center p-4">
              <div className={`border rounded-3xl w-full max-w-xs overflow-hidden shadow-2xl p-5 space-y-4 animate-fade-in text-left ${
                darkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-150'
              }`}>
                <div className="text-center space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider">Valider l'envoi</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Vérifiez vos données avant la signature électronique.</p>
                </div>

                <div className="p-3.5 rounded-2xl text-[11px] space-y-2.5 font-medium bg-slate-50 dark:bg-slate-950 text-slate-655 dark:text-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Immatriculation :</span>
                    <strong className="text-slate-800 dark:text-white uppercase font-mono">{vehicle.license_plate}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Odomètre :</span>
                    <strong className="text-slate-800 dark:text-white font-mono">{parseInt(mileage).toLocaleString()} km</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Montant :</span>
                    <strong className="text-[#22C55E] font-bold">{parseFloat(amount).toLocaleString()} FCFA</strong>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-200/50 pt-2">
                    <span className="text-slate-400">Opérateur :</span>
                    <span className="font-bold flex items-center gap-1">
                      {paymentMethod === 'wave' ? '🟦 Wave' : paymentMethod === 'orange_money' ? '🟧 Orange Money' : '🟩 Espèces'}
                    </span>
                  </div>
                  {ref && (
                    <div className="flex flex-col gap-1 border-t border-slate-200/50 pt-2">
                      <span className="text-slate-400">Référence :</span>
                      <span className="font-mono text-[9.5px] text-slate-500 break-all bg-white dark:bg-slate-900 p-1.5 rounded border border-slate-100 dark:border-white/5">{ref}</span>
                    </div>
                  )}
                  {isReceiptSelected && (
                    <div className="border-t border-slate-200/50 pt-2">
                      <span className="text-slate-400 block mb-1">Aperçu reçu :</span>
                      <img src={receiptUrl} alt="Reçu joint" className="w-full h-20 object-cover rounded-xl border border-slate-100" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={handleConfirmSubmit}
                    className="w-full bg-[#22C55E] hover:bg-emerald-600 text-white font-bold text-xs py-3 rounded-2xl transition-all cursor-pointer text-center active:scale-95 shadow-sm"
                  >
                    Confirmer et Signer
                  </button>
                  <button
                    onClick={() => setShowConfirmRecap(false)}
                    className="w-full text-xs font-bold py-2.5 rounded-2xl transition-all cursor-pointer text-center border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
                  >
                    Corriger
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ----------------- TAB: HOME (ACCUEIL) ----------------- */}
          {activeTab === 'home' && (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              
              <div className="space-y-4">
                
                {/* Visual Status Banner Card */}
                {isPaidToday ? (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center space-y-1 flex flex-col items-center shadow-xs text-left">
                    <span className="text-xl">🟢</span>
                    <h4 className="text-[11px] font-bold text-[#22C55E] uppercase tracking-wider">Versement Journalier : Validé</h4>
                    <p className="text-[10px] text-slate-505 font-medium leading-relaxed text-center">
                      Votre versement requis pour aujourd'hui a été approuvé. Bon repos !
                    </p>
                  </div>
                ) : isPendingToday ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center space-y-1 flex flex-col items-center shadow-xs animate-pulse text-left">
                    <span className="text-xl">⏳</span>
                    <h4 className="text-[11px] font-bold text-[#F59E0B] uppercase tracking-wider text-center">En attente de vérification</h4>
                    <p className="text-[10px] text-slate-505 font-medium leading-relaxed text-center">
                      Le reçu a été transmis. En attente de confirmation par le propriétaire.
                    </p>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center space-y-1 flex flex-col items-center shadow-xs text-left">
                    <span className="text-xl">🔴</span>
                    <h4 className="text-[11px] font-bold text-[#EF4444] uppercase tracking-wider">Versement requis aujourd'hui</h4>
                    <p className="text-[10px] text-slate-505 font-medium leading-relaxed text-center">
                      Versement attendu de 15 000 FCFA non encore validé pour la journée.
                    </p>
                  </div>
                )}

                {/* Sleek Vehicle Card */}
                <div className="bg-white border border-slate-100 rounded-2xl p-3.5 shadow-sm flex items-center justify-between text-left">
                  <div className="flex items-center gap-3.5">
                    {vehicle.vehicle_image ? (
                      <img 
                        src={vehicle.vehicle_image} 
                        alt={vehicle.brand_model} 
                        className="w-12 h-12 object-cover rounded-xl border border-slate-100 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 text-slate-400">
                        <Car className="w-6 h-6" />
                      </div>
                    )}
                    <div className="space-y-0.5 text-left">
                      <span className="text-[9px] font-bold text-[#6D4AFF] uppercase tracking-wider block">Véhicule</span>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {vehicle.brand_model || 'Toyota Corolla'}
                      </h4>
                      <span className="text-[10.5px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                        {vehicle.license_plate}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 text-[#22C55E] text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1.5 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
                    <span>En ligne</span>
                  </div>
                </div>

                {/* Informations du jour (4 clean simple cards) */}
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="bg-white border border-slate-100 p-3.5 rounded-2xl shadow-xs space-y-0.5">
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">À verser aujourd'hui</span>
                    <strong className="text-sm font-bold text-[#0F172A] block font-mono">15 000 FCFA</strong>
                  </div>
                  
                  <div className="bg-white border border-slate-100 p-3.5 rounded-2xl shadow-xs space-y-0.5">
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Versement</span>
                    <strong className={`text-xs font-bold block ${isPaidToday ? 'text-[#22C55E]' : isPendingToday ? 'text-[#F59E0B]' : 'text-[#EF4444]'}`}>
                      {isPaidToday ? 'Validé' : isPendingToday ? 'En attente' : 'Non envoyé'}
                    </strong>
                  </div>
                  
                  <div className="bg-white border border-slate-100 p-3.5 rounded-2xl shadow-xs space-y-0.5">
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Kilométrage</span>
                    <strong className="text-sm font-bold text-[#0F172A] block font-mono">{distanceTraveled ? Math.floor(distanceTraveled) : 125} km</strong>
                  </div>
                  
                  <div className="bg-white border border-slate-100 p-3.5 rounded-2xl shadow-xs space-y-0.5">
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Statut véhicule</span>
                    <strong className="text-xs font-bold text-[#22C55E] block">En ligne</strong>
                  </div>
                </div>

                {/* Grille de 6 icônes (Actions Rapides) */}
                <div className="space-y-2 text-left">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block text-center">Actions Chauffeur</span>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => {
                        speakGuide("Déclarer versement. Choisissez Wave, Orange Money ou Espèces. Prenez une photo du reçu.", "Dougal sa versement. Tannal Wave walla Orange Money. Natafal reçu bi.");
                        setActiveTab('declare');
                      }}
                      className="bg-white border border-slate-100 p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center shadow-xs active:scale-95 cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-8.5 h-8.5 rounded-xl bg-purple-50 flex items-center justify-center text-[#6D4AFF]">
                        <FileText className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-[9px] font-bold text-slate-700">Déclarer</span>
                    </button>

                    <button 
                      onClick={() => {
                        setPaymentMethod('wave');
                        handleSimulateUpload();
                        setActiveTab('declare');
                      }}
                      className="bg-white border border-slate-100 p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center shadow-xs active:scale-95 cursor-pointer hover:bg-slate-50 transition-colors text-slate-700"
                    >
                      <div className="w-8.5 h-8.5 rounded-xl bg-green-50 flex items-center justify-center text-[#22C55E]">
                        <Camera className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-[9px] font-bold">Reçu</span>
                    </button>

                    <button 
                      onClick={() => {
                        setActiveTab('chat');
                        setTimeout(() => startRecording(), 300);
                      }}
                      className="bg-white border border-slate-100 p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center shadow-xs active:scale-95 cursor-pointer hover:bg-slate-50 transition-colors text-slate-700"
                    >
                      <div className="w-8.5 h-8.5 rounded-xl bg-purple-50 flex items-center justify-center text-[#6D4AFF]">
                        <Mic className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-[9px] font-bold">Vocal</span>
                    </button>

                    <button 
                      onClick={() => window.open('tel:771234567')}
                      className="bg-white border border-slate-100 p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center shadow-xs active:scale-95 cursor-pointer hover:bg-slate-50 transition-colors text-slate-700"
                    >
                      <div className="w-8.5 h-8.5 rounded-xl bg-green-50 flex items-center justify-center text-[#22C55E]">
                        <Phone className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-[9px] font-bold">Appeler</span>
                    </button>

                    <button 
                      onClick={() => window.open('https://wa.me/221771234567')}
                      className="bg-white border border-slate-100 p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center shadow-xs active:scale-95 cursor-pointer hover:bg-slate-50 transition-colors text-slate-700"
                    >
                      <div className="w-8.5 h-8.5 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-650">
                        <MessageSquare className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-[9px] font-bold">WhatsApp</span>
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
                      className="bg-white border border-slate-100 p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center shadow-xs active:scale-95 cursor-pointer hover:bg-slate-50 transition-colors text-slate-700"
                    >
                      <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center transition-colors ${gpsActive ? 'bg-purple-100 text-[#6D4AFF]' : 'bg-slate-50 text-slate-400'}`}>
                        <MapPin className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-[9px] font-bold">Ma position</span>
                    </button>
                  </div>
                </div>

                {/* Bouton SOS (Single row discrète, pas d'effet dramatique) */}
                <div className="bg-red-50 border border-red-100 rounded-2xl p-3.5 flex items-center justify-between text-left shadow-2xs mt-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4.5 h-4.5 text-[#EF4444]" />
                    <div className="text-left">
                      <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider block">Signaler un problème</span>
                      <span className="text-[8.5px] text-slate-500 font-semibold block mt-0.5">Accident, panne ou urgence police</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setShowSosDialog(true)}
                    className="bg-[#EF4444] hover:bg-red-600 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-xl cursor-pointer shadow-sm active:scale-95 uppercase tracking-wider"
                  >
                    SOS
                  </button>
                </div>

              </div>

              {/* Simple vehicle signature */}
              <div className="text-center pt-4 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-400 font-semibold mt-6">
                <span>Chauffeur : {driver ? driver.name : ''}</span>
                <span>Toyota Corolla • DK-8854-B</span>
              </div>

            </div>
          )}

          {/* ----------------- TAB: VERSEMENTS (FORMULAIRE & LOGS) ----------------- */}
          {activeTab === 'declare' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Voice Guide Speech Bubble */}
              <div className="flex items-start gap-3 bg-[#6D4AFF]/5 border border-[#6D4AFF]/15 p-3.5 rounded-3xl relative text-left">
                <button 
                  type="button"
                  onClick={() => speakGuide(
                    "Sélectionnez Wave, Orange Money ou Espèces. Prenez une photo du reçu de paiement. Entrez le kilométrage de la voiture et validez.",
                    "Tannal Wave walla Orange Money. Natafal reçu bi. Bindal kilométrage auto bi ba paré cuqal bouton vert bi."
                  )}
                  className="w-9 h-9 rounded-full bg-[#6D4AFF]/10 hover:bg-[#6D4AFF]/20 text-[#6D4AFF] flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-[9px] font-bold text-[#6D4AFF] uppercase tracking-wider">Aide Vocale</p>
                    <div className="flex gap-1">
                      <button 
                        type="button"
                        onClick={() => setVoiceLang('fr')}
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                          voiceLang === 'fr' ? 'bg-[#6D4AFF] text-white' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        FR
                      </button>
                      <button 
                        type="button"
                        onClick={() => setVoiceLang('wo')}
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                          voiceLang === 'wo' ? 'bg-[#6D4AFF] text-white' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        WO
                      </button>
                    </div>
                  </div>
                  <p className="text-[9.5px] font-semibold leading-normal text-slate-600">
                    {voiceLang === 'wo' ? 'Tannal Wave walla Orange Money. Natafal reçu bi. Bindal kilométrage auto bi.' : 'Choisis ton opérateur. Prends en photo le reçu. Saisis ton kilométrage de fin de journée.'}
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-[#EF4444] text-xs p-3 rounded-2xl flex gap-2 font-bold animate-fadeIn text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              <form onSubmit={handleOpenRecap} className="space-y-4">
                
                {/* 1. Payment Operator selector (Wave, OM, Cash) */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider block text-center">1. Moyen de versement</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'wave', label: 'Wave', icon: '🟦' },
                      { id: 'orange_money', label: 'Orange M.', icon: '🟧' },
                      { id: 'cash', label: 'Espèces', icon: '💵' }
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
                        className={`py-3 rounded-2xl border flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all active:scale-95 text-[10.5px] font-bold ${
                          paymentMethod === mode.id
                            ? 'bg-[#6D4AFF]/5 border-[#6D4AFF] text-[#6D4AFF]'
                            : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <span className="text-sm">{mode.icon}</span>
                        <span className="mt-0.5">{mode.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Receipt capture / upload */}
                {paymentMethod !== 'cash' && (
                  <div className="space-y-1.5 text-left">
                    <label className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider block text-center">2. Reçu de paiement (Capture)</label>
                    {isReceiptSelected ? (
                      <div 
                        onClick={handleSimulateUpload}
                        className="bg-green-50 border border-green-200 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:bg-green-100/30 transition-all text-left"
                      >
                        <div className="space-y-0.5 text-left">
                          <span className="text-[10px] text-green-700 font-bold uppercase tracking-wide flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4 text-[#22C55E]" /> Reçu enregistré !
                          </span>
                          <span className="text-[8.5px] text-slate-500 block font-mono">Réf : {ref}</span>
                        </div>
                        <span className="text-[9px] bg-[#22C55E] text-white font-bold px-2.5 py-1 rounded-lg uppercase cursor-pointer">Modifier</span>
                      </div>
                    ) : (
                      <div 
                        onClick={handleSimulateUpload}
                        className="border-2 border-dashed border-slate-250 rounded-2xl p-5 text-center cursor-pointer transition-all hover:bg-slate-50 flex flex-col items-center justify-center gap-1.5 bg-white"
                      >
                        <span className="text-2xl">📸</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                          Prendre le reçu en photo
                        </span>
                        <span className="text-[8px] text-slate-400 block font-medium">
                          (Appuyez pour simuler une photo)
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Mileage Input */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider block text-center">3. Kilométrage actuel</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={mileage}
                      onChange={(e) => setMileage(e.target.value)}
                      className="w-full border border-slate-250 rounded-2xl px-4 py-3 text-xs font-mono font-bold focus:outline-none focus:border-[#6D4AFF] text-center min-h-[44px] bg-white text-slate-800"
                      placeholder={`${vehicle.current_mileage + 120}`}
                    />
                    <span className="absolute right-4 top-3 text-[9px] text-slate-400 font-bold font-mono">KM</span>
                  </div>
                  <span className="text-[8.5px] text-slate-400 block text-center">
                    Dernier kilométrage enregistré : <strong className="text-slate-600 font-mono">{vehicle.current_mileage.toLocaleString()} km</strong>
                  </span>
                </div>

                {/* 4. Amount Selection */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider block text-center">4. Montant à déclarer</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full border border-slate-250 rounded-2xl px-4 py-3 text-xs font-mono font-bold focus:outline-none focus:border-[#6D4AFF] text-center min-h-[44px] bg-white text-slate-800"
                      placeholder="15000"
                    />
                    <span className="absolute right-4 top-3 text-[9px] text-slate-400 font-bold font-mono">FCFA</span>
                  </div>

                  <div className="flex gap-2 justify-center pt-1">
                    {['10000', '15000', '20000'].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val)}
                        className={`text-[9.5px] font-bold px-4 py-1.5 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                          amount === val
                            ? 'bg-[#6D4AFF] border-[#6D4AFF] text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {parseInt(val).toLocaleString()} F
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#6D4AFF] hover:bg-[#5636E5] text-white font-bold text-xs py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer mt-4 active:scale-98 min-h-[46px]"
                >
                  <CheckCircle className="w-4.5 h-4.5" />
                  <span className="uppercase tracking-wider font-bold">Valider le versement</span>
                </button>

              </form>

              {/* Payments history list */}
              <div className="space-y-2.5 pt-5 border-t border-slate-150 text-left">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Déclarations de versement</span>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {payments.filter(p => p.driver_name === driver.name).map(p => (
                    <div key={p.id} className="p-3 rounded-2xl border border-slate-100 bg-white flex justify-between items-center shadow-2xs">
                      <div className="text-left">
                        <strong className="text-xs block text-slate-850 font-bold">{p.amount.toLocaleString()} FCFA</strong>
                        <span className="text-[8.5px] text-slate-500 font-mono block mt-0.5 text-left">{p.submitted_at} | Réf : {p.transaction_reference}</span>
                      </div>
                      
                      <span className={`text-[8.5px] font-bold uppercase px-2 py-0.5 rounded tracking-wide border ${
                        p.status === 'approved' 
                          ? 'bg-green-50 border-green-200 text-[#22C55E]' 
                          : p.status === 'rejected'
                            ? 'bg-red-50 border-red-200 text-[#EF4444]'
                            : 'bg-amber-50 border-amber-250 text-[#F59E0B]'
                      }`}>
                        {p.status === 'approved' ? 'Validé' : p.status === 'rejected' ? 'Rejeté' : 'Attente'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ----------------- TAB: MESSAGES (CHAT & VOCAL) ----------------- */}
          {activeTab === 'chat' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Voice Guide Speech Bubble */}
              <div className="flex items-start gap-3 bg-[#6D4AFF]/5 border border-[#6D4AFF]/15 p-3.5 rounded-3xl relative text-left">
                <button 
                  type="button"
                  onClick={() => speakGuide(
                    "Cliquez sur le gros micro pour enregistrer un message vocal au propriétaire, ou appuyez sur un message rapide pour l'envoyer immédiatement.",
                    "Cuqal micro bi ngir vocal walla message rapide yi ngir yone ko boss bi paré."
                  )}
                  className="w-9 h-9 rounded-full bg-[#6D4AFF]/10 hover:bg-[#6D4AFF]/20 text-[#6D4AFF] flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-[9px] font-bold text-[#6D4AFF] uppercase tracking-wider">Aide Vocale</p>
                    <div className="flex gap-1">
                      <button 
                        type="button"
                        onClick={() => setVoiceLang('fr')}
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                          voiceLang === 'fr' ? 'bg-[#6D4AFF] text-white' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        FR
                      </button>
                      <button 
                        type="button"
                        onClick={() => setVoiceLang('wo')}
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                          voiceLang === 'wo' ? 'bg-[#6D4AFF] text-white' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        WO
                      </button>
                    </div>
                  </div>
                  <p className="text-[9.5px] font-semibold leading-normal text-slate-600">
                    {voiceLang === 'wo' ? 'Cuq micro bi ngir dougal vocal, walla émoji yi ngir yone message rapide.' : 'Parlez directement au patron par vocal ou messages rapides d\'un seul clic.'}
                  </p>
                </div>
              </div>

              <div className="space-y-0.5 text-left">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Discuter avec le propriétaire</h4>
                <p className="text-[9.5px] text-slate-550">Vos vocaux et alertes rapides sont visibles directement sur son tableau de bord.</p>
              </div>

              {/* Simulated Voice Message Recorder (WhatsApp Style) */}
              <div className="border border-slate-150 rounded-3xl p-4.5 text-center space-y-3 bg-white shadow-xs">
                <h5 className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Message Vocal</h5>

                {isRecording ? (
                  <div className="space-y-3">
                    {/* Audio wave animation */}
                    <div className="flex items-center justify-center gap-1.5 h-8">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((bar) => {
                        const height = 6 + ((bar * 5) % 18);
                        return (
                          <div 
                            key={bar} 
                            className="w-1 bg-[#6D4AFF] rounded-full transition-all duration-150 animate-pulse" 
                            style={{ height: `${height}px` }}
                          />
                        );
                      })}
                    </div>
                    
                    <div className="text-xs font-bold font-mono text-[#EF4444] flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 bg-[#EF4444] rounded-full animate-ping mr-1"></span>
                      ENREGISTREMENT : {recordingSeconds}s
                    </div>

                    <button
                      type="button"
                      onClick={stopRecording}
                      className="w-12 h-12 rounded-full bg-[#EF4444] text-white flex items-center justify-center mx-auto cursor-pointer animate-pulse active:scale-90"
                    >
                      <Square className="w-5 h-5 fill-white" />
                    </button>
                  </div>
                ) : recordedAudio ? (
                  <div className="space-y-3">
                    <div className="text-[10.5px] font-bold text-slate-500 flex items-center justify-center gap-1.5">
                      🎙️ vocal_{recordedAudio.duration}s.wav prêt à l'envoi
                    </div>

                    <div className="flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsPlayingAudio(true);
                          setTimeout(() => setIsPlayingAudio(false), recordedAudio.duration * 1000);
                        }}
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center border cursor-pointer active:scale-95 ${
                          isPlayingAudio 
                            ? 'bg-[#6D4AFF]/10 border-[#6D4AFF] text-[#6D4AFF]' 
                            : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100'
                        }`}
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setRecordedAudio(null)}
                        className="w-10 h-10 rounded-2xl bg-red-50 border border-red-150 text-[#EF4444] flex items-center justify-center cursor-pointer hover:bg-red-100/50 active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={sendVoiceMessage}
                      className="w-full bg-[#6D4AFF] hover:bg-[#5636E5] text-white font-bold text-xs py-2.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm min-h-[40px]"
                    >
                      <Send className="w-4 h-4" />
                      Envoyer le message vocal
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[9.5px] text-slate-500 font-medium leading-relaxed max-w-[240px] mx-auto">
                      Appuyez sur le micro pour enregistrer. Votre patron recevra l'enregistrement vocal directement.
                    </p>

                    <button
                      type="button"
                      onClick={startRecording}
                      className="w-14 h-14 rounded-full bg-[#6D4AFF] text-white flex items-center justify-center mx-auto cursor-pointer hover:bg-[#5636E5] shadow-sm active:scale-90"
                    >
                      <Mic className="w-6 h-6 text-white" />
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Preset Messages in 1 Click */}
              <div className="space-y-2 text-left">
                <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block">Messages rapides (Envoi 1-Clic)</span>
                
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { text: 'Je commence ma journée', icon: '🏁' },
                    { text: 'Panne mécanique sur la route', icon: '🔧' },
                    { text: 'Au garage pour entretien / vidange', icon: '🏠' },
                    { text: 'Versement envoyé sur mobile money', icon: '💰' },
                    { text: 'Retard de versement pour aujourd\'hui', icon: '⏳' },
                    { text: 'Contrôle routier de police', icon: '👮' }
                  ].map((msg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => triggerQuickMessage(msg.text)}
                      className="w-full py-3 rounded-2xl border border-slate-150 bg-white flex items-center gap-3 px-4 text-xs font-semibold transition-all active:scale-98 text-left cursor-pointer min-h-[46px] hover:bg-slate-50 text-slate-700"
                    >
                      <span className="text-sm shrink-0">{msg.icon}</span>
                      <span className="truncate">{msg.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Incidents logs */}
              <div className="space-y-2.5 pt-4 border-t border-slate-150 text-left">
                <span className="text-[10px] text-slate-455 uppercase font-bold tracking-wider block">Incidents & SOS signalés</span>
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {incidents.filter(i => i.driver_name === driver.name).map(i => (
                    <div key={i.id} className="p-3 rounded-2xl border border-slate-100 bg-white shadow-2xs">
                      <div className="flex justify-between items-center">
                        <strong className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{i.type.toUpperCase()}</strong>
                        <span className="text-[8px] text-slate-400 font-mono">{i.date}</span>
                      </div>
                      <p className="text-[9.5px] leading-snug mt-1 text-slate-655 font-medium">{i.description}</p>
                    </div>
                  ))}
                  {incidents.filter(i => i.driver_name === driver.name).length === 0 && (
                    <span className="text-[9.5px] text-slate-400 font-medium block text-center py-3">Aucun problème signalé.</span>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ----------------- TAB: VÉHICULE (DETAILS & GPS) ----------------- */}
          {activeTab === 'vehicle' && (
            <div className="space-y-4 animate-fadeIn text-left">
              
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold uppercase tracking-wider">Mon Véhicule</h4>
                <p className="text-[9.5px] text-slate-550">Suivi et maintenance de votre outil de travail.</p>
              </div>

              {/* Specs vehicle card */}
              <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-xs text-left space-y-3.5">
                <div className="flex gap-4 items-center">
                  {vehicle.vehicle_image ? (
                    <img 
                      src={vehicle.vehicle_image} 
                      alt={vehicle.brand_model} 
                      className="w-16 h-16 object-cover rounded-2xl border border-slate-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-150">
                      <Car className="w-8 h-8" />
                    </div>
                  )}
                  <div className="space-y-0.5">
                    <span className="text-[8px] bg-purple-50 text-[#6D4AFF] border border-purple-100 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">Toyota</span>
                    <h4 className="text-md font-bold text-slate-900 leading-tight">{vehicle.brand_model || 'Toyota Corolla'}</h4>
                    <span className="text-xs font-mono font-bold text-slate-500 uppercase block">{vehicle.license_plate}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3.5 text-xs font-semibold">
                  <div className="space-y-0.5 text-left">
                    <span className="text-[9px] text-slate-450 uppercase font-bold tracking-wider block">Odomètre</span>
                    <strong className="block font-mono text-slate-800">{vehicle.current_mileage.toLocaleString()} km</strong>
                  </div>
                  <div className="space-y-0.5 text-left">
                    <span className="text-[9px] text-slate-450 uppercase font-bold tracking-wider block">Dernière vidange</span>
                    <strong className="block font-mono text-slate-800">{vehicle.last_oil_change_mileage.toLocaleString()} km</strong>
                  </div>
                  <div className="space-y-0.5 text-left">
                    <span className="text-[9px] text-slate-450 uppercase font-bold tracking-wider block">Prochaine maintenance</span>
                    <strong className="block font-mono text-slate-800">{(vehicle.last_oil_change_mileage + 5000).toLocaleString()} km</strong>
                  </div>
                  <div className="space-y-0.5 text-left">
                    <span className="text-[9px] text-slate-450 uppercase font-bold tracking-wider block">Statut mécanique</span>
                    <span className="text-[#22C55E] font-bold block">Excellent 🟢</span>
                  </div>
                </div>
              </div>

              {/* Simulated GPS Tracker Widget */}
              <div className="p-4.5 rounded-3xl border border-slate-100 bg-white space-y-3.5 shadow-xs text-left">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <MapPin className={`w-4 h-4 text-[#6D4AFF] ${gpsActive ? 'animate-bounce' : ''}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Traceur GPS Balise</span>
                  </div>
                  
                  <button
                    onClick={() => setGpsMode(gpsMode === 'performance' ? 'eco' : 'performance')}
                    className="text-[8px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-[#6D4AFF] border border-purple-100 cursor-pointer transition-colors"
                  >
                    ⚡ {gpsMode === 'performance' ? 'Vitesse 10s' : 'Éco 20s'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3.5 border-t border-slate-100 pt-3">
                  <div className="space-y-0.5 text-left">
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Position balise</span>
                    <strong className="text-xs font-bold text-slate-800 block">
                      {gpsPositionText}
                    </strong>
                    <span className="text-[8.5px] text-slate-500 font-mono block">
                      {gpsCoordinates.lat.toFixed(4)}, {gpsCoordinates.lng.toFixed(4)}
                    </span>
                  </div>

                  <div className="space-y-0.5 text-right">
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Distance parcourue</span>
                    <strong className="text-xs font-bold text-slate-900 block font-mono">
                      {distanceTraveled} KM
                    </strong>
                    <span className="text-[8.5px] text-slate-400 block font-mono">
                      MàJ : {lastGpsTime}
                    </span>
                  </div>
                </div>
                
                <div className="text-[8.5px] text-slate-400 font-bold border-t border-slate-100 pt-2.5 flex items-center justify-between">
                  <span>Balise active : {gpsActive ? '🟢 Transmission temps réel' : '🔴 Suspendue'}</span>
                  <button 
                    onClick={() => {
                      setDistanceTraveled(124.5);
                      triggerToast("GPS", "Indicateur de distance réinitialisé.", "info");
                    }}
                    className="text-[#6D4AFF] underline font-bold hover:text-[#5636E5] cursor-pointer"
                  >
                    Reset balise
                  </button>
                </div>
              </div>

              {/* Audit trail security logs */}
              <div className="space-y-2.5 pt-4 border-t border-slate-150 text-left">
                <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block">Journal d'accès & Sécurité</span>
                <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                  {audits.filter(au => au.driver_name === driver.name).map(au => (
                    <div key={au.id} className="p-2 border border-slate-100 rounded-xl text-[9px] font-mono bg-white shadow-2xs text-slate-500">
                      <div className="flex justify-between font-bold text-slate-450 mb-0.5">
                        <span className="text-[#6D4AFF]">{au.type.toUpperCase()}</span>
                        <span>{au.date}</span>
                      </div>
                      <p className="font-sans font-medium text-slate-700 leading-snug">{au.details}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ----------------- TAB: PROFIL (PARAMS & LOGOUT) ----------------- */}
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-fadeIn text-left">
              
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold uppercase tracking-wider">Mon Compte</h4>
                <p className="text-[9.5px] text-slate-500">Réglages généraux et outils de démonstration.</p>
              </div>

              {/* Driver info card */}
              <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-xs text-left flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-purple-50 border border-purple-100 text-[#6D4AFF] font-bold text-md flex items-center justify-center shrink-0">
                  {driver ? driver.name.split(' ').map(n => n[0]).join('') : 'AS'}
                </div>
                
                <div className="space-y-0.5 text-left">
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">{driver ? driver.name : 'Amadou Sow'}</h4>
                  <span className="text-[10.5px] text-slate-505 block font-medium">WhatsApp : {driver ? driver.phone : ''}</span>
                  <span className="text-[8.5px] uppercase font-bold text-emerald-600 tracking-wider block">Chauffeur Actif 🟢</span>
                </div>
              </div>

              {/* Settings links */}
              <div className="bg-white border border-slate-100 rounded-3xl p-2.5 shadow-xs text-left text-xs divide-y divide-slate-100">
                <div className="p-3.5 flex justify-between items-center">
                  <span className="font-semibold text-slate-700">Langue de l'aide vocale</span>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => setVoiceLang('fr')}
                      className={`text-[9.5px] font-bold px-2 py-0.5 rounded transition-colors ${
                        voiceLang === 'fr' ? 'bg-[#6D4AFF] text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      FR
                    </button>
                    <button 
                      onClick={() => setVoiceLang('wo')}
                      className={`text-[9.5px] font-bold px-2 py-0.5 rounded transition-colors ${
                        voiceLang === 'wo' ? 'bg-[#6D4AFF] text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      WO 🇸🇳
                    </button>
                  </div>
                </div>

                <div className="p-3.5 flex justify-between items-center">
                  <span className="font-semibold text-slate-700">Thème Sombre</span>
                  <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className={`text-[9.5px] font-bold px-3 py-0.5 rounded transition-colors border ${
                      darkMode ? 'bg-[#6D4AFF] text-white border-[#6D4AFF]' : 'bg-white text-slate-500 border-slate-200'
                    }`}
                  >
                    {darkMode ? 'Activé' : 'Désactivé'}
                  </button>
                </div>

                <div className="p-3.5 flex justify-between items-center">
                  <span className="font-semibold text-slate-700">Recette journalière</span>
                  <button 
                    onClick={() => {
                      setCustomIncomeInput(driver.daily_income || '0');
                      setIsEditingIncome(true);
                    }}
                    className="text-[#6D4AFF] font-bold hover:underline"
                  >
                    {(driver?.daily_income || 0).toLocaleString()} FCFA 📝
                  </button>
                </div>
              </div>

              {/* Daily Income customizable edit modal */}
              {isEditingIncome && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                  <form 
                    onSubmit={handleSaveIncome}
                    className="border border-slate-150 rounded-3xl w-full max-w-xs p-5 space-y-4 bg-white text-slate-800 text-left shadow-2xl animate-fade-in"
                  >
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 text-left">Saisir Gains du Jour</h4>
                    <p className="text-[10px] text-slate-500 font-medium text-left">Enregistrez vos gains réels du jour pour votre propre suivi.</p>
                    
                    <div className="relative">
                      <input 
                        type="number"
                        value={customIncomeInput}
                        onChange={(e) => setCustomIncomeInput(e.target.value)}
                        className="w-full border border-slate-250 rounded-xl px-4 py-3 text-xs font-mono font-bold focus:outline-none focus:border-[#6D4AFF] text-center bg-white text-slate-800"
                        placeholder="42500"
                      />
                      <span className="absolute right-4 top-3 text-[9px] text-slate-400 font-bold font-mono">FCFA</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 bg-[#6D4AFF] hover:bg-[#5636E5] text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer text-center"
                      >
                        Enregistrer
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingIncome(false)}
                        className="flex-1 bg-slate-100 text-slate-650 text-xs font-bold py-2.5 rounded-xl transition-all border border-slate-200 cursor-pointer text-center"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Collapse Developer Tools panel */}
              <div className="bg-white border border-slate-100 rounded-3xl p-2.5 shadow-xs text-left">
                <button
                  type="button"
                  onClick={() => setShowDevPanel(!showDevPanel)}
                  className="w-full flex justify-between items-center p-2.5 font-bold text-xs text-slate-650 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 text-slate-700">⚙️ Simulateur de Démo (Dev Tools)</span>
                  <span className="text-slate-400">{showDevPanel ? '▲' : '▼'}</span>
                </button>

                {showDevPanel && (
                  <div className="p-2 pt-3.5 border-t border-slate-100 mt-2 space-y-3 animate-fadeIn text-[10px]">
                    <p className="text-[9.5px] text-slate-550 font-semibold leading-relaxed text-left">
                      Actions rapides pour simuler les approbations du propriétaire sans passer par son interface.
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={devApproveLatestPayment}
                        className="bg-green-50 border border-green-200 text-green-700 font-bold py-2 rounded-xl cursor-pointer hover:bg-green-100/40 transition-colors text-center"
                      >
                        👍 Valider versement
                      </button>

                      <button 
                        onClick={devRejectLatestPayment}
                        className="bg-red-50 border border-red-200 text-red-700 font-bold py-2 rounded-xl cursor-pointer hover:bg-red-100/40 transition-colors text-center"
                      >
                        👎 Rejeter versement
                      </button>

                      <button 
                        onClick={devTriggerOilChangeWarning}
                        className="bg-amber-50 border border-amber-250 text-[#F59E0B] font-bold py-2.5 rounded-xl cursor-pointer hover:bg-amber-100/40 transition-colors text-center col-span-2"
                      >
                        🔧 Simuler Vidange Requise (+4800 km)
                      </button>

                      <button 
                        onClick={devSimulateMagicLinkExpiry}
                        className="bg-purple-50 border border-purple-100 text-[#6D4AFF] font-bold py-2.5 rounded-xl cursor-pointer hover:bg-purple-100/30 transition-colors text-center col-span-2"
                      >
                        🔗 Simuler Magic Link WhatsApp Expiré
                      </button>

                      <button 
                        onClick={devResetDatabase}
                        className="bg-slate-50 border border-slate-250 text-slate-650 font-bold py-2 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors text-center col-span-2"
                      >
                        🔄 Reset Database
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Logout button */}
              <button 
                onClick={handleLogout}
                className="w-full border border-red-200 bg-red-50/15 text-[#EF4444] font-bold text-xs py-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98] mt-4"
              >
                Se Déconnecter 🚪
              </button>

            </div>
          )}

        </div>

        {/* --- BOTTOM TAB BAR NAVIGATION --- */}
        <div className="absolute bottom-[30px] inset-x-0 border-t py-2.5 px-4 flex justify-between items-center z-30 backdrop-blur-md transition-colors bg-white/95 border-slate-150 shadow-md">
          
          {[
            { id: 'home', label: 'Accueil', icon: Home },
            { id: 'declare', label: 'Versements', icon: FileText },
            { id: 'chat', label: 'Messages', icon: Mic },
            { id: 'vehicle', label: 'Véhicule', icon: Car },
            { id: 'profile', label: 'Profil', icon: User }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            let activeColor = isActive ? 'text-[#6D4AFF]' : 'text-slate-400 hover:text-slate-650';

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setShowConfirmRecap(false);
                }}
                className={`flex flex-col items-center gap-0.5 cursor-pointer transition-all active:scale-90 ${activeColor}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-bold tracking-wide">{item.label}</span>
              </button>
            );
          })}

        </div>

        {/* Smartphone Home Indicator Bar */}
        <div className="py-1.5 flex justify-center items-center z-30 mt-auto transition-colors bg-slate-100">
          <span className="w-28 h-1 rounded-full block bg-slate-300"></span>
        </div>

      </div>

      {/* Switch links */}
      <div className="flex gap-4">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="mt-6 text-xs font-bold transition-all cursor-pointer border border-slate-200 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-650 shadow-sm active:scale-95"
        >
          Dashboard Propriétaire (Web) 🖥️
        </button>
      </div>

      {/* SOS dialog overlay modal */}
      {showSosDialog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-150 rounded-3xl w-full max-w-xs overflow-hidden shadow-2xl p-5 space-y-4 animate-fade-in text-left">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 bg-red-50 text-[#EF4444] rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Signaler un problème</h4>
              <p className="text-[10px] text-slate-505 font-medium text-center">Sélectionnez la catégorie de l'incident pour lancer l'alerte GPS.</p>
            </div>

            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {[
                { id: 'accident', label: 'Accident / Collision', desc: 'Accrochage, collision ou dégâts matériels', emoji: '🚗' },
                { id: 'engine', label: 'Panne mécanique complète', desc: 'Moteur en panne, crevaison ou surchauffe', emoji: '🔧' },
                { id: 'police', label: 'Contrôle Police / Fourrière', desc: 'Papiers saisis, contrôle routier tendu', emoji: '👮' },
                { id: 'security', label: 'Agression / Sécurité', desc: 'Vol de caisse, menace ou agression', emoji: '🛡️' },
                { id: 'medical', label: 'Urgence médicale', desc: 'Blessure chauffeur, malaise passager', emoji: '🚑' }
              ].map(sos => (
                <button
                  key={sos.id}
                  onClick={() => {
                    handleTriggerSOS(sos.id);
                    setShowSosDialog(false);
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-100 hover:border-red-200 hover:bg-red-50/20 text-left transition-all flex gap-3 items-start cursor-pointer active:scale-98"
                >
                  <span className="text-base leading-none shrink-0 mt-0.5">{sos.emoji}</span>
                  <div className="text-left">
                    <strong className="text-[10.5px] font-bold text-slate-800 block">{sos.label}</strong>
                    <span className="text-[8.5px] text-slate-500 block font-semibold leading-tight">{sos.desc}</span>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowSosDialog(false)}
              className="w-full text-xs font-bold py-2.5 rounded-2xl transition-all cursor-pointer text-center border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
