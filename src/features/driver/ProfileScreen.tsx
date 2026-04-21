// ============================================================
// ProfileScreen — driver profile & settings
// Avatar, vehicle info, stats, settings, logout
// ============================================================

import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, FONTS, FONT_SIZES, RADII, SHADOWS, SPACING } from '../../constants/theme';
import { VEHICLE_TYPE_LABELS } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('[Profile] Logout error:', error);
            }
          },
        },
      ]
    );
  }, [logout]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Minha Conta</Text>
        </View>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>
              {user ? getInitials(user.name) : '?'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Entregador'}</Text>
          <Text style={styles.userPhone}>{user?.phone || ''}</Text>
          {user?.email && (
            <Text style={styles.userEmail}>{user.email}</Text>
          )}

          {/* Role badge */}
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>🛵 Entregador</Text>
          </View>
        </View>

        {/* Stats section */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📦</Text>
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statLabel}>Entregas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statLabel}>Avaliação</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={styles.statValue}>--</Text>
            <Text style={styles.statLabel}>Dias ativos</Text>
          </View>
        </View>

        {/* Settings menu */}
        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>Definições</Text>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>👤</Text>
            <Text style={styles.menuText}>Editar Perfil</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🛵</Text>
            <Text style={styles.menuText}>Dados do Veículo</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🔔</Text>
            <Text style={styles.menuText}>Notificações</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🛡</Text>
            <Text style={styles.menuText}>Privacidade</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>❓</Text>
            <Text style={styles.menuText}>Ajuda & Suporte</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.version}>Kina Já Entregador v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  content: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['3xl'],
    color: COLORS.textPrimary,
  },
  profileCard: {
    backgroundColor: COLORS.bgCard,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: RADII['2xl'],
    padding: SPACING['2xl'],
    alignItems: 'center',
    ...SHADOWS.md,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.kinaRed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.red,
  },
  avatarText: {
    fontFamily: FONTS.black,
    fontSize: 28,
    color: COLORS.kinaCream,
  },
  userName: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.textPrimary,
  },
  userPhone: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  userEmail: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: `${COLORS.kinaRed}15`,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.pill,
    marginTop: SPACING.md,
  },
  roleBadgeText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.kinaRed,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADII.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  statValue: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  menuSection: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  menuTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  menuText: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
  },
  menuArrow: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.textTertiary,
  },
  logoutButton: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING['2xl'],
    backgroundColor: COLORS.dangerLight,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${COLORS.danger}30`,
  },
  logoutText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.danger,
  },
  version: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});
