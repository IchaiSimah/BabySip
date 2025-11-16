import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { styles } from '@/styles/styles';

const SWIPE_THRESHOLD = -40; // Threshold to open (swipe left)
const CLOSE_THRESHOLD = 20;  // Threshold to close (swipe right)
const MAX_SWIPE_DISTANCE = -140;

interface SwipeableItemProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
  editColor?: string;
  deleteColor?: string;
}

export default function SwipeableItem({
  children,
  onEdit,
  onDelete,
  editLabel = 'Edit',
  deleteLabel = 'Delete',
  editColor = '#007AFF',
  deleteColor = '#FF3B30',
}: SwipeableItemProps) {
  const translateX = useSharedValue(0);
  const isOpen = useSharedValue(false);
  const startX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      // Only respond to horizontal swipes, ignore vertical movement
      if (Math.abs(event.translationX) > Math.abs(event.translationY)) {
        const newTranslateX = startX.value + event.translationX;
        translateX.value = Math.max(MAX_SWIPE_DISTANCE, Math.min(0, newTranslateX));
      }
    })
    .onEnd((event) => {
      // Only trigger swipe if it was primarily horizontal
      if (Math.abs(event.translationX) > Math.abs(event.translationY)) {
        const currentPosition = startX.value + event.translationX;
        
        // Determine if we should open or close based on current state and direction
        let shouldOpen;
        if (isOpen.value) {
          // If already open, close if swiping right (positive translation)
          shouldOpen = currentPosition > -CLOSE_THRESHOLD;
        } else {
          // If closed, open if swiping left (negative translation)
          shouldOpen = currentPosition < SWIPE_THRESHOLD;
        }
        
        const targetValue = shouldOpen ? MAX_SWIPE_DISTANCE : 0;
        
        translateX.value = withSpring(targetValue, {
          damping: 40,
          stiffness: 500,
        });
        
        isOpen.value = shouldOpen;
      } else {
        // If it was primarily vertical, reset to closed position
        translateX.value = withSpring(0, {
          damping: 40,
          stiffness: 500,
        });
        isOpen.value = false;
      }
    })
    .activeOffsetX([-20, 20]) // Only activate for horizontal swipes of 20px or more
    .failOffsetY([-10, 10])   // Fail the gesture if vertical movement exceeds 10px
    .shouldCancelWhenOutside(true);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    }
    // Close the swipe
    translateX.value = withSpring(0, {
      damping: 20,
      stiffness: 300,
    });
    isOpen.value = false;
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    // Close the swipe
    translateX.value = withSpring(0, {
      damping: 20,
      stiffness: 300,
    });
    isOpen.value = false;
  };

  const backgroundStyle = useAnimatedStyle(() => {
    // Background buttons should stay in place, not move with the content
    return {};
  });

  return (
    <View style={styles.swipeableContainer}>
      {/* Background buttons - stay in place */}
      <View style={styles.swipeableBackgroundContainer}>
        <View style={styles.swipeableButtonContainer}>
          {onEdit && (
            <TouchableOpacity
              style={[styles.swipeableActionButton, { backgroundColor: editColor }]}
              onPress={handleEdit}
            >
              <Ionicons name="create" size={24} color="white" />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={[styles.swipeableActionButton, { backgroundColor: deleteColor }]}
              onPress={handleDelete}
            >
              <Ionicons name="trash" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main content - slides over the background */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.swipeableContentContainer, animatedStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
} 
