import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

const clients = new Set<Response>();

router.get("/alert/stream", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  res.write(": connected\n\n");

  clients.add(res);

  req.on("close", () => {
    clients.delete(res);
  });
});

router.post("/alert", (req: Request, res: Response) => {
  const { message } = req.body as { message?: string };

  if (!message || typeof message !== "string" || !message.trim()) {
    res.status(400).json({ success: false, error: "message is required" });
    return;
  }

  const payload = JSON.stringify({
    message: message.trim(),
    timestamp: new Date().toISOString(),
  });

  let delivered = 0;
  for (const client of clients) {
    try {
      client.write(`data: ${payload}\n\n`);
      delivered++;
    } catch {
      clients.delete(client);
    }
  }

  res.json({ success: true, delivered, message: message.trim() });
});

export default router;
