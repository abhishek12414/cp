import * as ExpoCamera from "expo-camera";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  IconButton,
  Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";

type UploadStep =
  | "permission"
  | "camera"
  | "preview"
  | "uploading"
  | "success"
  | "error";

export default function UploadOrderScreen() {
  const [step, setStep] = useState<UploadStep>("permission");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // typed as any because Expo Camera types can be problematic in some TS configs
  const cameraRef = useRef<any>(null);

  // Resolve Camera component from the ExpoCamera module. Try several
  // fallbacks: ExpoCamera.Camera, ExpoCamera.default, or null.
  let CameraComponent: React.ComponentType<any> | null = null;
  if (typeof ExpoCamera !== "undefined") {
    if (
      (ExpoCamera as any).Camera &&
      (typeof (ExpoCamera as any).Camera === "function" ||
        typeof (ExpoCamera as any).Camera === "object")
    ) {
      CameraComponent = (ExpoCamera as any).Camera as React.ComponentType<any>;
    } else if (
      (ExpoCamera as any).default &&
      (typeof (ExpoCamera as any).default === "function" ||
        typeof (ExpoCamera as any).default === "object")
    ) {
      CameraComponent = (ExpoCamera as any).default as React.ComponentType<any>;
    }
  }

  const colorScheme =
    useThemeColor({}, "background") === Colors.light.background
      ? "light"
      : "dark";
  const primaryColor = Colors[colorScheme].primary;

  // Treat Camera as available when the resolved component exists.
  const hasCameraApi = !!CameraComponent;

  // Request camera permission when user presses the button.
  const requestPermission = async () => {
    setErrorMessage(null);
    try {
      const cam = (ExpoCamera as any) || {};

      if (typeof cam.requestCameraPermissionsAsync === "function") {
        const res = await cam.requestCameraPermissionsAsync();
        const status = res?.status ?? (res?.granted ? "granted" : "denied");
        setHasPermission(status === "granted");
        if (status === "granted") setStep("camera");
        else setErrorMessage("Permission denied.");
        return;
      }

      if (typeof cam.getCameraPermissionsAsync === "function") {
        const current = await cam.getCameraPermissionsAsync();
        if (current?.status === "granted") {
          setHasPermission(true);
          setStep("camera");
          return;
        }
        if (typeof cam.requestPermissionsAsync === "function") {
          const res = await cam.requestPermissionsAsync();
          setHasPermission(res?.status === "granted");
          if (res?.status === "granted") setStep("camera");
          else setErrorMessage("Permission denied.");
          return;
        }
      }

      setErrorMessage("Camera not available on this platform.");
    } catch (e) {
      console.error("Permission request failed:", e);
      setErrorMessage("Failed to request camera permission.");
    }
  };

  // Request camera permission on component mount (only if API exists)
  React.useEffect(() => {
    if (!hasCameraApi) {
      setHasPermission(false);
      return;
    }

    // Call the same request flow used for the button so SDK differences are handled.
    requestPermission();
  }, [hasCameraApi]);

  const handleGoBack = () => {
    if (step === "preview") {
      setStep("camera");
      setImageUri(null);
    } else {
      router.back();
    }
  };

  const handleTakePicture = async () => {
    if (
      cameraRef.current &&
      typeof cameraRef.current.takePictureAsync === "function"
    ) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setImageUri(photo.uri);
        setStep("preview");
      } catch (error) {
        console.error("Error taking picture:", error);
        setErrorMessage("Failed to take picture. Please try again.");
      }
    } else {
      setErrorMessage("Camera is not available.");
    }
  };

  const handleSelectFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      setStep("preview");
    }
  };

  const handleUpload = async () => {
    if (!imageUri) return;

    setStep("uploading");

    // Simulate upload with a timeout
    setTimeout(() => {
      // For demo purposes, let's just show success
      setStep("success");

      // In a real app, you would upload the image to your server:
      /*
      try {
        const formData = new FormData();
        formData.append('file', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'order.jpg',
        });
        
        const response = await fetch('YOUR_UPLOAD_ENDPOINT', {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        const result = await response.json();
        if (result.success) {
          setStep('success');
        } else {
          throw new Error(result.message || 'Upload failed');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        setStep('error');
        setErrorMessage('Failed to upload image. Please try again.');
      }
      */
    }, 2000);
  };

  const renderContent = () => {
    switch (step) {
      case "permission":
        return (
          <View style={styles.centerContainer}>
            {hasPermission === null ? (
              <ActivityIndicator color={primaryColor} size="large" />
            ) : hasPermission === false ? (
              <>
                <Text variant="titleLarge" style={styles.permissionTitle}>
                  Camera Permission Required
                </Text>
                <Text variant="bodyMedium" style={styles.permissionText}>
                  We need camera permission to capture your purchase order.
                </Text>
                <Button
                  mode="contained"
                  buttonColor={primaryColor}
                  onPress={requestPermission}
                  style={styles.permissionButton}
                >
                  Grant Permission
                </Button>
                {errorMessage ? (
                  <Text
                    variant="bodySmall"
                    style={{ color: Colors.light.error, marginTop: 12 }}
                  >
                    {errorMessage}
                  </Text>
                ) : null}
              </>
            ) : (
              <ActivityIndicator color={primaryColor} size="large" />
            )}
          </View>
        );

      case "camera":
        // If Camera API is missing, show a fallback with gallery option
        if (!hasCameraApi) {
          return (
            <View style={styles.centerContainer}>
              <Text variant="titleLarge" style={styles.permissionTitle}>
                Camera Unavailable
              </Text>
              <Text variant="bodyMedium" style={styles.permissionText}>
                Your platform does not support the native camera. You can still
                pick an image from the gallery.
              </Text>
              <Button
                mode="contained"
                buttonColor={primaryColor}
                onPress={handleSelectFromGallery}
                style={styles.permissionButton}
              >
                Choose From Gallery
              </Button>
            </View>
          );
        }

        return (
          <>
            {CameraComponent ? (
              <CameraComponent
                ref={cameraRef}
                style={styles.camera}
                // Use optional chaining to avoid accessing Constants when undefined
                type={(ExpoCamera as any)?.Constants?.Type?.back}
              >
                <View style={styles.overlayContainer}>
                  <View style={styles.focusFrame} />

                  <View style={styles.cameraControls}>
                    <TouchableOpacity
                      style={styles.galleryButton}
                      onPress={handleSelectFromGallery}
                    >
                      <IconButton icon="image" size={28} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.captureButton}
                      onPress={handleTakePicture}
                    >
                      <View style={styles.captureButtonInner} />
                    </TouchableOpacity>

                    <View style={styles.placeholderButton} />
                  </View>
                </View>
              </CameraComponent>
            ) : (
              <View style={styles.camera}>
                <View style={styles.overlayContainer}>
                  <View style={styles.focusFrame} />
                  <View style={styles.cameraControls}>
                    <TouchableOpacity
                      style={styles.galleryButton}
                      onPress={handleSelectFromGallery}
                    >
                      <IconButton icon="image" size={28} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.captureButton}
                      onPress={() => setErrorMessage("Camera not available")}
                    >
                      <View style={styles.captureButtonInner} />
                    </TouchableOpacity>

                    <View style={styles.placeholderButton} />
                  </View>
                </View>
              </View>
            )}

            <View style={styles.instructionContainer}>
              <Text variant="titleMedium" style={styles.instructionTitle}>
                Take a Photo of Your Purchase Order
              </Text>
              <Text variant="bodyMedium" style={styles.instructionText}>
                Position the purchase order within the frame and ensure
                it&apos;s clearly visible.
              </Text>
            </View>
          </>
        );

      case "preview":
        return (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: imageUri || "" }}
              style={styles.previewImage}
              contentFit="contain"
            />

            <View style={styles.previewControls}>
              <Button
                mode="outlined"
                onPress={() => setStep("camera")}
                style={styles.previewButton}
              >
                Retake
              </Button>

              <Button
                mode="contained"
                buttonColor={primaryColor}
                onPress={handleUpload}
                style={styles.previewButton}
              >
                Upload Order
              </Button>
            </View>
          </View>
        );

      case "uploading":
        return (
          <View style={styles.centerContainer}>
            <ActivityIndicator color={primaryColor} size="large" />
            <Text variant="titleMedium" style={styles.uploadingText}>
              Uploading your purchase order...
            </Text>
            <Text variant="bodyMedium" style={styles.uploadingSubtext}>
              Please wait while we process your order.
            </Text>
          </View>
        );

      case "success":
        return (
          <View style={styles.centerContainer}>
            <IconButton
              icon="check-circle"
              size={80}
              iconColor={Colors.light.success}
            />
            <Text variant="titleLarge" style={styles.successTitle}>
              Order Uploaded Successfully!
            </Text>
            <Text variant="bodyMedium" style={styles.successText}>
              We&apos;ll process your order and get back to you with pricing
              details within 2-3 hours.
            </Text>
            <Button
              mode="contained"
              buttonColor={primaryColor}
              onPress={() => router.push("/")}
              style={styles.successButton}
            >
              Back to Home
            </Button>
          </View>
        );

      case "error":
        return (
          <View style={styles.centerContainer}>
            <IconButton
              icon="alert-circle"
              size={80}
              iconColor={Colors.light.error}
            />
            <Text variant="titleLarge" style={styles.errorTitle}>
              Upload Failed
            </Text>
            <Text variant="bodyMedium" style={styles.errorText}>
              {errorMessage || "Something went wrong. Please try again."}
            </Text>
            <Button
              mode="contained"
              buttonColor={primaryColor}
              onPress={() => setStep("camera")}
              style={styles.errorButton}
            >
              Try Again
            </Button>
          </View>
        );
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={handleGoBack}
            disabled={step === "uploading"}
          />
          <Text variant="titleLarge" style={styles.headerTitle}>
            Upload Purchase Order
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {renderContent()}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerTitle: {
    fontWeight: "600",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionTitle: {
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  permissionText: {
    textAlign: "center",
    marginBottom: 24,
  },
  permissionButton: {
    paddingHorizontal: 24,
  },
  camera: {
    flex: 1,
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
  },
  focusFrame: {
    alignSelf: "center",
    width: "80%",
    height: "50%",
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 12,
    marginBottom: 100,
  },
  cameraControls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "rgba(0, 0, 0, 0.2)",
  },
  galleryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderButton: {
    width: 44,
    height: 44,
  },
  instructionContainer: {
    padding: 16,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  instructionTitle: {
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  instructionText: {
    textAlign: "center",
  },
  previewContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  previewImage: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  previewControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  previewButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  uploadingText: {
    marginTop: 24,
    fontWeight: "600",
  },
  uploadingSubtext: {
    marginTop: 12,
    textAlign: "center",
    opacity: 0.7,
  },
  successTitle: {
    marginTop: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  successText: {
    marginTop: 12,
    textAlign: "center",
    marginHorizontal: 24,
    marginBottom: 24,
  },
  successButton: {
    marginTop: 12,
    paddingHorizontal: 32,
  },
  errorTitle: {
    marginTop: 24,
    fontWeight: "bold",
    color: Colors.light.error,
    textAlign: "center",
  },
  errorText: {
    marginTop: 12,
    textAlign: "center",
    marginHorizontal: 24,
    marginBottom: 24,
  },
  errorButton: {
    marginTop: 12,
    paddingHorizontal: 32,
  },
});
