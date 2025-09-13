import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, CheckCircle, Shield, MapPin, MessageCircle, Calendar, Bookmark, Share, Phone, Video, MoreHorizontal } from 'lucide-react';
import { Agent } from '../types';
import { mockAgents } from '../utils/mockData';
import AgentChat from '../components/AgentChat';

const AgentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'portfolio' | 'availability'>('overview');
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const foundAgent = mockAgents.find(a => a.id === id);
    setAgent(foundAgent || null);
  }, [id]);

  if (!agent) {
    return (
      <div className="container py-8">
        <div className="text-center py-16">
          <div className="glass-panel p-8 max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-4">Agent not found</h3>
            <p className="text-slate-600 mb-6">
              The agent you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/search" className="glass-button--primary px-6 py-3">
              Browse All Agents
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (min: number, max: number, currency: string) => {
    if (min === max) return `${currency}${min}`;
    return `${currency}${min} - ${currency}${max}`;
  };

  const mockReviews = [
    {
      id: 1,
      author: 'Jennifer K.',
      rating: 5,
      date: '2 weeks ago',
      content: 'Absolutely fantastic work! Fixed our kitchen emergency in under an hour. Professional, clean, and fairly priced. Will definitely call again.',
      verified: true
    },
    {
      id: 2,
      author: 'Mike R.',
      rating: 5,
      date: '1 month ago',
      content: 'Sarah was incredible. Came out at 10pm on a Sunday when our pipe burst. Had everything fixed by midnight. True professional.',
      verified: true
    },
    {
      id: 3,
      author: 'Linda M.',
      rating: 4,
      date: '2 months ago',
      content: 'Great service and very knowledgeable. Only minor complaint is that she arrived 15 minutes late, but the quality of work made up for it.',
      verified: true
    }
  ];

  const mockPortfolio = [
    {
      id: 1,
      title: 'Emergency Kitchen Pipe Repair',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
      description: 'Complete pipe replacement and leak detection in luxury apartment kitchen.'
    },
    {
      id: 2,
      title: 'Bathroom Renovation Plumbing',
      image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=300&h=200&fit=crop',
      description: 'Full plumbing installation for modern bathroom renovation project.'
    },
    {
      id: 3,
      title: 'Commercial Drain Cleaning',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=200&fit=crop',
      description: 'Industrial-grade drain cleaning and maintenance for restaurant chain.'
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
        }`}
      />
    ));
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* About */}
      <div>
        <h3 className="text-xl font-semibold mb-4">About {agent.name}</h3>
        <p className="text-slate-700 leading-relaxed mb-4">{agent.description}</p>
        <p className="text-slate-700 leading-relaxed">
          With over 15 years in the plumbing industry, I've handled everything from simple repairs to complex commercial installations. 
          I pride myself on being available 24/7 for emergencies and always arriving on time with the right tools for the job.
        </p>
      </div>

      {/* Specialties */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Specialties</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {agent.specialties.map((specialty, index) => (
            <span key={index} className="glass-pill text-sm text-center">
              {specialty}
            </span>
          ))}
        </div>
      </div>

      {/* Service Area */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Service Area</h3>
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="font-medium">{agent.location.city}, {agent.location.state}</span>
          </div>
          <p className="text-slate-600 text-sm">
            Primary service area within 25 miles of {agent.location.city}. 
            {agent.location.remote && ' Remote consultations available.'}
          </p>
        </div>
      </div>

      {/* Credentials */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Credentials & Safety</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass-panel p-4">
            <div className="flex items-center gap-3 mb-2">
              {agent.verified ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-slate-300"></div>
              )}
              <span className="font-medium">
                {agent.verified ? 'Verified Professional' : 'Not Verified'}
              </span>
            </div>
            <p className="text-sm text-slate-600">
              Background checked and credentials verified
            </p>
          </div>

          <div className="glass-panel p-4">
            <div className="flex items-center gap-3 mb-2">
              {agent.insured ? (
                <Shield className="w-6 h-6 text-blue-500" />
              ) : (
                <div className="w-6 h-6"></div>
              )}
              <span className="font-medium">
                {agent.insured ? 'Fully Insured' : 'No Insurance'}
              </span>
            </div>
            <p className="text-sm text-slate-600">
              $2M liability and bonding coverage
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReviews = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-2">{agent.rating}</div>
          <div className="flex justify-center mb-2">{renderStars(Math.floor(agent.rating))}</div>
          <p className="text-sm text-slate-600">{agent.reviewCount.toLocaleString()} reviews</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{agent.successRate}%</div>
          <p className="text-sm text-slate-600">Success rate</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-azure-600 mb-2">{agent.responseTime}</div>
          <p className="text-sm text-slate-600">Avg response</p>
        </div>
      </div>

      <div className="space-y-4">
        {mockReviews.map((review) => (
          <div key={review.id} className="glass-panel p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-azure-400 to-orchid-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {review.author.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{review.author}</span>
                    {review.verified && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="text-sm text-slate-500">{review.date}</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-slate-700">{review.content}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPortfolio = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockPortfolio.map((item) => (
        <div key={item.id} className="glass-panel overflow-hidden">
          <img 
            src={item.image} 
            alt={item.title}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h4 className="font-semibold mb-2">{item.title}</h4>
            <p className="text-sm text-slate-600">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAvailability = () => (
    <div className="space-y-6">
      <div className="glass-panel p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-3 h-3 rounded-full ${agent.available ? 'bg-green-500' : 'bg-slate-400'}`}></div>
          <span className="text-lg font-semibold">
            {agent.available ? 'Available now' : 'Currently busy'}
          </span>
        </div>
        <p className="text-slate-600 mb-4">
          Typical response time: <span className="font-medium">{agent.responseTime}</span>
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Regular Hours</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>Mon-Fri: 8:00 AM - 6:00 PM</li>
              <li>Saturday: 9:00 AM - 4:00 PM</li>
              <li>Sunday: Emergency only</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Emergency Hours</h4>
            <p className="text-sm text-slate-600">
              Available 24/7 for emergency calls with premium rates after regular hours.
            </p>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold mb-4">Schedule a Consultation</h3>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div key={day} className="text-center">
              <div className="text-xs text-slate-600 mb-2">{day}</div>
              <div className="text-sm font-medium">
                {15 + index}
              </div>
              <button className={`w-full py-2 text-xs rounded-lg mt-1 ${
                index < 5 ? 'glass-button' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}>
                {index < 5 ? 'Available' : 'Busy'}
              </button>
            </div>
          ))}
        </div>
        <button className="glass-button--primary w-full py-3 font-semibold">
          <Calendar className="w-4 h-4 mr-2" />
          View Full Calendar
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'reviews': return renderReviews();
      case 'portfolio': return renderPortfolio();
      case 'availability': return renderAvailability();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
          <Link to="/search" className="hover:text-primary">Search</Link>
          <span>/</span>
          <span>{agent.name}</span>
        </div>

        {/* Hero Section */}
        <div className="glass-panel glass-panel--elevated glass-panel--specular p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="shrink-0">
              <img
                src={agent.avatar}
                alt={agent.name}
                className="w-32 h-32 rounded-2xl object-cover ring-4 ring-white/30"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{agent.name}</h1>
                  <p className="text-xl text-slate-600 mb-4">{agent.category}</p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{agent.rating}</span>
                      <span className="text-slate-500">({agent.reviewCount.toLocaleString()})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>{agent.responseTime}</span>
                    </div>
                    <span className="text-green-600 font-medium">{agent.successRate}% success</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="glass-button p-3 hover:scale-105 transition-transform">
                    <Bookmark className="w-5 h-5" />
                  </button>
                  <button className="glass-button p-3 hover:scale-105 transition-transform">
                    <Share className="w-5 h-5" />
                  </button>
                  <button className="glass-button p-3 hover:scale-105 transition-transform">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6">
                {agent.verified && (
                  <div className="glass-pill glass-pill--active text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Verified
                  </div>
                )}
                {agent.insured && (
                  <div className="glass-pill text-sm">
                    <Shield className="w-4 h-4" />
                    Insured
                  </div>
                )}
                <div className={`glass-pill text-sm ${agent.available ? 'glass-pill--secondary' : ''}`}>
                  <div className={`w-2 h-2 rounded-full mr-1 ${agent.available ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                  {agent.available ? 'Available now' : 'Busy'}
                </div>
              </div>

              <div className="text-2xl font-bold text-primary mb-6">
                {formatPrice(agent.pricing.min, agent.pricing.max, agent.pricing.currency)}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowChat(true)}
                  className="glass-button--primary px-6 py-3 font-semibold"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Message Now
                </button>
                <button className="glass-button px-6 py-3 font-semibold">
                  <Phone className="w-5 h-5 mr-2" />
                  Call
                </button>
                <button className="glass-button px-6 py-3 font-semibold">
                  <Video className="w-5 h-5 mr-2" />
                  Video Call
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass-panel mb-6">
          <div className="flex overflow-x-auto p-2">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'reviews', label: `Reviews (${agent.reviewCount.toLocaleString()})` },
              { id: 'portfolio', label: 'Portfolio' },
              { id: 'availability', label: 'Availability' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`glass-pill mx-1 whitespace-nowrap ${
                  activeTab === tab.id ? 'glass-pill--active' : ''
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="glass-panel p-8">
          {renderTabContent()}
        </div>

        {/* Sticky Bottom Actions */}
        <div className="fixed bottom-6 left-0 right-0 px-6">
          <div className="glass-panel glass-panel--elevated p-4 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold">{agent.name}</div>
                <div className="text-sm text-slate-600">
                  {formatPrice(agent.pricing.min, agent.pricing.max, agent.pricing.currency)}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowChat(true)}
                  className="glass-button p-2"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button className="glass-button--primary px-6 py-2 font-semibold">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Modal */}
        {showChat && (
          <AgentChat
            agentId={agent.id}
            agentName={agent.name}
            onClose={() => setShowChat(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AgentProfile;