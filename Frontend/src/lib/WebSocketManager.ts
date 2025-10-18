import api from "./axios";

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private readonly url: string;
  private readonly token: string;
  private readonly onMessage: (msg: any) => void;
  private readonly reconnectDelay = 5000;

  constructor(url: string, token: string, onMessage: (msg: any) => void) {
    this.url = url;
    this.token = token;
    this.onMessage = onMessage;
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(
      `${this.url}?token=${encodeURIComponent(this.token)}`,
    );

    this.ws.onopen = () => console.log("[WS] Connected");
    this.ws.onmessage = (e) => this.onMessage(JSON.parse(e.data));
    this.ws.onclose = () => {
      console.log("[WS] Disconnected, retrying...");
      this.reconnectTimeout = setTimeout(
        () => this.connect(),
        this.reconnectDelay,
      );
    };
    this.ws.onerror = (e) => {
      console.error("[WS] Error:", e);
      api.post("/authenticated");
    };
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn("[WS] Not connected, dropping message", data);
    }
  }

  disconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.ws?.close();
    this.ws = null;
  }
}
