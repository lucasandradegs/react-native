import { useEffect, useState } from 'react';
import { useAuth } from './useAuthContext';

interface Product {
  id: string | number;
  name: string;
  price: number;
  created_at?: string;
  updated_at?: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchProducts = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3001/api/products', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar produtos');
      }

      const data = await response.json();
      setProducts(data || []);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      
      // Fallback para dados mockados em caso de erro
      setProducts([
        { id: '1', name: 'Hambúrguer Clássico', price: 25.90 },
        { id: '2', name: 'Pizza Margherita', price: 35.00 },
        { id: '3', name: 'Batata Frita', price: 12.50 },
        { id: '4', name: 'Refrigerante', price: 8.00 },
        { id: '5', name: 'Salada Caesar', price: 18.90 },
        { id: '6', name: 'Sanduíche Natural', price: 15.00 },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (productId: string | number, updates: { name?: string; price?: number }) => {
    try {
      const response = await fetch(`http://localhost:3001/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar produto');
      }

      const result = await response.json();
      
      // Atualizar o estado local
      setProducts(prev => prev.map(product =>
        product.id === productId
          ? { ...product, ...updates, updated_at: new Date().toISOString() }
          : product
      ));

      return result;
    } catch (err) {
      console.error('Erro ao atualizar produto:', err);
      throw err;
    }
  };

  const createProduct = async (productData: { name: string; price: number }) => {
    try {
      const response = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar produto');
      }

      const result = await response.json();
      
      // Adicionar ao estado local
      setProducts(prev => [...prev, result]);

      return result;
    } catch (err) {
      console.error('Erro ao criar produto:', err);
      throw err;
    }
  };

  const deleteProduct = async (productId: string | number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir produto');
      }

      // Remover do estado local
      setProducts(prev => prev.filter(product => product.id !== productId));

      return true;
    } catch (err) {
      console.error('Erro ao excluir produto:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const refetch = () => {
    fetchProducts();
  };

  return {
    products,
    isLoading,
    error,
    refetch,
    updateProduct,
    createProduct,
    deleteProduct,
  };
}; 