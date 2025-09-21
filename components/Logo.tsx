import React from 'react';
import { Image, ImageStyle, ViewStyle } from 'react-native';

import { shadows, styles } from '@/styles/styles';

interface LogoProps {
  size?: number;
  style?: ViewStyle | ImageStyle;
  variant?: 'default' | 'small' | 'large' | 'icon';
  circular?: boolean; // Nouvelle prop pour activer le mode circulaire
  withShadow?: boolean; // Add shadow for better integration
  withBorder?: boolean; // Ajouter une bordure
}

export default function Logo({ 
  size = 100, 
  style, 
  variant = 'default', 
  circular = true, 
  withShadow = true,
  withBorder = true 
}: LogoProps) {
  // Define sizes based on variant
  const getSize = () => {
    switch (variant) {
      case 'small':
        return 50;
      case 'large':
        return 150;
      case 'icon':
        return 30;
      default:
        return size;
    }
  };

  const logoSize = getSize();

  return (
    <Image
      source={require('../assets/images/logo.jpeg')}
      style={[
        styles.center,
        {
          width: logoSize,
          height: logoSize,
          borderRadius: circular ? logoSize / 2 : 0, // Mode circulaire
          borderWidth: withBorder ? 1 : 0, // Bordure plus fine
          borderColor: withBorder ? 'rgba(99, 102, 241, 0.3)' : 'transparent', // Bordure plus subtile
          ...(withShadow && shadows.lg), // More pronounced shadow
        },
        style,
      ]}
      resizeMode="cover" // Changed from "contain" to "cover" to better fill the circle
    />
  );
}
