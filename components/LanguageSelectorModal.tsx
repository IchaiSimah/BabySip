import { useLanguage } from '@/utils/languageContext';
import { Language } from '@/utils/translations';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { colors, styles } from '@/styles/styles';

interface LanguageSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

const languages = [
  {
    code: 'en' as Language,
    name: 'English',
    flag: '🇺🇸',
    nativeName: 'English',
  },
  {
    code: 'fr' as Language,
    name: 'Français',
    flag: '🇫🇷',
    nativeName: 'Français',
  },
  {
    code: 'he' as Language,
    name: 'עברית',
    flag: '🇮🇱',
    nativeName: 'עברית',
  },
];

export default function LanguageSelectorModal({ visible, onClose }: LanguageSelectorModalProps) {
  const { language, setLanguage, t } = useLanguage();
  const slideAnim = React.useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleLanguageSelect = async (selectedLanguage: Language) => {
    await setLanguage(selectedLanguage);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.languageSelectorOverlay}>
        <Animated.View
          style={[
            styles.languageSelectorModalContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.languageSelectorHeader}>
            <View style={styles.languageSelectorHeaderContent}>
              <Ionicons name="language" size={24} color={colors.primary.main} />
              <Text style={styles.languageSelectorTitle}>{t('selectLanguage')}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.languageSelectorCloseButton}>
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Language Options */}
          <View style={styles.languageSelectorLanguagesContainer}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageSelectorLanguageOption,
                  language === lang.code && styles.languageSelectorSelectedLanguageOption,
                ]}
                onPress={() => handleLanguageSelect(lang.code)}
                activeOpacity={0.7}
              >
                <View style={styles.languageSelectorLanguageContent}>
                  <Text style={styles.languageSelectorFlag}>{lang.flag}</Text>
                  <View style={styles.languageSelectorLanguageInfo}>
                    <Text
                      style={[
                        styles.languageSelectorLanguageName,
                        language === lang.code && styles.languageSelectorSelectedLanguageName,
                      ]}
                    >
                      {lang.nativeName}
                    </Text>
                    <Text
                      style={[
                        styles.languageSelectorLanguageCode,
                        language === lang.code && styles.languageSelectorSelectedLanguageCode,
                      ]}
                    >
                      {lang.name}
                    </Text>
                  </View>
                  {language === lang.code && (
                    <View style={styles.languageSelectorCheckContainer}>
                      <Ionicons name="checkmark-circle" size={24} color={colors.primary.main} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.languageSelectorFooter}>
            <Text style={styles.languageSelectorFooterText}>
              {t('languageDescription')}
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
