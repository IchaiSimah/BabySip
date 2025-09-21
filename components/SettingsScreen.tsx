import { authService } from '@/services/AuthService';
import databaseService from '@/services/DatabaseService';
import { useAuth } from '@/utils/authContext';
import { useLanguage } from '@/utils/languageContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { colors, spacing, styles } from '@/styles/styles';
import { useSettings } from '../utils/settingsContext';
import LanguageSelectorModal from './LanguageSelectorModal';

export default function SettingsScreen() {
  const { language, setLanguage, t, isLoading: languageLoading } = useLanguage();
  const [groupId, setGroupId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  
  // Get current language display name
  const getCurrentLanguageName = () => {
    switch (language) {
      case 'en': return 'English';
      case 'fr': return 'Français';
      case 'he': return 'עברית';
      default: return 'English';
    }
  };

  const getCurrentLanguageFlag = () => {
    switch (language) {
      case 'en': return '🇺🇸';
      case 'fr': return '🇫🇷';
      case 'he': return '🇮🇱';
      default: return '🇺🇸';
    }
  };
  
  // Use shared settings context for UI preferences
  const { dashboardSettings, updateDashboardSettings } = useSettings();
  
  // Get current user info for admin check
  const { authState } = useAuth();
  
  // Only load the important setting that affects bottle suggestions
  const [defaultBottleAmount, setDefaultBottleAmount] = useState(120);

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    if (groupId) {
      loadDefaultBottleSetting();
    }
  }, [groupId]);

  const initializeData = async () => {
    try {
      setLoading(true);
      
      // Initialize database
      await databaseService.initDatabase();
      
      // Get or create personal group (using a default user ID for now)
      const userId = 1; // In a real app, this would be the actual user ID
      setGroupId(1);
      
      // Get user language
      const userLanguage = await databaseService.getUserLanguage(userId);
      // Language is now managed by global context, no need to set it here
      
    } catch (error) {
      console.error('Error initializing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultBottleSetting = async () => {
    if (!groupId) return;

    try {
      const currentSettings = await databaseService.getGroupSettings(1); // Use default group ID
      if (currentSettings?.last_bottle) {
        setDefaultBottleAmount(currentSettings.last_bottle);
      }
    } catch (error) {
      console.error('Error loading default bottle setting:', error);
    }
  };

  // Instant UI updates - no database calls needed
  const updateDashboardSetting = (key: string, value: number) => {
    updateDashboardSettings({ [key]: value });
  };

  // Only persist the important setting
  const updateDefaultBottle = async (amount: number) => {
    setDefaultBottleAmount(amount);
    if (groupId) {
      try {
        await databaseService.updateGroupSettings(1, { last_bottle: amount }); // Use default group ID
      } catch (error) {
        console.error('Error updating default bottle amount:', error);
        Alert.alert(t('settingsError'), t('settingsErrorMessage'));
      }
    }
  };

  // Update increment/decrement logic for dashboard settings (instant updates)
  const incrementDashboardSetting = (key: string) => {
    let max = 20;
    if (key === 'poopsToShow') max = 10;
    
    const currentValue = dashboardSettings[key as keyof typeof dashboardSettings];
    
    if (currentValue < max) {
      const newValue = currentValue + 1;
      updateDashboardSetting(key, newValue);
    }
  };

  const decrementDashboardSetting = (key: string) => {
    let min = 1;
    const currentValue = dashboardSettings[key as keyof typeof dashboardSettings];
    
    if (currentValue > min) {
      const newValue = currentValue - 1;
      updateDashboardSetting(key, newValue);
    }
  };

  // Update increment/decrement logic for default bottle (database persistence)
  const incrementDefaultBottle = () => {
    const max = 300;
    const newAmount = Math.min(defaultBottleAmount + 5, max);
    updateDefaultBottle(newAmount);
  };

  const decrementDefaultBottle = () => {
    const min = 30;
    const newAmount = Math.max(defaultBottleAmount - 5, min);
    updateDefaultBottle(newAmount);
  };

  const handleResetSettings = async () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset dashboard settings to defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            updateDashboardSettings({ bottlesToShow: 5, poopsToShow: 1 });
            Alert.alert('Settings Reset', 'Dashboard settings have been reset to defaults.');
          },
        },
      ]
    );
  };

  // 🔥 NEW: Handle data cleanup and cloud sync
  const handleCleanupAndSync = async () => {
    Alert.alert(
      '🧹 Clean and retrieve from cloud',
      'This action will:\n\n• Delete all local bottles and poops\n• Keep your settings (colors, amounts)\n• Retrieve clean data from PostgreSQL\n• Sync across all devices\n\nAre you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: '🧹 Clean',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const success = await databaseService.clearAllDataAndSyncFromCloud();
              
              if (success) {
                Alert.alert(
                  '✅ Cleanup completed',
                  'All data has been cleaned and retrieved from the cloud successfully!'
                );
              } else {
                Alert.alert(
                  '❌ Error',
                  'An error occurred during cleanup. Please try again.'
                );
              }
            } catch (error) {
              console.error('Error during cleanup:', error);
              Alert.alert(
                '❌ Error',
                'An unexpected error occurred.'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // 🔥 NEW: Handle dropping all tables (DEBUG)
  const handleDropAllTables = async () => {
    Alert.alert(
      '🗑️ Delete ALL tables',
      '⚠️ WARNING: This action will:\n\n• Delete ALL database tables\n• Delete ALL data (bottles, poops, groups, settings)\n• Delete ALL local data\n• You will need to log in again\n\nThis action is IRREVERSIBLE!\n\nAre you ABSOLUTELY sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: '🗑️ DELETE ALL',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const success = await databaseService.dropAllTables();
              
              if (success) {
                Alert.alert(
                  '✅ Tables deleted',
                  'All tables have been deleted successfully!\n\nThe application will restart.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        // Force app restart by going back to main screen
                        router.push('/');
                      }
                    }
                  ]
                );
              } else {
                Alert.alert(
                  '❌ Error',
                  'An error occurred while deleting tables.'
                );
              }
            } catch (error) {
              console.error('Error dropping tables:', error);
              Alert.alert(
                '❌ Error',
                'An unexpected error occurred.'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
              // AuthGuard will automatically redirect to login when authState changes
            } catch (error) {
              console.error('Error logging out:', error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="refresh" size={48} color={colors.text.secondary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (loading || languageLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: spacing.sm }}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{t('settingsTitle')}</Text>
            <Text style={styles.subtitle}>Loading...</Text>
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.text.secondary }}>Loading settings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
            <TouchableOpacity onPress={() => router.back()} style={styles.settingsBackButton}>
              <Ionicons name="arrow-back" size={20} color={colors.text.primary} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{t('settingsTitle')}</Text>
              <Text style={styles.subtitle}>{t('customizeYourExperience')}</Text>
            </View>
          </View>
        </View>

        {/* Language Settings */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.settingsSectionHeader}>
              <Ionicons 
                name="language" 
                size={20} 
                color={colors.primary.main} 
                style={styles.settingsSectionIcon}
              />
              <Text style={[styles.sectionTitle, { flex: 1 }]}>{t('languageSettings')}</Text>
            </View>
            
            <Text style={styles.settingsLanguageDescription}>
              {t('languageDescription')}
            </Text>

            {/* Language Selector Button */}
            <TouchableOpacity
              onPress={() => setShowLanguageModal(true)}
              style={styles.settingsLanguageButton}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 24, marginRight: spacing.md }}>
                {getCurrentLanguageFlag()}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingsLanguageButtonText}>
                  {getCurrentLanguageName()}
                </Text>
                <Text style={styles.settingsLanguageButtonSubtext}>
                  {t('selectLanguage')}
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={colors.primary.main} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dashboard Settings - Icon alignment fixed for better visual consistency */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.settingsSectionHeader}>
              <Ionicons 
                name="stats-chart" 
                size={20} 
                color={colors.primary.main} 
                style={styles.settingsSectionIcon}
              />
              <Text style={[styles.sectionTitle, { flex: 1 }]}>{t('dashboardSettings')}</Text>
            </View>
            
            {/* Bottles to Show */}
            <View style={styles.settingsSettingContainer}>
              <View style={styles.settingsSettingRow}>
                <View style={styles.settingsSettingInfo}>
                  <Text style={styles.settingsSettingTitle}>
                    {t('bottlesToShow')}
                  </Text>
                  <Text style={styles.settingsSettingDescription}>
                    {t('bottlesToShowDescription')}
                  </Text>
                </View>
                <View style={styles.settingsControlRow}>
                  <TouchableOpacity
                    onPress={() => decrementDashboardSetting('bottlesToShow')}
                    style={[styles.settingsControlButton, styles.settingsControlButtonLeft]}
                  >
                    <Ionicons name="remove" size={20} color={colors.text.primary} />
                  </TouchableOpacity>
                  
                  <Text style={styles.settingsControlValue}>
                    {dashboardSettings.bottlesToShow}
                  </Text>
                  
                  <TouchableOpacity
                    onPress={() => incrementDashboardSetting('bottlesToShow')}
                    style={[styles.settingsControlButton, styles.settingsControlButtonRight]}
                  >
                    <Ionicons name="add" size={20} color={colors.text.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Poops to Show */}
            <View style={styles.settingsSettingContainer}>
              <View style={styles.settingsSettingRow}>
                <View style={styles.settingsSettingInfo}>
                  <Text style={styles.settingsSettingTitle}>
                    {t('poopsToShow')}
                  </Text>
                  <Text style={styles.settingsSettingDescription}>
                    {t('poopsToShowDescription')}
                  </Text>
                </View>
                <View style={styles.settingsControlRow}>
                  <TouchableOpacity
                    onPress={() => decrementDashboardSetting('poopsToShow')}
                    style={[styles.settingsControlButton, styles.settingsControlButtonLeft]}
                  >
                    <Ionicons name="remove" size={20} color={colors.text.primary} />
                  </TouchableOpacity>
                  
                  <Text style={styles.settingsControlValue}>
                    {dashboardSettings.poopsToShow}
                  </Text>
                  
                  <TouchableOpacity
                    onPress={() => incrementDashboardSetting('poopsToShow')}
                    style={[styles.settingsControlButton, styles.settingsControlButtonRight]}
                  >
                    <Ionicons name="add" size={20} color={colors.text.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Bottle Settings - Database persistence for this important setting */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.settingsSectionHeader}>
              <Ionicons 
                name="water" 
                size={20} 
                color={colors.secondary.main} 
                style={styles.settingsSectionIcon}
              />
              <Text style={[styles.sectionTitle, { flex: 1 }]}>{t('bottleSettings')}</Text>
            </View>
            
            {/* Default Bottle Amount */}
            <View style={styles.settingsSettingContainer}>
              <View style={styles.settingsSettingRow}>
                <View style={styles.settingsSettingInfo}>
                  <Text style={styles.settingsSettingTitle}>
                    {t('defaultBottleAmount')}
                  </Text>
                  <Text style={styles.settingsSettingDescription}>
                    {t('defaultBottleAmountDescription')}
                  </Text>
                </View>
                <View style={styles.settingsControlRow}>
                  <TouchableOpacity
                    onPress={decrementDefaultBottle}
                    style={[styles.settingsControlButton, styles.settingsControlButtonLeft]}
                  >
                    <Ionicons name="remove" size={20} color={colors.text.primary} />
                  </TouchableOpacity>
                  
                  <Text style={styles.settingsControlValueSecondary}>
                    {defaultBottleAmount}ml
                  </Text>
                  
                  <TouchableOpacity
                    onPress={incrementDefaultBottle}
                    style={[styles.settingsControlButton, styles.settingsControlButtonRight]}
                  >
                    <Ionicons name="add" size={20} color={colors.text.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Debug Section - Show current settings values - Only for admin user */}
        {authState.user?.username === 'admin' && (
          <View style={styles.section}>
            <View style={styles.card}>
              <View style={styles.settingsSectionHeader}>
                <Ionicons 
                  name="bug" 
                  size={20} 
                  color={colors.accent.warm} 
                  style={styles.settingsSectionIcon}
                />
                <Text style={[styles.sectionTitle, { flex: 1 }]}>Debug Info</Text>
              </View>
            
              <View style={styles.settingsDebugInfo}>
                <Text style={styles.settingsDebugText}>
                  Current Dashboard Settings:
                </Text>
                <Text style={styles.settingsDebugValue}>
                  Bottles to Show: {dashboardSettings.bottlesToShow}
                </Text>
                <Text style={styles.settingsDebugValue}>
                  Poops to Show: {dashboardSettings.poopsToShow}
                </Text>
                <Text style={styles.settingsDebugValue}>
                  Default Bottle: {defaultBottleAmount}ml
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={handleResetSettings}
                style={[styles.button, { backgroundColor: colors.status.warning }]}
              >
                <Ionicons name="refresh" size={20} color={colors.text.inverse} style={{ marginRight: spacing.sm }} />
                <Text style={[styles.buttonText, { color: colors.text.inverse }]}>Reset Dashboard Settings</Text>
              </TouchableOpacity>

              {/* 🔥 NEW: Cleanup and Sync Button */}
              <TouchableOpacity
                onPress={handleCleanupAndSync}
                style={[styles.button, { backgroundColor: colors.status.error, marginTop: spacing.md }]}
              >
                <Ionicons name="trash" size={20} color={colors.text.inverse} style={{ marginRight: spacing.sm }} />
                <Text style={[styles.buttonText, { color: colors.text.inverse }]}>🧹 Clean and retrieve from cloud</Text>
              </TouchableOpacity>

              {/* 🔥 NEW: Drop All Tables Button */}
              <TouchableOpacity
                onPress={handleDropAllTables}
                style={[styles.button, { backgroundColor: '#FF6B6B', marginTop: spacing.md }]}
              >
                <Ionicons name="trash-bin" size={20} color={colors.text.inverse} style={{ marginRight: spacing.sm }} />
                <Text style={[styles.buttonText, { color: colors.text.inverse }]}>🗑️ Delete ALL tables (DEBUG)</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Logout Section */}
        <View style={styles.section}>
          <View style={styles.card}>
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.settingsLogoutButton}
            >
              <Ionicons name="log-out" size={20} color={colors.text.inverse} style={{ marginRight: spacing.sm }} />
              <Text style={styles.settingsLogoutButtonText}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
      />
    </View>
  );
} 
