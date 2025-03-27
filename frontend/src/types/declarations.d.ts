import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
  
  interface Window {
    localStorage: Storage;
  }
}

// Add missing React types
declare module 'react' {
  interface CSSProperties {
    [key: string]: any;
  }
  
  interface HTMLAttributes<T> {
    [key: string]: any;
  }
}

// Declare types for modules that might not have type definitions
declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.png' {
  const content: any;
  export default content;
}

declare module '*.jpg' {
  const content: any;
  export default content;
}

// Ensure the file is treated as a module
export {};
