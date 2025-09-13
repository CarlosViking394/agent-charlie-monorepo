import { Agent } from '../types';

export const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    category: 'Emergency Plumber',
    rating: 4.9,
    reviewCount: 2847,
    responseTime: '~3min response',
    successRate: 98,
    pricing: {
      min: 85,
      max: 150,
      currency: '$'
    },
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b129?w=100&h=100&fit=crop&crop=faces',
    verified: true,
    insured: true,
    available: true,
    specialties: ['Emergency Repairs', 'Pipe Installation', 'Drain Cleaning', 'Leak Detection'],
    location: {
      city: 'Brooklyn',
      state: 'NY',
      remote: false
    },
    description: 'Licensed master plumber with 15+ years experience. Available 24/7 for emergency calls. Specializing in residential and commercial pipe repairs, installations, and maintenance.'
  },
  {
    id: '2',
    name: 'Dr. Michael Rodriguez',
    category: 'Math Tutor',
    rating: 4.8,
    reviewCount: 1204,
    responseTime: '~15min response',
    successRate: 94,
    pricing: {
      min: 45,
      max: 75,
      currency: '$'
    },
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    verified: true,
    insured: false,
    available: true,
    specialties: ['SAT Prep', 'Calculus', 'Algebra', 'Statistics', 'AP Math'],
    location: {
      city: 'Manhattan',
      state: 'NY',
      remote: true
    },
    description: 'PhD in Mathematics with 10 years of tutoring experience. Helped 500+ students improve their test scores and grades. Offering both in-person and virtual sessions.'
  },
  {
    id: '3',
    name: 'Jennifer Williams',
    category: 'Business Consultant',
    rating: 4.7,
    reviewCount: 892,
    responseTime: '~1hr response',
    successRate: 91,
    pricing: {
      min: 150,
      max: 300,
      currency: '$'
    },
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces',
    verified: true,
    insured: true,
    available: false,
    specialties: ['Strategy Consulting', 'Market Analysis', 'Operations', 'Digital Transformation'],
    location: {
      city: 'Queens',
      state: 'NY',
      remote: true
    },
    description: 'Former McKinsey consultant helping small and medium businesses optimize operations and grow revenue. 20+ years of experience across various industries.'
  },
  {
    id: '4',
    name: 'David Park',
    category: 'Web Developer',
    rating: 4.9,
    reviewCount: 1567,
    responseTime: '~30min response',
    successRate: 96,
    pricing: {
      min: 75,
      max: 125,
      currency: '$'
    },
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces',
    verified: true,
    insured: false,
    available: true,
    specialties: ['React', 'Node.js', 'TypeScript', 'E-commerce', 'Mobile Apps'],
    location: {
      city: 'San Francisco',
      state: 'CA',
      remote: true
    },
    description: 'Full-stack developer with expertise in modern web technologies. Built 100+ websites and applications for startups and enterprises. Available for urgent fixes and new projects.'
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    category: 'House Cleaner',
    rating: 4.6,
    reviewCount: 634,
    responseTime: '~2hr response',
    successRate: 89,
    pricing: {
      min: 30,
      max: 50,
      currency: '$'
    },
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces',
    verified: true,
    insured: true,
    available: true,
    specialties: ['Deep Cleaning', 'Move-in/Move-out', 'Regular Maintenance', 'Green Products'],
    location: {
      city: 'Brooklyn',
      state: 'NY',
      remote: false
    },
    description: 'Professional house cleaning service with eco-friendly products. Bonded and insured. Serving NYC area for 8 years with flexible scheduling options.'
  },
  {
    id: '6',
    name: 'Carlos Martinez',
    category: 'Personal Trainer',
    rating: 4.8,
    reviewCount: 789,
    responseTime: '~45min response',
    successRate: 93,
    pricing: {
      min: 60,
      max: 90,
      currency: '$'
    },
    avatar: 'https://images.unsplash.com/photo-1567515004624-219c11d31f2e?w=100&h=100&fit=crop&crop=faces',
    verified: true,
    insured: true,
    available: true,
    specialties: ['Weight Loss', 'Strength Training', 'HIIT', 'Nutrition Coaching'],
    location: {
      city: 'Manhattan',
      state: 'NY',
      remote: false
    },
    description: 'Certified personal trainer and nutrition coach. Helped 200+ clients achieve their fitness goals. Offering personalized workout plans and meal guidance.'
  }
];

export const getAgentsByQuery = (query: string): Agent[] => {
  if (!query) return mockAgents;
  
  const lowerQuery = query.toLowerCase();
  return mockAgents.filter(agent => 
    agent.name.toLowerCase().includes(lowerQuery) ||
    agent.category.toLowerCase().includes(lowerQuery) ||
    agent.specialties.some(specialty => specialty.toLowerCase().includes(lowerQuery)) ||
    agent.description.toLowerCase().includes(lowerQuery)
  );
};

export const getAgentsByCategory = (category: string): Agent[] => {
  const categoryMap: Record<string, string[]> = {
    home: ['plumber', 'cleaner', 'electrician'],
    health: ['trainer', 'therapist', 'nutritionist'],
    education: ['tutor', 'teacher', 'coach'],
    business: ['consultant', 'analyst', 'advisor'],
    tech: ['developer', 'designer', 'engineer'],
    creative: ['photographer', 'writer', 'designer']
  };
  
  const keywords = categoryMap[category] || [];
  return mockAgents.filter(agent => 
    keywords.some(keyword => 
      agent.category.toLowerCase().includes(keyword) ||
      agent.specialties.some(specialty => specialty.toLowerCase().includes(keyword))
    )
  );
};