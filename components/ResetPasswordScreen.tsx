import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { colors, spacing, styles } from '@/styles/styles';
import apiService from '../services/ApiService';
import { useLanguage } from '../utils/languageContext';
import Logo from './Logo';

export default function ResetPasswordScreen() {
  const { t } = useLanguage();
  const { email, code } = useLocalSearchParams<{ email: string; code: string }>();
  const [form, setForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return t('passwordMinLength6');
    }
    return null;
  };

  const handleResetPassword = async () => {
    if (!form.newPassword.trim() || !form.confirmPassword.trim()) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    const passwordError = validatePassword(form.newPassword);
    if (passwordError) {
      Alert.alert(t('error'), passwordError);
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      Alert.alert(t('error'), t('passwordsMustMatch'));
      return;
    }

    if (!email || !code) {
      Alert.alert(t('error'), t('missingData'));
      router.replace('/forgot-password');
      return;
    }

    setLoading(true);
    try {
      await apiService.resetPassword(email, code, form.newPassword);
      
      Alert.alert(
        t('passwordReset'),
        t('passwordResetSuccess'),
        [
          {
            text: t('login'),
            onPress: () => {
              router.replace('/login');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        t('error'),
        error.response?.data?.error || t('cannotResetPassword')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToVerifyCode = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.resetPasswordContainer} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.resetPasswordScrollView}>
        {/* Header */}
        <View style={[styles.header, { marginBottom: spacing.xl }]}>
          <View style={styles.resetPasswordHeader}>
            <Logo size={80} style={styles.resetPasswordLogoContainer} />
            <Text style={[styles.appTitle, { marginBottom: spacing.md }]}>BabySip</Text>
            <Text style={styles.subtitle}>{t('newPasswordTitle')}</Text>
          </View>
        </View>

        {/* Reset Password Form */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('setNewPasswordSection')}</Text>
            
            <Text style={styles.resetPasswordDescriptionText}>
              {t('chooseSecurePassword')}
            </Text>
            
            {/* New Password Input */}
            <View style={styles.resetPasswordFormField}>
              <Text style={styles.resetPasswordFormLabel}>
                {t('newPassword')}
              </Text>
              <View style={styles.resetPasswordPasswordContainer}>
                <TextInput
                  style={styles.resetPasswordPasswordInput}
                  placeholder={t('enterNewPassword')}
                  placeholderTextColor={colors.text.secondary}
                  value={form.newPassword}
                  onChangeText={(text) => setForm(prev => ({ ...prev, newPassword: text }))}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.resetPasswordPasswordToggle}
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
            <View style={styles.resetPasswordFormFieldLarge}>
              <Text style={styles.resetPasswordFormLabel}>
                {t('confirmNewPassword')}
              </Text>
              <View style={styles.resetPasswordPasswordContainer}>
                <TextInput
                  style={styles.resetPasswordPasswordInput}
                  placeholder={t('confirmNewPasswordPlaceholder')}
                  placeholderTextColor={colors.text.secondary}
                  value={form.confirmPassword}
                  onChangeText={(text) => setForm(prev => ({ ...prev, confirmPassword: text }))}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.resetPasswordPasswordToggle}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Requirements */}
            <View style={styles.resetPasswordRequirementsContainer}>
              <Text style={styles.resetPasswordRequirementsTitle}>
                {t('passwordRequirements')}
              </Text>
              <Text style={styles.resetPasswordRequirementsText}>
                {t('passwordRequirementsText')}
              </Text>
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              onPress={handleResetPassword}
              disabled={loading}
              style={[
                styles.button,
                styles.primaryButton,
                styles.resetPasswordButton,
                loading && styles.resetPasswordButtonDisabled
              ]}
            >
              <Text style={styles.buttonText}>
                {loading ? t('resetting') : t('resetPassword')}
              </Text>
            </TouchableOpacity>

            {/* Back Link */}
            <TouchableOpacity
              onPress={handleBackToVerifyCode}
              style={styles.resetPasswordLinkContainer}
            >
              <Text style={styles.resetPasswordLinkText}>
                {t('back')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Security Info */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('securitySection')}</Text>
            <Text style={styles.resetPasswordSecurityText}>
              {t('passwordSecurity')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
