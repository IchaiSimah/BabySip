import { colors, styles } from '@/styles/styles';
import { useAuth } from '@/utils/authContext';
import { router, usePathname } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { authState } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!authState.loading && !authState.isAuthenticated) {
      // Only redirect if not already on login/register/forgot-password pages
      const allowedUnauthenticatedRoutes = ['/login', '/register', '/forgot-password', '/verify-code', '/reset-password'];
      if (!allowedUnauthenticatedRoutes.includes(pathname)) {
        router.replace('/login');
      }
    }
    
    // If authenticated and on login/register pages, redirect to dashboard
    if (!authState.loading && authState.isAuthenticated && (pathname === '/login' || pathname === '/register')) {
      router.replace('/');
    }
  }, [authState.loading, authState.isAuthenticated, pathname]);

  // Show loading while checking authentication
  if (authState.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  // If not authenticated and on allowed pages, render children
  const allowedUnauthenticatedRoutes = ['/login', '/register', '/forgot-password', '/verify-code', '/reset-password'];
  if (!authState.isAuthenticated && allowedUnauthenticatedRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // If authenticated, render children
  if (authState.isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated and not on login/register, don't render (will redirect)
  return null;
}
