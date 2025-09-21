import AsyncStorage from '@react-native-async-storage/async-storage';

// Predefined colors
export const predefinedColors = [
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
export const poopPredefinedColors = [
  { color: '#8B4513', name: 'Brown' },
  { color: '#654321', name: 'Dark Brown' },
  { color: '#D2691E', name: 'Orange' },
  { color: '#FF6B35', name: 'Light Orange' },
  { color: '#8B0000', name: 'Dark Red' },
  { color: '#FF0000', name: 'Red' },
  { color: '#228B22', name: 'Green' },
  { color: '#FFFF00', name: 'Yellow' },
];

class ColorService {
  private static instance: ColorService;
  
  private constructor() {}
  
  static getInstance(): ColorService {
    if (!ColorService.instance) {
      ColorService.instance = new ColorService();
    }
    return ColorService.instance;
  }

  // Get default bottle color
  async getDefaultBottleColor(): Promise<string> {
    try {
      const savedColor = await AsyncStorage.getItem('defaultBottleColor');
      return savedColor || '#6366F1'; // Default color
    } catch (error) {
      console.error('Error getting default bottle color:', error);
      return '#6366F1';
    }
  }

  // Save default bottle color
  async setDefaultBottleColor(color: string): Promise<void> {
    try {
      await AsyncStorage.setItem('defaultBottleColor', color);
    } catch (error) {
      console.error('Error setting default bottle color:', error);
    }
  }

  // Save custom predefined colors for bottles
  async setCustomBottleColors(colors: Array<{ color: string; name: string }>): Promise<void> {
    try {
      await AsyncStorage.setItem('customBottleColors', JSON.stringify(colors));
    } catch (error) {
      console.error('Error setting custom bottle colors:', error);
    }
  }

  // Get custom predefined colors for bottles
  async getCustomBottleColors(): Promise<Array<{ color: string; name: string }>> {
    try {
      const savedColors = await AsyncStorage.getItem('customBottleColors');
      return savedColors ? JSON.parse(savedColors) : predefinedColors;
    } catch (error) {
      console.error('Error getting custom bottle colors:', error);
      return predefinedColors;
    }
  }

  // Get default poop color
  async getDefaultPoopColor(): Promise<string> {
    try {
      const savedColor = await AsyncStorage.getItem('defaultPoopColor');
      return savedColor || '#8B4513'; // Default color
    } catch (error) {
      console.error('Error getting default poop color:', error);
      return '#8B4513';
    }
  }

  // Save default poop color
  async setDefaultPoopColor(color: string): Promise<void> {
    try {
      await AsyncStorage.setItem('defaultPoopColor', color);
    } catch (error) {
      console.error('Error setting default poop color:', error);
    }
  }

  // Save custom predefined colors for poops
  async setCustomPoopColors(colors: Array<{ color: string; name: string }>): Promise<void> {
    try {
      await AsyncStorage.setItem('customPoopColors', JSON.stringify(colors));
    } catch (error) {
      console.error('Error setting custom poop colors:', error);
    }
  }

  // Get custom predefined colors for poops
  async getCustomPoopColors(): Promise<Array<{ color: string; name: string }>> {
    try {
      const savedColors = await AsyncStorage.getItem('customPoopColors');
      return savedColors ? JSON.parse(savedColors) : poopPredefinedColors;
    } catch (error) {
      console.error('Error getting custom poop colors:', error);
      return poopPredefinedColors;
    }
  }

  // Find the closest predefined color
  findClosestPredefinedColor(color: string, type: 'bottle' | 'poop' = 'bottle') {
    const colors = type === 'bottle' ? predefinedColors : poopPredefinedColors;
    let closest = colors[0];
    let minDistance = Number.MAX_VALUE;

    colors.forEach(predefined => {
      const distance = this.colorDistance(color, predefined.color);
      if (distance < minDistance) {
        minDistance = distance;
        closest = predefined;
      }
    });

    return closest;
  }

  // Calculer la distance entre deux couleurs
  private colorDistance(color1: string, color2: string): number {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
    
    return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
  }
}

export default ColorService.getInstance();
