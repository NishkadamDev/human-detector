import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";

const PI_URL = "https://medicinable-del-nonabsolutely.ngrok-free.dev";

export type LogEntry = {
  id: string;
  timestamp: Date;
  type: "PING" | "MSG";
  status: "SUCCESS" | "ERROR";
  raw: string;
};

export type ConnectionStatus = "UNKNOWN" | "ONLINE" | "OFFLINE" | "ERROR";

export function useCommandCenter() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("UNKNOWN");

  const addLog = useCallback((type: "PING" | "MSG", status: "SUCCESS" | "ERROR", raw: string) => {
    setLogs(prev => [
      {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        type,
        status,
        raw,
      },
      ...prev,
    ]);
  }, []);

  const pingMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${PI_URL}/ping`, {
        headers: { 'ngrok-skip-browser-warning': 'true' },
        signal: AbortSignal.timeout(5000),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
      return text;
    },
    onSuccess: (data) => {
      setConnectionStatus("ONLINE");
      addLog("PING", "SUCCESS", data);
    },
    onError: (error: unknown) => {
      setConnectionStatus("ERROR");
      const msg = error instanceof Error ? error.message : String(error);
      addLog("PING", "ERROR", msg);
    },
  });

  const messageMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch(`${PI_URL}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json", 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ message, sender: "Dashboard" }),
        signal: AbortSignal.timeout(5000),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
      return text;
    },
    onSuccess: (data) => {
      addLog("MSG", "SUCCESS", data);
    },
    onError: (error: unknown) => {
      const msg = error instanceof Error ? error.message : String(error);
      addLog("MSG", "ERROR", msg);
    },
  });

  return {
    logs,
    connectionStatus,
    ping: () => pingMutation.mutate(),
    isPinging: pingMutation.isPending,
    sendMsg: (msg: string) => messageMutation.mutate(msg),
    isSending: messageMutation.isPending,
  };
}
