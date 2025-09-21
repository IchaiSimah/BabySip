import { authService } from '@/services/AuthService';
import databaseService, { dataChangeEmitter } from '@/services/DatabaseService';
import { syncService } from '@/services/SyncService';
import { useAuth } from '@/utils/authContext';
import { formatTime, getTimeAgo } from '@/utils/dateUtils';
import { useLanguage } from '@/utils/languageContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { colors, spacing, styles } from '@/styles/styles';
import { useSettings } from '../utils/settingsContext';
import EditBottleModal from './EditBottleModal';
import Logo from './Logo';
import SwipeableItem from './SwipeableItem';

interface Bottle {
  id: string;
  amount: number;
  time: string;
  color?: string;
  created_at: string;
}

interface Poop {
  id: string;
  time: string;
  info: string | null;
  color?: string;
  created_at: string;
}

interface TodayStats {
  totalBottles: number;
  totalAmount: number;
  totalPoops: number;
  averageAmount: number;
}

export default function DashboardScreen() {
  const { authState } = useAuth();
  const { language, t } = useLanguage();
  
  // TEMPORARY: Allow access without authentication
  const TEMPORARY_BYPASS = false;
  
  const [groupId, setGroupId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentBottles, setRecentBottles] = useState<Bottle[]>([]);
  const [recentPoops, setRecentPoops] = useState<Poop[]>([]);
  const [todayStats, setTodayStats] = useState<TodayStats>({
    totalBottles: 0,
    totalAmount: 0,
    totalPoops: 0,
    averageAmount: 0,
  });
  
  // Use shared settings context for UI preferences
  const { dashboardSettings } = useSettings();
  
  // Only load the important setting that affects bottle suggestions
  const [lastBottleAmount, setLastBottleAmount] = useState(120);
  const [currentGroup, setCurrentGroup] = useState<{ id: number; name: string } | null>(null);

  // Edit modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingBottle, setEditingBottle] = useState<Bottle | null>(null);

  // Sync status
  const [syncStatus, setSyncStatus] = useState<string>('idle');
  const [hasInitialSync, setHasInitialSync] = useState(false); // 🔥 SIMPLE: false = not synced yet, true = synced
  const [isInitializing, setIsInitializing] = useState(false); // 🔥 NEW: Prevent multiple initializations

  // DEBUG: Function to reset initial sync status (for testing)
  const resetInitialSyncStatus = async () => {
    await AsyncStorage.removeItem('hasInitialSync');
    setHasInitialSync(false);
  };

  useEffect(() => {
    
    // SIMPLE: Check if initial sync was already done
    const checkInitialSync = async (): Promise<boolean> => {
      try {
        const hasDoneInitialSync = await AsyncStorage.getItem('hasInitialSync');
        const initialSyncDone = hasDoneInitialSync === 'true';
        setHasInitialSync(initialSyncDone);
        return initialSyncDone;
      } catch (error) {
        console.error('Error checking initial sync status:', error);
        setHasInitialSync(false);
        return false;
      }
    };
    
    checkInitialSync().then(async () => {
      // SIMPLE: Just initialize, let initializeScreen check AsyncStorage directly
      initializeScreen();
    });
    
    // CRITICAL FIX: Listen to sync events for real-time UI updates
    const unsubscribeSync = syncService.addListener((status) => {
      
      // FIXED: Remove redundant loadData() call - UI updates automatically
      // If sync just completed and we have a group, just log it
      if (status.lastSync && groupId && !status.isSyncing) {
        // Sync completed
      }
      
      // Update sync status in UI
      if (status.isSyncing) {
        setSyncStatus('syncing');
      } else if (status.error) {
        setSyncStatus('error');
      } else if (status.lastSync) {
        setSyncStatus('synced');
      }
    });

    // CRITICAL FIX: Listen to data change events for immediate UI updates
    const unsubscribeDataChange = dataChangeEmitter.addListener((event) => {
      // NEW: Handle specifically the CLOUD_SYNC_COMPLETED event
      // if (event.type === 'CLOUD_SYNC_COMPLETED') {
      //   if (groupId) {
      //     loadData(); // FIXED: Actually reload data after sync
      //   }
      // } else {
        // For other events (manual add/delete)
        // if (groupId) {
          loadData(); // ← Keep only for manual changes
        // }
      // }
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeSync();
      unsubscribeDataChange();
    };
  }, []); // No dependencies - listeners should only be created once

  // useFocusEffect with dashboardSettings dependency to ensure fresh context values
  // This prevents stale closure issues when settings are updated
  useFocusEffect(
    React.useCallback(() => {
      const reloadScreen = async () => {
        if (isInitializing) {
          return;
        }
        
        try {
          // Ensure database is initialized
          const dbInitialized = await databaseService.initDatabase();
          if (!dbInitialized) {
            console.error('Failed to initialize database in useFocusEffect');
            return;
          }
          
          // Get current user's group (this will detect if group changed)
          const userId = authState.user?.id || 1; // Use authenticated user ID
          const currentUserGroup = 1;
          
            // Load data with current dashboard settings (this handles settings changes)
            await loadDataWithSettings(dashboardSettings);
          
        } catch (error) {
          console.error('Error reloading screen:', error);
        }
      };
      reloadScreen();
    }, [dashboardSettings]) // Keep dependency for settings updates, but prevent duplicates with guards
  );

  const initializeScreen = async () => {
    if (isInitializing) {
      return;
    }
    
    setIsInitializing(true);
    try {
      setLoading(true);
      
      // TEMPORARY: Allow access without authentication
      const TEMPORARY_BYPASS = false;
      
      // Check authentication status
      if (!TEMPORARY_BYPASS && !authState.isAuthenticated) {
        router.replace('/login');
        return;
      }

      // Initialize database with proper error handling
      const dbInitialized = await databaseService.initDatabase();
      if (!dbInitialized) {
        console.error('Failed to initialize database');
        return;
      }
      
      // Get current user's group (this will get the actual group the user is in)
      const userId = TEMPORARY_BYPASS ? 1 : (authState.user?.id || 1); // Use authenticated user ID
      const currentGroupId = 1;
    
 
      
      // Get user language
      const userLanguage = await databaseService.getUserLanguage(userId);
      // Language is now managed by global context, no need to set it here
      
      // Load the important setting that affects bottle suggestions
      const groupSettings = await databaseService.getGroupSettings(1); // Use default group ID
      if (groupSettings?.last_bottle) {
        setLastBottleAmount(groupSettings.last_bottle);
      }

      // SIMPLE: Check AsyncStorage directly and sync only if needed
      const hasDoneInitialSync = await AsyncStorage.getItem('hasInitialSync');
      const initialSyncDone = hasDoneInitialSync === 'true';
      
      if (!TEMPORARY_BYPASS && authState.isAuthenticated && !initialSyncDone) {
        try {
          setSyncStatus('syncing');
          
          // First, try to sync from cloud
          await databaseService.syncFromCloud();
          
          setSyncStatus('synced');
          setHasInitialSync(true); // MARK as synced in state
          await AsyncStorage.setItem('hasInitialSync', 'true'); // PERSIST in AsyncStorage
        } catch (error) {
          console.error('Error syncing from cloud:', error);
          setSyncStatus('error');
        }
      } else if (authState.isAuthenticated && initialSyncDone) {
        // Skipping sync - already done initial sync
      }
      
      await loadData();
    } catch (error) {
      console.error('Error initializing screen:', error);
    } finally {
      setIsInitializing(false);
      setLoading(false);
    }
  };

  const loadDataWithSettings = async (newSettings: typeof dashboardSettings) => {
    try {
      // Load recent bottles with new settings
      const bottles = await databaseService.getRecentBottles(newSettings.bottlesToShow);
      setRecentBottles(bottles);
      
      // Load recent poops with new settings
      const poops = await databaseService.getRecentPoops(newSettings.poopsToShow);
      setRecentPoops(poops);
      
      // Load today's stats with error handling
      try {
        const stats = await databaseService.getTodayStats();
        setTodayStats(stats);
      } catch (statsError) {
        console.error('Error loading today\'s stats:', statsError);
        // Set default stats if there's an error
        setTodayStats({
          totalBottles: 0,
          totalAmount: 0,
          totalPoops: 0,
          averageAmount: 0,
        });
      }
    } catch (error) {
      console.error('Error loading data with settings:', error);
    }
  };

  const loadData = async () => {
    try {
      // Load recent bottles using dashboard settings from context
      const bottles = await databaseService.getRecentBottles(dashboardSettings.bottlesToShow);
      setRecentBottles(bottles);
      
      // Load recent poops using dashboard settings from context
      const poops = await databaseService.getRecentPoops(dashboardSettings.poopsToShow);
      setRecentPoops(poops);
      
      // Load today's stats with error handling
      try {
        const stats = await databaseService.getTodayStats();
        setTodayStats(stats);
      } catch (statsError) {
        console.error('Error loading today\'s stats:', statsError);
        // Set default stats if there's an error
        setTodayStats({
          totalBottles: 0,
          totalAmount: 0,
          totalPoops: 0,
          averageAmount: 0,
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddBottle = () => {
    router.push('/add-bottle');
  };

  const handleAddPoop = () => {
    router.push('/add-poop');
  };

  const handleSettings = () => {
    router.push('/settings');
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
              // 🔥 NEW: Reset initial sync flag on logout
              setHasInitialSync(false);
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

  const handleEditBottle = (bottle: Bottle) => {
    // Open the edit modal instead of navigating
    setEditingBottle(bottle);
    setEditModalVisible(true);
  };

  const handleDeleteBottle = async (bottle: Bottle) => {
    Alert.alert(
      t('confirmDeletion'),
      `Are you sure you want to delete this ${bottle.amount}ml bottle?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await databaseService.deleteBottleHybrid(bottle.id);
              if (success) {
                await loadData();
                Alert.alert('Success', 'Bottle deleted successfully');
              } else {
                Alert.alert('Error', 'Failed to delete bottle');
              }
            } catch (error) {
              console.error('Error deleting bottle:', error);
              Alert.alert('Error', 'Failed to delete bottle');
            }
          },
        },
      ]
    );
  };

  const handleSaveBottle = async (bottleId: string, amount: number, time: Date, color: string): Promise<boolean> => {


    try {
      const success = await databaseService.updateBottleHybrid(bottleId, amount, time, color);
      if (success) {
        await loadData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating bottle:', error);
      return false;
    }
  };

  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    setEditingBottle(null);
  };

  // Remove the full loading screen - show dashboard with spinner instead

  return (
    <View style={styles.dashboardContainer}>
      {/* ScrollView with optimized configuration for smooth scrolling with SwipeableItem components */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        directionalLockEnabled={false}
        alwaysBounceVertical={true}
        bounces={true}
        overScrollMode="always"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.dashboardHeaderRow}>
            <TouchableOpacity onPress={handleSettings}>
              <Logo size={48} style={styles.dashboardLogoContainer} />
            </TouchableOpacity>
            {/* Loading spinner */}
            {loading && (
              <View style={styles.dashboardLoadingSpinner}>
                <ActivityIndicator size="small" color={colors.primary.main} />
              </View>
            )}
            <View style={styles.dashboardTitleContainer}>
              <Text style={[styles.appTitle, { marginBottom: spacing.md }]}>BabySip</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/stats')}
              style={styles.dashboardStatsButton}
            >
              <Ionicons name="bar-chart" size={20} color={colors.background.tertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sync Status
        {!TEMPORARY_BYPASS && authState.isAuthenticated && (
          <View style={styles.section}>
            <View style={[styles.card, { paddingVertical: spacing.sm }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons 
                    name={syncStatus === 'syncing' ? "sync" : syncStatus === 'synced' ? "checkmark-circle" : "cloud-outline"} 
                    size={20} 
                    color={
                      syncStatus === 'syncing' ? colors.accent.warning :
                      syncStatus === 'synced' ? colors.accent.success :
                      colors.text.secondary
                    } 
                    style={{ marginRight: spacing.sm }}
                  />
                  <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
                    {syncStatus === 'syncing' ? 'Syncing...' : 
                     syncStatus === 'synced' ? 'Synced' : 
                     syncStatus === 'error' ? 'Sync Error' : 'Offline'}
                  </Text>
                </View>
                <Text style={{ color: colors.text.secondary, fontSize: 12 }}>Auto</Text>
              </View>
            </View>
          </View>
        )} */}

        {/* Today's Summary - Icon alignment fixed for better visual consistency */}
        <View style={styles.section}>
          <View style={[styles.card, {paddingBottom: spacing.xl}]}>
            <View style={styles.dashboardSectionHeader}>
              <Ionicons 
                name="calendar" 
                size={20} 
                color={colors.primary.main} 
                style={styles.dashboardSectionIcon}
              />
              <Text style={[styles.sectionTitle, { flex: 1 }]}>{t('todaySummary')}</Text>
            </View>
            
            <View style={styles.dashboardStatsContainer}>
              <View style={styles.dashboardStatItem}>
                <Text style={[styles.dashboardStatValue, styles.dashboardStatValuePrimary]}>
                  {todayStats.totalBottles}
                </Text>
                <Text style={styles.dashboardStatLabel}>{t('bottlesLabel')}</Text>
              </View>
              <View style={styles.dashboardStatItem}>
                <Text style={[styles.dashboardStatValue, styles.dashboardStatValueSecondary]}>
                  {todayStats.totalAmount}ml
                </Text>
                <Text style={styles.dashboardStatLabel}>{t('totalLabel')}</Text>
              </View>
              <View style={styles.dashboardStatItem}>
                <Text style={[styles.dashboardStatValue, styles.dashboardStatValueWarm]}>
                  {todayStats.averageAmount}ml
                </Text>
                <Text style={styles.dashboardStatLabel}>{t('averageLabel')}</Text>
              </View>
              <View style={styles.dashboardStatItem}>
                <Text style={[styles.dashboardStatValue, styles.dashboardStatValueError]}>
                  {todayStats.totalPoops}
                </Text>
                <Text style={styles.dashboardStatLabel}>{t('changesLabel')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.dashboardQuickActions}>
            <TouchableOpacity
              onPress={handleAddBottle}
              style={[
                styles.button,
                styles.primaryButton,
                styles.dashboardQuickActionButton
              ]}
            >
              <Ionicons name="add-circle" size={20} color={colors.text.inverse} style={styles.dashboardQuickActionIcon} />
              <Text style={styles.buttonText}>{t('addBottle')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleAddPoop}
              style={[
                styles.button,
                styles.secondaryButton,
                styles.dashboardQuickActionButton
              ]}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.text.primary} style={styles.dashboardQuickActionIcon} />
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>{t('addPoop')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Bottles - Icon alignment fixed for better visual consistency */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.dashboardSectionHeader}>
              <Ionicons 
                name="water" 
                size={20} 
                color={colors.primary.main} 
                style={styles.dashboardSectionIcon}
              />
              <Text style={[styles.sectionTitle, { flex: 1 }]}>{t('lastBottles')}</Text>
            </View>
            
            {recentBottles.length > 0 ? (
              recentBottles.map((bottle, index) => {
                const bottleTime = new Date(bottle.time);
                return (
                  <SwipeableItem
                    key={bottle.id}
                    onEdit={() => handleEditBottle(bottle)}
                    onDelete={() => handleDeleteBottle(bottle)}
                    editLabel="Edit"
                    deleteLabel="Delete"
                    editColor={colors.primary.main}
                    deleteColor={colors.status.error}
                  >
                    <View style={styles.listItem}>
                      <View style={styles.dashboardListItem}>
                        <Text style={styles.listItemText}>
                          {bottle.amount}ml
                        </Text>
                        <Text style={styles.listItemSubtext}>
                          {formatTime(bottleTime, language)} • {getTimeAgo(bottleTime, language)}
                        </Text>
                      </View>
                      <View style={[
                        styles.dashboardListItemIndicator,
                        { backgroundColor: bottle.color || colors.primary.main }
                      ]} />
                    </View>
                  </SwipeableItem>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="water-outline" size={48} color={colors.text.secondary} />
                <Text style={styles.emptyStateText}>{t('noBottles')}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Recent Poops - Icon alignment fixed for better visual consistency */}
        {recentPoops.length > 0 && (
          <View style={styles.section}>
            <View style={styles.card}>
              <View style={styles.dashboardSectionHeader}>
                <Ionicons 
                  name="flower" 
                  size={20} 
                  color={colors.primary.main} 
                  style={styles.dashboardSectionIcon}
                />
                <Text style={[styles.sectionTitle, { flex: 1 }]}>{t('lastPoops')}</Text>
              </View>
              
              {recentPoops.map((poop, index) => {
                const poopTime = new Date(poop.time);
                return (
                  <SwipeableItem
                    key={poop.id}
                    onDelete={() => {
                      Alert.alert(
                        t('confirmDeletion'),
                        `Are you sure you want to delete this poop at ${formatTime(poopTime, language)}?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: async () => {
                              try {
                                const success = await databaseService.deletePoopHybrid(poop.id);
                                if (success) {
                                  await loadData();
                                  Alert.alert('Success', 'Poop deleted successfully');
                                } else {
                                  Alert.alert('Error', 'Failed to delete poop');
                                }
                              } catch (error) {
                                console.error('Error deleting poop:', error);
                                Alert.alert('Error', 'Failed to delete poop');
                              }
                            },
                          },
                        ]
                      );
                    }}
                    editLabel="Edit"
                    deleteLabel="Delete"
                    editColor={colors.primary.main}
                    deleteColor={colors.status.error}
                  >
                    <View style={styles.listItem}>
                      <View style={styles.dashboardListItem}>
                        <Text style={styles.listItemText}>
                          {formatTime(poopTime, language)}
                        </Text>
                        <Text style={styles.listItemSubtext}>
                          {getTimeAgo(poopTime, language)}
                          {poop.info && ` • ${poop.info}`}
                        </Text>
                      </View>
                      <View style={[
                        styles.dashboardListItemIndicator,
                        { backgroundColor: poop.color || '#8B4513' }
                      ]} />
                    </View>
                  </SwipeableItem>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Edit Bottle Modal - should be outside ScrollView */}
        <EditBottleModal
          visible={editModalVisible}
          bottle={editingBottle}
          language={language}
          onClose={handleCloseEditModal}
          onSave={handleSaveBottle}
        />
    </View>
  );
} 