import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { colors, styles } from '@/styles/styles';
import { useAuth } from '../utils/authContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { authState } = useAuth();

  // TEMPORARY: Allow access without authentication for data verification
  const TEMPORARY_BYPASS = false;

  useEffect(() => {
    // If authentication is complete and the user is not logged in
    if (!TEMPORARY_BYPASS && !authState.loading && !authState.isAuthenticated) {
      router.replace('/login');
    }
  }, [authState.loading, authState.isAuthenticated]);

  // Display a loader while checking authentication
  if (!TEMPORARY_BYPASS && authState.loading) {
    return (
      <View style={[styles.container, styles.protectedRouteContainer]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.protectedRouteLoadingText}>
          Vérification de l'authentification...
        </Text>
      </View>
    );
  }

  // If the user is not logged in, display nothing (redirection in progress)
  if (!TEMPORARY_BYPASS && !authState.isAuthenticated) {
    return null;
  }

  // If the user is logged in OR in temporary mode, display protected content
  return <>{children}</>;
} 