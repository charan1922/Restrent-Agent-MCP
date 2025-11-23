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
import React, { FormEvent, useState } from "react";
import { useChat } from "@ai-sdk/react";

const ConversationDemo = () => {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    onFinish: () => {
      console.log("Message finished streaming");
    },
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  const suggestions = [
    "Show me the full menu with prices",
    "What vegetarian options do you have?",
    "I'd like to make a reservation for 4 people tonight at 7 PM",
    // "Place an order: 2 Chicken Tikka Masala and 1 Palak Paneer for table T3",
    "Check the status of my order",
    "I'd like to pay for my order with credit card",
  ];

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage({ text: suggestion });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full rounded-lg border h-[600px]">
      <div className="flex flex-col h-full">
        <Conversation>
          <ConversationContent>
            {messages.length === 0 ? (
              <>
                <ConversationEmptyState
                  icon={<MessageSquare className="size-12" />}
                  title="Welcome to Indian Restaurant! 🍽️"
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
              messages.map((message) => (
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    {message.parts.map((part, i) => {
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
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <PromptInput
          onSubmit={(message) => {
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
            onChange={(e) => setInput(e.currentTarget.value)}
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
