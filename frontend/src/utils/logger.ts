/**
 * TrueConnect Frontend Logging Utility
 * 
 * Provides structured console logging for frontend debugging with styled
 * and collapsible groups for better readability.
 */

type LogLevel = 'info' | 'success' | 'warning' | 'error' | 'debug';

interface LogOptions {
  context?: string;
  data?: any;
  showTimestamp?: boolean;
  expandData?: boolean;
  // Additional properties for more detailed logging
  status?: number;
  error?: any;
  userId?: string | number;
}

const defaultOptions: LogOptions = {
  context: 'App',
  showTimestamp: true,
  expandData: false
};

// Color codes for different log levels
const COLORS = {
  info: '#3498db',     // Blue
  success: '#2ecc71',  // Green
  warning: '#f39c12',  // Orange
  error: '#e74c3c',    // Red
  debug: '#9b59b6'     // Purple
};

// Background for log level
const BG_COLORS = {
  info: '#edf8ff',     // Light blue
  success: '#efffef',  // Light green
  warning: '#fff7e6',  // Light orange
  error: '#ffebee',    // Light red
  debug: '#f3e5f5'     // Light purple
};

/**
 * Main logging function
 */
function log(level: LogLevel, message: string, options: LogOptions = {}): void {
  const { context, data, showTimestamp, expandData } = { ...defaultOptions, ...options };
  
  // Skip debug logs in production unless explicitly enabled
  if (level === 'debug' && process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGS) {
    return;
  }
  
  const timestamp = showTimestamp ? new Date().toISOString() : '';
  const prefix = context ? `[${context}]` : '';
  
  // Style for the log level badge
  const badgeStyles = [
    `color: white`,
    `background-color: ${COLORS[level]}`,
    'padding: 2px 6px',
    'border-radius: 3px',
    'font-weight: bold',
    'text-transform: uppercase',
    'font-size: 10px'
  ].join(';');
  
  // Style for context
  const contextStyles = [
    `color: ${COLORS[level]}`,
    'font-weight: bold'
  ].join(';');
  
  // Style for message
  const messageStyles = [
    `color: #333`,
    `background: ${BG_COLORS[level]}`,
    'padding: 4px 8px',
    'border-radius: 3px',
    'margin-left: 4px'
  ].join(';');
  
  // Style for timestamp
  const timeStyles = 'color: #999; font-size: 0.8em;';
  
  // Create a grouped log for better organization
  if (data && expandData) {
    console.group(`%c ${level} %c ${prefix} %c ${message} %c ${timestamp}`, badgeStyles, contextStyles, messageStyles, timeStyles);
    console.log('📋 Details:', data);
    console.groupEnd();
  } else if (data) {
    console.groupCollapsed(`%c ${level} %c ${prefix} %c ${message} %c ${timestamp}`, badgeStyles, contextStyles, messageStyles, timeStyles);
    console.log('📋 Details:', data);
    console.groupEnd();
  } else {
    console.log(`%c ${level} %c ${prefix} %c ${message} %c ${timestamp}`, badgeStyles, contextStyles, messageStyles, timeStyles);
  }
}

// Create specific logging functions for each log level
const logger = {
  /**
   * Log informational messages
   */
  info(message: string, options?: LogOptions): void {
    log('info', message, options);
  },
  
  /**
   * Log success messages
   */
  success(message: string, options?: LogOptions): void {
    log('success', message, options);
  },
  
  /**
   * Log warning messages
   */
  warn(message: string, options?: LogOptions): void {
    log('warning', message, options);
  },
  
  /**
   * Log error messages
   */
  error(message: string, options?: LogOptions): void {
    log('error', message, options);
  },
  
  /**
   * Log debug messages (only in development or when enabled)
   */
  debug(message: string, options?: LogOptions): void {
    log('debug', message, options);
  },
  
  /**
   * Log API request information
   */
  apiRequest(method: string, url: string, data?: any): void {
    log('info', `${method} ${url}`, {
      context: 'API',
      data
    });
  },
  
  /**
   * Log API response information
   */
  apiResponse(method: string, url: string, status: number, data?: any): void {
    const level = status >= 400 ? 'error' : 'success';
    log(level, `${method} ${url} [${status}]`, {
      context: 'API',
      data,
      expandData: status >= 400 // Auto-expand on error
    });
  },
  
  /**
   * Log authentication events
   */
  auth(action: string, details?: any, isError = false): void {
    log(isError ? 'error' : 'info', action, {
      context: 'Auth',
      data: details,
      expandData: isError // Auto-expand on error
    });
  },
  
  /**
   * Create a logger for a specific context
   */
  createContextLogger(context: string) {
    return {
      info: (message: string, options?: LogOptions) => 
        log('info', message, { ...options, context }),
      success: (message: string, options?: LogOptions) => 
        log('success', message, { ...options, context }),
      warn: (message: string, options?: LogOptions) => 
        log('warning', message, { ...options, context }),
      error: (message: string, options?: LogOptions) => 
        log('error', message, { ...options, context }),
      debug: (message: string, options?: LogOptions) => 
        log('debug', message, { ...options, context })
    };
  }
};

export default logger;
