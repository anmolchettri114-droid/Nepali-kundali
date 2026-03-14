/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Moon, 
  Sun, 
  User, 
  History, 
  Plus, 
  Home as HomeIcon, 
  LogOut,
  ChevronLeft,
  Sparkles,
  Info,
  Star,
  Award,
  Clock,
  Layout
} from 'lucide-react';
import { auth, db } from './firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy 
} from 'firebase/firestore';
import { Toaster, toast } from 'sonner';
import { geminiService } from './services/geminiService';
import { KundaliData, PanchangData, MatchmakingResult } from './types';
import KundaliForm from './components/astrology/KundaliForm';
import NorthIndianChart from './components/astrology/NorthIndianChart';
import PanchangCard from './components/astrology/PanchangCard';
import MatchmakingForm from './components/astrology/MatchmakingForm';
import MatchmakingDisplay from './components/astrology/MatchmakingDisplay';
import { cn } from './lib/utils';

type View = 'home' | 'create' | 'result' | 'history' | 'about' | 'matchmaking' | 'matchmaking_result';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [panchang, setPanchang] = useState<PanchangData | null>(null);
  const [currentKundali, setCurrentKundali] = useState<KundaliData | null>(null);
  const [interpretation, setInterpretation] = useState<string>('');
  const [matchResult, setMatchResult] = useState<MatchmakingResult | null>(null);
  const [history, setHistory] = useState<KundaliData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState<'Lagna' | 'Navamsha' | 'Moon'>('Lagna');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) fetchHistory(u.uid);
    });
    fetchPanchang();
    return () => unsubscribe();
  }, []);

  const fetchPanchang = async () => {
    try {
      const data = await geminiService.getDailyPanchang();
      setPanchang(data);
    } catch (error) {
      console.error('Error fetching panchang:', error);
    }
  };

  const fetchHistory = async (uid: string) => {
    try {
      const q = query(
        collection(db, 'kundalis'),
        where('uid', '==', uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as KundaliData));
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleCreateKundali = async (values: any) => {
    setIsLoading(true);
    console.log('Starting Kundali calculation for:', values.name);
    try {
      const data = await geminiService.calculateKundali(
        values.name,
        values.birthDate,
        values.birthTime,
        values.birthPlace
      );
      
      console.log('Kundali data calculated successfully');

      if (user) {
        console.log('Saving Kundali to Firestore for user:', user.uid);
        data.uid = user.uid;
        try {
          await addDoc(collection(db, 'kundalis'), data);
          fetchHistory(user.uid);
        } catch (fsError) {
          console.error('Firestore save error:', fsError);
          toast.error('कुण्डली बचत गर्न सकिएन, तर तपाईंले नतिजा हेर्न सक्नुहुन्छ।');
        }
      }

      setCurrentKundali(data);
      setView('result');
      setInterpretation(''); // Reset interpretation for new calculation
      
      console.log('Fetching interpretation...');
      const interp = await geminiService.getInterpretation(data);
      setInterpretation(interp);
      toast.success('कुण्डली सफलतापूर्वक तयार भयो!');
    } catch (error: any) {
      console.error('Error creating kundali:', error);
      toast.error(error.message || 'कुण्डली बनाउन समस्या भयो। कृपया फेरि प्रयास गर्नुहोस्।');
    } finally {
      setIsLoading(false);
      console.log('Kundali creation process finished');
    }
  };

  const handleMatchmaking = async (values: any) => {
    setIsLoading(true);
    try {
      const result = await geminiService.getMatchmaking(values.person1, values.person2);
      setMatchResult(result);
      setView('matchmaking_result');
      toast.success('गुण मिलान सफलतापूर्वक सम्पन्न भयो!');
    } catch (error) {
      console.error('Matchmaking error:', error);
      toast.error('गुण मिलानमा समस्या भयो।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf0f0] text-red-950 font-sans selection:bg-red-200">
      <Toaster position="top-center" richColors />
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-red-100 px-4 py-3">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setView('home')}
          >
            <div className="bg-red-600 p-2 rounded-lg shadow-lg rotate-12">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-serif font-black tracking-tight text-red-900">
              Nepali <span className="text-blue-600">Kundali</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setView('history')}
                  className="p-2 hover:bg-red-50 rounded-full transition-colors text-red-700"
                >
                  <History className="w-5 h-5" />
                </button>
                <img 
                  src={user.photoURL || ''} 
                  alt={user.displayName || ''} 
                  className="w-8 h-8 rounded-full border-2 border-red-200"
                />
                <button 
                  onClick={handleLogout}
                  className="p-2 hover:bg-red-50 rounded-full transition-colors text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center gap-2 bg-white border border-red-200 px-4 py-2 rounded-full text-sm font-bold hover:bg-red-50 transition-all shadow-sm"
              >
                <User className="w-4 h-4" /> लगइन (Login)
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4 py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  <Sparkles className="w-12 h-12 text-red-500 opacity-50" />
                </motion.div>
                <h2 className="text-4xl md:text-6xl font-serif font-black text-red-900 leading-tight">
                  तपाईंको भविष्य <br />
                  <span className="text-blue-600">ताराहरूमा लेखिएको छ</span>
                </h2>
                <p className="text-lg text-red-800/70 max-w-2xl mx-auto">
                  नेपाली कुण्डली सफ्टवेयर - सटीक गणना र विस्तृत व्याख्याको साथ आफ्नो जीवनको मार्ग पत्ता लगाउनुहोस्।
                </p>
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <button 
                    onClick={() => setView('create')}
                    className="bg-red-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-red-200 hover:bg-red-700 transition-all flex items-center gap-2 group"
                  >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    नयाँ कुण्डली बनाउनुहोस्
                  </button>
                  <button 
                    onClick={() => setView('about')}
                    className="bg-white border border-red-200 text-red-900 px-8 py-4 rounded-2xl font-bold hover:bg-red-50 transition-all flex items-center gap-2"
                  >
                    <Info className="w-5 h-5" />
                    हाम्रो बारेमा
                  </button>
                </div>
              </div>

              {panchang && <PanchangCard data={panchang} />}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: 'दैनिक राशिफल', desc: 'तपाईंको राशिको आजको फल', icon: Moon, action: () => {} },
                  { title: 'गुण मिलान', desc: 'विवाहको लागि उत्तम जोडी खोज्नुहोस्', icon: Sparkles, action: () => setView('matchmaking') },
                  { title: 'वास्तु शास्त्र', desc: 'घर र कार्यालयको लागि वास्तु सुझाव', icon: HomeIcon, action: () => {} },
                ].map((item, i) => (
                  <div 
                    key={i} 
                    onClick={item.action}
                    className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-600 transition-colors">
                      <item.icon className="w-6 h-6 text-red-600 group-hover:text-white transition-colors" />
                    </div>
                    <h4 className="font-bold text-red-900">{item.title}</h4>
                    <p className="text-sm text-red-700/70">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <button 
                onClick={() => setView('home')}
                className="flex items-center gap-2 text-amber-700 font-bold mb-6 hover:text-amber-900 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" /> पछाडि जानुहोस्
              </button>
              <h2 className="text-3xl font-serif font-bold text-amber-900 mb-8">जन्म विवरण भर्नुहोस्</h2>
              <KundaliForm onSubmit={handleCreateKundali} isLoading={isLoading} />
            </motion.div>
          )}

          {view === 'result' && currentKundali && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => setView('create')}
                  className="flex items-center gap-2 text-amber-700 font-bold hover:text-amber-900 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" /> नयाँ गणना
                </button>
                <div className="text-right">
                  <h2 className="text-2xl font-serif font-bold text-red-900">{currentKundali.name}</h2>
                  <p className="text-sm text-red-700">{currentKundali.birthDate} | {currentKundali.birthTime}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div className="space-y-8">
                  <div className="bg-white rounded-3xl border border-red-100 shadow-xl overflow-hidden">
                    <div className="flex border-b border-red-100">
                      {['Lagna', 'Navamsha', 'Moon'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveChartTab(tab as any)}
                          className={`flex-1 py-4 text-sm font-bold transition-all ${
                            activeChartTab === tab 
                              ? 'bg-red-50 text-red-900 border-b-2 border-red-600' 
                              : 'text-red-500 hover:bg-red-50/50'
                          }`}
                        >
                          {tab === 'Lagna' ? 'जन्म (D1)' : tab === 'Navamsha' ? 'नवांश (D9)' : 'चन्द्र'}
                        </button>
                      ))}
                    </div>
                    <div className="p-6">
                      <NorthIndianChart 
                        planets={
                          activeChartTab === 'Lagna' ? currentKundali.planets :
                          activeChartTab === 'Navamsha' ? (currentKundali.navamshaPlanets || []) :
                          (currentKundali.moonPlanets || [])
                        } 
                        ascendant={
                          activeChartTab === 'Lagna' ? currentKundali.ascendant :
                          activeChartTab === 'Navamsha' ? (currentKundali.navamshaPlanets?.find(p => p.planet === 'Ascendant')?.sign || currentKundali.ascendant) :
                          (currentKundali.moonPlanets?.find(p => p.planet === 'Moon')?.sign || currentKundali.ascendant)
                        } 
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-red-900 border-b border-red-200 pb-2 flex items-center gap-2">
                      <Star className="w-5 h-5" /> ग्रह स्थिति (Planetary Positions)
                    </h3>
                    <div className="overflow-x-auto bg-white rounded-2xl border border-red-100 shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-red-50 text-red-900 text-sm uppercase tracking-wider">
                            <th className="px-4 py-3 font-black">ग्रह</th>
                            <th className="px-4 py-3 font-black">राशि</th>
                            <th className="px-4 py-3 font-black">अंश</th>
                            <th className="px-4 py-3 font-black">नक्षत्र</th>
                            <th className="px-4 py-3 font-black">भाव</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {currentKundali.planets.map((p, idx) => (
                            <tr key={idx} className="border-t border-red-50 hover:bg-red-50/50 transition-colors">
                              <td className="px-4 py-3 font-bold text-red-900">
                                {p.planet} {p.isRetrograde && <span className="text-[10px] text-red-500">(R)</span>}
                              </td>
                              <td className="px-4 py-3 text-red-800">{p.sign}</td>
                              <td className="px-4 py-3 text-red-800 font-mono">{p.degree.toFixed(2)}°</td>
                              <td className="px-4 py-3 text-red-800">{p.nakshatra || '-'}</td>
                              <td className="px-4 py-3 text-red-800">{p.house}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {currentKundali.rajyogas && currentKundali.rajyogas.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-red-900 border-b border-red-200 pb-2 flex items-center gap-2">
                        <Award className="w-5 h-5" /> राजयोगहरू (Rajyogas)
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        {currentKundali.rajyogas.map((yoga, idx) => (
                          <div key={idx} className="bg-white p-4 rounded-xl border border-red-100 shadow-sm">
                            <h4 className="font-bold text-red-900">{yoga.name}</h4>
                            <p className="text-sm text-red-700">{yoga.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentKundali.dasha && currentKundali.dasha.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-red-900 border-b border-red-200 pb-2 flex items-center gap-2">
                        <Clock className="w-5 h-5" /> विंशोत्तरी महादशा (Vimshottari Dasha)
                      </h3>
                      <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
                        <div className="grid grid-cols-2 bg-red-50 p-3 text-xs font-black uppercase tracking-wider text-red-900">
                          <span>महादशा</span>
                          <span>अन्त्य मिति</span>
                        </div>
                        <div className="divide-y divide-red-50">
                          {currentKundali.dasha.map((d, idx) => (
                            <div key={idx} className="grid grid-cols-2 p-3 text-sm hover:bg-red-50/30 transition-colors">
                              <span className="font-bold text-red-900">{d.planet}</span>
                              <span className="text-red-700">{d.endDate}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-red-900 border-b border-red-200 pb-2">विस्तृत फलादेश (Detailed Prediction)</h3>
                  <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-xl prose prose-red max-w-none">
                    {interpretation ? (
                      <div className="whitespace-pre-wrap leading-relaxed text-red-900 text-lg font-serif">
                        {interpretation}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-24 space-y-6">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-12 h-12 text-red-500" />
                        </motion.div>
                        <p className="text-red-700 font-bold text-xl animate-pulse">AI ले तपाईंको भविष्यको गणना गर्दैछ...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-serif font-bold text-red-900">बचत गरिएका कुण्डलीहरू</h2>
              {history.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {history.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => {
                        setCurrentKundali(item);
                        setInterpretation('');
                        setView('result');
                        geminiService.getInterpretation(item).then(setInterpretation);
                      }}
                      className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    >
                      <h4 className="font-bold text-red-900 group-hover:text-red-600 transition-colors">{item.name}</h4>
                      <p className="text-sm text-red-700/70">{item.birthDate} | {item.birthTime}</p>
                      <p className="text-xs text-red-600 mt-2">{item.birthPlace}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-red-200">
                  <History className="w-12 h-12 text-red-200 mx-auto mb-4" />
                  <p className="text-red-700">कुनै इतिहास भेटिएन।</p>
                </div>
              )}
            </motion.div>
          )}

          {view === 'matchmaking' && (
            <motion.div
              key="matchmaking"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <button 
                onClick={() => setView('home')}
                className="flex items-center gap-2 text-red-700 font-bold mb-6 hover:text-red-900 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" /> पछाडि जानुहोस्
              </button>
              <h2 className="text-3xl font-serif font-bold text-red-900 mb-8">गुण मिलान (Matchmaking)</h2>
              <MatchmakingForm onSubmit={handleMatchmaking} isLoading={isLoading} />
            </motion.div>
          )}

          {view === 'matchmaking_result' && matchResult && (
            <motion.div
              key="matchmaking_result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <button 
                onClick={() => setView('matchmaking')}
                className="flex items-center gap-2 text-red-700 font-bold hover:text-red-900 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" /> नयाँ मिलान
              </button>
              <MatchmakingDisplay result={matchResult} />
            </motion.div>
          )}

          {view === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto prose prose-red"
            >
              <h2 className="text-3xl font-serif font-bold text-red-900">नेपाली कुण्डलीको बारेमा</h2>
              <p>
                नेपाली कुण्डली एक आधुनिक ज्योतिषीय सफ्टवेयर हो जसले प्राचीन वैदिक ज्योतिषीय ज्ञानलाई आधुनिक प्रविधिसँग जोड्दछ। 
                हाम्रो लक्ष्य भनेको नेपाली भाषामा सटीक र बुझ्न सजिलो ज्योतिषीय सेवाहरू प्रदान गर्नु हो।
              </p>
              <h3>हाम्रा विशेषताहरू:</h3>
              <ul>
                <li>सटीक जन्म कुण्डली गणना</li>
                <li>दैनिक पञ्चाङ्ग र राशिफल</li>
                <li>AI द्वारा संचालित विस्तृत व्याख्या</li>
                <li>विवाहको लागि गुण मिलान</li>
                <li>सुरक्षित र निजी डेटा भण्डारण</li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-24 border-t border-red-100 py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sun className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-serif font-bold text-red-900">Nepali Kundali</h3>
            </div>
            <p className="text-sm text-red-800/60">
              तपाईंको आध्यात्मिक यात्राको साथी।
            </p>
          </div>
          <div>
            <h4 className="font-bold text-red-900 mb-4">लिङ्कहरू</h4>
            <ul className="space-y-2 text-sm text-red-800/70">
              <li className="hover:text-red-600 cursor-pointer" onClick={() => setView('home')}>गृहपृष्ठ</li>
              <li className="hover:text-red-600 cursor-pointer" onClick={() => setView('create')}>कुण्डली बनाउनुहोस्</li>
              <li className="hover:text-red-600 cursor-pointer" onClick={() => setView('about')}>हाम्रो बारेमा</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-red-900 mb-4">सम्पर्क</h4>
            <p className="text-sm text-red-800/70">
              इमेल: info@nepalikundali.com<br />
              काठमाडौं, नेपाल
            </p>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-12 pt-8 border-t border-red-50 text-center text-xs text-red-800/40">
          © {new Date().getFullYear()} Nepali Kundali. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
