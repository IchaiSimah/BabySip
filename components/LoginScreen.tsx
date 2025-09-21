import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { colors, spacing, styles } from '@/styles/styles';
import authService from '../services/AuthService';
import { useLanguage } from '../utils/languageContext';
import Logo from './Logo';

interface LoginForm {
  username: string;
  password: string;
}

export default function LoginScreen() {
  const { t } = useLanguage();
  const [form, setForm] = useState<LoginForm>({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!form.username.trim() || !form.password.trim()) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({
        username: form.username.trim(),
        password: form.password,
      });

      Alert.alert(
        t('loginSuccess'),
        t('welcomeUser').replace('{username}', response.user.username),
        [
          {
            text: t('continue'),
            // onPress: () => router.replace('/'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        t('loginError'),
        error.response?.data?.message || t('invalidCredentials')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.loginContainer} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.loginScrollView}>
        {/* Header */}
        <View style={[styles.header, { marginBottom: spacing.xl }]}>
          <View style={styles.loginHeader}>
            <Logo size={80} style={styles.loginLogoContainer} />
            <Text style={[styles.appTitle, { marginBottom: spacing.md }]}>BabySip</Text>
            <Text style={styles.subtitle}>{t('loginToAccount')}</Text>
          </View>
        </View>

        {/* Login Form */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('loginSection')}</Text>
            
            {/* Username Input */}
            <View style={styles.loginFormField}>
              <Text style={styles.loginFormLabel}>
                {t('username')}
              </Text>
              <TextInput
                style={styles.loginFormInput}
                placeholder={t('enterUsername')}
                placeholderTextColor={colors.text.secondary}
                value={form.username}
                onChangeText={(text) => setForm(prev => ({ ...prev, username: text }))}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View style={styles.loginFormFieldLarge}>
              <Text style={styles.loginFormLabel}>
                {t('password')}
              </Text>
              <View style={styles.loginPasswordContainer}>
                <TextInput
                  style={styles.loginPasswordInput}
                  placeholder={t('enterPassword')}
                  placeholderTextColor={colors.text.secondary}
                  value={form.password}
                  onChangeText={(text) => setForm(prev => ({ ...prev, password: text }))}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.loginPasswordToggle}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={[
                styles.button,
                styles.primaryButton,
                styles.loginButton,
                loading && styles.loginButtonDisabled
              ]}
            >
              <Text style={styles.buttonText}>
                {loading ? t('loggingIn') : t('login')}
              </Text>
            </TouchableOpacity>

            {/* Forgot Password Link */}
            <TouchableOpacity
              onPress={() => router.push('/forgot-password')}
              style={styles.loginLinkContainer}
            >
              <Text style={styles.loginLinkText}>
                {t('forgotPassword')}
              </Text>
            </TouchableOpacity>

            {/* Register Link */}
            <TouchableOpacity
              onPress={handleRegister}
              style={styles.loginLinkContainerLast}
            >
              <Text style={styles.loginLinkText}>
                {t('noAccount')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Demo Info */}
        {/* <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>ℹ️ Mode démo</Text>
            <Text style={{
              fontSize: 14,
              color: colors.text.secondary,
              lineHeight: 20,
              textAlign: 'center',
            }}>
              Pour tester l'application, vous pouvez créer un compte ou utiliser le mode hors ligne.
            </Text>
          </View>
        </View> */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 