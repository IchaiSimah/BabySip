import ColorService from '@/services/ColorService';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, Modal, Text, TouchableOpacity, View } from 'react-native';
import ColorPicker from 'react-native-wheel-color-picker';

import { colors, styles } from '@/styles/styles';

interface ColorPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onColorSelect: (color: string) => void;
  currentColor: string;
  type?: 'bottle' | 'poop';
}

// Predefined colors for matching
const predefinedColors = [
  { color: '#10B981', name: 'Green' },
  { color: '#6366F1', name: 'Blue' },
  { color: '#F59E0B', name: 'Orange' },
  { color: '#8B5CF6', name: 'Purple' },
  { color: '#EF4444', name: 'Red' },
  { color: '#6B7280', name: 'Gray' },
  { color: '#EAB308', name: 'Yellow' },
  { color: '#06B6D4', name: 'Light Blue' },
];

// Default colors for poops
const poopPredefinedColors = [
  { color: '#8B4513', name: 'Brown' },
  { color: '#654321', name: 'Dark Brown' },
  { color: '#D2691E', name: 'Orange' },
  { color: '#FF6B35', name: 'Light Orange' },
  { color: '#8B0000', name: 'Dark Red' },
  { color: '#FF0000', name: 'Red' },
  { color: '#228B22', name: 'Green' },
  { color: '#FFFF00', name: 'Yellow' },
];

const { width: screenWidth } = Dimensions.get('window');
const pickerSize = Math.min(screenWidth * 0.8, 300);

export default function ColorPickerModal({ visible, onClose, onColorSelect, currentColor, type = 'bottle' }: ColorPickerModalProps) {
  const [selectedColor, setSelectedColor] = useState(currentColor);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    // Call onColorSelect immediately to update color in parent
    onColorSelect(color);
  };

  const handleConfirm = () => {
    onClose();
  };

  const handleCancel = () => {
    // Remettre la couleur originale
    onColorSelect(currentColor);
    setSelectedColor(currentColor);
    onClose();
  };

  // Find the closest predefined color
  const closestPredefined = ColorService.findClosestPredefinedColor(selectedColor, type);

  // Update selected color when it changes
  React.useEffect(() => {
    setSelectedColor(currentColor);
  }, [currentColor]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.colorPickerModalOverlay}>
        <View style={styles.colorPickerModalContent}>
          {/* Header */}
          <View style={styles.colorPickerModalHeader}>
            <Text style={styles.colorPickerModalTitle}>Choose Color</Text>
            <TouchableOpacity onPress={handleCancel} style={styles.colorPickerModalCloseButton}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

                     {/* Color Picker */}
           <View style={styles.colorPickerModalPickerContainer}>
             <ColorPicker
               color={selectedColor}
               onColorChange={handleColorSelect}
               row={false}
               noSnap={true}
               thumbSize={30}
               sliderSize={30}
             />
           </View>



          {/* Action Buttons */}
          <View style={styles.colorPickerModalButtonContainer}>
            <TouchableOpacity onPress={handleCancel} style={styles.colorPickerModalCancelButton}>
              <Text style={styles.colorPickerModalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={styles.colorPickerModalConfirmButton}>
              <Text style={styles.colorPickerModalConfirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
