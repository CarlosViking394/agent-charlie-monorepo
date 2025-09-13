import React from 'react';
import { X, SlidersHorizontal, DollarSign, Star, Clock, CheckCircle, MapPin } from 'lucide-react';
import { FilterOptions } from '../types';

interface FilterPanelProps {
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
  onClose?: () => void;
  className?: string;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ 
  filters, 
  onChange, 
  onClose,
  className = '' 
}) => {
  const updateFilter = <K extends keyof FilterOptions>(
    key: K, 
    value: FilterOptions[K]
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onChange({
      priceRange: [0, 500],
      rating: 0,
      responseTime: '',
      verified: false,
      remote: false,
      available: false,
    });
  };

  return (
    <div className={`glass-panel p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Filters</h3>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="glass-button p-2 hover:scale-105 transition-transform"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-slate-600" />
          <label className="font-medium">Price Range</label>
        </div>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="1000"
            value={filters.priceRange[1]}
            onChange={(e) => updateFilter('priceRange', [0, parseInt(e.target.value)])}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-sm text-slate-600">
            <span>$0</span>
            <span className="font-medium">${filters.priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-slate-600" />
          <label className="font-medium">Minimum Rating</label>
        </div>
        <div className="flex gap-2">
          {[0, 3, 4, 4.5, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => updateFilter('rating', rating)}
              className={`glass-pill text-sm ${
                filters.rating === rating ? 'glass-pill--active' : ''
              }`}
            >
              {rating === 0 ? 'Any' : `${rating}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Response Time */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-slate-600" />
          <label className="font-medium">Response Time</label>
        </div>
        <div className="flex flex-wrap gap-2">
          {['', 'Within 1 hour', 'Same day', 'Within 24 hours'].map((time) => (
            <button
              key={time}
              onClick={() => updateFilter('responseTime', time)}
              className={`glass-pill text-sm ${
                filters.responseTime === time ? 'glass-pill--active' : ''
              }`}
            >
              {time === '' ? 'Any time' : time}
            </button>
          ))}
        </div>
      </div>

      {/* Toggle Filters */}
      <div className="space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.verified}
            onChange={(e) => updateFilter('verified', e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <CheckCircle className="w-4 h-4 text-slate-600" />
          <span>Verified only</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.remote}
            onChange={(e) => updateFilter('remote', e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <MapPin className="w-4 h-4 text-slate-600" />
          <span>Remote services available</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.available}
            onChange={(e) => updateFilter('available', e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Clock className="w-4 h-4 text-slate-600" />
          <span>Available now</span>
        </label>
      </div>

      {/* Reset Button */}
      <button
        onClick={resetFilters}
        className="w-full glass-button mt-6 py-3 font-medium"
      >
        Reset Filters
      </button>
    </div>
  );
};

export default FilterPanel;