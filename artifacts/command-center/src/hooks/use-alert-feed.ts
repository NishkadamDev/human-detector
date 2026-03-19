import { useState, useEffect, useRef } from "react";

export type AlertEntry = {
  id: string;
  message: string;
  timestamp: Date;
};

export function useAlertFeed() {
  const [alerts, setAlerts] = useState<AlertEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const streamUrl = `${import.meta.env.BASE_URL}api/alert/stream`.replace("//", "/");
    const es = new EventSource(streamUrl);
    esRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as { message: string; timestamp: string };
        setAlerts((prev) => [
          {
            id: crypto.randomUUID(),
            message: data.message,
            timestamp: new Date(data.timestamp),
          },
          ...prev,
        ]);
      } catch {
        // ignore malformed events
      }
    };

    es.onerror = () => {
      setConnected(false);
    };

    return () => {
      es.close();
      esRef.current = null;
      setConnected(false);
    };
  }, []);

  return { alerts, connected };
}
