import React, { useState, useEffect, useMemo } from 'react';
import { Home, Stethoscope, FileText, ShieldAlert, Heart, Plus, Camera, Send, MapPin, ChevronRight, Bell, Mic, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapsProvider } from './components/MapsProvider.tsx';
import { QuotaBanner } from './components/QuotaBanner.tsx';
import { Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { storage, Pet, HealthRecord } from './lib/storage.ts';
import { translations, Language } from './lib/i18n.ts';

const TABS = (t: any) => [
  { id: 'home', icon: Home, label: t.home },
  { id: 'ai-vet', icon: Stethoscope, label: t.aiVet },
  { id: 'records', icon: FileText, label: t.records },
  { id: 'food-scan', icon: ShieldAlert, label: t.foodScan },
  { id: 'emergency', icon: Heart, label: t.emergency },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('lang') as Language) || 'zh';
  });
  const [showLangMenu, setShowLangMenu] = useState(false);

  const t = useMemo(() => translations[lang], [lang]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  useEffect(() => {
    const loadedPets = storage.getPets();
    setPets(loadedPets);
    if (loadedPets.length > 0) setSelectedPet(loadedPets[0]);
  }, []);

  return (
    <MapsProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
        <QuotaBanner />
        
        {/* Header Zone */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Heart className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">{t.appName}</span>
          </div>
          <div className="flex items-center gap-3 relative">
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-1"
            >
              <Languages className="w-5 h-5 text-slate-600" />
              <span className="text-[10px] font-bold uppercase">{lang}</span>
            </button>

            {showLangMenu && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-1 min-w-[100px] z-50">
                {(['zh', 'en', 'ko'] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLang(l); setShowLangMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${
                      lang === l ? 'bg-emerald-50 text-emerald-600 font-bold' : 'hover:bg-slate-50'
                    }`}
                  >
                    {l === 'zh' ? '简体中文' : l === 'en' ? 'English' : '한국어'}
                  </button>
                ))}
              </div>
            )}

            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
            </div>
          </div>
        </header>

        <main className="max-w-screen-md mx-auto p-4">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && <HomeModule t={t} pets={pets} selectedPet={selectedPet} onSelectPet={setSelectedPet} />}
            {activeTab === 'ai-vet' && <AIVetModule t={t} lang={lang} />}
            {activeTab === 'records' && <RecordsModule t={t} selectedPet={selectedPet} />}
            {activeTab === 'food-scan' && <FoodScanModule t={t} lang={lang} />}
            {activeTab === 'emergency' && <EmergencyModule t={t} />}
          </AnimatePresence>
        </main>

        {/* Bottom Tab Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-slate-200 h-16 pb-safe grid grid-cols-5 items-center px-2">
          {TABS(t).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === tab.id ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] font-medium tracking-tight">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </MapsProvider>
  );
}

function HomeModule({ t, pets, selectedPet, onSelectPet }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <section className="relative h-48 rounded-3xl overflow-hidden shadow-xl shadow-slate-200">
        <img src="/src/assets/images/pet_health_hero_1794129005538.jpg" className="w-full h-full object-cover" alt="Hero" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-6">
          <h1 className="text-white text-2xl font-bold">{t.welcomeBack}</h1>
          <p className="text-emerald-50/90 text-sm">{t.heroSub}</p>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{t.myPets}</h2>
          <button className="text-emerald-600 text-sm font-semibold flex items-center gap-1">
            <Plus className="w-4 h-4" /> {t.addPet}
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {pets.length === 0 ? (
            <div className="w-full py-8 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 gap-2">
              <Plus className="w-8 h-8" />
              <span className="text-sm">{t.noPets}</span>
            </div>
          ) : (
            pets.map((pet: any) => (
              <button
                key={pet.id}
                onClick={() => onSelectPet(pet)}
                className={`flex-shrink-0 flex flex-col items-center gap-2 p-2 rounded-2xl transition-all ${
                  selectedPet?.id === pet.id ? 'bg-emerald-50 ring-2 ring-emerald-500' : 'bg-white'
                }`}
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <img src={pet.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${pet.name}`} alt={pet.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-bold">{pet.name}</span>
              </button>
            ))
          )}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <StatCard title={t.dietTrack} value="320g" unit={t.consumed} icon={Heart} color="text-red-500" bgColor="bg-red-50" />
        <StatCard title={t.steps} value="4.2k" unit={t.stepsUnit} icon={Plus} color="text-blue-500" bgColor="bg-blue-50" />
        <StatCard title={t.water} value="800ml" unit={t.consumed} icon={Home} color="text-sky-500" bgColor="bg-sky-50" />
        <StatCard title={t.vaccineStatus} value={t.normal} unit={t.nextMonth} icon={Stethoscope} color="text-emerald-500" bgColor="bg-emerald-50" />
      </section>
    </motion.div>
  );
}

function StatCard({ title, value, unit, icon: Icon, color, bgColor }: any) {
  return (
    <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 space-y-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-xl ${bgColor}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
      </div>
      <div>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        <div className="text-xs text-slate-500 font-medium">{title} · {unit}</div>
      </div>
    </div>
  );
}

function AIVetModule({ t, lang }: { t: any, lang: Language }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: t.onlineConsult }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/vet/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          history: messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
          message: userMsg,
          language: lang
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'model', text: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: t.errorGeneric }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-[calc(100vh-12rem)] flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100"
    >
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 overflow-hidden flex items-center justify-center">
          <img src="/src/assets/images/ai_vet_avatar_1794129006105.jpg" alt="AI Vet" className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="font-bold text-sm">{t.aiVetTitle}</h3>
          <p className="text-[10px] text-emerald-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> {t.onlineConsult}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
              m.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-tr-none' 
                : 'bg-slate-100 text-slate-800 rounded-tl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50 flex items-center gap-2">
        <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
          <Camera className="w-5 h-5" />
        </button>
        <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
          <Mic className="w-5 h-5" />
        </button>
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.inputPlaceholder}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
        <button 
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="p-2 bg-emerald-600 text-white rounded-xl disabled:bg-slate-300 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}

function RecordsModule({ t, selectedPet }: any) {
  const [records, setRecords] = useState<HealthRecord[]>([]);

  useEffect(() => {
    if (selectedPet) {
      setRecords(storage.getHealthRecords(selectedPet.id));
    }
  }, [selectedPet]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t.recordsTitle}</h2>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-transform">
          {t.newRecord}
        </button>
      </div>

      {!selectedPet ? (
        <div className="text-center py-20 text-slate-400">{t.selectPet}</div>
      ) : records.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <FileText className="w-12 h-12 text-slate-200 mx-auto" />
          <p className="text-slate-400">{t.noRecords}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div key={record.id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                record.type === 'vaccine' ? 'bg-purple-50 text-purple-600' :
                record.type === 'medical' ? 'bg-red-50 text-red-600' :
                record.type === 'diet' ? 'bg-amber-50 text-amber-600' :
                'bg-blue-50 text-blue-600'
              }`}>
                {record.type === 'vaccine' ? <Stethoscope /> : <FileText />}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm">{record.title}</h4>
                  <span className="text-[10px] text-slate-400">{record.date}</span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{record.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function FoodScanModule({ t, lang }: { t: any, lang: Language }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleScan = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setResult({
        productName: t.foodResultName,
        nutritionScore: 8,
        harmfulIngredients: [t.foodResultHarmful],
        recommendation: t.foodResultRec,
        reason: t.foodResultReason
      });
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <section className="bg-emerald-600 rounded-3xl p-6 text-white space-y-4 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <h2 className="text-2xl font-bold">{t.foodScanTitle}</h2>
          <p className="text-emerald-100 text-sm">{t.foodScanSub}</p>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-20 rotate-12">
          <ShieldAlert size={140} />
        </div>
      </section>

      {!result ? (
        <div className="bg-white rounded-3xl p-8 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-6">
          <div className="w-48 h-32 rounded-2xl overflow-hidden shadow-lg border-4 border-white">
            <img src="/src/assets/images/pet_food_scan_1794129006097.jpg" className="w-full h-full object-cover" alt="Food Scan" />
          </div>
          <button 
            onClick={handleScan}
            disabled={analyzing}
            className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-200 flex items-center gap-2 active:scale-95 transition-transform"
          >
            {analyzing ? <Plus className="animate-spin" /> : <Camera />}
            {analyzing ? t.analyzing : t.takePhoto}
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">{result.productName}</h3>
            <div className="flex items-center gap-1 px-3 py-1 bg-emerald-50 rounded-full text-emerald-600 font-bold text-xs">
              {t.score}: {result.nutritionScore}/10
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-600" /> {t.analysisResult}
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">{result.recommendation}。{result.reason}</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-red-500">{t.warningIng}</h4>
              <div className="flex flex-wrap gap-2">
                {result.harmfulIngredients.map((ing: string, i: number) => (
                  <span key={i} className="text-[10px] px-2 py-1 bg-red-50 text-red-600 rounded-lg font-medium">{ing}</span>
                ))}
              </div>
            </div>
          </div>
          <button 
            onClick={() => setResult(null)}
            className="w-full py-3 border border-slate-200 rounded-2xl text-sm font-bold text-slate-500"
          >
            {t.reScan}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

function EmergencyModule({ t }: any) {
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const hospitals = useMemo(() => [
    { id: 1, name: t.hospital1, position: { lat: 31.2304, lng: 121.4737 }, address: t.hospital1Addr, distance: "0.8km", phone: "021-XXXXXXX" },
    { id: 2, name: t.hospital2, position: { lat: 31.2254, lng: 121.4637 }, address: t.hospital2Addr, distance: "1.2km", phone: "021-XXXXXXX" },
  ], [t]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <div className="bg-red-50 p-4 rounded-3xl border border-red-100 flex items-center gap-4">
        <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse">
          <Heart className="text-white w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-red-900">{t.emergencyTitle}</h3>
          <p className="text-xs text-red-700">{t.locating}</p>
        </div>
      </div>

      <div className="h-64 rounded-3xl overflow-hidden border border-slate-200 relative">
        <Map
          defaultCenter={{ lat: 31.2304, lng: 121.4737 }}
          defaultZoom={13}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          className="w-full h-full"
          disableDefaultUI
        >
          {hospitals.map((h) => (
            <AdvancedMarker
              key={h.id}
              position={h.position}
              onClick={() => setSelectedHospital(h)}
            >
              <Pin background={'#ef4444'} glyphColor={'#fff'} borderColor={'#b91c1c'} />
            </AdvancedMarker>
          ))}
          {selectedHospital && (
            <InfoWindow
              position={selectedHospital.position}
              onCloseClick={() => setSelectedHospital(null)}
            >
              <div className="p-1 space-y-1">
                <h4 className="font-bold text-sm text-slate-900">{selectedHospital.name}</h4>
                <p className="text-[10px] text-slate-500">{selectedHospital.address}</p>
                <button className="w-full mt-1 bg-red-500 text-white text-[10px] py-1 rounded-md font-bold">{t.callNow}</button>
              </div>
            </InfoWindow>
          )}
        </Map>
        <button className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg border border-slate-200 active:scale-95 transition-transform">
          <MapPin className="w-5 h-5 text-emerald-600" />
        </button>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-bold text-slate-600">{t.nearbyHospitals}</h4>
        <div className="space-y-3">
          {hospitals.map((h) => (
            <div key={h.id} className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <h5 className="font-bold text-sm">{h.name}</h5>
                <p className="text-[10px] text-slate-400">{h.address} · {h.distance}</p>
              </div>
              <button className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold active:bg-red-100 transition-colors">
                {t.contactCenter}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <EmergencyAction icon={Plus} label={t.lostPet} color="bg-blue-500" />
        <EmergencyAction icon={ShieldAlert} label={t.poisonGuide} color="bg-amber-500" />
      </div>
    </motion.div>
  );
}

function EmergencyAction({ icon: Icon, label, color }: any) {
  return (
    <button className="bg-white p-4 rounded-3xl border border-slate-100 flex flex-col items-center gap-3 shadow-sm active:scale-95 transition-transform hover:shadow-md w-full">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="text-white w-5 h-5" />
      </div>
      <span className="text-xs font-bold text-slate-700">{label}</span>
    </button>
  );
}
