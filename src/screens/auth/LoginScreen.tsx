// src/screens/auth/LoginScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  Keyboard,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  HelperText,
  Checkbox,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation, useTheme } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { authService } from '../../services/authService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Config } from '../../config/config';

// Typage de la navigation
type LoginNavProp = StackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginNavProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Chargement des identifiants enregistrés
  useEffect(() => {
    const loadSaved = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem(Config.STORAGE_KEYS.USER_EMAIL);
        const savedRemember = await AsyncStorage.getItem(Config.STORAGE_KEYS.REMEMBER_ME);
        if (savedEmail && savedRemember === 'true') {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (err) {
        console.warn('Load credentials error', err);
      }
    };
    loadSaved();

    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Validateurs
  const validateEmail = (value: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return setEmailError('Veuillez saisir votre email'), false;
    if (!re.test(value)) return setEmailError("Format d'email invalide"), false;
    setEmailError('');
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value) return setPasswordError('Veuillez saisir votre mot de passe'), false;
    if (value.length < 6) return setPasswordError('Le mot de passe doit faire ≥ 6 caractères'), false;
    setPasswordError('');
    return true;
  };

  // Handler de connexion
  const handleLogin = useCallback(async () => {
    if (!validateEmail(email) || !validatePassword(password)) return;

    setIsLoading(true);
    try {
      // Sauvegarde conditionnelle
      if (rememberMe) {
        await AsyncStorage.multiSet([
          [Config.STORAGE_KEYS.USER_EMAIL, email],
          [Config.STORAGE_KEYS.REMEMBER_ME, 'true'],
        ]);
      } else {
        await AsyncStorage.multiRemove([
          Config.STORAGE_KEYS.USER_EMAIL,
          Config.STORAGE_KEYS.REMEMBER_ME,
        ]);
      }

      await authService.login({ email, password });
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (err) {
      console.error('Login error:', err);
      Alert.alert(
        'Échec de connexion',
        'Identifiants incorrects ou problème réseau. Réessayez.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  }, [email, password, rememberMe, navigation]);

  return (
    <View style={[{ flex: 1, paddingTop: insets.top, backgroundColor: colors.background }]}>      
      <StatusBar style={colors.background === '#fff' ? 'dark' : 'light'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.inner}>
            {!keyboardVisible && (
              <Animatable.View animation="fadeIn" style={styles.logoContainer}>
                <Image
                  source={require('../../assets/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                  accessible
                  accessibilityLabel="Logo de l'application"
                />
              </Animatable.View>
            )}

            <Animatable.View animation="fadeInUp" delay={200} style={styles.form}>
              <Text style={[styles.title, { color: colors.primary }]}>Bienvenue</Text>
              <Text style={[styles.subtitle, { color: colors.text }]}>Connectez-vous pour continuer</Text>

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                onBlur={() => validateEmail(email)}
                keyboardType="email-address"
                autoCapitalize="none"
                left={<TextInput.Icon icon="email" />}
                mode="outlined"
                error={!!emailError}
                accessibilityLabel="Champ email"
                style={styles.input}
              />
              {emailError ? <HelperText type="error">{emailError}</HelperText> : null}

              <TextInput
                label="Mot de passe"
                value={password}
                onChangeText={setPassword}
                onBlur={() => validatePassword(password)}
                secureTextEntry={!showPassword}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(v => !v)}
                  />
                }
                mode="outlined"
                error={!!passwordError}
                accessibilityLabel="Champ mot de passe"
                style={styles.input}
              />
              {passwordError ? <HelperText type="error">{passwordError}</HelperText> : null}

              <View style={styles.options}>
                <View style={styles.remember} accessible accessibilityLabel="Se souvenir de moi">
                  <Checkbox
                    status={rememberMe ? 'checked' : 'unchecked'}
                    onPress={() => setRememberMe(v => !v)}
                  />
                  <Text>Se souvenir de moi</Text>
                </View>
                <Button mode="text" onPress={() => navigation.navigate('ForgotPassword')} compact>
                  Mot de passe oublié ?
                </Button>
              </View>

              <Button
                mode="contained"
                onPress={handleLogin}
                disabled={isLoading}
                contentStyle={styles.btnContent}
                accessibilityLabel="Se connecter"
              >
                {isLoading ? <ActivityIndicator animating size="small" /> : 'Se connecter'}
              </Button>

              <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={{ marginHorizontal: 12, color: colors.text }}>ou</Text>
                <View style={styles.line} />
              </View>

              <View style={styles.socials}>
                {['google', 'facebook', 'apple'].map(icon => (
                  <IconButton key={icon} icon={icon} size={28} onPress={() => console.log(`${icon} login`)} />
                ))}
              </View>

              <View style={styles.register}>
                <Text>Pas de compte ?</Text>
                <Button mode="text" onPress={() => navigation.navigate('Register')}>
                  S'inscrire
                </Button>
              </View>
            </Animatable.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, padding: 16 },
  inner: { flex: 1, maxWidth: 500, alignSelf: 'center', justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 120, height: 120 },
  form: {},
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 24, opacity: 0.8 },
  input: { marginBottom: 16, backgroundColor: 'transparent' },
  options: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  remember: { flexDirection: 'row', alignItems: 'center' },
  btnContent: { height: 48 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#CCC' },
  socials: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  register: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
});

export default LoginScreen;
