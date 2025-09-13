import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Clock, CheckCircle, Shield, MapPin, MessageCircle, X } from 'lucide-react';
import { Agent } from '../types';
import { mockAgents } from '../utils/mockData';

const Compare: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedCriteria, setSelectedCriteria] = useState<string>('overview');

  const agentIds = searchParams.get('agents')?.split(',') || [];

  useEffect(() => {
    const compareAgents = mockAgents.filter(agent => agentIds.includes(agent.id));
    setAgents(compareAgents);
  }, [agentIds]);

  const criteria = [
    { id: 'overview', label: 'Overview' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'reviews', label: 'Reviews & Rating' },
    { id: 'availability', label: 'Availability' },
    { id: 'specialties', label: 'Specialties' },
    { id: 'verification', label: 'Verification' },
  ];

  const removeAgent = (agentId: string) => {
    const newIds = agentIds.filter(id => id !== agentId);
    if (newIds.length === 0) {
      window.history.back();
    } else {
      window.location.search = `agents=${newIds.join(',')}`;
    }
  };

  const formatPrice = (min: number, max: number, currency: string) => {
    if (min === max) return `${currency}${min}`;
    return `${currency}${min} - ${currency}${max}`;
  };

  const renderComparisonRow = (label: string, getValue: (agent: Agent) => React.ReactNode) => (
    <div className="border-b border-white/10 py-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${agents.length}, 1fr)` }}>
        <div className="font-medium text-slate-700">{label}</div>
        {agents.map((agent) => (
          <div key={agent.id} className="text-slate-900">
            {getValue(agent)}
          </div>
        ))}
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-0">
      {renderComparisonRow('Name', (agent) => (
        <div className="flex items-center gap-3">
          <img src={agent.avatar} alt={agent.name} className="w-8 h-8 rounded-full" />
          <span className="font-semibold">{agent.name}</span>
        </div>
      ))}
      
      {renderComparisonRow('Category', (agent) => agent.category)}
      
      {renderComparisonRow('Rating', (agent) => (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="font-medium">{agent.rating}</span>
          <span className="text-slate-500 text-sm">({agent.reviewCount.toLocaleString()})</span>
        </div>
      ))}
      
      {renderComparisonRow('Response Time', (agent) => (
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-slate-500" />
          <span>{agent.responseTime}</span>
        </div>
      ))}
      
      {renderComparisonRow('Success Rate', (agent) => (
        <span className="text-green-600 font-medium">{agent.successRate}%</span>
      ))}
      
      {renderComparisonRow('Location', (agent) => (
        <div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-slate-500" />
            <span>{agent.location.city}, {agent.location.state}</span>
          </div>
          {agent.location.remote && (
            <span className="glass-pill text-xs mt-1 inline-block">Remote OK</span>
          )}
        </div>
      ))}
    </div>
  );

  const renderPricing = () => (
    <div className="space-y-0">
      {renderComparisonRow('Price Range', (agent) => (
        <div className="text-lg font-semibold text-primary">
          {formatPrice(agent.pricing.min, agent.pricing.max, agent.pricing.currency)}
        </div>
      ))}
      
      {renderComparisonRow('Starting Price', (agent) => (
        <span className="text-slate-700">{agent.pricing.currency}{agent.pricing.min}</span>
      ))}
      
      {renderComparisonRow('Maximum Price', (agent) => (
        <span className="text-slate-700">{agent.pricing.currency}{agent.pricing.max}</span>
      ))}
    </div>
  );

  const renderReviews = () => (
    <div className="space-y-0">
      {renderComparisonRow('Overall Rating', (agent) => (
        <div className="flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= agent.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <span className="font-medium">{agent.rating}</span>
        </div>
      ))}
      
      {renderComparisonRow('Total Reviews', (agent) => (
        <span className="font-medium">{agent.reviewCount.toLocaleString()} reviews</span>
      ))}
      
      {renderComparisonRow('Success Rate', (agent) => (
        <div className="flex items-center gap-2">
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${agent.successRate}%` }}
            ></div>
          </div>
          <span className="text-green-600 font-medium">{agent.successRate}%</span>
        </div>
      ))}
    </div>
  );

  const renderAvailability = () => (
    <div className="space-y-0">
      {renderComparisonRow('Current Status', (agent) => (
        <div className={`flex items-center gap-2 ${agent.available ? 'text-green-600' : 'text-slate-500'}`}>
          <div className={`w-2 h-2 rounded-full ${agent.available ? 'bg-green-500' : 'bg-slate-400'}`}></div>
          <span>{agent.available ? 'Available now' : 'Busy'}</span>
        </div>
      ))}
      
      {renderComparisonRow('Response Time', (agent) => (
        <span className="font-medium">{agent.responseTime}</span>
      ))}
      
      {renderComparisonRow('Service Area', (agent) => (
        <div>
          <span>{agent.location.city}, {agent.location.state}</span>
          {agent.location.remote && (
            <div className="text-sm text-slate-600 mt-1">+ Remote services</div>
          )}
        </div>
      ))}
    </div>
  );

  const renderSpecialties = () => (
    <div className="space-y-0">
      {renderComparisonRow('Core Specialties', (agent) => (
        <div className="space-y-2">
          {agent.specialties.map((specialty, index) => (
            <span key={index} className="glass-pill text-xs block w-fit">
              {specialty}
            </span>
          ))}
        </div>
      ))}
      
      {renderComparisonRow('Total Skills', (agent) => (
        <span className="font-medium">{agent.specialties.length} specialties</span>
      ))}
    </div>
  );

  const renderVerification = () => (
    <div className="space-y-0">
      {renderComparisonRow('Verified Status', (agent) => (
        <div className="flex items-center gap-2">
          {agent.verified ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-600 font-medium">Verified</span>
            </>
          ) : (
            <>
              <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
              <span className="text-slate-500">Not verified</span>
            </>
          )}
        </div>
      ))}
      
      {renderComparisonRow('Insurance', (agent) => (
        <div className="flex items-center gap-2">
          {agent.insured ? (
            <>
              <Shield className="w-5 h-5 text-blue-500" />
              <span className="text-blue-600 font-medium">Insured</span>
            </>
          ) : (
            <>
              <div className="w-5 h-5"></div>
              <span className="text-slate-500">No insurance</span>
            </>
          )}
        </div>
      ))}
    </div>
  );

  const renderCriteriaContent = () => {
    switch (selectedCriteria) {
      case 'pricing': return renderPricing();
      case 'reviews': return renderReviews();
      case 'availability': return renderAvailability();
      case 'specialties': return renderSpecialties();
      case 'verification': return renderVerification();
      default: return renderOverview();
    }
  };

  if (agents.length === 0) {
    return (
      <div className="container py-8">
        <div className="text-center py-16">
          <div className="glass-panel p-8 max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-4">No agents to compare</h3>
            <p className="text-slate-600 mb-6">
              Select agents from the search results to compare them side by side.
            </p>
            <Link to="/search" className="glass-button--primary px-6 py-3">
              Browse Agents
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/search" className="glass-button p-2 hover:scale-105 transition-transform">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Compare Agents</h1>
              <p className="text-slate-600">Side-by-side comparison of {agents.length} agents</p>
            </div>
          </div>
        </div>

        {/* Agent Headers */}
        <div className="glass-panel mb-6">
          <div className="grid gap-4 p-6" style={{ gridTemplateColumns: `200px repeat(${agents.length}, 1fr)` }}>
            <div></div>
            {agents.map((agent) => (
              <div key={agent.id} className="text-center relative">
                <button
                  onClick={() => removeAgent(agent.id)}
                  className="absolute -top-2 -right-2 glass-button p-1 hover:scale-105 transition-transform"
                >
                  <X className="w-4 h-4" />
                </button>
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="w-16 h-16 rounded-full mx-auto mb-3 ring-2 ring-white/30"
                />
                <h3 className="font-semibold text-lg mb-1">{agent.name}</h3>
                <p className="text-slate-600 text-sm mb-4">{agent.category}</p>
                
                <div className="flex gap-2 justify-center">
                  <Link
                    to={`/agent/${agent.id}`}
                    className="glass-button px-4 py-2 text-sm"
                  >
                    View Profile
                  </Link>
                  <button className="glass-button--primary px-4 py-2 text-sm">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Criteria Tabs */}
        <div className="glass-panel mb-6">
          <div className="flex overflow-x-auto p-2">
            {criteria.map((criterion) => (
              <button
                key={criterion.id}
                onClick={() => setSelectedCriteria(criterion.id)}
                className={`glass-pill mx-1 ${
                  selectedCriteria === criterion.id ? 'glass-pill--active' : ''
                }`}
              >
                {criterion.label}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Content */}
        <div className="glass-panel">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6 capitalize">
              {criteria.find(c => c.id === selectedCriteria)?.label}
            </h2>
            {renderCriteriaContent()}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex gap-4 justify-center mt-8">
          {agents.map((agent) => (
            <Link
              key={agent.id}
              to={`/agent/${agent.id}`}
              className="glass-button--primary px-8 py-3 font-semibold"
            >
              Book {agent.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Compare;