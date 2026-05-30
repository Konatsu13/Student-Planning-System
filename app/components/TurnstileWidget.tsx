'use client';

import { useEffect, useRef, useState } from 'react';

interface TurnstileWidgetProps {
  onTokenChange: (token: string) => void;
  onError?: (error: string) => void;
}

export default function TurnstileWidget({ onTokenChange, onError }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load Turnstile script if not already loaded
    if ((window as any).turnstile) {
      initTurnstile();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initTurnstile();
    };
    script.onerror = () => {
      setIsLoading(false);
      onError?.('Failed to load Turnstile');
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [onError]);

  const initTurnstile = () => {
    if (!containerRef.current || !window.turnstile) return;

    try {
      (window as any).turnstile.render('#turnstile-container', {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAADZ3Z3UjPdFcTLBT',
        theme: 'light',
        callback: (token: string) => {
          onTokenChange(token);
        },
        'error-callback': () => {
          onError?.('Turnstile verification failed');
        },
      });
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      onError?.('Failed to initialize Turnstile');
    }
  };

  return (
    <div className="mb-4">
      <div
        ref={containerRef}
        id="turnstile-container"
        className="flex justify-center"
      >
        {isLoading && (
          <div className="text-sm text-gray-500">Loading security check...</div>
        )}
      </div>
    </div>
  );
}

declare global {
  interface Window {
    turnstile: {
      render: (selector: string, options: any) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string | undefined;
    };
  }
}
