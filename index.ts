import { registerRootComponent } from 'expo';
import { LogBox, Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';
import App from './App';

/**
 * @file index.ts
 * Main entry point for the mobile application
 * Bootstraps the React Native app using Expo's registerRootComponent
 */


// Initialize error tracking (optional, but recommended for production apps)
if (!__DEV__) {
    Sentry.init({
        dsn: "YOUR_SENTRY_DSN_HERE", // Replace with your actual Sentry DSN in production
        enableAutoSessionTracking: true,
        // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
        tracesSampleRate: 1.0,
    });
}

// Ignore specific harmless warnings in development
LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
    'Possible Unhandled Promise Rejection',
    'Remote debugger',
]);

// Configure app for specific platforms if needed
if (Platform.OS === 'android') {
    // Android specific configuration
}

if (Platform.OS === 'ios') {
    // iOS specific configuration
}

// Register the main component
registerRootComponent(App);

export default App;