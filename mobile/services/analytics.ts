import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, AppState, AppStateStatus } from "react-native";

// Analytics event names - type safe
export type AnalyticsEventName =
  // Screen views
  | "screen_view"
  // Product events
  | "product_view"
  | "product_search"
  | "product_share"
  // Cart events
  | "add_to_cart"
  | "remove_from_cart"
  | "update_cart_quantity"
  | "clear_cart"
  | "view_cart"
  // Wishlist events
  | "add_to_wishlist"
  | "remove_from_wishlist"
  // Order events
  | "checkout_start"
  | "order_create"
  | "order_complete"
  | "order_cancel"
  // Auth events
  | "login"
  | "logout"
  | "signup"
  | "password_reset_request"
  | "password_reset_complete"
  // Upload order events
  | "upload_order_create"
  | "upload_order_view"
  // Error events
  | "error"
  | "api_error"
  | "network_error"
  // User activity
  | "user_activity_track";

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  params?: Record<string, unknown>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

interface AnalyticsConfig {
  enabled: boolean;
  debugMode: boolean;
  flushIntervalMs: number;
  maxQueueSize: number;
}

const STORAGE_KEY = "analytics_queue";
const SESSION_ID_KEY = "analytics_session_id";

/**
 * Analytics Service
 *
 * Provides event tracking with offline support:
 * - Queues events locally
 * - Flushes to server when online
 * - Supports user identification
 */
class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private config: AnalyticsConfig = {
    enabled: true,
    debugMode: __DEV__,
    flushIntervalMs: 60000, // 1 minute
    maxQueueSize: 100,
  };
  private userId: string | null = null;
  private sessionId: string = "";
  private flushInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  /**
   * Initialize the analytics service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load pending events from storage
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.events = JSON.parse(stored);
        if (this.config.debugMode) {
          console.log("[Analytics] Loaded", this.events.length, "queued events");
        }
      }

      // Get or create session ID
      let sessionId = await AsyncStorage.getItem(SESSION_ID_KEY);
      if (!sessionId) {
        sessionId = this.generateSessionId();
        await AsyncStorage.setItem(SESSION_ID_KEY, sessionId);
      }
      this.sessionId = sessionId;

      // Start periodic flush
      this.startFlushInterval();

      // Flush on app background
      this.setupAppStateListener();

      this.isInitialized = true;
      if (this.config.debugMode) {
        console.log("[Analytics] Initialized with session:", this.sessionId);
      }
    } catch (error) {
      console.error("[Analytics] Initialization failed:", error);
    }
  }

  /**
   * Set the current user ID
   */
  setUserId(userId: string | null): void {
    this.userId = userId;
    if (this.config.debugMode) {
      console.log("[Analytics] User ID set:", userId);
    }
  }

  /**
   * Enable or disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Set debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.config.debugMode = enabled;
  }

  /**
   * Track an event
   */
  track(name: AnalyticsEventName, params?: Record<string, unknown>): void {
    if (!this.config.enabled) return;

    const event: AnalyticsEvent = {
      name,
      params: {
        ...params,
        platform: Platform.OS,
        appVersion: "1.0.0", // Could be dynamic
      },
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId || undefined,
    };

    this.events.push(event);

    // Log in debug mode
    if (this.config.debugMode) {
      console.log("[Analytics] Track:", name, params || "");
    }

    // Persist events
    this.persistEvents();

    // Flush if queue is full
    if (this.events.length >= this.config.maxQueueSize) {
      this.flush();
    }
  }

  /**
   * Track a screen view
   */
  trackScreenView(screenName: string, params?: Record<string, unknown>): void {
    this.track("screen_view", {
      screen_name: screenName,
      ...params,
    });
  }

  /**
   * Track an error
   */
  trackError(error: Error, context?: Record<string, unknown>): void {
    this.track("error", {
      error_message: error.message,
      error_name: error.name,
      error_stack: error.stack?.substring(0, 500), // Truncate stack
      ...context,
    });
  }

  /**
   * Track an API error
   */
  trackApiError(
    endpoint: string,
    status: number,
    message: string,
    context?: Record<string, unknown>
  ): void {
    this.track("api_error", {
      endpoint,
      status,
      error_message: message,
      ...context,
    });
  }

  /**
   * Flush queued events to server
   */
  async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];

    try {
      // In a real implementation, send to your analytics endpoint
      // For now, we'll just log and clear
      if (this.config.debugMode) {
        console.log("[Analytics] Flushing", eventsToSend.length, "events");
      }

      // Example: Send to server
      // await apiClient.post("/api/analytics/events", { events: eventsToSend });

      // Clear sent events
      this.events = [];
      await this.persistEvents();
    } catch (error) {
      // On failure, events remain in queue for next flush
      console.error("[Analytics] Flush failed:", error);

      // Restore events on failure
      this.events = eventsToSend;
    }
  }

  /**
   * Get pending event count
   */
  getPendingEventCount(): number {
    return this.events.length;
  }

  /**
   * Clear all pending events
   */
  async clearPendingEvents(): Promise<void> {
    this.events = [];
    await AsyncStorage.removeItem(STORAGE_KEY);
  }

  // Private methods

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private async persistEvents(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.events));
    } catch (error) {
      console.error("[Analytics] Failed to persist events:", error);
    }
  }

  private startFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.config.flushIntervalMs);
  }

  private setupAppStateListener(): void {
    AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        // Flush when app goes to background
        this.flush();
      }
    });
  }
}

// Singleton instance
export const analytics = new AnalyticsService();

export default analytics;
