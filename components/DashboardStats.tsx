import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface DashboardStatsProps {
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

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType,
  description,
  icon,
}) => {
  const cardBackground = useThemeColor({ light: '#ffffff', dark: '#262626' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#343434' }, 'text');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');
  
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return '#10b981';
      case 'negative':
        return '#ef4444';
      default:
        return mutedColor;
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={1}>
          {title}
        </Text>
        <Ionicons name={icon} size={16} color={mutedColor} />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardValue, { color: textColor }]} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
        <Text style={[styles.cardDescription, { color: mutedColor }]} numberOfLines={2}>
          {change && (
            <Text style={{ color: getChangeColor() }}>
              {changeType === 'positive' ? '+' : ''}
              {change}
            </Text>
          )}
          {change && ' '}
          {description}
        </Text>
      </View>
    </View>
  );
};

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  todaySales,
  salesChange,
  totalSales,
  todayOrders,
  ordersChange,
  averageTicket,
  ticketChange,
  totalOrders,
  cancelledOrders,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const stats = [
    {
      title: 'Vendas Hoje',
      value: formatCurrency(todaySales),
      change: `${salesChange.toFixed(1)}%`,
      changeType: (salesChange >= 0 ? 'positive' : 'negative') as 'positive' | 'negative',
      description: 'em relação a ontem',
      icon: 'trending-up' as const,
    },
    {
      title: 'Total de Vendas',
      value: formatCurrency(totalSales),
      description: 'Valor total de vendas',
      icon: 'wallet' as const,
    },
    {
      title: 'Pedidos Hoje',
      value: formatNumber(todayOrders),
      change: `${ordersChange.toFixed(1)}%`,
      changeType: (ordersChange >= 0 ? 'positive' : 'negative') as 'positive' | 'negative',
      description: 'em relação a ontem',
      icon: 'bag' as const,
    },
    {
      title: 'Ticket Médio',
      value: formatCurrency(averageTicket),
      change: `${ticketChange.toFixed(1)}%`,
      changeType: (ticketChange >= 0 ? 'positive' : 'negative') as 'positive' | 'negative',
      description: 'em relação a ontem',
      icon: 'cash' as const,
    },
    {
      title: 'Total de Pedidos',
      value: formatNumber(totalOrders),
      description: `Total de pedidos realizados${cancelledOrders > 0 ? `, ${cancelledOrders} cancelados` : ''}`,
      icon: 'time' as const,
    },
  ];

  return (
    <View style={styles.statsGrid}>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          changeType={stat.changeType}
          description={stat.description}
          icon={stat.icon}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: width < 768 ? 12 : 16,
    marginBottom: 16,
  },
  card: {
    width: width < 768 ? '100%' : 
          width < 1024 ? '47%' : 
          width < 1280 ? '30%' : '18%',
    minHeight: width < 768 ? 100 : 120,
    padding: width < 768 ? 14 : 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: width < 768 ? 8 : 12,
    minHeight: 20,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardValue: {
    fontSize: width < 768 ? 18 : 24,
    fontWeight: 'bold',
    lineHeight: width < 768 ? 22 : 28,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: width < 768 ? 11 : 12,
    lineHeight: width < 768 ? 14 : 16,
    flexWrap: 'wrap',
  },
}); 