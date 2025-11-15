"use client";

import { Fragment, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputMessage,
  PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";

import { Loader } from "@/components/ai-elements/loader";

import { GlobeIcon } from "lucide-react";

const RAGChatbot = () => {
  const textareaRef = useRef(null);

  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat();

  const handleSubmit = async (message: PromptInputMessage) => {
    if (!message.text) return;
    await sendMessage({ text: message.text });
    setInput(""); // Clear input after sending
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full h-[calc(100vh)]">
      <div className="flex flex-col h-full">
        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message) => {
              return (
                <div key={message.id}>
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <Fragment key={`${message.id}-${i}`}>
                            <Message from={message.role}>
                              <MessageContent>
                                <MessageResponse>{part.text}</MessageResponse>
                              </MessageContent>
                            </Message>
                          </Fragment>
                        );

                      case "tool-call":
                        return (
                          <Fragment key={`${message.id}-${i}`}>
                            <Message from={message.role}>
                              <MessageContent>
                                <MessageResponse>
                                  {`🔍 Searching knowledge base for: ${
                                    JSON.parse(part.input as string).query
                                  }`}
                                </MessageResponse>
                                {typeof part.output === "string" && (
                                  <MessageResponse>
                                    {`Found relevant information:\n${
                                      typeof part.output === "string"
                                        ? part.output
                                        : String(part.output)
                                    }`}
                                  </MessageResponse>
                                )}
                              </MessageContent>
                            </Message>
                          </Fragment>
                        );

                      default:
                        return null;
                    }
                  })}
                </div>
              );
            })}
            {(status === "submitted" || status === "streaming") && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <PromptInput className="mt-4" onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputSpeechButton textareaRef={textareaRef} />
              <PromptInputButton>
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>
            </PromptInputTools>
            <PromptInputSubmit status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
};

export default RAGChatbot;
