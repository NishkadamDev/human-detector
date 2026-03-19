import React, { useState, useRef } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  Terminal, 
  Activity, 
  Send, 
  RadioTower, 
  Wifi, 
  WifiOff, 
  AlertTriangle,
  Server,
  Zap,
  BellRing,
  Circle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCommandCenter } from "@/hooks/use-command-center";
import { useAlertFeed } from "@/hooks/use-alert-feed";
import { TerminalPanel } from "@/components/TerminalPanel";
import { TerminalButton } from "@/components/TerminalButton";

export default function Dashboard() {
  const { logs, connectionStatus, ping, isPinging, sendMsg, isSending } = useCommandCenter();
  const { alerts, connected: alertConnected } = useAlertFeed();
  const [message, setMessage] = useState("");
  const logEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMsg(message);
    setMessage("");
  };

  const getStatusDisplay = () => {
    switch (connectionStatus) {
      case "ONLINE":
        return { label: "SYS.ONLINE", color: "text-primary glow-text", icon: <Wifi className="w-5 h-5" /> };
      case "OFFLINE":
        return { label: "SYS.OFFLINE", color: "text-muted-foreground", icon: <WifiOff className="w-5 h-5" /> };
      case "ERROR":
        return { label: "SYS.ERROR", color: "text-destructive glow-text-error", icon: <AlertTriangle className="w-5 h-5" /> };
      default:
        return { label: "SYS.UNKNOWN", color: "text-muted-foreground", icon: <Activity className="w-5 h-5" /> };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-border/50 pb-4 gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-primary glow-text flex items-center gap-4">
            <Terminal className="w-10 h-10 md:w-12 md:h-12" />
            PRO-BUILDER
          </h1>
          <p className="text-muted-foreground tracking-widest uppercase mt-2 text-sm md:text-base">
            Command Center Interface v1.0.0
          </p>
        </div>
        
        <div className="flex flex-col items-start md:items-end text-sm md:text-base bg-card/30 p-3 border border-border glow-box">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <RadioTower className="w-4 h-4" /> TARGET IP: <span className="text-primary font-bold">medicinable-del-nonabsolutely.ngrok-free.dev</span>
          </div>
          <div className={`flex items-center gap-2 font-bold ${statusDisplay.color}`}>
            {statusDisplay.icon}
            {statusDisplay.label}
            {connectionStatus === 'ONLINE' && <span className="w-3 h-3 bg-primary rounded-full blink ml-2" />}
            {connectionStatus === 'ERROR' && <span className="w-3 h-3 bg-destructive rounded-full blink ml-2" />}
          </div>
        </div>
      </header>

      {/* MAIN CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PING PANEL */}
        <TerminalPanel title="System Diagnostics" icon={<Server className="w-5 h-5" />}>
          <div className="flex-1 flex flex-col justify-center items-center py-8 text-center gap-6">
            <div className="relative w-32 h-32 flex items-center justify-center border-2 border-dashed border-border rounded-full">
              {isPinging ? (
                <Zap className="w-12 h-12 text-primary animate-pulse glow-text" />
              ) : connectionStatus === "ONLINE" ? (
                <Wifi className="w-12 h-12 text-primary glow-text" />
              ) : connectionStatus === "ERROR" ? (
                <WifiOff className="w-12 h-12 text-destructive glow-text-error" />
              ) : (
                <RadioTower className="w-12 h-12 text-muted-foreground" />
              )}
              {isPinging && (
                <div className="absolute inset-0 rounded-full border border-primary animate-ping opacity-50" />
              )}
            </div>
            
            <p className="text-muted-foreground max-w-[250px]">
              Execute ICMP diagnostic sweep to verify remote hardware availability and latency.
            </p>
            
            <TerminalButton 
              onClick={ping} 
              isLoading={isPinging}
              className="w-full sm:w-auto min-w-[200px]"
            >
              Initiate System Ping
            </TerminalButton>
          </div>
        </TerminalPanel>

        {/* MESSAGE COMPOSER */}
        <TerminalPanel title="Message Uplink" icon={<Send className="w-5 h-5" />}>
          <form onSubmit={handleSendMessage} className="flex-1 flex flex-col justify-between gap-4 py-4">
            <div className="flex-1 flex flex-col gap-2">
              <label htmlFor="payload" className="text-primary text-sm tracking-widest uppercase">
                &gt; Enter Payload Data
              </label>
              <textarea
                id="payload"
                ref={inputRef as any}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full flex-1 min-h-[150px] bg-black/50 border border-border p-4 text-primary placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 resize-none font-mono"
                disabled={isSending}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <p className="text-xs text-muted-foreground flex justify-between">
                <span>Sender ID: Dashboard</span>
                <span>Press Enter to send</span>
              </p>
            </div>
            
            <div className="flex justify-end">
              <TerminalButton 
                type="submit" 
                isLoading={isSending} 
                disabled={!message.trim()}
                className="w-full sm:w-auto min-w-[200px]"
              >
                Transmit Payload
              </TerminalButton>
            </div>
          </form>
        </TerminalPanel>
      </div>

      {/* ALERT FEED + RESPONSE LOG side by side on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LIVE ALERT FEED */}
        <TerminalPanel
          title="Live Alert Feed"
          icon={<BellRing className="w-5 h-5" />}
          className="min-h-[350px]"
        >
          {/* Connection status badge */}
          <div className="flex items-center gap-2 pb-2 border-b border-border/40 mb-2">
            <Circle
              className={cn(
                "w-2.5 h-2.5 fill-current",
                alertConnected ? "text-green-400" : "text-muted-foreground"
              )}
            />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              {alertConnected ? "Stream Active" : "Connecting..."}
            </span>
            {alerts.length > 0 && (
              <span className="ml-auto text-xs text-primary border border-primary/40 px-2 py-0.5">
                {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-[250px]">
            <AnimatePresence initial={false}>
              {alerts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex items-center justify-center text-muted-foreground flex-col gap-2 py-10"
                >
                  <BellRing className="w-8 h-8 opacity-30" />
                  <p className="uppercase tracking-widest text-sm text-center">
                    Listening for alerts...
                    <br />
                    <span className="text-xs opacity-60">POST /api/alert to trigger</span>
                  </p>
                </motion.div>
              ) : (
                alerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: -8, backgroundColor: "rgba(204,85,0,0.25)" }}
                    animate={{ opacity: 1, y: 0, backgroundColor: "rgba(0,0,0,0)" }}
                    transition={{ duration: 0.4 }}
                    className="border-l-2 border-primary pl-3 py-2 border-b border-border/20"
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs text-muted-foreground shrink-0">
                        [{format(alert.timestamp, "HH:mm:ss")}]
                      </span>
                      <span className="w-2 h-2 bg-primary rounded-full blink shrink-0" />
                      <span className="text-xs text-primary/70 uppercase tracking-wider">ALERT</span>
                    </div>
                    <p className="text-sm text-foreground pl-1 break-words">{alert.message}</p>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </TerminalPanel>

        {/* RESPONSE LOG */}
        <TerminalPanel 
          title="Communication Log" 
          icon={<Activity className="w-5 h-5" />}
          className="min-h-[350px]"
        >
          <div className="bg-black/80 border border-border flex-1 relative overflow-hidden min-h-[300px]">
            <div className="absolute top-0 left-0 right-0 bg-border/30 border-b border-border text-xs text-primary/70 p-2 flex justify-between uppercase z-10 font-bold backdrop-blur-sm">
              <span className="w-1/4">Timestamp</span>
              <span className="w-1/6">Operation</span>
              <span className="w-1/6">Status</span>
              <span className="w-5/12 text-right">Data Stream</span>
            </div>
            
            <div className="absolute inset-0 pt-10 p-4 overflow-y-auto overflow-x-hidden flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {logs.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="h-full flex items-center justify-center text-muted-foreground flex-col gap-2"
                  >
                    <Activity className="w-8 h-8 opacity-50" />
                    <p className="uppercase tracking-widest text-sm">Awaiting incoming transmissions...</p>
                  </motion.div>
                ) : (
                  logs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20, backgroundColor: "rgba(0,255,0,0.2)" }}
                      animate={{ opacity: 1, x: 0, backgroundColor: "rgba(0,0,0,0)" }}
                      className="border-l-2 border-border pl-3 pb-3 border-b border-border/20 border-dashed"
                    >
                      <div className="flex flex-wrap md:flex-nowrap gap-2 justify-between mb-2">
                        <div className="flex gap-4 items-center">
                          <span className="text-muted-foreground w-28 shrink-0">
                            [{format(log.timestamp, "HH:mm:ss")}]
                          </span>
                          <span className="text-primary font-bold w-16 shrink-0 glow-text">
                            {log.type}
                          </span>
                          <span className={cn(
                            "font-bold px-2 py-0.5 text-xs w-20 text-center shrink-0",
                            log.status === "SUCCESS" ? "bg-primary/20 text-primary border border-primary/50" : "bg-destructive/20 text-destructive border border-destructive/50"
                          )}>
                            {log.status}
                          </span>
                        </div>
                      </div>
                      
                      <pre className={cn(
                        "mt-2 p-3 bg-black/40 border border-border/50 text-xs whitespace-pre-wrap break-all overflow-x-auto",
                        log.status === "SUCCESS" ? "text-primary/90" : "text-destructive/90"
                      )}>
                        {log.raw}
                      </pre>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
              <div ref={logEndRef} />
            </div>
          </div>
        </TerminalPanel>
      </div>
    </div>
  );
}
