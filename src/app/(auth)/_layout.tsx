import React from "react";
import { Slot } from "expo-router";
import {
    SafeAreaView,
    KeyboardAvoidingView,
    ScrollView,
    StyleSheet,
    Platform,
    View,
} from "react-native";
import { AuthProvider } from "../../context/AuthContext";

export default function AuthLayout() {
return (
    <AuthProvider>
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.avoid}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.inner}>{/* logo or header could go here */}</View>
                    <Slot />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    </AuthProvider>
);
}

const styles = StyleSheet.create({
safeArea: {
    flex: 1,
    backgroundColor: "#fff",
},
avoid: {
    flex: 1,
},
scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
},
inner: {
    alignItems: "center",
    marginBottom: 32,
},
});