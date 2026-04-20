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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";

import { loginRequest, loginSuccess, loginFailure, User } from "@/reducers/auth.reducer";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import authApi from "@/apis/auth.api";

// Validation schema
const LoginSchema = Yup.object().shape({
  identifier: Yup.string().email("Please enter a valid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

interface LoginFormValues {
  identifier: string;
  password: string;
}

export default function LoginScreen() {
  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background ? "light" : "dark";
  const primaryColor = Colors[colorScheme].primary;
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: any) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const initialValues: LoginFormValues = {
    identifier: "",
    password: "",
  };

  const handleLogin = async (values: LoginFormValues) => {
    try {
      dispatch(loginRequest());

      const response = await authApi.login({
        identifier: values.identifier,
        password: values.password,
      });

      const { jwt, user } = response.data;

      // Save token to storage
      await AsyncStorage.setItem("auth_token", jwt);

      // Fetch full user data to get name, phone etc.
      try {
        const meResponse = await authApi.getMe();
        const fullUser = meResponse.data;

        const userData: User = {
          id: fullUser.id,
          email: fullUser.email,
          username: fullUser.username,
          name: fullUser.name || fullUser.username,
          phone: fullUser.phone,
          provider: fullUser.provider,
          confirmed: fullUser.confirmed,
          blocked: fullUser.blocked,
        };

        // Update Redux state
        dispatch(loginSuccess({ user: userData, token: jwt }));
      } catch {
        // Fallback to basic user data from login response
        const userData: User = {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.username,
          provider: user.provider,
          confirmed: user.confirmed,
          blocked: user.blocked,
        };
        dispatch(loginSuccess({ user: userData, token: jwt }));
      }

      // Navigate to home screen
      router.replace("/");
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        "Invalid email or password. Please try again.";
      dispatch(loginFailure(errorMessage));
    }
  };

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
            <View style={styles.logoContainer}>
              <Image source={require("../assets/images/react-logo.png")} style={styles.logo} />
              <Text style={[styles.logoText, { color: primaryColor }]}>CurrentShop</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.subtitleText}>Sign in to continue shopping</Text>

              <Formik
                initialValues={initialValues}
                validationSchema={LoginSchema}
                onSubmit={handleLogin}
              >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                  <View style={styles.form}>
                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Email</Text>
                      <TextInput
                        style={[
                          styles.input,
                          touched.identifier && errors.identifier && styles.inputError,
                        ]}
                        placeholder="Enter your email"
                        placeholderTextColor="#999"
                        value={values.identifier}
                        onChangeText={handleChange("identifier")}
                        onBlur={handleBlur("identifier")}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading}
                      />
                      {touched.identifier && errors.identifier && (
                        <Text style={styles.errorText}>{errors.identifier}</Text>
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
                          placeholder="Enter your password"
                          placeholderTextColor="#999"
                          value={values.password}
                          onChangeText={handleChange("password")}
                          onBlur={handleBlur("password")}
                          // secureTextEntry={!showPassword}
                          // autoCapitalize="none"
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

                    {/* Forgot Password Link */}
                    <TouchableOpacity
                      style={styles.forgotPasswordContainer}
                      onPress={() => router.push("/forgot-password")}
                    >
                      <Text style={[styles.forgotPasswordText, { color: primaryColor }]}>
                        Forgot Password?
                      </Text>
                    </TouchableOpacity>

                    {/* Error Message */}
                    {error && (
                      <View style={styles.errorContainer}>
                        <Text style={styles.errorMessage}>{error}</Text>
                      </View>
                    )}

                    {/* Login Button */}
                    <Button
                      mode="contained"
                      buttonColor={primaryColor}
                      onPress={() => handleSubmit()}
                      style={styles.loginButton}
                      disabled={loading}
                    >
                      {loading ? <ActivityIndicator animating color="#fff" /> : "Sign In"}
                    </Button>
                  </View>
                )}
              </Formik>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Sign Up Link */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don&apos;t have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/signup")}>
                  <Text style={[styles.signupLink, { color: primaryColor }]}>Sign Up</Text>
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
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 12,
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
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "600",
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
  loginButton: {
    padding: 4,
    borderRadius: 12,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#999",
    fontWeight: "600",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
    color: "#666",
  },
  signupLink: {
    fontSize: 14,
    fontWeight: "700",
  },
});
