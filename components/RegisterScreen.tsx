import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { colors, styles } from '@/styles/styles';
import authService from '../services/AuthService';
import { useLanguage } from '../utils/languageContext';
import Logo from './Logo';

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterScreen() {
  const { t } = useLanguage();
  const [form, setForm] = useState<RegisterForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (): string | null => {
    if (!form.username.trim()) return t('usernameRequired');
    if (form.username.length < 3) return t('usernameMinLength');
    if (!form.email.trim()) return t('emailRequired');
    if (!form.email.includes('@')) return t('emailInvalid');
    if (!form.password) return t('passwordRequired');
    if (form.password.length < 5) return t('passwordMinLength');
    if (form.password !== form.confirmPassword) return t('passwordsDontMatch');
    return null;
  };

  const handleRegister = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert(t('validationError'), error);
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      Alert.alert(
        t('registrationSuccess'),
        t('accountCreated').replace('{username}', response.user.username),
        [
          {
            text: t('great'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        t('registrationError'),
        error.response?.data?.message || t('accountCreationError')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.registerContainer} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.registerScrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.registerHeader}>
            <Logo size={60} style={styles.registerLogoContainer} />
            <Text style={styles.appTitle}>{t('createAccount')}</Text>
            <Text style={styles.subtitle}>{t('joinBabySip')}</Text>
          </View>
        </View>

        {/* Register Form */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('registerSection')}</Text>
            
            {/* Username Input */}
            <View style={styles.registerFormField}>
              <Text style={styles.registerFormLabel}>
                {t('usernameRequiredField')}
              </Text>
              <TextInput
                style={styles.registerFormInput}
                placeholder={t('chooseUsername')}
                placeholderTextColor={colors.text.secondary}
                value={form.username}
                onChangeText={(text) => setForm(prev => ({ ...prev, username: text }))}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Email Input */}
            <View style={styles.registerFormField}>
              <Text style={styles.registerFormLabel}>
                {t('emailRequiredField')}
              </Text>
              <TextInput
                style={styles.registerFormInput}
                placeholder={t('enterEmail')}
                placeholderTextColor={colors.text.secondary}
                value={form.email}
                onChangeText={(text) => setForm(prev => ({ ...prev, email: text }))}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </View>

            {/* Password Input */}
            <View style={styles.registerFormField}>
              <Text style={styles.registerFormLabel}>
                {t('passwordRequiredField')}
              </Text>
              <View style={styles.registerPasswordContainer}>
                <TextInput
                  style={styles.registerPasswordInput}
                  placeholder={t('choosePassword')}
                  placeholderTextColor={colors.text.secondary}
                  value={form.password}
                  onChangeText={(text) => setForm(prev => ({ ...prev, password: text }))}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.registerPasswordToggle}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.registerFormFieldLarge}>
              <Text style={styles.registerFormLabel}>
                {t('confirmPasswordRequired')}
              </Text>
              <View style={styles.registerPasswordContainer}>
                <TextInput
                  style={styles.registerPasswordInput}
                  placeholder={t('confirmPassword')}
                  placeholderTextColor={colors.text.secondary}
                  value={form.confirmPassword}
                  onChangeText={(text) => setForm(prev => ({ ...prev, confirmPassword: text }))}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.registerPasswordToggle}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              style={[
                styles.button,
                styles.primaryButton,
                styles.registerButton,
                loading && styles.registerButtonDisabled
              ]}
            >
              <Text style={styles.buttonText}>
                {loading ? t('creating') : t('createMyAccount')}
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <TouchableOpacity
              onPress={handleBackToLogin}
              style={styles.registerLinkContainer}
            >
              <Text style={styles.registerLinkText}>
                {t('alreadyHaveAccount')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Terms Info */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('termsSection')}</Text>
            <Text style={styles.registerTermsText}>
              {t('termsAcceptance')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 