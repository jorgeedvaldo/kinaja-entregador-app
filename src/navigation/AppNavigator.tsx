// ============================================================
// AppNavigator — root navigation setup
// Auth stack + Main tabs + Modal screens
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, FONT_SIZES, SHADOWS } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';

// Screens
import SplashScreen from '../features/auth/SplashScreen';
import LoginScreen from '../features/auth/LoginScreen';
import HomeScreen from '../features/driver/HomeScreen';
import EarningsScreen from '../features/driver/EarningsScreen';
import ProfileScreen from '../features/driver/ProfileScreen';
import AvailableOrdersScreen from '../features/orders/AvailableOrdersScreen';
import ActiveOrderScreen from '../features/orders/ActiveOrderScreen';
import MapTrackingScreen from '../features/tracking/MapTrackingScreen';
import OrderDetailsScreen from '../features/orders/OrderDetailsScreen';

// Types
import type { AuthStackParamList, MainStackParamList, TabParamList } from '../types';

// ----------------------------------------------------------
// Tab Icons (inline SVG-like components)
// ----------------------------------------------------------

function MapIcon({ color }: { color: string }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabIconEmoji, { color }]}>📍</Text>
    </View>
  );
}

function WalletIcon({ color }: { color: string }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabIconEmoji, { color }]}>💰</Text>
    </View>
  );
}

function OrdersIcon({ color }: { color: string }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabIconEmoji, { color }]}>📋</Text>
    </View>
  );
}

function ProfileIcon({ color }: { color: string }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabIconEmoji, { color }]}>👤</Text>
    </View>
  );
}

// ----------------------------------------------------------
// Tab Navigator
// ----------------------------------------------------------

const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.bgCard,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingTop: 8,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          height: 70 + (insets.bottom > 0 ? insets.bottom : 0),
          position: 'absolute',
          borderTopWidth: 0,
          ...SHADOWS.top,
        },
        tabBarActiveTintColor: COLORS.kinaRed,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarLabelStyle: {
          fontFamily: FONTS.bold,
          fontSize: FONT_SIZES.xs,
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Mapa',
          tabBarIcon: ({ color }) => <MapIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{
          tabBarLabel: 'Carteira',
          tabBarIcon: ({ color }) => <WalletIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={AvailableOrdersScreen}
        options={{
          tabBarLabel: 'Resumo',
          tabBarIcon: ({ color }) => <OrdersIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Conta',
          tabBarIcon: ({ color }) => <ProfileIcon color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// ----------------------------------------------------------
// Auth Stack (unauthenticated)
// ----------------------------------------------------------

const AuthStack = createStackNavigator<AuthStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{ headerShown: false }}
    >
      <AuthStack.Screen name="Splash" component={SplashScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

// ----------------------------------------------------------
// Main Stack (authenticated)
// ----------------------------------------------------------

const MainStack = createStackNavigator<MainStackParamList>();

function MainNavigator() {
  return (
    <MainStack.Navigator
      screenOptions={{ headerShown: false }}
    >
      <MainStack.Screen name="MainTabs" component={TabNavigator} />
      <MainStack.Screen
        name="ActiveOrder"
        component={ActiveOrderScreen}
        options={{ presentation: 'modal' }}
      />
      <MainStack.Screen
        name="MapTracking"
        component={MapTrackingScreen}
        options={{ presentation: 'modal' }}
      />
      <MainStack.Screen
        name="OrderDetails"
        component={OrderDetailsScreen}
        options={{
          presentation: 'card',
          headerShown: true,
          headerTitle: 'Detalhes do Pedido',
          headerTintColor: COLORS.kinaRed,
          headerTitleStyle: {
            fontFamily: FONTS.bold,
          },
        }}
      />
    </MainStack.Navigator>
  );
}

// ----------------------------------------------------------
// Root Navigator — switches between Auth and Main
// ----------------------------------------------------------

const RootStack = createStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, isInitialized } = useAuth();

  // Show splash until auth state is resolved
  if (!isInitialized) {
    return <SplashScreen />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <RootStack.Screen name="Main" component={MainNavigator} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconEmoji: {
    fontSize: 20,
  },
});
