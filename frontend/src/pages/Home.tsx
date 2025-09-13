import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Mic, MicOff, Paperclip, Clock, DollarSign, MapPin, Zap } from 'lucide-react';
import { QuickChip } from '../types';

const quickChips: QuickChip[] = [
  { id: 'emergency', label: 'Emergency now', icon: 'zap' },
  { id: 'budget', label: 'Under $200', icon: 'dollar-sign' },
  { id: 'week', label: 'This week', icon: 'clock' },
  { id: 'nearby', label: 'Near me', icon: 'map-pin' },
];

const categories = [
  { id: 'home', name: 'Home Services', icon: '🏠', color: 'azure' },
  { id: 'health', name: 'Health & Wellness', icon: '🏥', color: 'orchid' },
  { id: 'education', name: 'Education & Tutoring', icon: '📚', color: 'lime' },
  { id: 'business', name: 'Business Consulting', icon: '💼', color: 'amber' },
  { id: 'tech', name: 'Tech Support', icon: '💻', color: 'azure' },
  { id: 'creative', name: 'Creative Services', icon: '🎨', color: 'orchid' },
];

const Home: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const navigate = useNavigate();

  const handleSearch = (searchQuery?: string) => {
    const q = searchQuery || query;
    if (q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  const handleChipClick = (chip: QuickChip) => {
    navigate(`/search?filter=${chip.id}`);
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognition);
    }
  }, []);

  const handleMicrophoneClick = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const renderChipIcon = (iconName: string) => {
    const iconProps = { size: 16, className: "text-current" };
    switch (iconName) {
      case 'zap': return <Zap {...iconProps} />;
      case 'dollar-sign': return <DollarSign {...iconProps} />;
      case 'clock': return <Clock {...iconProps} />;
      case 'map-pin': return <MapPin {...iconProps} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="relative pt-12 pb-32">
        <div className="container">
          {/* Floating Cards Background Elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-20 left-10 glass-panel w-16 h-16 rounded-2xl opacity-30 animate-float"></div>
            <div className="absolute top-32 right-20 glass-panel w-12 h-12 rounded-xl opacity-20 animate-float-delayed"></div>
            <div className="absolute bottom-20 left-20 glass-panel w-20 h-20 rounded-3xl opacity-25 animate-float-slow"></div>
          </div>

          <div className="text-center relative z-10">
            {/* Hero Text */}
            <div className="mb-16">
              <div className="inline-flex items-center gap-3 glass-pill glass-pill--active mb-8 px-6 py-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">24/7 Agent Network Online</span>
              </div>

              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 bg-gradient-to-r from-slate-900 via-azure-700 to-orchid-600 bg-clip-text text-transparent leading-none">
                Your calm,<br />
                capable<br />
                companion
              </h1>

              <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-12">
                Find and connect with the perfect service agents—plumbers, tutors, consultants, or AI specialists—all in one place.
              </p>
            </div>

            {/* Main Search Panel */}
            <div className="glass-panel glass-panel--elevated glass-panel--specular p-10 max-w-5xl mx-auto mb-12 shadow-2xl">
            {/* Listening Indicator */}
            {isListening && (
              <div className="mb-4 p-4 bg-azure-50 border border-azure-200 rounded-lg flex items-center gap-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-azure-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-azure-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-azure-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-azure-700 font-medium">Listening... Speak now!</span>
                <button 
                  onClick={() => recognition?.stop()}
                  className="ml-auto text-azure-600 hover:text-azure-800 font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
              <div className="relative">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-7 h-7 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={isListening ? "🎤 Listening for your voice..." : "What kind of help do you need today?"}
                  className={`glass-input pl-16 pr-32 py-8 text-xl transition-all duration-300 ${
                    isListening ? 'ring-2 ring-azure-400 border-azure-300' : ''
                  }`}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  readOnly={isListening}
                />
                <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex items-center gap-3">
                  <button
                    onClick={handleMicrophoneClick}
                    className={`glass-button p-4 hover:scale-105 transition-all duration-300 ${
                      isListening
                        ? 'glass-button--primary animate-pulse ring-2 ring-azure-400'
                        : ''
                    }`}
                    title={isListening ? "Stop recording" : "Speak your search query"}
                  >
                    {isListening ? (
                      <MicOff className="w-6 h-6 text-white" />
                    ) : (
                      <Mic className="w-6 h-6" />
                    )}
                  </button>
                  <button className="glass-button p-4 hover:scale-105 transition-transform">
                    <Paperclip className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => handleSearch()}
                    className="glass-button--primary px-8 py-4 font-semibold text-lg"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Quick Chips */}
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {quickChips.map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => handleChipClick(chip)}
                    className="glass-pill hover:glass-pill--active text-base px-6 py-3"
                  >
                    {chip.icon && renderChipIcon(chip.icon)}
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-32 relative">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 right-10 glass-panel w-24 h-24 rounded-3xl opacity-20 animate-float-slow"></div>
          <div className="absolute bottom-20 right-32 glass-panel w-16 h-16 rounded-2xl opacity-25 animate-float-delayed"></div>
        </div>

        <div className="container relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 glass-pill glass-pill--secondary mb-6 px-4 py-2">
              <span className="text-sm font-medium">6 Categories Available</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-azure-700 to-orchid-600 bg-clip-text text-transparent">
              Explore Categories
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Discover trusted professionals across all service areas, vetted and ready to help
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {categories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => navigate(`/search?category=${category.id}`)}
                className="glass-panel glass-panel--interactive p-10 text-left group hover:scale-105 hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-azure-100 to-orchid-100 rounded-full -translate-y-16 translate-x-16 opacity-20 group-hover:opacity-30 transition-opacity"></div>

                <div className="flex flex-col gap-6 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold group-hover:text-primary transition-colors duration-300 mb-1">
                        {category.name}
                      </h3>
                      <div className="w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-azure-500 to-orchid-500 transition-all duration-500"></div>
                    </div>
                  </div>

                  <p className="text-slate-600 leading-relaxed text-lg">
                    Find verified professionals ready to help with your {category.name.toLowerCase()} needs
                  </p>

                  <div className="flex items-center text-primary font-medium group-hover:translate-x-2 transition-transform duration-300">
                    <span className="mr-2">Explore</span>
                    <svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="m6 12 4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Searches Section */}
      <section className="pb-32 relative">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-16 left-16 glass-panel w-20 h-20 rounded-2xl opacity-15 animate-float"></div>
        </div>

        <div className="container relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-pill glass-pill--secondary mb-6 px-4 py-2">
              <span className="text-sm font-medium">Recently Active</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-azure-700 to-orchid-600 bg-clip-text text-transparent">
              Recent Searches
            </h2>
            <p className="text-lg text-slate-600 max-w-xl mx-auto">
              Continue where you left off
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="glass-panel glass-panel--interactive p-8 hover:glass-panel--elevated hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <h4 className="font-bold text-xl group-hover:text-primary transition-colors">Emergency plumber needed</h4>
                <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">2 hours ago</span>
              </div>
              <p className="text-slate-600 text-base mb-4 leading-relaxed">
                Kitchen sink flooding, need immediate help in Brooklyn
              </p>
              <div className="flex gap-3">
                <span className="glass-pill glass-pill--active text-sm px-4 py-2">Emergency</span>
                <span className="glass-pill text-sm px-4 py-2">Brooklyn</span>
              </div>
            </div>

            <div className="glass-panel glass-panel--interactive p-8 hover:glass-panel--elevated hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <h4 className="font-bold text-xl group-hover:text-primary transition-colors">Math tutor for SAT prep</h4>
                <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">1 day ago</span>
              </div>
              <p className="text-slate-600 text-base mb-4 leading-relaxed">
                Looking for experienced tutor, 2-3 sessions per week
              </p>
              <div className="flex gap-3">
                <span className="glass-pill text-sm px-4 py-2">Education</span>
                <span className="glass-pill text-sm px-4 py-2">Remote OK</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;