import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { spacing, styles } from '@/styles/styles';
import apiService from '../services/ApiService';
import { useLanguage } from '../utils/languageContext';
import Logo from './Logo';

export default function VerifyCodeScreen() {
  const { t } = useLanguage();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = (value: string, index: number) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const codeString = code.join('');
    
    if (codeString.length !== 6) {
      Alert.alert(t('error'), t('enterCompleteCode'));
      return;
    }

    if (!email) {
      Alert.alert(t('error'), t('emailMissing'));
      router.replace('/forgot-password');
      return;
    }

    setLoading(true);
    try {
      // Verify code (this will be implemented in ApiService)
      await apiService.verifyResetCode(email, codeString);
      
      Alert.alert(
        t('codeVerified'),
        t('codeCorrect'),
        [
          {
            text: t('continue'),
            onPress: () => {
              router.push({
                pathname: '/reset-password',
                params: { email, code: codeString }
              });
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        t('error'),
        error.response?.data?.error || t('incorrectOrExpiredCode')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      Alert.alert(t('error'), t('emailMissing'));
      router.replace('/forgot-password');
      return;
    }

    setResendLoading(true);
    try {
      await apiService.sendResetCode(email);
      setTimeLeft(600); // Reset timer
      setCode(['', '', '', '', '', '']); // Clear code inputs
      
      Alert.alert(
        t('codeResent'),
        t('newCodeSent')
      );
    } catch (error: any) {
      Alert.alert(
        t('error'),
        error.response?.data?.error || t('cannotResendCode')
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToForgotPassword = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.verifyCodeContainer} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.verifyCodeScrollView}>
        {/* Header */}
        <View style={[styles.header, { marginBottom: spacing.xl }]}>
          <View style={styles.verifyCodeHeader}>
            <Logo size={80} style={styles.verifyCodeLogoContainer} />
            <Text style={[styles.appTitle, { marginBottom: spacing.md }]}>BabySip</Text>
            <Text style={styles.subtitle}>{t('verifyCodeTitle')}</Text>
          </View>
        </View>

        {/* Verify Code Form */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('enterCodeSection')}</Text>
            
            <Text style={styles.verifyCodeDescriptionText}>
              {t('codeSentDescription')}
            </Text>

            {/* Email display */}
            <Text style={styles.verifyCodeEmailText}>
              {email}
            </Text>
            
            {/* Code Input */}
            <View style={styles.verifyCodeInputContainer}>
              <View style={styles.verifyCodeInputRow}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={[
                      styles.verifyCodeInput,
                      digit && styles.verifyCodeInputFilled
                    ]}
                    value={digit}
                    onChangeText={(value) => handleCodeChange(value, index)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </View>
            </View>

            {/* Timer */}
            {timeLeft > 0 && (
              <Text style={styles.verifyCodeTimerText}>
                {t('codeExpiresIn').replace('{time}', formatTime(timeLeft))}
              </Text>
            )}

            {/* Verify Button */}
            <TouchableOpacity
              onPress={handleVerifyCode}
              disabled={loading || code.join('').length !== 6}
              style={[
                styles.button,
                styles.primaryButton,
                styles.verifyCodeButton,
                (loading || code.join('').length !== 6) && styles.verifyCodeButtonDisabled
              ]}
            >
              <Text style={styles.buttonText}>
                {loading ? t('verifying') : t('verifyCode')}
              </Text>
            </TouchableOpacity>

            {/* Resend Code Button */}
            <TouchableOpacity
              onPress={handleResendCode}
              disabled={resendLoading || timeLeft > 0}
              style={[
                styles.verifyCodeResendContainer,
                (resendLoading || timeLeft > 0) && styles.verifyCodeResendContainerDisabled
              ]}
            >
              <Text style={[
                styles.verifyCodeResendText,
                timeLeft > 0 && styles.verifyCodeResendTextDisabled
              ]}>
                {resendLoading ? t('resending') : t('resendCode')}
              </Text>
            </TouchableOpacity>

            {/* Back Link */}
            <TouchableOpacity
              onPress={handleBackToForgotPassword}
              style={styles.verifyCodeLinkContainer}
            >
              <Text style={styles.verifyCodeLinkText}>
                {t('back')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Help */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('helpSection')}</Text>
            <Text style={styles.verifyCodeHelpText}>
              {t('codeHelp')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
