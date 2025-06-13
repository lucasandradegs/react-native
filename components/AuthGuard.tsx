import { useAuth } from '@/hooks/useAuthContext';
import { router, useSegments } from 'expo-router';
import React, { useEffect } from 'react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    // Rotas protegidas que requerem autenticação
    const protectedRoutes = ['dashboard', 'novo-pedido', 'pedidos', 'cardapio', 'novo-produto'];
    // Rotas públicas que não requerem autenticação
    const publicRoutes = ['', 'cadastro']; // '' é a rota index (/), 'cadastro' é a rota de cadastro
    
    const inAuthGroup = protectedRoutes.includes(segments[0]);
    const inPublicGroup = publicRoutes.includes(segments[0] || '');

    if (!isAuthenticated && inAuthGroup) {
      // Usuário não autenticado tentando acessar rota protegida
      router.replace('/');
    } else if (isAuthenticated && inPublicGroup) {
      // Usuário autenticado em rota pública (login ou cadastro) - redireciona para dashboard
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, segments]);

  return <>{children}</>;
} 