/**
 * Security Utilities for DoS Protection and Safe Operations
 */

// Transaction queue management for DoS prevention
class TransactionQueue {
  private static instance: TransactionQueue;
  private pendingTransactions: Set<string> = new Set();
  private readonly MAX_PENDING = 5;
  private readonly TIMEOUT_MS = 60000; // 60 seconds

  private constructor() {}

  static getInstance(): TransactionQueue {
    if (!TransactionQueue.instance) {
      TransactionQueue.instance = new TransactionQueue();
    }
    return TransactionQueue.instance;
  }

  /**
   * Add transaction to queue with DoS protection
   */
  addTransaction(txHash: string): void {
    if (this.pendingTransactions.size >= this.MAX_PENDING) {
      throw new Error(
        `Too many pending transactions (${this.MAX_PENDING} max). Please wait for current transactions to complete.`
      );
    }

    this.pendingTransactions.add(txHash);

    // Auto-cleanup after timeout
    setTimeout(() => {
      this.removeTransaction(txHash);
    }, this.TIMEOUT_MS);
  }

  /**
   * Remove transaction from queue
   */
  removeTransaction(txHash: string): void {
    this.pendingTransactions.delete(txHash);
  }

  /**
   * Get current queue size
   */
  getQueueSize(): number {
    return this.pendingTransactions.size;
  }

  /**
   * Check if can add more transactions
   */
  canAddTransaction(): boolean {
    return this.pendingTransactions.size < this.MAX_PENDING;
  }
}

// Export singleton instance
export const txQueue = TransactionQueue.getInstance();

/**
 * Rate limiter for preventing spam
 */
class RateLimiter {
  private actionTimestamps: Map<string, number> = new Map();
  private readonly COOLDOWN_MS = 1000; // 1 second default

  /**
   * Check if action is allowed (not rate limited)
   */
  isAllowed(action: string, cooldownMs: number = this.COOLDOWN_MS): boolean {
    const now = Date.now();
    const lastAction = this.actionTimestamps.get(action);

    if (!lastAction || now - lastAction >= cooldownMs) {
      this.actionTimestamps.set(action, now);
      return true;
    }

    return false;
  }

  /**
   * Get remaining cooldown time in milliseconds
   */
  getRemainingCooldown(action: string, cooldownMs: number = this.COOLDOWN_MS): number {
    const now = Date.now();
    const lastAction = this.actionTimestamps.get(action);

    if (!lastAction) {
      return 0;
    }

    const elapsed = now - lastAction;
    return Math.max(0, cooldownMs - elapsed);
  }

  /**
   * Clear cooldown for action
   */
  reset(action: string): void {
    this.actionTimestamps.delete(action);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Input validation and sanitization
 */
export const sanitizeInput = {
  /**
   * Validate and sanitize numeric input
   */
  number: (value: string | number, min = 0, max = Number.MAX_SAFE_INTEGER): number => {
    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num) || !isFinite(num)) {
      throw new Error('Invalid number input');
    }

    if (num < min || num > max) {
      throw new Error(`Number must be between ${min} and ${max}`);
    }

    return num;
  },

  /**
   * Validate and sanitize string input
   */
  string: (value: string, maxLength = 1000): string => {
    if (typeof value !== 'string') {
      throw new Error('Input must be a string');
    }

    if (value.length > maxLength) {
      throw new Error(`String exceeds maximum length of ${maxLength}`);
    }

    // Remove potential XSS patterns
    return value
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .trim();
  },

  /**
   * Validate Ethereum address
   */
  address: (value: string): string => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
      throw new Error('Invalid Ethereum address format');
    }
    return value.toLowerCase();
  },

  /**
   * Validate array length for batch operations
   */
  arrayLength: (arr: unknown[], maxLength = 100): void => {
    if (!Array.isArray(arr)) {
      throw new Error('Input must be an array');
    }

    if (arr.length > maxLength) {
      throw new Error(`Array length exceeds maximum of ${maxLength}`);
    }

    if (arr.length === 0) {
      throw new Error('Array cannot be empty');
    }
  },
};

/**
 * Safe transaction execution with timeout and error handling
 */
export async function safeTransaction<T>(
  txPromise: Promise<T>,
  timeoutMs = 60000
): Promise<T> {
  return Promise.race([
    txPromise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Transaction timeout exceeded')), timeoutMs)
    ),
  ]);
}

/**
 * Debounce function for preventing rapid repeated calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func.apply(this, args);
    }, waitMs);
  };
}

/**
 * Throttle function for rate limiting
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let lastRun = 0;

  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now();

    if (now - lastRun >= limitMs) {
      func.apply(this, args);
      lastRun = now;
    }
  };
}

/**
 * Gas estimation safety wrapper
 */
export async function estimateGasSafely(
  gasEstimate: () => Promise<bigint>,
  maxGasLimit = 5000000n
): Promise<bigint> {
  try {
    const estimate = await gasEstimate();

    // Add 20% buffer for safety
    const buffered = (estimate * 120n) / 100n;

    // Cap at maximum gas limit (DoS protection)
    if (buffered > maxGasLimit) {
      throw new Error(
        `Estimated gas (${buffered}) exceeds maximum limit (${maxGasLimit}). Possible DoS attack or inefficient contract.`
      );
    }

    return buffered;
  } catch (error) {
    throw new Error(`Gas estimation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      if (attempt < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s, 8s...
        const delay = baseDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`Operation failed after ${maxRetries} attempts: ${lastError?.message}`);
}

/**
 * Memory-safe array chunking for large datasets
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) {
    throw new Error('Chunk size must be positive');
  }

  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }

  return chunks;
}

/**
 * Security headers for development server
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
} as const;

/**
 * Content Security Policy (CSP) configuration
 */
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"], // unsafe-inline needed for Vite in dev
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': ["'self'", 'wss:', 'https:'],
  'font-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
} as const;

/**
 * Generate CSP header string
 */
export function generateCSP(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
}
