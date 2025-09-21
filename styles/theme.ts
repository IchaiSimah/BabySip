/**
 * Design Tokens - Single source of truth for all styles
 * 
 * This file contains all base values (colors, spacing, typography, etc.)
 * used in the application. Changing a value here automatically changes
 * the appearance throughout the entire application.
 */

// === COLORS ===
export const colors = {
  // Primary brand colors
  primary: {
    main: '#297289',        // Modern primary blue
    light: '#818CF8',        // Light blue
    dark: '#4F46E5',         // Dark blue
    gradient: ['#6366F1', '#8B5CF6'], // Indigo to violet gradient
  },
  
  // Secondary colors
  secondary: {
    main: '#10B981',         // Modern emerald green
    light: '#34D399',        // Light green
    dark: '#059669',         // Dark green
    gradient: ['#10B981', '#06B6D4'], // Emerald to cyan gradient
  },
  
  // Accent colors
  accent: {
    warm: '#F59E0B',        // Amber
    cool: '#3B82F6',         // Blue
    success: '#10B981',      // Success green
    warning: '#F59E0B',      // Warning amber
    error: '#EF4444',        // Error red
  },
  
  // Neutral colors (gray scale)
  neutral: {
    50: '#F9FAFB',          // Very light
    100: '#F3F4F6',          // Light
    200: '#E5E7EB',          // Light gray
    300: '#D1D5DB',          // Medium-light gray
    400: '#9CA3AF',          // Medium gray
    500: '#6B7280',          // Medium-dark gray
    600: '#4B5563',          // Dark gray
    700: '#374151',          // Very dark
    800: '#1F2937',          // Almost black
    900: '#111827',          // Black
  },
  
  // Background colors
  background: {
    primary: '#F9FAFB',      // Primary background (very light gray)
    secondary: '#FFFFFF',    // Secondary background (white)
    tertiary: '#F3F4F6',     // Tertiary background (light gray)
    dark: '#1F2937',         // Dark background
  },
  
  // Text colors
  text: {
    primary: '#111827',      // Primary text (black)
    secondary: '#4B5563',    // Secondary text (dark gray)
    tertiary: '#6B7280',     // Tertiary text (medium gray)
    inverse: '#FFFFFF',      // Inverse text (white)
    muted: '#9CA3AF',        // Muted text (gray)
  },
  
  // Status colors
  status: {
    success: '#10B981',      // Success green
    warning: '#F59E0B',      // Warning amber
    error: '#EF4444',        // Error red
    info: '#3B82F6',         // Info blue
  }
};

// === SPACING ===
export const spacing = {
  xs: 4,                     // Very small spacing
  sm: 8,                     // Small spacing
  md: 16,                    // Medium spacing
  lg: 24,                    // Large spacing
  xl: 32,                    // Extra large spacing
  xxl: 48,                   // Huge spacing
  xxxl: 64,                  // Gigantic spacing
};

// === BORDER RADIUS ===
export const borderRadius = {
  xs: 4,                     // Very small radius
  sm: 8,                     // Small radius
  md: 12,                    // Medium radius
  lg: 16,                    // Large radius
  xl: 20,                    // Extra large radius
  xxl: 24,                   // Huge radius
  full: 9999,                // Full radius (circle)
};

// === TYPOGRAPHY ===
export const fontSize = {
  xs: 12,                    // Very small font
  sm: 14,                    // Small font
  md: 16,                    // Medium font
  lg: 18,                    // Large font
  xl: 20,                    // Extra large font
  xxl: 24,                   // Huge font
  xxxl: 30,                  // Gigantic font
  display: 36,               // Display font
};

// === FONT WEIGHTS ===
export const fontWeight = {
  light: '300',              // Light
  normal: '400',             // Normal
  medium: '500',             // Medium
  semibold: '600',           // Semi-bold
  bold: '700',               // Bold
  extrabold: '800',          // Extra bold
};

// === SHADOWS ===
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 12,
  },
};

// === LAYOUT ===
export const layout = {
  screenPadding: spacing.lg,  // Screen padding
  cardPadding: spacing.md,    // Card padding
  buttonHeight: 48,           // Button height
  inputHeight: 48,            // Input height
  headerHeight: 60,           // Header height
  tabBarHeight: 80,           // Tab bar height
};

// === EXPORT COMPLETE THEME ===
export const theme = {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
  layout,
};
