// API agent runner: runs one task for one agent through one provider.
// Provider-agnostic — any OpenAI-compatible endpoint works (FreeLLMAPI,
// OmniRoute, Groq, Gemini API, OpenRouter, ...). The API call IS the work,
// so status and token usage reported from here are exact.
export function buildChatRequest({ baseUrl, apiKey, model, rolePrompt, task }) {
  return {
    url: `${baseUrl.replace(/\/$/, "")}/chat/completions`,
    init: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: rolePrompt || "You are a helpful agent." },
          { role: "user", content: task },
        ],
      }),
    },
  };
}

export function parseChatResponse(json) {
  const content = json?.choices?.[0]?.message?.content ?? "";
  const usage = json?.usage ?? {};
  return {
    content,
    promptTokens: Number(usage.prompt_tokens) || 0,
    completionTokens: Number(usage.completion_tokens) || 0,
  };
}

// Runs the task and reports lifecycle through `events` callbacks:
// onStart(), onDone({content, promptTokens, completionTokens}), onError(err).
export async function runApiAgent({ provider, model, rolePrompt, task, fetchImpl = fetch, events = {} }) {
  const { url, init } = buildChatRequest({
    baseUrl: provider.baseUrl,
    apiKey: provider.apiKey,
    model,
    rolePrompt,
    task,
  });
  events.onStart?.();
  try {
    const res = await fetchImpl(url, init);
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Provider ${provider.name} -> ${res.status} ${body.slice(0, 200)}`);
    }
    const result = parseChatResponse(await res.json());
    events.onDone?.(result);
    return result;
  } catch (err) {
    events.onError?.(err);
    throw err;
  }
}
