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
import { useDispatch, useSelector } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";

import { signupRequest, signupSuccess, signupFailure, clearError } from "@/reducers/auth.reducer";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import authApi from "@/apis/auth.api";

// Validation schema
const SignupSchema = Yup.object().shape({
  name: Yup.string().min(2, "Name must be at least 2 characters").required("Name is required"),
  email: Yup.string().email("Please enter a valid email").required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

interface SignupFormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function SignupScreen() {
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background ? "light" : "dark";
  const primaryColor = Colors[colorScheme].primary;
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: any) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupSuccess2, setSignupSuccess] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");

  const initialValues: SignupFormValues = {
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  };

  const handleSignup = async (values: SignupFormValues) => {
    try {
      dispatch(signupRequest());
      dispatch(clearError());

      // Generate username from email
      const username = values.email.split("@")[0] + "_" + Date.now();

      await authApi.register({
        username,
        email: values.email,
        password: values.password,
        name: values.name,
        phone: values.phone,
      });

      // Show success message
      setSignupEmail(values.email);
      setSignupSuccess(true);
      dispatch(signupSuccess());
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        "Registration failed. Please try again.";
      dispatch(signupFailure(errorMessage));
    }
  };

  // Success state - show verification message
  if (signupSuccess2) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
              <Text style={styles.successIcon}>✉️</Text>
            </View>
            <Text style={styles.successTitle}>Verify Your Email</Text>
            <Text style={styles.successMessage}>We&apos;ve sent a verification link to:</Text>
            <Text style={styles.emailText}>{signupEmail}</Text>
            <Text style={styles.successHint}>
              Please check your inbox and click the verification link to activate your account.
            </Text>
            <Button
              mode="contained"
              buttonColor={primaryColor}
              onPress={() => router.replace("/login")}
              style={styles.successButton}
            >
              Back to Login
            </Button>
            <TouchableOpacity
              onPress={() => {
                setSignupSuccess(false);
                setSignupEmail("");
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
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <View style={styles.logoContainer}>
              <Image source={require("../assets/images/react-logo.png")} style={styles.logo} />
              <Text style={[styles.logoText, { color: primaryColor }]}>CurrentShop</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.welcomeText}>Create Account</Text>
              <Text style={styles.subtitleText}>Sign up to start shopping</Text>

              <Formik
                initialValues={initialValues}
                validationSchema={SignupSchema}
                onSubmit={handleSignup}
              >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                  <View style={styles.form}>
                    {/* Name Input */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Full Name</Text>
                      <TextInput
                        style={[styles.input, touched.name && errors.name && styles.inputError]}
                        placeholder="Enter your full name"
                        placeholderTextColor="#999"
                        value={values.name}
                        onChangeText={handleChange("name")}
                        onBlur={handleBlur("name")}
                        autoCapitalize="words"
                        editable={!loading}
                      />
                      {touched.name && errors.name && (
                        <Text style={styles.errorText}>{errors.name}</Text>
                      )}
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Email</Text>
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

                    {/* Phone Input */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Mobile Number</Text>
                      <TextInput
                        style={[styles.input, touched.phone && errors.phone && styles.inputError]}
                        placeholder="Enter 10-digit mobile number"
                        placeholderTextColor="#999"
                        value={values.phone}
                        onChangeText={handleChange("phone")}
                        onBlur={handleBlur("phone")}
                        keyboardType="phone-pad"
                        maxLength={10}
                        editable={!loading}
                      />
                      {touched.phone && errors.phone && (
                        <Text style={styles.errorText}>{errors.phone}</Text>
                      )}
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Password</Text>
                      <View style={styles.passwordContainer}>
                        <TextInput
                          style={[
                            styles.passwordInput,
                            touched.password && errors.password && styles.inputError,
                          ]}
                          placeholder="Create a password"
                          placeholderTextColor="#999"
                          value={values.password}
                          onChangeText={handleChange("password")}
                          onBlur={handleBlur("password")}
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          editable={!loading}
                        />
                        <TouchableOpacity
                          style={styles.eyeButton}
                          onPress={() => setShowPassword(!showPassword)}
                        >
                          <Text style={styles.eyeText}>{showPassword ? "🙈" : "👁️"}</Text>
                        </TouchableOpacity>
                      </View>
                      {touched.password && errors.password && (
                        <Text style={styles.errorText}>{errors.password}</Text>
                      )}
                    </View>

                    {/* Confirm Password Input */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Confirm Password</Text>
                      <View style={styles.passwordContainer}>
                        <TextInput
                          style={[
                            styles.passwordInput,
                            touched.confirmPassword && errors.confirmPassword && styles.inputError,
                          ]}
                          placeholder="Confirm your password"
                          placeholderTextColor="#999"
                          value={values.confirmPassword}
                          onChangeText={handleChange("confirmPassword")}
                          onBlur={handleBlur("confirmPassword")}
                          secureTextEntry={!showConfirmPassword}
                          autoCapitalize="none"
                          editable={!loading}
                        />
                        <TouchableOpacity
                          style={styles.eyeButton}
                          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          <Text style={styles.eyeText}>{showConfirmPassword ? "🙈" : "👁️"}</Text>
                        </TouchableOpacity>
                      </View>
                      {touched.confirmPassword && errors.confirmPassword && (
                        <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                      )}
                    </View>

                    {/* Error Message */}
                    {error && (
                      <View style={styles.errorContainer}>
                        <Text style={styles.errorMessage}>{error}</Text>
                      </View>
                    )}

                    {/* Signup Button */}
                    <Button
                      mode="contained"
                      buttonColor={primaryColor}
                      onPress={() => handleSubmit()}
                      style={styles.signupButton}
                      disabled={loading}
                    >
                      {loading ? <ActivityIndicator animating color="#fff" /> : "Create Account"}
                    </Button>
                  </View>
                )}
              </Formik>

              {/* Sign In Link */}
              <View style={styles.signinContainer}>
                <Text style={styles.signinText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.replace("/login")}>
                  <Text style={[styles.signinLink, { color: primaryColor }]}>Sign In</Text>
                </TouchableOpacity>
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
    marginTop: 20,
    marginBottom: 30,
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
    marginBottom: 24,
    textAlign: "center",
    opacity: 0.7,
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  eyeButton: {
    padding: 12,
  },
  eyeText: {
    fontSize: 20,
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
  signupButton: {
    padding: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  signinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  signinText: {
    fontSize: 14,
    color: "#666",
  },
  signinLink: {
    fontSize: 14,
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
