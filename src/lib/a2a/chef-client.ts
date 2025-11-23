import { A2AClient } from "@a2a-js/sdk/client";
import type { Message, MessageSendParams } from "@a2a-js/sdk";
import { v4 as uuidv4 } from "uuid";
import {
  type Order,
  type OrderStatusResponse,
  type ChefAgentRequest,
  type ChefAgentResponse,
  ChefAgentResponseSchema,
} from "./schema";

/**
 * Configuration for retry logic
 */
interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  timeoutMs: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  timeoutMs: 30000,
};

/**
 * Chef Agent A2A Client
 * Handles all communication with the Chef Agent using the A2A protocol
 * with retry logic, timeout handling, and graceful degradation
 */
export class ChefAgentClient {
  private client: A2AClient | null = null;
  private chefAgentUrl: string;
  private initialized: boolean = false;
  private retryConfig: RetryConfig;
  private lastHealthCheck: number = 0;
  private isHealthy: boolean = false;

  constructor(chefAgentUrl?: string, retryConfig?: Partial<RetryConfig>) {
    this.chefAgentUrl =
      chefAgentUrl ||
      process.env.CHEF_AGENT_URL ||
      "http://localhost:5000"; // Default chef agent URL
    
    this.retryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      ...retryConfig,
    };
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Calculate exponential backoff delay
   */
  private getBackoffDelay(attempt: number): number {
    const delay = this.retryConfig.initialDelayMs * Math.pow(2, attempt);
    return Math.min(delay, this.retryConfig.maxDelayMs);
  }

  /**
   * Initialize the A2A client by fetching the Chef Agent's card
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.retryConfig.maxAttempts; attempt++) {
      try {
        const cardUrl = `${this.chefAgentUrl}/.well-known/agent-card.json`;
        
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("Connection timeout")),
            this.retryConfig.timeoutMs
          )
        );

        // Race between connection and timeout
        this.client = await Promise.race([
          A2AClient.fromCardUrl(cardUrl),
          timeoutPromise,
        ]);

        this.initialized = true;
        this.isHealthy = true;
        this.lastHealthCheck = Date.now();
        console.log(`✅ Connected to Chef Agent via A2A protocol at ${this.chefAgentUrl}`);
        return;
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `⚠️ Failed to connect to Chef Agent (attempt ${attempt + 1}/${this.retryConfig.maxAttempts}):`,
          error
        );

        if (attempt < this.retryConfig.maxAttempts - 1) {
          const delay = this.getBackoffDelay(attempt);
          console.log(`⏳ Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    this.isHealthy = false;
    throw new Error(
      `Could not connect to Chef Agent at ${this.chefAgentUrl} after ${this.retryConfig.maxAttempts} attempts: ${lastError?.message}`
    );
  }

  /**
   * Send a message to the Chef Agent and get a response with retry logic
   */
  private async sendMessage(
    request: ChefAgentRequest
  ): Promise<ChefAgentResponse> {
    if (!this.client) {
      await this.initialize();
    }

    if (!this.client) {
      throw new Error("Chef Agent client not initialized");
    }

    const message: Message = {
      messageId: uuidv4(),
      role: "user",
      kind: "message",
      parts: [
        {
          kind: "text",
          text: JSON.stringify(request),
        },
      ],
    };

    const sendParams: MessageSendParams = {
      message,
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.retryConfig.maxAttempts; attempt++) {
      try {
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("Request timeout")),
            this.retryConfig.timeoutMs
          )
        );

        // Race between request and timeout
        const response = await Promise.race([
          this.client.sendMessage(sendParams),
          timeoutPromise,
        ]);

        if ("error" in response) {
          throw new Error(response.error.message);
        }

        const result = response.result as Message;
        const textPart = result.parts.find((p) => p.kind === "text");

        if (!textPart || textPart.kind !== "text") {
          throw new Error("Invalid response from Chef Agent");
        }

        const parsedResponse = JSON.parse(textPart.text);
        const validatedResponse = ChefAgentResponseSchema.parse(parsedResponse);
        
        this.isHealthy = true;
        this.lastHealthCheck = Date.now();
        
        return validatedResponse;
      } catch (error) {
        lastError = error as Error;
        console.error(
          `Error communicating with Chef Agent (attempt ${attempt + 1}/${this.retryConfig.maxAttempts}):`,
          error
        );

        if (attempt < this.retryConfig.maxAttempts - 1) {
          const delay = this.getBackoffDelay(attempt);
          console.log(`⏳ Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    this.isHealthy = false;
    throw lastError || new Error("Failed to communicate with Chef Agent");
  }

  /**
   * Place an order with the Chef Agent
   */
  async placeOrder(order: Order): Promise<OrderStatusResponse> {
    const request: ChefAgentRequest = {
      type: "PLACE_ORDER",
      payload: order,
    };

    const response = await this.sendMessage(request);

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to place order with Chef");
    }

    return response.data as OrderStatusResponse;
  }

  /**
   * Request the status of an order from the Chef Agent
   */
  async requestOrderStatus(orderId: string): Promise<OrderStatusResponse> {
    const request: ChefAgentRequest = {
      type: "REQUEST_STATUS",
      payload: { orderId },
    };

    const response = await this.sendMessage(request);

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to get order status");
    }

    return response.data as OrderStatusResponse;
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<void> {
    const request: ChefAgentRequest = {
      type: "CANCEL_ORDER",
      payload: { orderId },
    };

    const response = await this.sendMessage(request);

    if (!response.success) {
      throw new Error(response.error || "Failed to cancel order");
    }
  }

  /**
   * Check if the Chef Agent is reachable
   * Uses cached health status if checked recently (within 30 seconds)
   */
  async healthCheck(): Promise<boolean> {
    const now = Date.now();
    const cacheValidMs = 30000; // 30 seconds

    // Return cached status if recent
    if (now - this.lastHealthCheck < cacheValidMs) {
      return this.isHealthy;
    }

    try {
      await this.initialize();
      this.isHealthy = true;
      this.lastHealthCheck = now;
      return true;
    } catch {
      this.isHealthy = false;
      this.lastHealthCheck = now;
      return false;
    }
  }

  /**
   * Get the current health status without making a network call
   */
  getHealthStatus(): {
    isHealthy: boolean;
    lastCheck: number;
    url: string;
  } {
    return {
      isHealthy: this.isHealthy,
      lastCheck: this.lastHealthCheck,
      url: this.chefAgentUrl,
    };
  }

  /**
   * Reset the client connection (useful for reconnection scenarios)
   */
  async reset(): Promise<void> {
    this.client = null;
    this.initialized = false;
    this.isHealthy = false;
    this.lastHealthCheck = 0;
    console.log("🔄 Chef Agent client reset");
  }
}

// Singleton instance for the application
let chefClientInstance: ChefAgentClient | null = null;

/**
 * Get the singleton Chef Agent client instance
 */
export function getChefAgentClient(): ChefAgentClient {
  if (!chefClientInstance) {
    chefClientInstance = new ChefAgentClient();
  }
  return chefClientInstance;
}

/**
 * Reset the singleton instance (useful for testing or reconnection)
 */
export function resetChefAgentClient(): void {
  chefClientInstance = null;
}
