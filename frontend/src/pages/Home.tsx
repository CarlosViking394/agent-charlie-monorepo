import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Mic, Paperclip, Clock, DollarSign, MapPin, Zap } from 'lucide-react';
import { QuickChip } from '../types';
import TTSService from '../services/ttsService';

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

  const handleMicrophoneClick = async () => {
    try {
      if (query.trim()) {
        // Speak the current search query
        await TTSService.speak(`Searching for: ${query}`);
      } else {
        // Speak a prompt if no query
        await TTSService.speak("What kind of help do you need today?");
      }
    } catch (error) {
      console.error('TTS Error:', error);
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
            <div className="relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What kind of help do you need today?"
                className="glass-input pl-16 pr-24 py-6 text-lg"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <button 
                  onClick={handleMicrophoneClick}
                  className="glass-button p-3 hover:scale-105 transition-transform"
                  title="Speak your search query"
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button className="glass-button p-3 hover:scale-105 transition-transform">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleSearch()}
                  className="glass-button--primary px-6 py-3 font-semibold"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {quickChips.map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => handleChipClick(chip)}
                  className="glass-pill hover:glass-pill--active"
                >
                  {chip.icon && renderChipIcon(chip.icon)}
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Explore Categories</h2>
            <p className="text-lg text-slate-600">
              Discover trusted professionals across all service areas
            </p>
          </div>

          <div className="grid grid-cols-auto-fit gap-12 max-w-6xl mx-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => navigate(`/search?category=${category.id}`)}
                className="glass-panel glass-panel--interactive p-8 text-left group hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{category.icon}</div>
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Find verified professionals ready to help with your {category.name.toLowerCase()} needs
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Contexts - Mock for now */}
      <section className="pb-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Recent Searches</h2>
            <p className="text-lg text-slate-600">
              Continue where you left off
            </p>
          </div>

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
        </div>
      </section>
    </div>
  );
};

export default Home;