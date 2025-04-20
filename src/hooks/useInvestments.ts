import { useState, useCallback } from 'react';
import { getStockMarketOpportunities, getCrowdfundingProjects } from '@/api/investments';

export type InvestmentType = 'stocks' | 'crowdfunding';
export type Filter = {
  country?: string;
  sector?: string;
  priceRange?: [number, number];
  fundingRange?: [number, number];
};

export function useInvestments(type: InvestmentType) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);

  const fetchInvestments = useCallback(async (filters?: Filter) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = type === 'stocks' 
        ? await getStockMarketOpportunities(filters)
        : await getCrowdfundingProjects(filters);
      
      setData(response.data);
    } catch (err) {
      setError('Failed to fetch investments');
      console.error('Error fetching investments:', err);
    } finally {
      setLoading(false);
    }
  }, [type]);

  const filterInvestments = useCallback((searchQuery: string) => {
    if (!searchQuery) return data;
    
    const query = searchQuery.toLowerCase();
    return data.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.sector?.toLowerCase().includes(query) ||
        item.country?.toLowerCase().includes(query)
    );
  }, [data]);

  return {
    loading,
    error,
    data,
    fetchInvestments,
    filterInvestments,
  };
}