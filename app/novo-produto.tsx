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
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function NovoProdutoScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');
  const cardBackground = useThemeColor({ light: '#ffffff', dark: '#262626' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#343434' }, 'text');
  
  const { createProduct } = useProducts();
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const formatPrice = (value: string) => {
    // Remove caracteres não numéricos exceto vírgula e ponto
    const numericValue = value.replace(/[^0-9.,]/g, '');
    return numericValue;
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    // Auto-hide após 4 segundos
    setTimeout(() => {
      setNotification(null);
    }, 4000);
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

    setIsLoading(true);

    try {
      await createProduct({ name: productName.trim(), price });
      
      // Limpar os campos após sucesso
      setProductName('');
      setProductPrice('');
      
      showNotification('success', 'Produto criado com sucesso!');
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Erro ao criar produto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Notificação Toast */}
      {notification && (
        <View style={[
          styles.notification,
          {
            backgroundColor: notification.type === 'success' ? '#10b981' : '#ef4444'
          }
        ]}>
          <Ionicons 
            name={notification.type === 'success' ? 'checkmark-circle' : 'alert-circle'} 
            size={20} 
            color="#ffffff" 
          />
          <Text style={styles.notificationText}>{notification.message}</Text>
          
          <Pressable 
            onPress={() => setNotification(null)}
            style={styles.closeNotification}
          >
            <Ionicons name="close" size={16} color="#ffffff" />
          </Pressable>
        </View>
      )}
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Novo Produto
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          {/* Formulário */}
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
                autoFocus
              />
              <Text style={[styles.helperText, { color: mutedColor }]}>
                Máximo 50 caracteres
              </Text>
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
              <Text style={[styles.helperText, { color: mutedColor }]}>
                Use vírgula ou ponto para separar os centavos
              </Text>
            </View>
          </View>

          {/* Botões de Ação */}
          <View style={styles.actions}>
            <Pressable
              style={[styles.cancelButton, { borderColor: mutedColor }]}
              onPress={() => router.back()}
              disabled={isLoading}
            >
              <Ionicons name="close-outline" size={16} color={mutedColor} />
              <Text style={[styles.cancelButtonText, { color: mutedColor }]}>
                Cancelar
              </Text>
            </Pressable>
            
            <Pressable
              style={[styles.saveButton, { 
                backgroundColor: isLoading || !productName.trim() || !productPrice 
                  ? '#9ca3af' 
                  : '#3b82f6'
              }]}
              onPress={handleSaveProduct}
              disabled={isLoading || !productName.trim() || !productPrice}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="checkmark-outline" size={16} color="#ffffff" />
                  <Text style={styles.saveButtonText}>
                    Criar Produto
                  </Text>
                </>
              )}
            </Pressable>
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
    gap: 32,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  notification: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 30,
    left: 16,
    right: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  notificationText: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeNotification: {
    padding: 4,
  },
}); 