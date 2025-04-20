/**
 * Theme constants for the application
 * This file serves as a single source of truth for styling constants
 */

export const colors = {
    // Primary palette
    primary: {
        main: '#007AFF',
        light: '#4DA3FF',
        dark: '#0062CC',
        contrastText: '#FFFFFF',
    },
    
    // Secondary palette
    secondary: {
        main: '#E9F0FF',
        light: '#F5F8FF',
        dark: '#C7D8F2',
        contrastText: '#007AFF',
    },
    
    // Error/danger palette
    danger: {
        main: '#FF3B30',
        light: '#FF6B63',
        dark: '#D93026',
        contrastText: '#FFFFFF',
    },
    
    // Success palette
    success: {
        main: '#34C759',
        light: '#5FD57B',
        dark: '#2AA148',
        contrastText: '#FFFFFF',
    },
    
    // Warning palette
    warning: {
        main: '#FFCC00',
        light: '#FFD633',
        dark: '#CCA300',
        contrastText: '#000000',
    },
    
    // Info palette
    info: {
        main: '#5AC8FA',
        light: '#7DD6FB',
        dark: '#47A0C9',
        contrastText: '#000000',
    },
    
    // Neutral/grey palette
    grey: {
        50: '#F9F9F9',
        100: '#F5F5F5',
        200: '#E1E1E1',
        300: '#CCCCCC',
        400: '#999999',
        500: '#666666',
        600: '#444444',
        700: '#333333',
        800: '#222222',
        900: '#111111',
    },
    
    // Common colors
    common: {
        black: '#000000',
        white: '#FFFFFF',
        transparent: 'transparent',
    },
    
    // Background colors
    background: {
        default: '#FFFFFF',
        paper: '#FFFFFF',
        subtle: '#F5F5F5',
    },
    
    // Text colors
    text: {
        primary: '#000000',
        secondary: '#666666',
        disabled: '#999999',
        hint: '#999999',
    },
    
    // Action colors (for interactive elements)
    action: {
        active: 'rgba(0, 0, 0, 0.54)',
        hover: 'rgba(0, 0, 0, 0.04)',
        selected: 'rgba(0, 0, 0, 0.08)',
        disabled: 'rgba(0, 0, 0, 0.26)',
        disabledBackground: 'rgba(0, 0, 0, 0.12)',
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const typography = {
    // Font family
    fontFamily: {
        base: 'System', // Uses system font by default
        heading: 'System',
    },
    
    // Font sizes
    fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        xxxl: 32,
    },
    
    // Font weights
    fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },
    
    // Line heights
    lineHeight: {
        xs: 16,
        sm: 20,
        md: 24,
        lg: 28,
        xl: 32,
        xxl: 36,
        xxxl: 40,
    },
};

export const borderRadius = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
};

export const shadows = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    sm: {
        shadowColor: colors.common.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: colors.common.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    lg: {
        shadowColor: colors.common.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    xl: {
        shadowColor: colors.common.black,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
};

export const zIndex = {
    base: 0,
    elevated: 1,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
};

export const layout = {
    screenPadding: spacing.md,
    maxContentWidth: 1200,
};

export const transitions = {
    duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
    },
    easing: {
        easeInOut: 'ease-in-out',
        easeOut: 'ease-out',
        easeIn: 'ease-in',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
};

// Shared component styles that can be used across the app
export const componentStyles = {
    card: {
        borderRadius: borderRadius.md,
        padding: spacing.md,
        backgroundColor: colors.background.paper,
    },
    button: {
        borderRadius: borderRadius.sm,
        paddingHorizontal: spacing.md,
        height: 48,
    },
    input: {
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.grey[300],
        height: 48,
        paddingHorizontal: spacing.md,
    },
};

const theme = {
    colors,
    spacing,
    typography,
    borderRadius,
    shadows,
    zIndex,
    layout,
    transitions,
    componentStyles,
};

export default theme;