// ============================================================
// LoginScreen — driver authentication
// Red header with logo + white card with login form
// ============================================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { COLORS, FONTS, FONT_SIZES, RADII, SHADOWS, SPACING } from '../../constants/theme';
import KinaLogo from '../../components/KinaLogo';
import { useAuth } from '../../hooks/useAuth';

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();

  const handleLogin = useCallback(async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert('Erro', 'Preencha o telefone/email e a senha.');
      return;
    }

    try {
      await login(identifier.trim(), password);
    } catch (error: unknown) {
      const err = error as { message?: string };
      Alert.alert(
        'Erro de Login',
        err.message || 'Credenciais inválidas. Tente novamente.'
      );
    }
  }, [identifier, password, login]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.kinaRed} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Red header with logo */}
        <View style={styles.header}>
          <KinaLogo scale={0.7} animate={false} />
          <Text style={styles.headerSubtitle}>App Entregador</Text>
        </View>

        {/* White login card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Entrar na sua conta</Text>
          <Text style={styles.cardSubtitle}>
            Use o seu telefone ou email para entrar
          </Text>

          {/* Phone/Email input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Telefone ou Email</Text>
            <TextInput
              style={styles.input}
              placeholder="+244 923 456 789"
              placeholderTextColor={COLORS.gray400}
              value={identifier}
              onChangeText={setIdentifier}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="••••••••"
                placeholderTextColor={COLORS.gray400}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeIcon}>
                  {showPassword ? '🙈' : '👁'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Login button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'A entrar...' : 'ENTRAR'}
            </Text>
          </TouchableOpacity>

          {/* Forgot password */}
          <TouchableOpacity style={styles.forgotButton}>
            <Text style={styles.forgotText}>Esqueci minha senha</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom branding */}
        <View style={styles.bottomBrand}>
          <Text style={styles.bottomText}>
            Kina Já © 2026 — Plataforma de Entregas
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.kinaRed,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: COLORS.kinaRed,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 32,
  },
  headerSubtitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: -8,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: RADII['3xl'],
    borderTopRightRadius: RADII['3xl'],
    paddingHorizontal: SPACING['2xl'],
    paddingTop: SPACING['4xl'],
    paddingBottom: SPACING['3xl'],
  },
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['3xl'],
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING['3xl'],
  },
  inputContainer: {
    marginBottom: SPACING.xl,
  },
  inputLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.gray50,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  eyeIcon: {
    fontSize: 20,
  },
  loginButton: {
    backgroundColor: COLORS.kinaRed,
    borderRadius: RADII.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: SPACING.xl,
    ...SHADOWS.red,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontFamily: FONTS.black,
    fontSize: FONT_SIZES.xl,
    color: COLORS.kinaCream,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  forgotButton: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  forgotText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    color: COLORS.kinaRed,
  },
  bottomBrand: {
    backgroundColor: COLORS.bgCard,
    paddingBottom: 40,
    alignItems: 'center',
  },
  bottomText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
  },
});
