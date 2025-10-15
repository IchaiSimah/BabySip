import { useLanguage } from '@/utils/languageContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, Text, TextInput, View } from 'react-native';

import ColorService from '@/services/ColorService';
import { styles } from '@/styles/styles';


interface Bottle {
  id: string;
  amount: number;
  time: string;
  color?: string;
  created_at: string;
}

interface EditBottleModalProps {
  visible: boolean;
  bottle: Bottle | null;
  language: string;
  onClose: () => void;
  onSave: (bottleId: string, amount: number, time: Date, color: string) => Promise<boolean>;
}

export default function EditBottleModal({ 
  visible, 
  bottle, 
  onClose, 
  onSave 
}: EditBottleModalProps) {
  const { t, language } = useLanguage();
  const [editedAmount, setEditedAmount] = useState<number>(120);
  const [editedAmountText, setEditedAmountText] = useState<string>('120');
  const [editedTime, setEditedTime] = useState<Date>(new Date());
  const [editedColor, setEditedColor] = useState<string>('#6366F1');
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [customColors, setCustomColors] = useState<Array<{ color: string; name?: string }>>([]);

  useEffect(() => {
    if (bottle) {
      setEditedAmount(bottle.amount);
      setEditedAmountText(bottle.amount.toString());
      setEditedTime(new Date(bottle.time));
      setEditedColor(bottle.color || '#6366F1');
    }
  }, [bottle]);

  useEffect(() => {
    const loadColors = async () => {
      try {
        const savedCustomColors = await ColorService.getCustomBottleColors();
        if (savedCustomColors && savedCustomColors.length > 0) {
          setCustomColors(savedCustomColors);
        } else {
          setCustomColors([
            { color: '#10B981' }, { color: '#6366F1' }, { color: '#F59E0B' }, { color: '#8B5CF6' },
            { color: '#EF4444' }, { color: '#6B7280' }, { color: '#EAB308' }, { color: '#06B6D4' },
          ]);
        }
      } catch (e) {
        setCustomColors([
          { color: '#10B981' }, { color: '#6366F1' }, { color: '#F59E0B' }, { color: '#8B5CF6' },
          { color: '#EF4444' }, { color: '#6B7280' }, { color: '#EAB308' }, { color: '#06B6D4' },
        ]);
      }
    };
    loadColors();
  }, []);

  const handleSave = async () => {
    if (!bottle) return;
    
    try {
      setLoading(true);
      const success = await onSave(bottle.id, editedAmount, editedTime, editedColor);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving bottle:', error);
      Alert.alert('Error', 'Failed to save bottle changes');
    } finally {
      setLoading(false);
    }
  };

  const colorOptions = customColors.map(c => c.color);

  // Si pas de bottle, on ne rend rien
  if (!bottle) {
    return null;
  }

  // Si pas visible, on ne rend rien
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.editBottleOverlay}>
      <View style={styles.editBottleModalContainer}>
        {/* Header */}
        <View style={styles.editBottleHeader}>
          <Text style={styles.editBottleHeaderTitle}>{t('editBottle')}</Text>
          <Pressable 
            style={styles.editBottleCloseButton}
            onPress={onClose}
          >
            <Text style={styles.editBottleCloseButtonText}>✕</Text>
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.editBottleContent}>
          {/* Amount Section */}
          <View style={styles.editBottleSection}>
            <Text style={styles.editBottleSectionTitle}>{t('amountMlLabel')}</Text>
            <View style={styles.editBottleAmountInputContainer}>
              <TextInput
                style={styles.editBottleAmountInput}
                value={editedAmountText}
                onChangeText={(text) => {
                  setEditedAmountText(text);
                  
                  // Update editedAmount only if it's a valid number
                  const amount = parseInt(text);
                  if (!isNaN(amount) && amount > 0) {
                    setEditedAmount(amount);
                  }
                }}
                keyboardType="numeric"
                placeholder="Enter amount"
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.editBottleAmountUnit}>ml</Text>
            </View>
          </View>

          {/* Time Section */}
          <View style={styles.editBottleSection}>
            <Text style={styles.editBottleSectionTitle}>{t('timeLabelStandalone')}</Text>
            <Pressable 
              style={styles.editBottleTimeButton}
              onPress={() => setShowTimePicker(!showTimePicker)}
            >
              <Text style={styles.editBottleTimeButtonText}>
                {editedTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </Pressable>
            
            {showTimePicker && (
              <DateTimePicker style={{ alignSelf: 'center' }}
                value={editedTime}
                mode="time"
                is24Hour={false}

                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              
                onChange={(event, selectedTime) => {
                  if (Platform.OS !== 'ios') {
                  setShowTimePicker(false);
                  }
                  if (selectedTime) {
                    setEditedTime(selectedTime);
                  }
                }}
              />
            )}
          </View>

          {/* Color Section */}
          <View style={styles.editBottleSection}>
            <Text style={styles.editBottleSectionTitle}>{t('color')}</Text>
            
            
            <View style={styles.editBottleColorGrid}>
              {colorOptions.map((color) => (
                <Pressable
                  key={color}
                  style={[
                    styles.editBottleColorSwatch,
                    { backgroundColor: color },
                    editedColor === color && styles.editBottleColorSwatchSelected
                  ]}
                  onPress={() => setEditedColor(color)}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.editBottleActions}>
          <Pressable 
            style={[styles.editBottleButton, styles.editBottleSecondaryButton]}
            onPress={onClose}
          >
            <Text style={[styles.editBottleButtonText, styles.editBottleSecondaryButtonText]}>{t('cancel')}</Text>
          </Pressable>
          <Pressable 
            style={[styles.editBottleButton, styles.editBottlePrimaryButton]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.editBottleButtonText}>
              {loading ? t('saving') : t('saveChanges')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
} 