import { useEffect, useState } from 'react';
import { useAuth } from './useAuthContext';

interface DashboardStats {
  todaySales: number;
  salesChange: number;
  totalSales: number;
  todayOrders: number;
  ordersChange: number;
  averageTicket: number;
  ticketChange: number;
  totalOrders: number;
  cancelledOrders: number;
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchDashboardStats = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3001/api/dashboard/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar estatísticas do dashboard');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      
      // Fallback para dados mockados em caso de erro
      setStats({
        todaySales: 2847.50,
        salesChange: 12.5,
        totalSales: 45320.80,
        todayOrders: 127,
        ordersChange: 8.2,
        averageTicket: 22.42,
        ticketChange: -2.1,
        totalOrders: 2048,
        cancelledOrders: 23,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [token]);

  const refetch = () => {
    fetchDashboardStats();
  };

  return {
    stats,
    isLoading,
    error,
    refetch,
  };
}; 