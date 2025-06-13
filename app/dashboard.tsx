import { DashboardStats } from '@/components/DashboardStats';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/hooks/useAuthContext';
import { useDashboard } from '@/hooks/useDashboard';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');
  
  const { user, logout } = useAuth();
  const { stats, isLoading, error, refetch } = useDashboard();

  const handleLogout = () => {
    logout();
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleNewOrder = () => {
    router.push('/novo-pedido');
  };

  // Fallback para dados padrão caso não tenha stats
  const dashboardStats = stats || {
    todaySales: 0,
    salesChange: 0,
    totalSales: 0,
    todayOrders: 0,
    ordersChange: 0,
    averageTicket: 0,
    ticketChange: 0,
    totalOrders: 0,
    cancelledOrders: 0,
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleSection}>
            <Text style={[styles.mainTitle, { color: textColor }]} numberOfLines={2}>
              Restaurante do {user?.username || 'Usuário'} - Dashboard
            </Text>
            <Text style={[styles.subtitle, { color: mutedColor }]}>
              Gerencie seus produtos e acompanhe suas vendas
            </Text>
          </View>
          
          <View style={styles.headerActions}>
            {/* Botão de Refresh */}
            <Pressable 
              style={[styles.refreshButton, { borderColor: mutedColor }]}
              onPress={handleRefresh}
              disabled={isLoading}
            >
              <Ionicons 
                name="refresh-outline" 
                size={18} 
                color={isLoading ? mutedColor : textColor} 
              />
            </Pressable>
            
            {/* Botão de Logout */}
            <Pressable 
              style={[styles.logoutButton, { borderColor: mutedColor }]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={18} color={textColor} />
              <Text style={[styles.logoutText, { color: textColor }]}>
                Sair
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="warning-outline" size={20} color="#ef4444" />
              <Text style={styles.errorText}>
                {error} - Mostrando dados de exemplo
              </Text>
            </View>
          )}

          {/* Loading or Dashboard Stats */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={[styles.loadingText, { color: mutedColor }]}>
                Carregando estatísticas...
              </Text>
            </View>
          ) : (
            <DashboardStats {...dashboardStats} />
          )}

          {/* Quick Actions Section */}
          <View style={styles.quickActionsSection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Ações Rápidas
            </Text>
            
            <View style={styles.actionButtons}>
              <Pressable 
                style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}
                onPress={handleNewOrder}
              >
                <Ionicons name="add-outline" size={20} color="#ffffff" />
                <Text style={styles.actionButtonText}>Novo Pedido</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.actionButton, { backgroundColor: '#8b5cf6' }]}
                onPress={() => router.push('/pedidos')}
              >
                <Ionicons name="list-outline" size={20} color="#ffffff" />
                <Text style={styles.actionButtonText}>Gerenciar Pedidos</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                onPress={() => router.push('/cardapio')}
              >
                <Ionicons name="restaurant-outline" size={20} color="#ffffff" />
                <Text style={styles.actionButtonText}>Gerenciar Cardápio</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0,
  },
  header: {
    paddingHorizontal: width < 768 ? 16 : 24,
    paddingVertical: width < 768 ? 16 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: width > 640 ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: width > 640 ? 'center' : 'flex-start',
    gap: width > 640 ? 0 : 16,
  },
  titleSection: {
    flex: 1,
  },
  mainTitle: {
    fontSize: width < 768 ? 16 : 18,
    fontWeight: 'bold',
    letterSpacing: -0.025,
    marginBottom: 4,
    lineHeight: width < 768 ? 20 : 22,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: width < 768 ? 16 : 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
  },
  quickActionsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: width < 768 ? 'column' : 'row',
    gap: width < 768 ? 8 : 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: width < 768 ? 14 : 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: width < 768 ? 0 : 1,
    minHeight: 48,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 