import { Router, type IRouter } from "express";
import { PingPiResponse, SendMessageBody, SendMessageResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const PI_BASE_URL = "http://192.168.86.39:5000";

router.get("/pi/ping", async (_req, res) => {
  try {
    const response = await fetch(`${PI_BASE_URL}/ping`, {
      signal: AbortSignal.timeout(5000),
    });
    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    const result = PingPiResponse.parse({ success: true, data: data as Record<string, unknown>, raw: text });
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(502).json({ success: false, error: `Pi unreachable: ${message}` });
  }
});

router.post("/pi/message", async (req, res) => {
  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: "Invalid request body" });
    return;
  }

  try {
    const response = await fetch(`${PI_BASE_URL}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(5000),
    });
    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    const result = SendMessageResponse.parse({ success: true, data: data as Record<string, unknown>, raw: text });
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(502).json({ success: false, error: `Pi unreachable: ${message}` });
  }
});

export default router;
