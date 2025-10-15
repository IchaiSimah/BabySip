import ColorService, { predefinedColors } from '@/services/ColorService';
import databaseService from '@/services/DatabaseService';
import { adjustDateForTimeLogic, formatTime, getRelativeDateString } from '@/utils/dateUtils';
import { useLanguage } from '@/utils/languageContext';
import { useSettings } from '@/utils/settingsContext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { colors, spacing, styles } from '@/styles/styles';
import ColorPickerModal from './ColorPickerModal';

function roundToNearestQuarter(date: Date) {
  const minutes = date.getMinutes();
  const roundedMinutes = Math.round(minutes / 15) * 15;
  if (roundedMinutes === 60) {
    date.setHours(date.getHours() + 1);
    date.setMinutes(0);
  } else {
    date.setMinutes(roundedMinutes);
  }
  date.setSeconds(0, 0);
  return new Date(date);
}

function getQuarterSuggestions(baseDate: Date) {
  // Returns 4 previous quarter-hour times (rounded)
  const suggestions = [];
  for (let i = 4; i >= 1; i--) {
    const d = new Date(baseDate.getTime() - i * 15 * 60000);
    suggestions.push(roundToNearestQuarter(new Date(d)));
  }
  // Remove duplicates (can happen at hour boundaries)
  return suggestions.filter((date, idx, arr) =>
    idx === arr.findIndex(d => d.getHours() === date.getHours() && d.getMinutes() === date.getMinutes())
  );
}

function generateAmountSuggestions(lastBottle: number) {
  const suggestions = [lastBottle, lastBottle - 10, lastBottle - 20, lastBottle - 30];
  return [...new Set(suggestions)].filter(amount => amount > 0);
}

export default function AddBottleScreen() {
  const { t, language } = useLanguage();
  const { dashboardSettings } = useSettings();
  const [selectedDateTime, setSelectedDateTime] = useState(roundToNearestQuarter(new Date()));
  const [selectedAmount, setSelectedAmount] = useState(120);
  const [showAmountInput, setShowAmountInput] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userExplicitlySelectedDate, setUserExplicitlySelectedDate] = useState(false);
  const [groupId, setGroupId] = useState<number | null>(null);
  const [lastBottle, setLastBottle] = useState(120);
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#6366F1'); // Default to current blue color
  const [previewColor, setPreviewColor] = useState('#6366F1'); // Couleur de prévisualisation temporaire
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColors, setCustomColors] = useState(predefinedColors);
  const [selectedColorIndex, setSelectedColorIndex] = useState(1); // Index of the selected predefined color

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    try {
      await databaseService.initDatabase();
      const userId = 1;
      
      // Get current user's group (this will get the actual group the user is in)
      const currentGroupId = 1;
      
      
      // Language is managed by useLanguage context, no need to set it here
      
      const finalGroupId = groupId || currentGroupId!;
      // Use persisted settings from AsyncStorage (via SettingsContext)
      if (dashboardSettings.lastBottleDefault > 20) {
        setLastBottle(dashboardSettings.lastBottleDefault);
        setSelectedAmount(dashboardSettings.lastBottleDefault);
      }
      
      // Load default color
      const defaultColor = await ColorService.getDefaultBottleColor();
      setSelectedColor(defaultColor);
      setPreviewColor(defaultColor); // Initialiser la couleur de prévisualisation
      
      // Load custom colors
      const savedCustomColors = await ColorService.getCustomBottleColors();
      setCustomColors(savedCustomColors);
      
      // Find which predefined color is currently selected
      const currentIndex = savedCustomColors.findIndex(color => color.color === defaultColor);
      setSelectedColorIndex(currentIndex >= 0 ? currentIndex : 1);
    } catch (error) {
      console.error('Error initializing screen:', error);
    }
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
  };

  const handleCustomAmount = () => {
    setShowAmountInput(true);
  };

  const handleColorSelect = async (color: string) => {
    setSelectedColor(color);
    setPreviewColor(color); // Mettre à jour la prévisualisation aussi
    
    // Update the selected predefined color
    const updatedColors = [...customColors];
    updatedColors[selectedColorIndex] = { ...updatedColors[selectedColorIndex], color };
    setCustomColors(updatedColors);
    
    // Save custom colors and default color
    await ColorService.setCustomBottleColors(updatedColors);
    await ColorService.setDefaultBottleColor(color);
  };

  const handleColorPreview = (color: string) => {
    // Mettre à jour seulement la prévisualisation, pas la couleur sélectionnée
    setPreviewColor(color);
  };

  const handlePredefinedColorSelect = (color: string, index: number) => {
    setSelectedColor(color);
    setPreviewColor(color); // Mettre à jour la prévisualisation aussi
    setSelectedColorIndex(index);
  };

  const handleColorPickerClose = () => {
    setShowColorPicker(false);
  };

  const confirmCustomAmount = () => {
    const amount = parseInt(customAmount);
    if (amount > 0 && amount <= 1000) {
      setSelectedAmount(amount);
      setCustomAmount('');
      setShowAmountInput(false);
    } else {
      Alert.alert(t('invalidAmountTitle'), t('invalidAmountDescription'));
    }
  };

  const addBottle = async () => {
    if (!groupId) {
      setGroupId(1);
    }
    try {
      setLoading(true);
      // Use hybrid add method for background sync
      const adjustedSelectedTime = adjustDateForTimeLogic(selectedDateTime, userExplicitlySelectedDate);
      const result = await databaseService.addBottleHybrid(selectedAmount, adjustedSelectedTime, selectedColor);
      if (result) {
        Alert.alert(
          t('bottleAdded'),
          `${selectedAmount}ml at ${formatTime(selectedDateTime, language)}`,
          [
            {
              text: 'OK',
              onPress: () => router.back() // 🔥 FIXED: Use router.back() instead of router.push to avoid remounting DashboardScreen
            }
          ]
        );
      } else {
        Alert.alert(t('error'));
      }
    } catch (error) {
      console.error('Error adding bottle:', error);
      Alert.alert(t('error'));
    } finally {
      setLoading(false);
    }
  };

  // --- Date and Time selection logic ---
  const timeSuggestions = getQuarterSuggestions(new Date());
  const isSelected = (date: Date) =>
    selectedDateTime.getHours() === date.getHours() && selectedDateTime.getMinutes() === date.getMinutes();
  const isNowSelected = () => {
    const now = new Date();
    return (
      selectedDateTime.getHours() === now.getHours() &&
      selectedDateTime.getMinutes() === now.getMinutes() &&
      Math.abs(selectedDateTime.getTime() - now.getTime()) < 60000 // within 1 minute
    );
  };


  const handleDateSelect = (date: Date) => {
    const newDateTime = new Date(selectedDateTime);
    newDateTime.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    setSelectedDateTime(newDateTime);
    setUserExplicitlySelectedDate(true);
  };

  const handleTimeSelect = (time: Date) => {
    const newDateTime = new Date(selectedDateTime);
    newDateTime.setHours(time.getHours(), time.getMinutes(), 0, 0);
    setSelectedDateTime(newDateTime);
  };

  const amountSuggestions = generateAmountSuggestions(lastBottle);

  // Use centralized translations

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
            <TouchableOpacity onPress={() => router.back()} style={styles.addBottleBackButton}>
              <Ionicons name="arrow-back" size={20} color={colors.text.primary} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{t('addBottleTitle')}</Text>
            </View>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.modalAmountDisplay,
              { backgroundColor: colors.text.secondary },
            ]}
            onPress={() => setShowDatePicker(!showDatePicker)}
            activeOpacity={0.7}
          >
            <Text style={[styles.modalAmountDisplayText, { color: colors.text.inverse }]}>
              {getRelativeDateString(selectedDateTime, language)}
            </Text>
            <Text style={styles.modalAmountDisplayLabel}>{t('tapToChange')}</Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker style={{ alignSelf: 'center' }}
              value={selectedDateTime}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => {
                if (Platform.OS !== 'ios') {
                  setShowDatePicker(false);
                }
                if (date) handleDateSelect(date);
              }}
            />
          )}
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('timeQuestion')}</Text>
            <View style={styles.modalSuggestionContainer}>
              {/* Now button */}
              <TouchableOpacity
                style={[
                  styles.modalSuggestionButton,
                  isNowSelected() && styles.modalSuggestionButtonSelected,
                  isNowSelected() && { backgroundColor: colors.primary.main, borderColor: colors.primary.light },
                ]}
                onPress={() => handleTimeSelect(new Date())}
              >
                <Text style={[
                  styles.modalSuggestionText,
                  isNowSelected() && styles.modalSuggestionTextSelected,
                  isNowSelected() && { color: colors.text.inverse }
                ]}>
                  {t('now')}
                </Text>
              </TouchableOpacity>
              {/* 4 previous quarter-hour buttons */}
              {timeSuggestions.map((date, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.modalSuggestionButton,
                    isSelected(date) && styles.modalSuggestionButtonSelected
                  ]}
                  onPress={() => {
                    if (isSelected(date)) {
                      setShowTimePicker(true);
                    } else {
                      handleTimeSelect(date);
                    }
                  }}
                >
                  <Text style={[
                    styles.modalSuggestionText,
                    isSelected(date) && styles.modalSuggestionTextSelected
                  ]}>
                    {formatTime(date, language)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Clickable selected time display */}
            <TouchableOpacity
              style={[
                styles.modalAmountDisplay,
                { backgroundColor: colors.primary.main, marginTop: spacing.md },
              ]}
              onPress={() => setShowTimePicker(!showTimePicker)}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalAmountDisplayText, { color: colors.text.inverse }]}>{formatTime(selectedDateTime, language)}</Text>
              <Text style={styles.modalAmountDisplayLabel}>{t('customTime')}</Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker style={{ alignSelf: 'center' }}
                
                value={selectedDateTime}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  if (Platform.OS !== 'ios') {
                    setShowTimePicker(false);
                  }
                  if (date) handleTimeSelect(date);
                }}
              />
            )}
          </View>
        </View>

        {/* Amount Selection */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('amountQuestion')}</Text>
            <View style={styles.modalSuggestionContainer}>
              {amountSuggestions.map((amount, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.modalSuggestionButton,
                    selectedAmount === amount && styles.modalSuggestionButtonSelected
                  ]}
                  onPress={() => handleAmountSelect(amount)}
                >
                  <Text style={[
                    styles.modalSuggestionText,
                    selectedAmount === amount && styles.modalSuggestionTextSelected
                  ]}>
                    {amount}ml
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Clickable selected amount display (custom input) */}
            <TouchableOpacity
              style={[styles.modalAmountDisplay, { marginTop: spacing.md }]}
              onPress={handleCustomAmount}
              activeOpacity={0.7}
            >
              <Text style={styles.modalAmountDisplayText}>{selectedAmount}ml</Text>
              <Text style={styles.modalAmountDisplayLabel}>{t('customAmountLabel')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Color Selection */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('chooseBottleColor')}</Text>
            <View style={styles.modalSuggestionContainer}>
              {customColors.map((colorOption, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.modalSuggestionButton,
                    selectedColor === colorOption.color && styles.modalSuggestionButtonSelected,
                    { 
                      backgroundColor: colorOption.color,
                      borderColor: selectedColor === colorOption.color ? colors.primary.main : 'transparent',
                      borderWidth: selectedColor === colorOption.color ? 2 : 0,
                    }
                  ]}
                  onPress={() => handlePredefinedColorSelect(colorOption.color, idx)}
                >
                  <View style={{ 
                    width: 24, 
                    height: 24, 
                    borderRadius: 12, 
                    backgroundColor: colorOption.color,
                    borderWidth: 2,
                    borderColor: selectedColor === colorOption.color ? colors.text.inverse : 'transparent',
                  }} />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.modalAmountDisplay, { marginTop: spacing.md, backgroundColor: previewColor }]}
              onPress={() => setShowColorPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalAmountDisplayText, { color: colors.text.inverse }]}>{t('selectedColor')}</Text>
              <Text style={styles.modalAmountDisplayLabel}>{t('tapToChange')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <TouchableOpacity
              onPress={() => router.back()} // 🔥 FIXED: Use router.back() instead of router.push
              style={[
                styles.button,
                styles.secondaryButton,
                { flex: 1 }
              ]}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>{t('cancel')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={async () => { await addBottle(); }} // 🔥 FIXED: Remove router.back() - Alert handles navigation
              disabled={loading}
              style={[
                styles.button,
                styles.primaryButton,
                { flex: 1, opacity: loading ? 0.6 : 1 }
              ]}
            >
              {loading ? (
                <Text style={styles.buttonText}>{t('adding')}</Text>
              ) : (
                <Text style={styles.buttonText}>{t('finish')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Custom Amount Modal */}
      <Modal
        visible={showAmountInput}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.addBottleCustomAmountModalOverlay}>
          <View style={styles.addBottleCustomAmountModalContent}>
            <Text style={styles.addBottleCustomAmountModalTitle}>{t('customAmountPrompt')}</Text>
            <TextInput
              style={styles.addBottleCustomAmountModalInput}
              value={customAmount}
              onChangeText={setCustomAmount}
              placeholder="120"
              keyboardType="numeric"
              autoFocus={true}
            />
            <View style={styles.addBottleCustomAmountModalButtons}>
              <TouchableOpacity
                style={styles.addBottleCustomAmountModalButton}
                onPress={() => setShowAmountInput(false)}
              >
                <Text style={styles.addBottleCustomAmountModalButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addBottleCustomAmountModalConfirmButton}
                onPress={confirmCustomAmount}
              >
                <Text style={styles.addBottleCustomAmountModalConfirmButtonText}>{t('finish')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Color Picker Modal */}
      <ColorPickerModal
        visible={showColorPicker}
        onClose={handleColorPickerClose}
        onColorSelect={handleColorSelect}
        onColorPreview={handleColorPreview}
        currentColor={selectedColor}
        type="bottle"
      />
    </View>
  );
} 