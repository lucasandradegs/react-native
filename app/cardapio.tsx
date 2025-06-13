import { ThemedView } from '@/components/ThemedView';
import { useProducts } from '@/hooks/useProducts';
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
  TextInput,
  TextStyle,
  View,
  ViewStyle
} from 'react-native';

const { width } = Dimensions.get('window');

interface Product {
  id: string | number;
  name: string;
  price: number;
  created_at?: string;
  updated_at?: string;
}

export default function CardapioScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');
  const cardBackground = useThemeColor({ light: '#ffffff', dark: '#262626' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#343434' }, 'text');
  
  // Usar o hook para produtos da API
  const { products, isLoading, error, refetch, updateProduct, deleteProduct } = useProducts();

  // Estados para o modal de edição
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Estados para o modal de confirmação de exclusão
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setProductName(product.name);
    setProductPrice(product.price.toString());
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingProduct(null);
    setProductName('');
    setProductPrice('');
  };

  const handleSaveProduct = async () => {
    if (!productName.trim()) {
      Alert.alert('Erro', 'Nome do produto é obrigatório');
      return;
    }

    const price = parseFloat(productPrice.replace(',', '.'));
    if (isNaN(price) || price <= 0) {
      Alert.alert('Erro', 'Preço deve ser um valor válido maior que zero');
      return;
    }

    if (!editingProduct) {
      Alert.alert('Erro', 'Produto não encontrado');
      return;
    }

    setIsSaving(true);

    try {
      // Editar produto existente
      await updateProduct(editingProduct.id, { name: productName.trim(), price });
      Alert.alert('Sucesso', 'Produto atualizado com sucesso!');
      closeEditModal();
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao salvar produto'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);

    try {
      await deleteProduct(productToDelete.id);
      Alert.alert('Sucesso', 'Produto excluído com sucesso!');
      closeDeleteModal();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir produto';
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatPrice = (value: string) => {
    // Remove caracteres não numéricos exceto vírgula e ponto
    const numericValue = value.replace(/[^0-9.,]/g, '');
    return numericValue;
  };

  if (isLoading && !refreshing) {
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
          Gerenciar Cardápio
        </Text>
        <Pressable 
          style={styles.addButton} 
          onPress={() => router.push('/novo-produto')}
        >
          <Ionicons name="add" size={24} color={textColor} />
        </Pressable>
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

          {/* Lista de Produtos */}
          {products.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={64} color={mutedColor} />
              <Text style={[styles.emptyTitle, { color: textColor }]}>
                Nenhum produto cadastrado
              </Text>
              <Text style={[styles.emptyDescription, { color: mutedColor }]}>
                Toque no botão + para adicionar seu primeiro produto
              </Text>
            </View>
          ) : (
            <View style={styles.productsList}>
              {products.map((product) => (
                <View 
                  key={product.id} 
                  style={[styles.productCard, { backgroundColor: cardBackground, borderColor }]}
                >
                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: textColor }]}>
                      {product.name}
                    </Text>
                    <Text style={[styles.productPrice, { color: mutedColor }]}>
                      R$ {product.price.toFixed(2)}
                    </Text>
                  </View>
                  
                  <View style={styles.productActions}>
                    <Pressable
                      style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}
                      onPress={() => openEditModal(product)}
                    >
                      <Ionicons name="create-outline" size={18} color="#ffffff" />
                    </Pressable>
                    
                    <Pressable
                      style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
                      onPress={() => openDeleteModal(product)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#ffffff" />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal de Editar Produto */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>
                Editar Produto
              </Text>
              <Pressable style={styles.closeButton} onPress={closeEditModal}>
                <Ionicons name="close" size={24} color={mutedColor} />
              </Pressable>
            </View>
            
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: textColor }]}>Nome do Produto</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: cardBackground, 
                    borderColor, 
                    color: textColor 
                  }]}
                  value={productName}
                  onChangeText={setProductName}
                  placeholder="Ex: Hambúrguer Clássico"
                  placeholderTextColor={mutedColor}
                  maxLength={50}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: textColor }]}>Preço (R$)</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: cardBackground, 
                    borderColor, 
                    color: textColor 
                  }]}
                  value={productPrice}
                  onChangeText={(value) => setProductPrice(formatPrice(value))}
                  placeholder="0,00"
                  placeholderTextColor={mutedColor}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: '#6b7280' }]}
                onPress={closeEditModal}
                disabled={isSaving}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </Pressable>
              
              <Pressable
                style={[styles.modalButton, { backgroundColor: '#3b82f6', opacity: isSaving ? 0.6 : 1 }]}
                onPress={handleSaveProduct}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.modalButtonText}>Salvar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeDeleteModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBackground }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>
                Confirmar Exclusão
              </Text>
              <Pressable
                style={[styles.closeButton, { backgroundColor: 'transparent' }]}
                onPress={closeDeleteModal}
                disabled={isDeleting}
              >
                <Ionicons name="close" size={24} color={textColor} />
              </Pressable>
            </View>

            {/* Conteúdo */}
            <View style={{ gap: 16 }}>
              <Text style={[{ fontSize: 16, color: textColor }]}>
                Tem certeza que deseja excluir o produto{' '}
                <Text style={{ fontWeight: 'bold' }}>&quot;{productToDelete?.name}&quot;</Text>?
              </Text>
              <Text style={[{ fontSize: 14, color: mutedColor }]}>
                Esta ação não pode ser desfeita.
              </Text>
            </View>

            {/* Botões de Ação */}
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: '#6b7280' }]}
                onPress={closeDeleteModal}
                disabled={isDeleting}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </Pressable>
              
              <Pressable
                style={[styles.modalButton, { backgroundColor: '#ef4444', opacity: isDeleting ? 0.6 : 1 }]}
                onPress={confirmDeleteProduct}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.modalButtonText}>Excluir</Text>
                )}
              </Pressable>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: width < 768 ? 16 : 24,
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
  productsList: {
    gap: 12,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
  form: {
    gap: 16,
  } as ViewStyle,
  inputGroup: {
    gap: 8,
  } as ViewStyle,
  label: {
    fontSize: 14,
    fontWeight: '600',
  } as TextStyle,
  input: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  } as TextStyle,
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  } as ViewStyle,
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  } as ViewStyle,
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  } as TextStyle,
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  } as ViewStyle,
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  } as TextStyle,
  addButton: {
    padding: 8,
  } as ViewStyle,
}); 