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
 * Handles all communication with the external Chef Agent using the A2A protocol
 * Chef Agent runs on port 5555 as a standalone service
 */
export class ChefAgentClient {
  private chefAgentUrl: string;
  private initialized: boolean = false;
  private retryConfig: RetryConfig;
  private lastHealthCheck: number = 0;
  private isHealthy: boolean = false;

  constructor(chefAgentUrl?: string, retryConfig?: Partial<RetryConfig>) {
    // Chef Agent now runs as external service on port 5555
    this.chefAgentUrl =
      chefAgentUrl ||
      process.env.CHEF_AGENT_URL ||
      "http://localhost:5555";
    
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
   * Send a message to the Chef Agent (Direct HTTP Mode for Internal Server)
   */
  private async sendMessage(
    request: ChefAgentRequest
  ): Promise<ChefAgentResponse> {
    // Use external Chef Agent on port 5555
    const targetUrl = `${this.chefAgentUrl}/api/a2a`;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.retryConfig.maxAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.retryConfig.timeoutMs);

        const response = await fetch(targetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-tenant-id": process.env.TENANT_ID || "tenant-pista-house",
          },
          body: JSON.stringify(request),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
           const errorText = await response.text();
           throw new Error(`Chef Agent returned ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const validatedResponse = ChefAgentResponseSchema.parse(data);
        
        this.isHealthy = true;
        this.lastHealthCheck = Date.now();
        
        return validatedResponse;
      } catch (error) {
        lastError = error as Error;
        console.error(
          `Error communicating with Chef Agent at ${targetUrl} (attempt ${attempt + 1}/${this.retryConfig.maxAttempts}):`,
          error
        );

        if (attempt < this.retryConfig.maxAttempts - 1) {
          const delay = this.getBackoffDelay(attempt);
          await this.sleep(delay);
        }
      }
    }

    this.isHealthy = false;
    throw lastError || new Error("Failed to communicate with Chef Agent");
  }

  // A2A Protocol methods removed/suspended in favor of direct internal link for reliability
  async initialize(): Promise<void> {
      // No-op for direct mode
      this.initialized = true;
      return Promise.resolve();
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
