import { useEffect, useState } from 'react';
import { useAuth } from './useAuthContext';

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchOrders = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar pedidos');
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      
      // Fallback para dados mockados em caso de erro
      setOrders([
        {
          id: 1,
          total_amount: 45.90,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          total_amount: 67.50,
          status: 'confirmed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status do pedido');
      }

      const result = await response.json();
      
      // Atualizar o estado local
      setOrders(prev => prev.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
          : order
      ));

      return result;
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const refetch = () => {
    fetchOrders();
  };

  return {
    orders,
    isLoading,
    error,
    refetch,
    updateOrderStatus,
  };
}; 