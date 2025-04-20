import React from 'react';
import { View, Text, StyleSheet, ViewProps, TouchableOpacity, StyleProp, ViewStyle, TextStyle } from 'react-native';

export type CardVariant = 'elevated' | 'outlined' | 'filled';
export type CardSize = 'small' | 'medium' | 'large';

export interface CardProps extends ViewProps {
    /**
     * Optional title text for the card
     */
    title?: string;
    
    /**
     * Optional subtitle text for the card
     */
    subtitle?: string;
    
    /**
     * Optional main content for the card
     */
    children?: React.ReactNode;
    
    /**
     * Optional footer content for the card
     */
    footer?: React.ReactNode;
    
    /**
     * Card visual style variant
     * @default 'elevated'
     */
    variant?: CardVariant;
    
    /**
     * Card size preset
     * @default 'medium'
     */
    size?: CardSize;
    
    /**
     * Optional header icon or image
     */
    headerIcon?: React.ReactNode;
    
    /**
     * Custom styles for the card container
     */
    cardStyle?: StyleProp<ViewStyle>;
    
    /**
     * Custom styles for title text
     */
    titleStyle?: StyleProp<TextStyle>;
    
    /**
     * Custom styles for subtitle text
     */
    subtitleStyle?: StyleProp<TextStyle>;
    
    /**
     * Makes the entire card clickable
     */
    onPress?: () => void;
    
    /**
     * Corner radius override
     */
    borderRadius?: number;
    
    /**
     * Whether to remove padding inside the card
     * @default false
     */
    noPadding?: boolean;
}

/**
 * A versatile Card component for displaying grouped content
 */
const Card: React.FC<CardProps> = ({
    title,
    subtitle,
    children,
    footer,
    variant = 'elevated',
    size = 'medium',
    headerIcon,
    cardStyle,
    titleStyle,
    subtitleStyle,
    onPress,
    borderRadius,
    noPadding = false,
    ...rest
}) => {
    // Build component styles based on props
    const containerStyles = [
        styles.container,
        styles[variant],
        styles[size],
        borderRadius !== undefined && { borderRadius },
        !noPadding && styles.withPadding,
        cardStyle,
    ];

    // Determine if we need header section
    const hasHeader = !!(title || subtitle || headerIcon);
    
    // Render appropriate container based on onPress prop
    const CardContainer = onPress ? TouchableOpacity : View;
    
    return (
        <CardContainer 
            style={containerStyles}
            {...(onPress && { onPress, activeOpacity: 0.7 })}
            {...rest}
        >
            {hasHeader && (
                <View style={styles.header}>
                    {headerIcon && <View style={styles.headerIcon}>{headerIcon}</View>}
                    <View style={styles.headerText}>
                        {title && (
                            <Text 
                                style={[styles.title, styles[`${size}Title`], titleStyle]} 
                                numberOfLines={2}
                            >
                                {title}
                            </Text>
                        )}
                        {subtitle && (
                            <Text 
                                style={[styles.subtitle, styles[`${size}Subtitle`], subtitleStyle]}
                                numberOfLines={2}
                            >
                                {subtitle}
                            </Text>
                        )}
                    </View>
                </View>
            )}
            
            {children && <View style={styles.content}>{children}</View>}
            
            {footer && <View style={styles.footer}>{footer}</View>}
        </CardContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
    },
    withPadding: {
        padding: 16,
    },
    // Variants
    elevated: {
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    outlined: {
        borderWidth: 1,
        borderColor: '#E1E1E1',
    },
    filled: {
        backgroundColor: '#F5F5F5',
    },
    // Sizes
    small: {
        borderRadius: 8,
        minHeight: 60,
    },
    medium: {
        borderRadius: 12,
        minHeight: 80,
    },
    large: {
        borderRadius: 16,
        minHeight: 100,
    },
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerIcon: {
        marginRight: 12,
    },
    headerText: {
        flex: 1,
    },
    // Typography
    title: {
        fontWeight: '600',
        color: '#000000',
        marginBottom: 4,
    },
    subtitle: {
        color: '#666666',
    },
    smallTitle: {
        fontSize: 14,
    },
    mediumTitle: {
        fontSize: 16,
    },
    largeTitle: {
        fontSize: 18,
    },
    smallSubtitle: {
        fontSize: 12,
    },
    mediumSubtitle: {
        fontSize: 14,
    },
    largeSubtitle: {
        fontSize: 16,
    },
    // Content
    content: {
        marginVertical: 8,
    },
    // Footer
    footer: {
        marginTop: 12,
    },
});

export default Card;