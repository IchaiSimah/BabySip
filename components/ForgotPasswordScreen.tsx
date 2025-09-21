import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { colors, spacing, styles } from '@/styles/styles';
import apiService from '../services/ApiService';
import { useLanguage } from '../utils/languageContext';
import Logo from './Logo';

export default function ForgotPasswordScreen() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert(t('error'), t('enterEmailAddress'));
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert(t('error'), t('enterValidEmail'));
      return;
    }

    setLoading(true);
    try {
      await apiService.sendResetCode(email.trim());
      
      Alert.alert(
        t('codeSent'),
        t('resetCodeSent'),
        [
          {
            text: t('continue'),
            onPress: () => {
              // Navigate to verify code screen with email parameter
              router.push({
                pathname: '/verify-code',
                params: { email: email.trim() }
              });
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        t('error'),
        error.response?.data?.error || t('cannotSendCode')
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
      style={styles.forgotPasswordContainer} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.forgotPasswordScrollView}>
        {/* Header */}
        <View style={[styles.header, { marginBottom: spacing.xl }]}>
          <View style={styles.forgotPasswordHeader}>
            <Logo size={80} style={styles.forgotPasswordLogoContainer} />
            <Text style={[styles.appTitle, { marginBottom: spacing.md }]}>BabySip</Text>
            <Text style={styles.subtitle}>{t('forgotPasswordTitle')}</Text>
          </View>
        </View>

        {/* Forgot Password Form */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('resetPasswordSection')}</Text>
            
            <Text style={styles.forgotPasswordDescriptionText}>
              {t('resetPasswordDescription')}
            </Text>
            
            {/* Email Input */}
            <View style={styles.forgotPasswordFormField}>
              <Text style={styles.forgotPasswordFormLabel}>
                {t('emailAddress')}
              </Text>
              <TextInput
                style={styles.forgotPasswordFormInput}
                placeholder={t('enterEmailAddress')}
                placeholderTextColor={colors.text.secondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
            </View>

            {/* Send Code Button */}
            <TouchableOpacity
              onPress={handleSendCode}
              disabled={loading}
              style={[
                styles.button,
                styles.primaryButton,
                styles.forgotPasswordButton,
                loading && styles.forgotPasswordButtonDisabled
              ]}
            >
              <Text style={styles.buttonText}>
                {loading ? t('sending') : t('sendCode')}
              </Text>
            </TouchableOpacity>

            {/* Back to Login Link */}
            <TouchableOpacity
              onPress={handleBackToLogin}
              style={styles.forgotPasswordLinkContainer}
            >
              <Text style={styles.forgotPasswordLinkText}>
                {t('backToLogin')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('infoSection')}</Text>
            <Text style={styles.forgotPasswordInfoText}>
              {t('resetCodeExpires')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
