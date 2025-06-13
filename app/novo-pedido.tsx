import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/hooks/useAuthContext';
import { useProducts } from '@/hooks/useProducts';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export default function NovoPedidoScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');
  const cardBackground = useThemeColor({ light: '#ffffff', dark: '#262626' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#343434' }, 'text');
  
  const { token, user } = useAuth();
  const { products, isLoading: isLoadingProducts, error, refetch } = useProducts();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const addItemToOrder = (product: { id: string | number; name: string; price: number }) => {
    const existingItem = orderItems.find(item => item.productName === product.name);
    
    if (existingItem) {
      setOrderItems(prev => prev.map(item =>
        item.productName === product.name
          ? {
              ...item,
              quantity: item.quantity + 1,
              totalPrice: (item.quantity + 1) * item.unitPrice
            }
          : item
      ));
    } else {
      const newItem: OrderItem = {
        id: Date.now().toString(),
        productName: product.name,
        quantity: 1,
        unitPrice: product.price,
        totalPrice: product.price,
      };
      setOrderItems(prev => [...prev, newItem]);
    }
  };

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    setOrderItems(prev => prev.map(item =>
      item.id === itemId
        ? {
            ...item,
            quantity: newQuantity,
            totalPrice: newQuantity * item.unitPrice
          }
        : item
    ));
  };

  const removeItem = (itemId: string) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId));
  };

  const getTotalAmount = () => {
    return orderItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const handleSubmitOrder = async () => {
    if (orderItems.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos um item ao pedido');
      return;
    }

    try {
      setIsSubmitting(true);

      const orderData = {
        items: orderItems.map(item => ({
          product_name: item.productName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice,
        })),
        total_amount: getTotalAmount(),
        user_id: user?.id,
      };

      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar pedido');
      }

      const result = await response.json();
      
      Alert.alert(
        'Sucesso!',
        `Pedido #${result.id} criado com sucesso!`,
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
      
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao criar pedido'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProducts && !refreshing) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={[styles.loadingText, { color: textColor }]}>
            Carregando produtos...
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
          Novo Pedido
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
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

          {/* Produtos Disponíveis */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Produtos Disponíveis
            </Text>
            {products.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: mutedColor }]}>
                  Nenhum produto disponível
                </Text>
              </View>
            ) : (
              <View style={styles.productsGrid}>
                {products.map((product) => (
                  <Pressable
                    key={product.id}
                    style={[styles.productCard, { backgroundColor: cardBackground, borderColor }]}
                    onPress={() => addItemToOrder(product)}
                  >
                    <Text style={[styles.productName, { color: textColor }]} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={[styles.productPrice, { color: mutedColor }]}>
                      R$ {product.price.toFixed(2)}
                    </Text>
                    <Ionicons name="add-circle" size={24} color="#3b82f6" />
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Itens do Pedido */}
          {orderItems.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Itens do Pedido
              </Text>
              {orderItems.map((item) => (
                <View key={item.id} style={[styles.orderItem, { backgroundColor: cardBackground, borderColor }]}>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: textColor }]} numberOfLines={1}>
                      {item.productName}
                    </Text>
                    <Text style={[styles.itemPrice, { color: mutedColor }]}>
                      R$ {item.unitPrice.toFixed(2)} cada
                    </Text>
                  </View>
                  
                  <View style={styles.quantityControls}>
                    <Pressable
                      style={[styles.quantityButton, { borderColor }]}
                      onPress={() => updateItemQuantity(item.id, item.quantity - 1)}
                    >
                      <Ionicons name="remove" size={16} color={textColor} />
                    </Pressable>
                    
                    <Text style={[styles.quantityText, { color: textColor }]}>
                      {item.quantity}
                    </Text>
                    
                    <Pressable
                      style={[styles.quantityButton, { borderColor }]}
                      onPress={() => updateItemQuantity(item.id, item.quantity + 1)}
                    >
                      <Ionicons name="add" size={16} color={textColor} />
                    </Pressable>
                  </View>
                  
                  <View style={styles.itemTotal}>
                    <Text style={[styles.itemTotalPrice, { color: textColor }]}>
                      R$ {item.totalPrice.toFixed(2)}
                    </Text>
                    <Pressable
                      style={styles.removeButton}
                      onPress={() => removeItem(item.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Total e Finalizar */}
          {orderItems.length > 0 && (
            <View style={styles.section}>
              <View style={[styles.totalCard, { backgroundColor: cardBackground, borderColor }]}>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: textColor }]}>
                    Total do Pedido:
                  </Text>
                  <Text style={[styles.totalAmount, { color: textColor }]}>
                    R$ {getTotalAmount().toFixed(2)}
                  </Text>
                </View>
                
                <Pressable
                  style={[styles.submitButton, { backgroundColor: '#3b82f6' }]}
                  onPress={handleSubmitOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                      <Text style={styles.submitButtonText}>
                        Finalizar Pedido
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>
          )}
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
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: width < 768 ? 16 : 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    width: width < 768 ? '47%' : '30%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 14,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '500',
    minWidth: 20,
    textAlign: 'center',
  },
  itemTotal: {
    alignItems: 'center',
    gap: 8,
  },
  itemTotalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    padding: 4,
  },
  totalCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 12,
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 