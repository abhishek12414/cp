import { useEffect, useState, useCallback, useRef } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import { onlineManager } from "@tanstack/react-query";

interface NetworkState {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  type: string | null;
  isConnectionExpensive: boolean | null;
}

type NetworkChangeListener = (isConnected: boolean) => void;

/**
 * Network status manager
 * Provides network connectivity information and listeners
 */
class NetworkManager {
  private listeners: Set<NetworkChangeListener> = new Set();
  private _isConnected: boolean = true;
  private _networkState: NetworkState = {
    isConnected: true,
    isInternetReachable: true,
    type: null,
    isConnectionExpensive: false,
  };

  get isConnected(): boolean {
    return this._isConnected;
  }

  get networkState(): NetworkState {
    return this._networkState;
  }

  setConnected(connected: boolean) {
    if (this._isConnected !== connected) {
      this._isConnected = connected;
      this.notifyListeners(connected);

      // Update React Query's online manager
      onlineManager.setOnline(connected);
    }
  }

  setNetworkState(state: Partial<NetworkState>) {
    this._networkState = { ...this._networkState, ...state };
    if (state.isConnected !== undefined && state.isConnected !== null) {
      this.setConnected(state.isConnected);
    }
  }

  addListener(listener: NetworkChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(isConnected: boolean) {
    this.listeners.forEach((listener) => {
      try {
        listener(isConnected);
      } catch (error) {
        console.error("[NetworkManager] Listener error:", error);
      }
    });
  }

  /**
   * Check connectivity by pinging the server
   */
  async checkConnectivity(serverUrl?: string): Promise<boolean> {
    try {
      const url = serverUrl || "https://www.google.com";
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        method: "HEAD",
        mode: "no-cors",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
const networkManager = new NetworkManager();

/**
 * Hook to get and monitor network status
 */
export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(networkManager.isConnected);
  const [networkState, setNetworkState] = useState(networkManager.networkState);

  useEffect(() => {
    const unsubscribe = networkManager.addListener((connected) => {
      setIsConnected(connected);
    });

    return unsubscribe;
  }, []);

  const checkConnectivity = useCallback(async (serverUrl?: string) => {
    const connected = await networkManager.checkConnectivity(serverUrl);
    networkManager.setConnected(connected);
    return connected;
  }, []);

  return {
    isConnected,
    networkState,
    checkConnectivity,
  };
};

/**
 * Hook that provides network status with periodic checking
 * Useful for components that need to show offline state
 */
export const useNetworkStatusWithCheck = (checkIntervalMs: number = 30000) => {
  const { isConnected, checkConnectivity } = useNetworkStatus();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const checkNetwork = async () => {
      await checkConnectivity();
    };

    // Initial check
    checkNetwork();

    // Periodic check
    intervalRef.current = setInterval(checkNetwork, checkIntervalMs);

    // Check on app state change
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === "active") {
        // App came to foreground, check connectivity
        checkNetwork();
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      subscription.remove();
    };
  }, [checkIntervalMs, checkConnectivity]);

  return { isConnected };
};

/**
 * Initialize network monitoring
 * Call this early in the app lifecycle
 */
export const initializeNetworkMonitoring = async (): Promise<void> => {
  // Initial connectivity check
  const isConnected = await networkManager.checkConnectivity();
  networkManager.setConnected(isConnected);

  // Set up React Query's online manager
  onlineManager.setOnline(isConnected);

  console.log("[NetworkManager] Initialized, connected:", isConnected);
};

/**
 * Get the network manager instance for direct access
 */
export const getNetworkManager = () => networkManager;

export default networkManager;
