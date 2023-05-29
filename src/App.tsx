import { useSetAtom, useAtomValue } from "jotai"
import { useRef, useState } from "react"
import { motion } from "framer-motion"

import { messagesAtom, sendMessageAtom, typingResponseAtom } from "./atoms.ts"
import { Message } from "./openai.ts"

type Role = "user" | "assistant" | "system"

function getName(role: Role) {
  if (role === "user") return "You"

  return "Mr. Kotchasan Advocate"
}

interface BubbleProps {
  message: Message
  typing?: boolean
}

const ChatBubble = ({ message: { content, role }, typing }: BubbleProps) => (
  <motion.div
    className="flex w-full"
    {...((role !== "assistant" || typing) && {
      initial: { y: 50 },
      animate: { y: 0 },
    })}
  >
    <div className={role === "user" ? "order-2" : ""}>
      <div
        className={`text-gray-200 mb-1 text-xs ${
          role === "user" ? "text-right" : ""
        }`}
      >
        {getName(role)}
      </div>

      <div
        className={`max-w-[400px] px-5 py-2 font-sans rounded-md ${
          role === "user"
            ? "bg-blue-600 text-white"
            : "bg-gray-50 text-gray-800"
        }`}
      >
        {content}
      </div>
    </div>

    <div className="flex-auto" />
  </motion.div>
)

function App() {
  const [message, setMessage] = useState("")
  const messages = useAtomValue(messagesAtom)
  const typingResponse = useAtomValue(typingResponseAtom)
  const sendMessage = useSetAtom(sendMessageAtom)

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  function scroll() {
    scrollContainerRef.current?.scrollTo({
      top: 100000,
      behavior: "smooth",
    })
  }

  async function send() {
    const scrollTimer = setInterval(scroll, 200)

    setMessage("")
    await sendMessage(message)

    clearInterval(scrollTimer)
  }

  return (
    <div className="bg-[#202124]">
      <div className="text-white mx-auto flex flex-col gap-y-4 items-center justify-center min-h-screen max-w-3xl">
        <h1 className="text-3xl">เมื่อ 🐘 เป็น tech lead ของทีมคุณ</h1>

        <div
          className="flex flex-col mx-5 w-full h-[75vh] overflow-scroll"
          ref={scrollContainerRef}
        >
          <div className="flex flex-col gap-y-4 w-full">
            {messages
              .filter((m) => m.role !== "system")
              .map((message) => (
                <ChatBubble key={message.content} message={message} />
              ))}

            {typingResponse && (
              <ChatBubble
                message={{ content: typingResponse, role: "assistant" }}
                typing
              />
            )}
          </div>
        </div>

        <div
          className={`w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg ${
            typingResponse !== null && "cursor-not-allowed bg-gray-400"
          }`}
        >
          <textarea
            autoFocus
            disabled={typingResponse !== null}
            value={message}
            className="bg-transparent text-lg w-full outline-none cursor-[inherit]"
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
        </div>
      </div>
    </div>
  )
}

export default App
