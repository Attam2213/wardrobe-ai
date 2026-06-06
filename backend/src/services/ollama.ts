import { z } from "zod";

export type OllamaConfig = {
  baseUrl: string;
  model: string;
  timeoutMs?: number;
};

const OllamaChatResponseSchema = z.object({
  message: z.object({
    content: z.string(),
  }),
});

export async function ollamaChat(params: {
  cfg: OllamaConfig;
  system: string;
  user: string;
}): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), params.cfg.timeoutMs ?? 60_000);

  try {
    const resp = await fetch(new URL("/api/chat", params.cfg.baseUrl).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: params.cfg.model,
        stream: false,
        messages: [
          { role: "system", content: params.system },
          { role: "user", content: params.user },
        ],
      }),
      signal: controller.signal,
    });

    const text = await resp.text();
    if (!resp.ok) {
      throw new Error(`Ollama error ${resp.status}: ${text.slice(0, 500)}`);
    }

    const json = OllamaChatResponseSchema.parse(JSON.parse(text));
    return json.message.content;
  } finally {
    clearTimeout(timeout);
  }
}
