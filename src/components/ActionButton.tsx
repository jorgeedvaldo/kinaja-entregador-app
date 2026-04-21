// ============================================================
// ActionButton — full-width action button for delivery flow
// ============================================================

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { COLORS, FONTS, RADII, SHADOWS, FONT_SIZES, SPACING } from '../constants/theme';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
  size?: 'md' | 'lg';
}

export default function ActionButton({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  size = 'lg',
}: ActionButtonProps) {
  const bgColor = {
    primary: COLORS.kinaRed,
    secondary: COLORS.gray100,
    success: COLORS.success,
    danger: COLORS.danger,
  }[variant];

  const textColor = {
    primary: COLORS.kinaCream,
    secondary: COLORS.textSecondary,
    success: COLORS.textWhite,
    danger: COLORS.textWhite,
  }[variant];

  const shadowStyle = variant === 'primary' ? SHADOWS.red : SHADOWS.md;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: bgColor,
          paddingVertical: size === 'lg' ? 16 : 12,
          opacity: disabled ? 0.5 : 1,
        },
        shadowStyle,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: textColor,
              fontSize: size === 'lg' ? FONT_SIZES.xl : FONT_SIZES.lg,
            },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  text: {
    fontFamily: FONTS.black,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
