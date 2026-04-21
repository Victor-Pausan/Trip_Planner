import { MapPin, Sparkles } from "lucide-react";
import api from "../../api";
import { useEffect, useState } from "react";

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const SuggestionCard = ({ suggestion, changeMapCenter, onAccept, onDismiss }) => {
    return (
        <div className="flex justify-between bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="flex items-start gap-4">
                <div onClick={() => changeMapCenter(suggestion.location.lat, suggestion.location.lng)} className="w-10 h-10 cursor-pointer rounded-full bg-teal-50 flex items-center justify-center text-teal-700 shrink-0">
                    <Sparkles size={20} />
                </div>
                <div className="flex-1">
                    <h4 onClick={() => changeMapCenter(suggestion.location.lat, suggestion.location.lng)} className="font-semibold cursor-pointer text-gray-900">{suggestion.placeName}</h4>
                    <div className="mt-3 flex gap-4 text-sm text-gray-600 p-2 rounded-lg">
                        <div>
                            <span className="block text-xs text-gray-400 uppercase tracking-wider">Date & Time</span>
                            {formatDate(suggestion.start_date)}
                        </div>
                        <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0 text-xs font-medium text-gray-800">
                            ⭐ {suggestion.rating}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex gap-4 items-center px-4 py-7">
                <button onClick={() => onAccept(suggestion.id)} class="max-h-8 btn-accept flex items-center gap-1.5 text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-xs font-semibold px-3.5 py-2 rounded-xl">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
                    Accept
                </button>
                <button onClick={() => onDismiss(suggestion.id)} class="max-h-8 btn-dismiss flex items-center gap-1.5 text-red-500 bg-red-100 hover:bg-red-200 text-xs font-semibold px-3.5 py-2 rounded-xl">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    Dismiss
                </button>
            </div>
        </div>
    );
}