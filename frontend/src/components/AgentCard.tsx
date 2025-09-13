import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, CheckCircle, Shield, MapPin, Bookmark, GitCompare } from 'lucide-react';
import { Agent } from '../types';

interface AgentCardProps {
  agent: Agent;
  onCompare?: (agent: Agent) => void;
  onSave?: (agent: Agent) => void;
  isComparing?: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({ 
  agent, 
  onCompare, 
  onSave, 
  isComparing = false 
}) => {
  const formatPrice = (min: number, max: number, currency: string) => {
    if (min === max) {
      return `${currency}${min}`;
    }
    return `${currency}${min} - ${currency}${max}`;
  };

  return (
    <div className="glass-panel glass-panel--interactive">
      {/* Header with badges */}
      <div className="glass-panel bg-white/50 p-4 rounded-t-xl border-b border-white/20">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <img
              src={agent.avatar}
              alt={agent.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-white/30"
            />
            <div>
              <h3 className="font-semibold text-lg">{agent.name}</h3>
              <p className="text-sm text-slate-600">{agent.category}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {agent.verified && (
              <div className="glass-pill glass-pill--active text-xs">
                <CheckCircle className="w-3 h-3" />
                Verified
              </div>
            )}
            {agent.insured && (
              <div className="glass-pill text-xs">
                <Shield className="w-3 h-3" />
                Insured
              </div>
            )}
          </div>
        </div>

        {/* Rating and Meta */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-medium">{agent.rating}</span>
            <span className="text-slate-500">
              ({agent.reviewCount.toLocaleString()})
            </span>
          </div>
          <div className="text-slate-600">
            {formatPrice(agent.pricing.min, agent.pricing.max, agent.pricing.currency)}
          </div>
          <div className="flex items-center gap-1 text-slate-600">
            <Clock className="w-4 h-4" />
            {agent.responseTime}
          </div>
          <div className="text-green-600 font-medium">
            {agent.successRate}% success
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <p className="text-slate-700 mb-4 line-clamp-2">
          {agent.description}
        </p>

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-slate-600 mb-4">
          <MapPin className="w-4 h-4" />
          <span>{agent.location.city}, {agent.location.state}</span>
          {agent.location.remote && (
            <span className="glass-pill text-xs ml-2">Remote OK</span>
          )}
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-2 mb-6">
          {agent.specialties.slice(0, 3).map((specialty, index) => (
            <span key={index} className="glass-pill text-xs">
              {specialty}
            </span>
          ))}
          {agent.specialties.length > 3 && (
            <span className="text-xs text-slate-500">
              +{agent.specialties.length - 3} more
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSave?.(agent)}
            className="glass-button p-2 hover:scale-105 transition-transform"
            title="Save to favorites"
          >
            <Bookmark className="w-4 h-4" />
          </button>
          {onCompare && (
            <button
              onClick={() => onCompare(agent)}
              className={`glass-button p-2 hover:scale-105 transition-transform ${
                isComparing ? 'glass-button--primary' : ''
              }`}
              title="Add to compare"
            >
              <GitCompare className="w-4 h-4" />
            </button>
          )}
          <Link
            to={`/agent/${agent.id}`}
            className="glass-button--primary flex-1 text-center py-3 font-semibold"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AgentCard;