import { useState, useEffect, useRef } from 'react';
import { Loader2, MapPin } from 'lucide-react';

const GooglePlacesAutosugest = ({
    value,
    onChange,
    apiKey,
    placeholder = "Enter location",
    className = "",
    disabled = false
}) => {

    const [inputValue, setInputValue] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);
    const debounceTimer = useRef(null);

    useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                inputRef.current &&
                !inputRef.current.contains(event.target) &&
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchPlaceSuggestions = async (searchText) => {
        if (!searchText || searchText.length < 3) {
            setSuggestions([]);
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(
                `https://places.googleapis.com/v1/places:autocomplete`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Goog-Api-Key': apiKey,
                    },
                    body: JSON.stringify({
                        input: searchText,
                    }),
                }
            );

            const data = await response.json();

            if (data.suggestions) {
                setSuggestions(data.suggestions.map(s => ({
                    placeId: s.placePrediction?.placeId,
                    text: s.placePrediction?.text?.text,
                    structuredFormat: s.placePrediction?.structuredFormat
                })));
                setShowSuggestions(true);
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            console.error('Error fetching places:', error);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        setSelectedIndex(-1);
        //onChange?.(newValue);

        // Clear previous timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Debounce API calls
        debounceTimer.current = setTimeout(() => {
            fetchPlaceSuggestions(newValue);
        }, 300);
    };

    const handleSuggestionClick = (suggestion) => {
        setInputValue(suggestion.text);
        setSuggestions([]);
        onChange?.(suggestion.text, suggestion.placeId);
        setShowSuggestions(false);
    };

    const handleKeyDown = (e) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                    handleSuggestionClick(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                break;
            default:
                break;
        }
    };

    return (
        <>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent block p-4 pr-12 appearance-none transition duration-200 ease-in-out disabled:opacity-50 ${className}`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                    {isLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <MapPin size={18} />
                    )}
                </div>
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                >
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={suggestion.placeId || index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className={`w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors duration-150 flex items-start gap-3 border-b border-gray-100 last:border-b-0 ${index === selectedIndex ? 'bg-indigo-50' : ''
                                }`}
                            type="button"
                        >
                            <MapPin size={16} className="text-indigo-500 mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                    {suggestion.structuredFormat?.mainText?.text || suggestion.text}
                                </div>
                                {suggestion.structuredFormat?.secondaryText?.text && (
                                    <div className="text-xs text-gray-500 truncate mt-0.5">
                                        {suggestion.structuredFormat.secondaryText.text}
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </>
    );
}

export default GooglePlacesAutosugest