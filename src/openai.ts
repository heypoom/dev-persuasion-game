export interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

const API_KEY: string = import.meta.env.VITE_OPENAI_API_KEY

export async function streamChatGPT(
  messages: Message[],
  onChunk: (data: string) => void,
  apiKey = API_KEY
) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        stream: true,
      }),
    })

    if (response.body) {
      await consume(response.body.getReader(), onChunk)
    }
  } catch (err) {
    // ?
  }
}

type R = ReadableStreamDefaultReader<Uint8Array>

async function consume(
  reader: R,
  onChunk: (data: string) => void
): Promise<void> {
  const decoder = new TextDecoder()

  const { value, done } = await reader.read()
  if (done) return reader.cancel()

  if (value) {
    const chunk = decoder.decode(value)

    if (chunk.includes("[DONE]")) return reader.cancel()

    const result = chunk
      .trim()
      .split("\n\n")
      .map((x) => JSON.parse(x.replace("data: ", "")).choices[0].delta.content)
      .join("")

    onChunk(result)
  }

  return consume(reader, onChunk)
}
