import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Mic, MicOff, Paperclip, Clock, DollarSign, MapPin, Zap } from 'lucide-react';

// New architecture imports
import { useUI, useActions, useSelector } from '../store/context';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useAgentSearch } from '../hooks/useAgentSearch';
import { QuickChip } from '../types/ui';
import { AGENT_CATEGORIES, QUICK_CHIPS } from '../constants';
import { cn } from '../lib/utils';

// Component for rendering quick chip icons
const QuickChipIcon: React.FC<{ iconName: string; className?: string }> = ({
  iconName,
  className = "w-4 h-4"
}) => {
  const iconProps = { size: 16, className: cn("text-current", className) };

  switch (iconName) {
    case 'zap': return <Zap {...iconProps} />;
    case 'dollar-sign': return <DollarSign {...iconProps} />;
    case 'clock': return <Clock {...iconProps} />;
    case 'map-pin': return <MapPin {...iconProps} />;
    default: return null;
  }
};

// Main Home component with new architecture
const Home: React.FC = () => {
  const navigate = useNavigate();
  const ui = useUI();
  const actions = useActions();
  const { quickSearch } = useAgentSearch();

  // Use custom speech recognition hook
  const {
    isSupported,
    isListening,
    transcript,
    error: speechError,
    startListening,
    stopListening,
    toggleListening,
    reset: resetSpeech,
  } = useSpeechRecognition();

  // Get search query from UI state
  const searchQuery = useSelector(state => state.ui.search.query);

  // Handle search with enhanced functionality
  const handleSearch = useCallback(
    async (query?: string) => {
      const searchTerm = query || searchQuery;

      if (!searchTerm.trim()) return;

      try {
        // Add to recent searches via global state
        actions.user.addRecentSearch(searchTerm.trim());

        // Navigate to results page
        navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);

        // Optionally trigger search in background for faster results
        if (searchTerm.length > 2) {
          quickSearch(searchTerm.trim());
        }
      } catch (error) {
        actions.ui.addNotification({
          id: `search-error-${Date.now()}`,
          type: 'error',
          title: 'Search Error',
          message: 'Failed to perform search. Please try again.',
          duration: 4000,
        });
      }
    },
    [searchQuery, navigate, actions, quickSearch]
  );

  // Handle quick chip clicks
  const handleChipClick = useCallback(
    (chip: QuickChip) => {
      // Update search state if needed
      if (chip.action === 'search' && chip.value) {
        actions.ui.setSearchState({ query: chip.value });
        handleSearch(chip.value);
      } else {
        navigate(`/search?filter=${chip.id}`);
      }
    },
    [navigate, actions, handleSearch]
  );

  // Handle category selection
  const handleCategoryClick = useCallback(
    (categoryId: string) => {
      navigate(`/search?category=${categoryId}`);
    },
    [navigate]
  );

  // Update search query in global state
  const updateSearchQuery = useCallback(
    (value: string) => {
      actions.ui.setSearchState({ query: value });
    },
    [actions]
  );

  // Handle speech recognition result
  useEffect(() => {
    if (transcript && !isListening) {
      // Update search query with transcript
      updateSearchQuery(transcript);

      // Auto-search if confidence is high enough
      if (transcript.length > 3) {
        handleSearch(transcript);
      }

      // Reset speech recognition
      resetSpeech();
    }
  }, [transcript, isListening, updateSearchQuery, handleSearch, resetSpeech]);

  // Handle speech errors
  useEffect(() => {
    if (speechError) {
      actions.ui.addNotification({
        id: `speech-error-${Date.now()}`,
        type: 'error',
        title: 'Voice Recognition Error',
        message: speechError,
        duration: 4000,
      });
    }
  }, [speechError, actions]);

  // Handle microphone click
  const handleMicrophoneClick = useCallback(() => {
    if (!isSupported) {
      actions.ui.addNotification({
        id: `speech-unsupported-${Date.now()}`,
        type: 'warning',
        title: 'Voice Recognition Unavailable',
        message: 'Speech recognition is not supported in your browser. Please try Chrome or Edge.',
        duration: 6000,
      });
      return;
    }

    toggleListening();
  }, [isSupported, toggleListening, actions]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + K for search focus
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        // Focus search input (you'd need a ref for this)
      }

      // Escape to stop listening
      if (event.key === 'Escape' && isListening) {
        event.preventDefault();
        stopListening();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isListening, stopListening]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-16 pb-24">
        <div className="container text-center">
          {/* Hero Text */}
          <div className="mb-12">
            <h1 className="text-responsive-4xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-azure-700 to-orchid-600 bg-clip-text text-transparent">
              Your calm, capable companion
            </h1>
            <p className="text-responsive-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Find and connect with the perfect service agents—plumbers, tutors, consultants, or AI specialists—all in one place.
            </p>
          </div>

          {/* Main Search Panel */}
          <div className="glass-panel glass-panel--elevated glass-panel--specular p-8 max-w-4xl mx-auto mb-8">
            {/* Enhanced Listening Indicator */}
            {isListening && (
              <div className="mb-4 p-4 bg-azure-50 border border-azure-200 rounded-lg flex items-center gap-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-azure-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-azure-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-azure-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-azure-700 font-medium">Listening... Speak now!</span>
                <button
                  onClick={stopListening}
                  className="ml-auto text-azure-600 hover:text-azure-800 font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => updateSearchQuery(e.target.value)}
                placeholder={isListening ? "🎤 Listening for your voice..." : "What kind of help do you need today?"}
                className={cn(
                  "glass-input pl-16 pr-24 py-6 text-lg transition-all duration-300",
                  isListening && "ring-2 ring-azure-400 border-azure-300"
                )}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                readOnly={isListening}
                autoComplete="off"
                spellCheck="false"
              />

              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {/* Enhanced Microphone Button */}
                <button
                  onClick={handleMicrophoneClick}
                  className={cn(
                    "glass-button p-3 hover:scale-105 transition-all duration-300",
                    isListening
                      ? "glass-button--primary animate-pulse ring-2 ring-azure-400"
                      : "",
                    !isSupported && "opacity-50 cursor-not-allowed"
                  )}
                  title={isListening ? "Stop recording" : "Speak your search query"}
                  disabled={!isSupported}
                >
                  {isListening ? (
                    <MicOff className="w-5 h-5 text-white" />
                  ) : (
                    <Mic className={cn("w-5 h-5", !isSupported && "text-gray-400")} />
                  )}
                </button>

                <button className="glass-button p-3 hover:scale-105 transition-transform">
                  <Paperclip className="w-5 h-5" />
                </button>

                <button
                  onClick={() => handleSearch()}
                  className="glass-button--primary px-6 py-3 font-semibold"
                  disabled={!searchQuery.trim()}
                >
                  Search
                </button>
              </div>
            </div>

            {/* Enhanced Quick Chips */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => handleChipClick(chip)}
                  className="glass-pill hover:glass-pill--active flex items-center gap-2"
                >
                  <QuickChipIcon iconName={chip.icon} />
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Categories Section */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Explore Categories</h2>
            <p className="text-lg text-slate-600">
              Discover trusted professionals across all service areas
            </p>
          </div>

          <div className="grid grid-cols-auto-fit gap-12 max-w-6xl mx-auto">
            {Object.values(AGENT_CATEGORIES).map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="glass-panel glass-panel--interactive p-8 text-left group hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{category.icon}</div>
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {category.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Recent Searches Section */}
      <section className="pb-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Recent Searches</h2>
            <p className="text-lg text-slate-600">
              Continue where you left off
            </p>
          </div>

          {/* Recent searches from global state */}
          {ui.search.recentSearches.length > 0 ? (
            <div className="grid grid-cols-1-md-2 gap-4 max-w-4xl mx-auto">
              {ui.search.recentSearches.slice(0, 4).map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(search)}
                  className="glass-panel p-6 hover:glass-panel--elevated transition-all duration-300 cursor-pointer text-left"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold truncate">{search}</h4>
                    <span className="text-sm text-slate-500 flex-shrink-0 ml-2">Recent</span>
                  </div>
                  <p className="text-slate-600 text-sm">
                    Search again for "{search}"
                  </p>
                </button>
              ))}
            </div>
          ) : (
            /* Mock recent searches for demo */
            <div className="grid grid-cols-1-md-2 gap-4 max-w-4xl mx-auto">
              <div className="glass-panel p-6 hover:glass-panel--elevated transition-all duration-300 cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold">Emergency plumber needed</h4>
                  <span className="text-sm text-slate-500">2 hours ago</span>
                </div>
                <p className="text-slate-600 text-sm mb-3">
                  Kitchen sink flooding, need immediate help in Brooklyn
                </p>
                <div className="flex gap-2">
                  <span className="glass-pill glass-pill--active text-xs">Emergency</span>
                  <span className="glass-pill text-xs">Brooklyn</span>
                </div>
              </div>

              <div className="glass-panel p-6 hover:glass-panel--elevated transition-all duration-300 cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold">Math tutor for SAT prep</h4>
                  <span className="text-sm text-slate-500">1 day ago</span>
                </div>
                <p className="text-slate-600 text-sm mb-3">
                  Looking for experienced tutor, 2-3 sessions per week
                </p>
                <div className="flex gap-2">
                  <span className="glass-pill text-xs">Education</span>
                  <span className="glass-pill text-xs">Remote OK</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;