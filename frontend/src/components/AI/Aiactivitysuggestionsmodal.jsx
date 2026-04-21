import { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Calendar, Plus, RotateCcw } from 'lucide-react';
import api from '../../api';

const CATEGORIES = [
    { id: 'adventure', label: 'Adventure', emoji: '🧗' },
    { id: 'food', label: 'Food & Drink', emoji: '🍜' },
    { id: 'culture', label: 'Culture', emoji: '🏛️' },
    { id: 'nature', label: 'Nature', emoji: '🌿' },
    { id: 'nightlife', label: 'Nightlife', emoji: '🌙' },
    { id: 'relaxation', label: 'Relaxation', emoji: '🧘' },
    { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
    { id: 'sports', label: 'Sports', emoji: '⚽' },
];

function LoadingState({ tripTitle, numDays }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center animate-pulse">
                <Sparkles size={22} className="text-white" />
            </div>
            <div className="text-center">
                <p className="text-base font-semibold text-gray-900 mb-1">Crafting your itinerary…</p>
                <p className="text-sm text-gray-400">
                    Finding the best {numDays}-day plan for {tripTitle}
                </p>
            </div>
            <div className="flex gap-1.5 mt-1">
                {[0, 1, 2].map(i => (
                    <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-teal-500"
                        style={{ animation: `dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                    />
                ))}
            </div>
            <style>{`
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: scale(0.5); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
        </div>
    );
}

export default function AIActivitySuggestionsModal({ isOpen, onClose, trip, handleAddSuggestions }) {
    const [step, setStep] = useState('form'); // 'form' | 'loading' | 'results'
    const [startDate, setStartDate] = useState('');
    const [numDays, setNumDays] = useState(3);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [preferences, setPreferences] = useState('');
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');
    const resultsRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setStep('form');
            setResults(null);
            setError('');
            setStartDate(trip?.start_date?.slice(0, 10) || '');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const toggleCategory = (id) =>
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );

    const handleGenerate = async () => {
        if(startDate == '') {
            setError("Choose start date."); 
            return
        }
        setStep('loading');
        setError('');
        try {
            const res = await api.post(`/api/generate/activity/suggestions/${trip.id}/`, {
                start_date: startDate || null,
                nr_of_days: numDays,
                categories: selectedCategories,
                user_notes: preferences.trim() || null,
            });
            if (res.status === 201) {
                handleAddSuggestions(res.data.data);
                onClose()
            }
        } catch (err) {
            setError(err?.res?.data?.detail || 'Something went wrong. Please try again.');
            setStep('form');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[88vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                            <Sparkles size={16} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900 leading-tight">AI Activity Planner</h2>
                            <p className="text-xs text-gray-400 leading-tight">{trip?.title}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Scrollable body */}
                <div ref={resultsRef} className="flex-1 overflow-y-auto px-6 py-5">

                    {/* ── FORM ── */}
                    {step === 'form' && (
                        <div className="flex flex-col gap-5">
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                        Start date
                                    </label>
                                    <div className="relative">
                                        <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={e => {setStartDate(e.target.value); setError(''); setStep('form')}}
                                            className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-teal-500 transition-colors text-gray-700"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                        Days
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setNumDays(d => Math.max(1, d - 1))}
                                            className="w-9 h-9 rounded-lg border border-gray-200 bg-white hover:border-teal-400 text-gray-500 flex items-center justify-center text-base transition-colors flex-shrink-0"
                                        >−</button>
                                        <div className="flex-1 h-9 border border-gray-200 rounded-lg flex items-center justify-center text-sm font-semibold text-gray-900">
                                            {numDays}
                                        </div>
                                        <button
                                            onClick={() => setNumDays(d => Math.min(14, d + 1))}
                                            className="w-9 h-9 rounded-lg border border-gray-200 bg-white hover:border-teal-400 text-gray-500 flex items-center justify-center text-base transition-colors flex-shrink-0"
                                        >+</button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    What are you into?
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map(cat => {
                                        const active = selectedCategories.includes(cat.id);
                                        return (
                                            <button
                                                key={cat.id}
                                                onClick={() => toggleCategory(cat.id)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${active
                                                        ? 'bg-teal-50 border-teal-400 text-teal-700 font-medium'
                                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }`}
                                            >
                                                <span className="text-base leading-none">{cat.emoji}</span>
                                                {cat.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Anything else?{' '}
                                    <span className="normal-case font-normal text-gray-400">(optional)</span>
                                </label>
                                <textarea
                                    value={preferences}
                                    onChange={e => setPreferences(e.target.value)}
                                    placeholder="e.g. We're 4 adults, love spicy food, prefer avoiding tourist traps, one person has mobility issues…"
                                    rows={3}
                                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-teal-500 transition-colors resize-none text-gray-700 placeholder-gray-300 leading-relaxed"
                                />
                            </div>
                        </div>
                    )}

                    {/* ── LOADING ── */}
                    {step === 'loading' && (
                        <LoadingState tripTitle={trip?.title} numDays={numDays} />
                    )}
                </div>

                {/* Footer */}
                {step === 'form' && (
                    <div className="px-6 pb-5 pt-4 border-t border-gray-100 flex-shrink-0">
                        <button
                            onClick={handleGenerate}
                            className="w-full py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                            <Sparkles size={15} />
                            Generate {numDays}-Day Itinerary
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}