import { ThemedView } from '@/components/ThemedView';
import { useOrders } from '@/hooks/useOrders';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle
} from 'react-native';

const { width } = Dimensions.get('window');

const statusLabels = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Pronto',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const statusColors = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  preparing: '#8b5cf6',
  ready: '#10b981',
  delivered: '#059669',
  cancelled: '#ef4444',
};

export default function PedidosScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');
  const cardBackground = useThemeColor({ light: '#ffffff', dark: '#262626' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#343434' }, 'text');
  
  const { orders, isLoading, error, refetch, updateOrderStatus } = useOrders();
  const [refreshing, setRefreshing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{ id: number; currentStatus: string } | null>(null);
  const [statusOptions, setStatusOptions] = useState<{ text: string; status: string }[]>([]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleStatusChange = async (orderId: number, currentStatus: string) => {
    console.log('handleStatusChange chamada com:', { orderId, currentStatus });
    
    // Se já está finalizado, mostrar aviso
    if (currentStatus === 'delivered' || currentStatus === 'cancelled') {
      console.log('Status já finalizado, mostrando aviso');
      if (Platform.OS === 'web') {
        window.alert('Este pedido já está no status final.');
      } else {
        Alert.alert('Aviso', 'Este pedido já está no status final.');
      }
      return;
    }

    // Definir opções disponíveis baseadas no status atual
    let options: { text: string; status: string }[] = [];

    switch (currentStatus) {
      case 'pending':
        options = [
          { text: 'Confirmar', status: 'confirmed' },
          { text: 'Cancelar', status: 'cancelled' },
        ];
        break;
      case 'confirmed':
        options = [
          { text: 'Preparando', status: 'preparing' },
          { text: 'Cancelar', status: 'cancelled' },
        ];
        break;
      case 'preparing':
        options = [
          { text: 'Pronto', status: 'ready' },
          { text: 'Cancelar', status: 'cancelled' },
        ];
        break;
      case 'ready':
        options = [
          { text: 'Entregue', status: 'delivered' },
          { text: 'Cancelar', status: 'cancelled' },
        ];
        break;
      default:
        options = [
          { text: 'Confirmar', status: 'confirmed' },
          { text: 'Cancelar', status: 'cancelled' },
        ];
    }

    console.log('Status options:', options);

    // Configurar e abrir o modal
    setSelectedOrder({ id: orderId, currentStatus });
    setStatusOptions(options);
    setShowStatusModal(true);
  };

  const handleStatusSelection = (newStatus: string) => {
    if (selectedOrder) {
      console.log('Opção selecionada:', { status: newStatus, orderId: selectedOrder.id });
      updateStatus(selectedOrder.id, newStatus);
    }
    setShowStatusModal(false);
    setSelectedOrder(null);
    setStatusOptions([]);
  };

  const closeModal = () => {
    setShowStatusModal(false);
    setSelectedOrder(null);
    setStatusOptions([]);
  };

  const updateStatus = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingStatus(orderId);
      await updateOrderStatus(orderId, newStatus);
      Alert.alert('Sucesso', 'Status do pedido atualizado com sucesso!');
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao atualizar status'
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || '#6b7280';
  };

  const getStatusLabel = (status: string) => {
    return statusLabels[status as keyof typeof statusLabels] || status;
  };

  if (isLoading && !refreshing) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={[styles.loadingText, { color: textColor }]}>
            Carregando pedidos...
          </Text>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Gerenciar Pedidos
        </Text>
        <Pressable style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color={textColor} />
        </Pressable>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          
          {/* Erro */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={24} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Lista de Pedidos */}
          {orders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color={mutedColor} />
              <Text style={[styles.emptyTitle, { color: textColor }]}>
                Nenhum pedido encontrado
              </Text>
              <Text style={[styles.emptyDescription, { color: mutedColor }]}>
                Os pedidos aparecerão aqui quando forem criados
              </Text>
            </View>
          ) : (
            <View style={styles.ordersList}>
              {orders.map((order) => (
                <View 
                  key={order.id} 
                  style={[styles.orderCard, { backgroundColor: cardBackground, borderColor }]}
                >
                  {/* Header do Pedido */}
                  <View style={styles.orderHeader}>
                    <View style={styles.orderInfo}>
                      <Text style={[styles.orderId, { color: textColor }]}>
                        Pedido #{order.id}
                      </Text>
                      <Text style={[styles.orderDate, { color: mutedColor }]}>
                        {formatDate(order.created_at)}
                      </Text>
                    </View>
                    
                    <View style={styles.orderMeta}>
                      <Text style={[styles.orderTotal, { color: textColor }]}>
                        R$ {order.total_amount.toFixed(2)}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                        <Text style={styles.statusText}>
                          {getStatusLabel(order.status)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Ações */}
                  <View style={styles.orderActions}>
                    <Pressable
                      style={[
                        styles.actionButton,
                        { backgroundColor: getStatusColor(order.status) },
                        updatingStatus === order.id && styles.disabledButton
                      ]}
                      onPress={() => handleStatusChange(order.id, order.status)}
                      disabled={
                        updatingStatus === order.id || 
                        order.status === 'delivered' || 
                        order.status === 'cancelled'
                      }
                    >
                      {updatingStatus === order.id ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <>
                          <Ionicons name="refresh-circle" size={20} color="#ffffff" />
                          <Text style={styles.actionButtonText}>
                            {order.status === 'delivered' || order.status === 'cancelled' 
                              ? 'Finalizado' 
                              : 'Alterar Status'
                            }
                          </Text>
                        </>
                      )}
                    </Pressable>

                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                      <Pressable
                        style={[styles.cancelButton, { borderColor: '#ef4444' }]}
                        onPress={() => updateStatus(order.id, 'cancelled')}
                        disabled={updatingStatus === order.id}
                      >
                        <Ionicons name="close-circle-outline" size={20} color="#ef4444" />
                        <Text style={[styles.cancelButtonText, { color: '#ef4444' }]}>
                          Cancelar
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal de Seleção de Status */}
      <Modal
        visible={showStatusModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>
                Alterar Status
              </Text>
              <Pressable style={styles.closeButton} onPress={closeModal}>
                <Ionicons name="close" size={24} color={mutedColor} />
              </Pressable>
            </View>
            
            {selectedOrder && (
              <Text style={[styles.modalSubtitle, { color: mutedColor }]}>
                Pedido #{selectedOrder.id}
              </Text>
            )}

            <View style={styles.modalButtons}>
              {statusOptions.map((option, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.modalButton,
                    { 
                      backgroundColor: option.status === 'cancelled' ? '#ef4444' : '#3b82f6',
                      opacity: updatingStatus === selectedOrder?.id ? 0.6 : 1 
                    }
                  ]}
                  onPress={() => handleStatusSelection(option.status)}
                  disabled={updatingStatus === selectedOrder?.id}
                >
                  {updatingStatus === selectedOrder?.id ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons 
                        name={option.status === 'cancelled' ? 'close-circle' : 'checkmark-circle'} 
                        size={20} 
                        color="#ffffff" 
                      />
                      <Text style={styles.modalButtonText}>{option.text}</Text>
                    </>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  refreshButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: width < 768 ? 16 : 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#ef4444',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
  },
  ordersList: {
    gap: 16,
  },
  orderCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
  },
  orderMeta: {
    alignItems: 'flex-end',
    gap: 8,
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  } as ViewStyle,
  modalContent: {
    width: width < 768 ? '90%' : 400,
    maxWidth: '90%',
    padding: 24,
    borderRadius: 12,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  } as ViewStyle,
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as ViewStyle,
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  } as TextStyle,
  closeButton: {
    padding: 8,
    borderRadius: 20,
  } as ViewStyle,
  modalSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: -8,
  } as TextStyle,
  modalButtons: {
    gap: 12,
  } as ViewStyle,
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 10,
    minHeight: 48,
  } as ViewStyle,
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
}); 