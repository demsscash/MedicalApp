// components/ui/Button.tsx
import React, { useState } from 'react';
import { Text, TouchableOpacity, ActivityIndicator, Pressable } from 'react-native';
import { COLORS } from '../../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

type ButtonProps = {
    onPress: () => void;
    title: string;
    variant?: ButtonVariant;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    textClassName?: string;
};

export const Button: React.FC<ButtonProps> = ({
    onPress,
    title,
    variant = 'primary',
    disabled = false,
    loading = false,
    className = '',
    textClassName = '',
}) => {
    const [isPressed, setIsPressed] = useState(false);

    // Styles basés sur la variante et l'état
    const getButtonClass = () => {
        if (disabled) return 'bg-[#D3D3D3] px-8 py-4 rounded-full shadow';

        // Si le bouton est pressé, appliquer le style bleu quel que soit le variant
        if (isPressed) {
            return 'bg-[#4169E1] px-8 py-4 rounded-full shadow';
        }

        switch (variant) {
            case 'primary':
                return 'bg-gradient-to-r from-[#2850F1] to-[#607AF1] px-8 py-4 rounded-full shadow';
            case 'secondary':
                return 'bg-white px-8 py-4 rounded-full shadow';
            case 'outline':
                return 'bg-transparent border border-[#4169E1] px-8 py-4 rounded-full';
            default:
                return 'bg-[#4169E1] px-8 py-4 rounded-full shadow';
        }
    };

    const getTextClass = () => {
        if (disabled) return 'text-white font-medium text-base';

        // Si le bouton est pressé, toujours utiliser le texte blanc
        if (isPressed) {
            return 'text-white font-medium text-base';
        }

        switch (variant) {
            case 'primary':
                return 'text-white font-medium text-base';
            case 'secondary':
                return 'text-[#4169E1] font-medium text-base';
            case 'outline':
                return 'text-[#4169E1] font-medium text-base';
            default:
                return 'text-white font-medium text-base';
        }
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.9}
            className={`${getButtonClass()} ${className}`}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
        >
            {loading ? (
                <ActivityIndicator size="small" color={variant === 'primary' ? COLORS.white : COLORS.primary} />
            ) : (
                <Text className={`${getTextClass()} ${textClassName}`}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

export default Button;