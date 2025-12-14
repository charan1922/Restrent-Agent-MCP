"use client";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";

import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion";
import { MessageSquare } from "lucide-react";
import React, { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { useTheme } from "@/contexts/ThemeContext";

const ConversationDemo = () => {
  const { theme } = useTheme();
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    onFinish: () => {
      console.log("Message finished streaming");
    },
    onError: (error: any) => {
      console.error("Chat error:", error);
    },
  });

  const suggestions = [
    "Show me the full menu with prices",
    "What vegetarian options do you have?",
    "I'd like to make a reservation for 4 people tonight at 7 PM",
    "Check the status of my order",
    "I'd like to pay for my order with credit card",
  ];

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage({ text: suggestion });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full rounded-lg border h-full">
      <div className="flex flex-col h-full">
        <Conversation>
          <ConversationContent>
            {messages.length === 0 ? (
              <>
                <ConversationEmptyState
                  icon={<MessageSquare className="size-12" />}
                  title={`Welcome to ${theme.tenantName}! 🍽️`}
                  description="I'm your AI waiter. Ask about our menu, make a reservation, or place an order!"
                />
                <Suggestions className="mt-4 px-4">
                  {suggestions.map((suggestion, index) => (
                    <Suggestion
                      key={index}
                      suggestion={suggestion}
                      onClick={handleSuggestionClick}
                    />
                  ))}
                </Suggestions>
              </>
            ) : (
              messages.map((message: any) => (
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    {message.parts.map((part: any, i: number) => {
                      switch (part.type) {
                        case "text":
                          return (
                            <MessageResponse key={`${message.id}-${i}`}>
                              {part.text}
                            </MessageResponse>
                          );
                        default:
                          return null;
                      }
                    })}
                  </MessageContent>
                </Message>
              ))
            )}
            {(status === 'submitted' || (status === 'streaming' && (messages[messages.length - 1] as any)?.role === 'assistant' && !(messages[messages.length - 1] as any)?.content)) && (
              <div className="flex items-center gap-2 text-muted-foreground ml-2 mt-2">
                <div className="size-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="size-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="size-2 bg-current rounded-full animate-bounce" />
                <span className="text-sm">Thinking...</span>
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <PromptInput
          onSubmit={(message: any) => {
            if (message.text?.trim()) {
              setInput("");
              sendMessage({ text: message.text });
            }
          }}
          className="mt-4 w-full max-w-2xl mx-auto"
        >
          <PromptInputTextarea
            value={input}
            placeholder="Say something..."
            onChange={(e: any) => setInput(e.currentTarget.value)}
            className="pr-12"
          />
          <PromptInputSubmit
            status={status === "streaming" ? "streaming" : "ready"}
            disabled={!input.trim()}
            className="absolute bottom-1 right-1"
          />
        </PromptInput>
      </div>
    </div>
  );
};

export default ConversationDemo;
