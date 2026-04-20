import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ActivityIndicator } from "react-native-paper";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Formik } from "formik";
import * as Yup from "yup";

import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import authApi from "@/apis/auth.api";

// Validation schema
const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email("Please enter a valid email").required("Email is required"),
});

interface ForgotPasswordFormValues {
  email: string;
}

export default function ForgotPasswordScreen() {
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background ? "light" : "dark";
  const primaryColor = Colors[colorScheme].primary;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const initialValues: ForgotPasswordFormValues = {
    email: "",
  };

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      setLoading(true);
      setError(null);

      await authApi.forgotPassword({ email: values.email });

      // Show success state
      setSubmittedEmail(values.email);
      setEmailSent(true);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        "Failed to send reset email. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Success state - email sent
  if (emailSent) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
              <Text style={styles.successIcon}>✉️</Text>
            </View>
            <Text style={styles.successTitle}>Check Your Email</Text>
            <Text style={styles.successMessage}>We&apos;ve sent a password reset link to:</Text>
            <Text style={styles.emailText}>{submittedEmail}</Text>
            <Text style={styles.successHint}>
              Click the link in the email to reset your password. The link will expire in 24 hours.
            </Text>
            <Button
              mode="contained"
              buttonColor={primaryColor}
              onPress={() => {
                router.replace("/login");
              }}
              style={styles.successButton}
            >
              Back to Login
            </Button>
            <TouchableOpacity
              onPress={() => {
                setEmailSent(false);
              }}
              style={styles.resendContainer}
            >
              <Text style={[styles.resendText, { color: primaryColor }]}>
                Didn&apos;t receive the email? Resend
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                router.back();
              }}
            >
              <Text style={styles.backText}>← Back to Login</Text>
            </TouchableOpacity>

            <View style={styles.logoContainer}>
              <Image source={require("../assets/images/react-logo.png")} style={styles.logo} />
              <Text style={[styles.logoText, { color: primaryColor }]}>CurrentShop</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.welcomeText}>Forgot Password?</Text>
              <Text style={styles.subtitleText}>
                Enter your email address and we&apos;ll send you a link to reset your password.
              </Text>

              <Formik
                initialValues={initialValues}
                validationSchema={ForgotPasswordSchema}
                onSubmit={handleSubmit}
              >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                  <View style={styles.form}>
                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Email Address</Text>
                      <TextInput
                        style={[styles.input, touched.email && errors.email && styles.inputError]}
                        placeholder="Enter your email"
                        placeholderTextColor="#999"
                        value={values.email}
                        onChangeText={handleChange("email")}
                        onBlur={handleBlur("email")}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading}
                      />
                      {touched.email && errors.email && (
                        <Text style={styles.errorText}>{errors.email}</Text>
                      )}
                    </View>

                    {/* Error Message */}
                    {error && (
                      <View style={styles.errorContainer}>
                        <Text style={styles.errorMessage}>{error}</Text>
                      </View>
                    )}

                    {/* Submit Button */}
                    <Button
                      mode="contained"
                      buttonColor={primaryColor}
                      onPress={() => handleSubmit()}
                      style={styles.submitButton}
                      disabled={loading}
                    >
                      {loading ? <ActivityIndicator animating color="#fff" /> : "Send Reset Link"}
                    </Button>
                  </View>
                )}
              </Formik>

              {/* Help Text */}
              <View style={styles.helpContainer}>
                <Text style={styles.helpText}>
                  Remember your password?{" "}
                  <Text
                    style={[styles.helpLink, { color: primaryColor }]}
                    onPress={() => router.replace("/login")}
                  >
                    Sign In
                  </Text>
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
    color: "#666",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
  },
  formContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitleText: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 24,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: "#FFE5E5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorMessage: {
    color: "#FF3B30",
    fontSize: 14,
    textAlign: "center",
  },
  submitButton: {
    padding: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  helpContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  helpText: {
    fontSize: 14,
    color: "#666",
  },
  helpLink: {
    fontWeight: "700",
  },
  // Success screen styles
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 80,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  successHint: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  successButton: {
    paddingHorizontal: 48,
    borderRadius: 12,
    marginBottom: 16,
  },
  resendContainer: {
    padding: 12,
  },
  resendText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
