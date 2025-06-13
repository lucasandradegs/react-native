import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/hooks/useAuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');
  const isMobile = width < 768;

  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string>('');
  const [usernameError, setUsernameError] = useState<string>('');

  // Regex para permitir apenas letras, números e underscore
  const usernameRegex = /^[a-zA-Z0-9_]*$/;

  const router = useRouter();

  const handleUsernameChange = (text: string) => {
    // Remove espaços e caracteres especiais
    const filteredText = text.replace(/[^a-zA-Z0-9_]/g, '');
    
    setUsername(filteredText);
    
    // Limpa erros se estava com erro
    if (loginError) setLoginError('');
    if (usernameError) setUsernameError('');
    
    // Valida se o username foi alterado (removidos caracteres especiais)
    if (text !== filteredText && text.length > 0) {
      setUsernameError('Username pode conter apenas letras, números e underscore');
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      const errorMsg = 'Por favor, preencha todos os campos';
      setLoginError(errorMsg);
      Alert.alert('Erro', errorMsg);
      return;
    }

    if (!usernameRegex.test(username)) {
      const errorMsg = 'Username pode conter apenas letras, números e underscore';
      setUsernameError(errorMsg);
      Alert.alert('Erro', errorMsg);
      return;
    }

    // Limpa erros anteriores
    setLoginError('');
    setUsernameError('');

    try {
      await login(username, password);
    } catch (error) {
      console.error('Erro no login:', error);
      
      // Extrai a mensagem de erro de diferentes formatos
      let errorMessage = 'Erro desconhecido';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        // Se o erro for um objeto com uma propriedade message
        if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        }
      }
      
      // Fallback para mensagens específicas se a mensagem estiver vazia ou genérica
      if (!errorMessage || errorMessage === 'Erro desconhecido' || errorMessage.length === 0) {
        errorMessage = 'Verifique suas credenciais e tente novamente';
      }
      
      setLoginError(errorMessage);
      Alert.alert('Erro no Login', errorMessage);
    }
  };

  const navigateToRegister = () => {
    router.push('/cadastro');
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.contentContainer}>
        <View style={styles.leftSection}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name="person-add-outline" 
              size={32} 
              color="#3b82f6" 
            />
          </View>
          <ThemedText type="title" style={styles.title}>
            Faça login para começar a ter o controle do seu restaurante
          </ThemedText>
          <Text style={[styles.subtitle, { color: mutedColor }]}>
            Entre com seu username e senha para acessar o seu dashboard
          </Text>
          
          <TextInput
            style={[styles.input, { borderColor: mutedColor, color: textColor }]}
            placeholder="Username"
            placeholderTextColor={mutedColor}
            value={username}
            onChangeText={handleUsernameChange}
            keyboardType="default"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          {usernameError && (
            <View style={styles.errorContainer}>
              <Ionicons 
                name="alert-circle-outline" 
                size={16} 
                color="#ef4444" 
                style={styles.errorIcon}
              />
              <Text style={styles.errorText}>
                {usernameError}
              </Text>
            </View>
          )}
          
          <TextInput
            style={[styles.input, { borderColor: mutedColor, color: textColor }]}
            placeholder="Senha"
            placeholderTextColor={mutedColor}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (loginError) setLoginError('');
            }}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          {loginError ? (
            <View style={styles.errorContainer}>
              <Ionicons 
                name="alert-circle-outline" 
                size={16} 
                color="#ef4444" 
                style={styles.errorIcon}
              />
              <Text style={styles.errorText}>
                {loginError}
              </Text>
            </View>
          ) : null}
          
          <Pressable 
            style={[styles.loginButton, { backgroundColor: '#3b82f6' }]}
            onPress={handleLogin}
            android_ripple={{ color: 'rgba(255,255,255,0.1)' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>
                Entrar
              </Text>
            )}
          </Pressable>

          <Pressable 
            style={styles.registerLinkContainer}
            onPress={navigateToRegister}
          >
            <Text style={[styles.registerLinkText, { color: mutedColor }]}>
              Não tem uma conta?{' '}
              <Text style={[styles.registerLink, { color: '#3b82f6' }]}>
                Criar conta
              </Text>
            </Text>
          </Pressable>

          <Text style={[styles.terms, { color: mutedColor }]}>
            Criando uma conta, você aceita os termos e condições de uso
          </Text>
        </View>
        {width > 768 && (
          <View style={styles.imageSection}>
            <Image
              source={require('@/assets/images/LoginPI2.png')}
              style={styles.restaurantImage}
              resizeMode="cover"
            />
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0,
  },
  contentContainer: {
    flex: 1,
    flexDirection: width > 768 ? 'row' : 'column',
  },
  leftSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
    maxWidth: width > 768 ? 500 : '100%',
    alignSelf: width > 768 ? 'center' : 'stretch',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 16,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  loginButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  terms: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'left',
  },
  imageSection: {
    flex: 1,
    minHeight: 300,
  },
  restaurantImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    flex: 1,
  },
  registerLinkContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerLinkText: {
    fontSize: 14,
    lineHeight: 20,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 