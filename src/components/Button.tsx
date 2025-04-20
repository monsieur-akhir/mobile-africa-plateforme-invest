import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps, View } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends TouchableOpacityProps {
    /**
     * Texte à afficher sur le bouton
     */
    label: string;
    
    /**
     * Variante de style du bouton
     * @default 'primary'
     */
    variant?: ButtonVariant;
    
    /**
     * Taille du bouton
     * @default 'medium'
     */
    size?: ButtonSize;
    
    /**
     * État de chargement
     * @default false
     */
    loading?: boolean;
    
    /**
     * État désactivé
     * @default false
     */
    disabled?: boolean;
    
    /**
     * Icône à afficher avant le texte (composant React Native)
     */
    leftIcon?: React.ReactNode;
    
    /**
     * Icône à afficher après le texte (composant React Native)
     */
    rightIcon?: React.ReactNode;
    
    /**
     * Étendre le bouton à la largeur maximale disponible
     * @default false
     */
    fullWidth?: boolean;
}

/**
 * Composant Button réutilisable avec différentes variantes et états
 */
const Button: React.FC<ButtonProps> = ({
    label,
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    style,
    ...rest
}) => {
    // Détermine si le bouton est dans un état désactivé
    const isDisabled = disabled || loading;
    
    // Convertit les styles en fonction des props
    const buttonStyles = [
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        isDisabled && styles[`${variant}Disabled`],
        style
    ];
    
    const textStyles = [
        styles.textStyle,
        styles[`${variant}Text`],
        styles[`${size}Text`],
        isDisabled && styles.disabledText
    ];

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            disabled={isDisabled}
            style={buttonStyles}
            {...rest}
        >
            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator 
                        size="small" 
                        color={variant === 'primary' ? '#FFF' : '#007AFF'} 
                    />
                ) : (
                    <>
                        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
                        <Text style={textStyles}>{label}</Text>
                        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
                    </>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Variantes
    primary: {
        backgroundColor: '#007AFF',
    },
    secondary: {
        backgroundColor: '#E9F0FF',
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    text: {
        backgroundColor: 'transparent',
    },
    danger: {
        backgroundColor: '#FF3B30',
    },
    // Tailles
    small: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    medium: {
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    large: {
        paddingVertical: 16,
        paddingHorizontal: 32,
    },
    // Texte par variante
    primaryText: {
        color: '#FFFFFF',
    },
    secondaryText: {
        color: '#007AFF',
    },
    outlineText: {
        color: '#007AFF',
    },
    textText: {
        color: '#007AFF',
    },
    dangerText: {
        color: '#FFFFFF',
    },
    // Texte par taille
    smallText: {
        fontSize: 14,
        fontWeight: '500',
    },
    mediumText: {
        fontSize: 16,
        fontWeight: '600',
    },
    largeText: {
        fontSize: 18,
        fontWeight: '600',
    },
    // États désactivés
    disabled: {
        opacity: 0.6,
    },
    primaryDisabled: {},
    secondaryDisabled: {},
    outlineDisabled: {},
    textDisabled: {},
    dangerDisabled: {},
    disabledText: {
        opacity: 0.8,
    },
    // Icônes
    iconLeft: {
        marginRight: 8,
    },
    iconRight: {
        marginLeft: 8,
    },
    // Largeur
    fullWidth: {
        width: '100%',
    },
    textStyle: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default Button;