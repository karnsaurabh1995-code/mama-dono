'use client';

import { useEffect, useRef } from 'react';

/**
 * CLIENT-SIDE REALTIME SYNCHRONIZATION HOOK
 *
 * Connects to the platform's Server-Sent Events (SSE) stream.
 * Automatically triggers callbacks when administrative updates (settings, team, curation)
 * occur in other browser sessions, eliminating the need to reload or redeploy.
 */

export function useRealtimeSync(onUpdate?: (event: string, data: any) => void) {
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let eventSource: EventSource | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;

    function connect() {
      try {
        eventSource = new EventSource('/api/realtime/updates');

        eventSource.onopen = () => {
          // Connected successfully
        };

        const handleEvent = (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            if (callbackRef.current) {
              callbackRef.current(e.type, data);
            }
          } catch {
            // Non-JSON ping
          }
        };

        eventSource.addEventListener('site_settings_updated', handleEvent);
        eventSource.addEventListener('homepage_curation_updated', handleEvent);
        eventSource.addEventListener('employee_updated', handleEvent);
        eventSource.addEventListener('employee_created', handleEvent);
        eventSource.addEventListener('employee_deleted', handleEvent);
        eventSource.addEventListener('gateway_updated', handleEvent);
        eventSource.addEventListener('api_keys_updated', handleEvent);

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Exponential backoff reconnect
          reconnectTimer = setTimeout(connect, 5000);
        };
      } catch (err) {
        console.warn('[useRealtimeSync] Connection initialization failed:', err);
      }
    }

    connect();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (eventSource) eventSource.close();
    };
  }, []);
}
