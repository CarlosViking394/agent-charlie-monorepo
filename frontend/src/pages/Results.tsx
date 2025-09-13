import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, Info, GitCompare } from 'lucide-react';
import AgentCard from '../components/AgentCard';
import FilterPanel from '../components/FilterPanel';
import { Agent, FilterOptions } from '../types';
import { mockAgents, getAgentsByQuery, getAgentsByCategory } from '../utils/mockData';

const Results: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [compareList, setCompareList] = useState<Agent[]>([]);
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'price' | 'response'>('relevance');
  
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 500],
    rating: 0,
    responseTime: '',
    verified: false,
    remote: false,
    available: false,
  });

  const query = searchParams.get('q');
  const category = searchParams.get('category');
  const filter = searchParams.get('filter');

  useEffect(() => {
    let results: Agent[] = [];
    
    if (query) {
      results = getAgentsByQuery(query);
    } else if (category) {
      results = getAgentsByCategory(category);
    } else if (filter) {
      switch (filter) {
        case 'emergency':
          results = mockAgents.filter(agent => 
            agent.available && agent.responseTime.includes('min')
          );
          break;
        case 'budget':
          results = mockAgents.filter(agent => agent.pricing.max <= 200);
          break;
        case 'nearby':
          results = mockAgents.filter(agent => 
            agent.location.city === 'Brooklyn' || agent.location.city === 'Manhattan'
          );
          break;
        default:
          results = mockAgents;
      }
    } else {
      results = mockAgents;
    }
    
    setAgents(results);
  }, [query, category, filter]);

  useEffect(() => {
    let filtered = agents.filter(agent => {
      if (filters.rating > 0 && agent.rating < filters.rating) return false;
      if (agent.pricing.max > filters.priceRange[1]) return false;
      if (filters.responseTime && !agent.responseTime.includes(filters.responseTime)) return false;
      if (filters.verified && !agent.verified) return false;
      if (filters.remote && !agent.location.remote) return false;
      if (filters.available && !agent.available) return false;
      return true;
    });

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'price':
        filtered.sort((a, b) => a.pricing.min - b.pricing.min);
        break;
      case 'response':
        filtered.sort((a, b) => {
          const getMinutes = (time: string) => {
            if (time.includes('min')) return parseInt(time);
            if (time.includes('hr')) return parseInt(time) * 60;
            return 1440; // 24 hours in minutes
          };
          return getMinutes(a.responseTime) - getMinutes(b.responseTime);
        });
        break;
      default:
        // Keep relevance order
        break;
    }

    setFilteredAgents(filtered);
  }, [agents, filters, sortBy]);

  const handleCompare = (agent: Agent) => {
    if (compareList.find(a => a.id === agent.id)) {
      setCompareList(compareList.filter(a => a.id !== agent.id));
    } else if (compareList.length < 4) {
      setCompareList([...compareList, agent]);
    }
  };

  const getResultsTitle = () => {
    if (query) return `Results for "${query}"`;
    if (category) return `${category.charAt(0).toUpperCase() + category.slice(1)} Services`;
    if (filter === 'emergency') return 'Emergency Services Available Now';
    if (filter === 'budget') return 'Budget-Friendly Options Under $200';
    if (filter === 'nearby') return 'Service Agents Near You';
    return 'All Service Agents';
  };

  return (
    <div className="min-h-screen">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{getResultsTitle()}</h1>
            <p className="text-slate-600">
              {filteredAgents.length} agents found
              {filters.rating > 0 || filters.verified || filters.remote || filters.available ? 
                ` (filtered from ${agents.length} total)` : ''
              }
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="glass-input py-2 px-3 text-sm"
              >
                <option value="relevance">Relevance</option>
                <option value="rating">Highest Rated</option>
                <option value="price">Lowest Price</option>
                <option value="response">Fastest Response</option>
              </select>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`glass-button px-4 py-2 ${showFilters ? 'glass-button--primary' : ''}`}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </button>
            
            <button className="glass-button px-4 py-2">
              <Info className="w-4 h-4 mr-2" />
              Explain Ranking
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 shrink-0">
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                onClose={() => setShowFilters(false)}
              />
            </div>
          )}

          {/* Results Grid */}
          <div className="flex-1">
            <div className="grid gap-6">
              {filteredAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onCompare={handleCompare}
                  isComparing={compareList.some(a => a.id === agent.id)}
                />
              ))}
            </div>

            {filteredAgents.length === 0 && (
              <div className="text-center py-16">
                <div className="glass-panel p-8 max-w-md mx-auto">
                  <h3 className="text-xl font-semibold mb-4">No agents found</h3>
                  <p className="text-slate-600 mb-6">
                    Try adjusting your filters or search terms to find more results.
                  </p>
                  <button
                    onClick={() => setFilters({
                      priceRange: [0, 500],
                      rating: 0,
                      responseTime: '',
                      verified: false,
                      remote: false,
                      available: false,
                    })}
                    className="glass-button--primary px-6 py-3"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Compare Tray */}
        {compareList.length > 0 && (
          <div className="fixed bottom-6 right-6 glass-panel glass-panel--elevated p-4 max-w-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-primary" />
                <span className="font-semibold">Compare ({compareList.length})</span>
              </div>
              <button
                onClick={() => setCompareList([])}
                className="text-slate-500 hover:text-slate-700"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-2 mb-4">
              {compareList.map((agent) => (
                <div key={agent.id} className="flex items-center gap-2 text-sm">
                  <img src={agent.avatar} alt={agent.name} className="w-6 h-6 rounded-full" />
                  <span className="flex-1">{agent.name}</span>
                  <button
                    onClick={() => handleCompare(agent)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            
            <Link
              to={`/compare?agents=${compareList.map(a => a.id).join(',')}`}
              className="glass-button--primary w-full text-center py-2 font-semibold block"
            >
              Compare Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;