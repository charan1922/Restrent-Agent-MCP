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
   * Initialize the client verify connection
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log(`Connecting to Chef Agent at ${this.chefAgentUrl}...`);
      // Simple health check to verify connection
      const isHealthy = await this.healthCheck();
      
      if (isHealthy) {
        this.initialized = true;
        console.log(`✅ Connected to Chef Agent at ${this.chefAgentUrl}`);
      } else {
        throw new Error("Health check failed");
      }
    } catch (error) {
      console.warn(`⚠️ Failed to connect to Chef Agent: ${(error as Error).message}`);
      // We don't throw here to allow partial startup, but functionality will be degraded
    }
  }

  /**
   * Send a message to the Chef Agent (Direct HTTP Mode with JSON-RPC 2.0)
   */
  private async sendMessage(
    method: string,
    params: any,
    tenantId: string
  ): Promise<any> {
    const targetUrl = `${this.chefAgentUrl}/api/a2a`;
    const requestId = crypto.randomUUID();

    const request = {
      jsonrpc: "2.0",
      method,
      params,
      id: requestId,
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.retryConfig.maxAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.retryConfig.timeoutMs);

        console.log(`[DEBUG ChefClient] Sending ${method} with tenantId: ${tenantId}`);
        const response = await fetch(targetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-tenant-id": tenantId,
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
        
        // JSON-RPC Error Handling
        if (validatedResponse.error) {
          throw new Error(`Chef Agent Error (${validatedResponse.error.code}): ${validatedResponse.error.message}`);
        }

        this.isHealthy = true;
        this.lastHealthCheck = Date.now();
        
        return validatedResponse.result;
      } catch (error) {
        lastError = error as Error;
        console.error(
          `Error communicating with Chef Agent at ${targetUrl} (method: ${method}, attempt ${attempt + 1}/${this.retryConfig.maxAttempts}):`,
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


  /**
   * Place an order with the Chef Agent
   */
  async placeOrder(order: Order, tenantId: string): Promise<OrderStatusResponse> {
    const result = await this.sendMessage("placeOrder", order, tenantId);
    return result as OrderStatusResponse;
  }

  /**
   * Request the status of an order from the Chef Agent
   */
  async requestOrderStatus(orderId: string, tenantId: string): Promise<OrderStatusResponse> {
    const result = await this.sendMessage("getOrderStatus", { orderId }, tenantId);
    return result as OrderStatusResponse;
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, tenantId: string): Promise<void> {
    await this.sendMessage("cancelOrder", { orderId }, tenantId);
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
    // this.client = null; // Removed as A2AClient is no longer used
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
