import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Users, TrendingUp, ShieldCheck, Zap, CheckCircle, Star, ChevronRight, Menu, X } from 'lucide-react';
import taxiImage from '../assets/dakar_taxi_sunset.png';

export default function Landing() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Car,
      title: 'Gestion de Flotte',
      description: 'Suivez tous vos véhicules en temps réel, gérez leur maintenance et leurs kilométrages.'
    },
    {
      icon: Users,
      title: 'Gestion des Chauffeurs',
      description: 'Enregistrez vos chauffeurs, gérez leurs accès et suivez leurs performances.'
    },
    {
      icon: TrendingUp,
      title: 'Suivi Financier',
      description: 'Visualisez vos revenus, validez les versements et générez des rapports détaillés.'
    },
    {
      icon: ShieldCheck,
      title: 'Sécurité',
      description: 'Authentification sécurisée, protection des données et accès contrôlé.'
    }
  ];

  const pricingPlans = [
    {
      name: 'Mensuel',
      price: '9 900',
      period: '/mois',
      features: ['Véhicules illimités', 'Chauffeurs illimités', 'Suivi en temps réel', 'Support par email'],
      popular: false
    },
    {
      name: 'Annuel',
      price: '95 040',
      period: '/an',
      savings: '-20%',
      features: ['Tout du plan Mensuel', '2 mois gratuits', 'Support prioritaire', 'Rapports avancés'],
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#6D4AFF] to-indigo-700 rounded-xl flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#6D4AFF] to-indigo-700 bg-clip-text text-transparent">
                Verse
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => navigate('/login')} className="text-slate-600 hover:text-[#6D4AFF] font-medium transition-colors">
                Se connecter
              </button>
              <button 
                onClick={() => {
                  localStorage.setItem('verse_show_register', 'true');
                  navigate('/login');
                }} 
                className="bg-[#6D4AFF] hover:bg-[#5636E5] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-[#6D4AFF]/20 active:scale-95"
              >
                S'inscrire
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 py-4 px-4 space-y-3">
            <button 
              onClick={() => {
                navigate('/login');
                setMobileMenuOpen(false);
              }} 
              className="w-full text-left px-4 py-2 text-slate-600 hover:text-[#6D4AFF] font-medium"
            >
              Se connecter
            </button>
            <button 
              onClick={() => {
                localStorage.setItem('verse_show_register', 'true');
                navigate('/login');
                setMobileMenuOpen(false);
              }} 
              className="w-full bg-[#6D4AFF] hover:bg-[#5636E5] text-white px-4 py-2.5 rounded-xl font-bold transition-all"
            >
              S'inscrire
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-bold">
                <Zap className="w-4 h-4" />
                Essai gratuit de 7 jours
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
                Gérez votre <span className="bg-gradient-to-r from-[#6D4AFF] to-indigo-700 bg-clip-text text-transparent">flotte VTC</span> en toute simplicité
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Verse est la plateforme complète pour gérer vos véhicules, vos chauffeurs et vos revenus. Une solution moderne, sécurisée et accessible depuis n'importe où.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => {
                    localStorage.setItem('verse_show_register', 'true');
                    navigate('/login');
                  }} 
                  className="bg-[#6D4AFF] hover:bg-[#5636E5] text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-[#6D4AFF]/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  Commencer gratuitement
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => navigate('/login')} 
                  className="bg-white border-2 border-slate-200 hover:border-[#6D4AFF] text-slate-700 px-8 py-4 rounded-2xl font-bold text-lg transition-all active:scale-95"
                >
                  Se connecter
                </button>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6D4AFF] to-indigo-700 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                      {i + 10}
                    </div>
                  ))}
                </div>
                <span>Plus de 50 propriétaires nous font confiance</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#6D4AFF]/20 to-indigo-700/20 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
                <img 
                  src={taxiImage} 
                  alt="Verse - Gestion de flotte" 
                  className="w-full h-80 object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-indigo-50 rounded-xl">
                      <Car className="w-6 h-6 text-[#6D4AFF] mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-medium">Véhicules</p>
                      <p className="text-xl font-black text-slate-900">12</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-medium">Ce mois</p>
                      <p className="text-xl font-black text-slate-900">+24%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Fonctionnalités puissantes
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour gérer votre flotte efficacement
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-slate-50 rounded-3xl p-6 border border-slate-200 hover:border-[#6D4AFF]/30 hover:shadow-lg hover:shadow-[#6D4AFF]/10 transition-all group">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#6D4AFF] to-indigo-700 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
              Tarifs simples et transparents
            </h2>
            <p className="text-lg text-slate-600">
              Choisissez le plan qui vous convient le mieux
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative rounded-3xl p-8 transition-all ${
                  plan.popular 
                    ? 'bg-gradient-to-b from-[#6D4AFF] to-indigo-800 text-white shadow-2xl shadow-[#6D4AFF]/30 scale-105' 
                    : 'bg-white border-2 border-slate-200 hover:border-[#6D4AFF]/30 hover:shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 px-4 py-1 rounded-full text-sm font-bold">
                    Populaire
                  </div>
                )}
                <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`text-4xl font-extrabold ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                    {plan.price}
                  </span>
                  <span className={`font-medium ${plan.popular ? 'text-indigo-200' : 'text-slate-500'}`}>
                    FCFA{plan.period}
                  </span>
                </div>
                {plan.savings && (
                  <div className="inline-block bg-amber-400 text-slate-900 px-3 py-1 rounded-full text-xs font-bold mb-6">
                    {plan.savings}
                  </div>
                )}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className={`w-5 h-5 ${plan.popular ? 'text-amber-400' : 'text-green-500'}`} />
                      <span className={plan.popular ? 'text-indigo-100' : 'text-slate-600'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => {
                    navigate('/login');
                    localStorage.setItem('verse_show_register', 'true');
                    localStorage.setItem('verse_selected_plan', plan.name.toLowerCase());
                  }} 
                  className={`w-full py-3 rounded-2xl font-bold transition-all active:scale-95 ${
                    plan.popular 
                      ? 'bg-white text-[#6D4AFF] hover:bg-slate-100' 
                      : 'bg-[#6D4AFF] text-white hover:bg-[#5636E5]'
                  }`}
                >
                  Commencer avec {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-[#6D4AFF] to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl font-black text-white">MS</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
            Développé avec passion
          </h2>
          <p className="text-lg text-slate-600 mb-6">
            Verse a été créé par <span className="font-bold text-[#6D4AFF]">Mamadou Seck</span>, développeur passionné par les solutions technologiques pour les entreprises africaines.
          </p>
          <div className="flex items-center justify-center gap-2 text-slate-500">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#6D4AFF] to-indigo-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">
            Prêt à transformer votre gestion de flotte ?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Commencez votre essai gratuit de 7 jours dès aujourd'hui
          </p>
          <button 
            onClick={() => {
              navigate('/login');
              localStorage.setItem('verse_show_register', 'true');
            }} 
            className="bg-white hover:bg-slate-100 text-[#6D4AFF] px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg active:scale-95 inline-flex items-center gap-2"
          >
            Commencer gratuitement
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#6D4AFF] to-indigo-700 rounded-lg flex items-center justify-center">
                <Car className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Verse</span>
            </div>
            <p className="text-sm">
              © 2024 Verse. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
