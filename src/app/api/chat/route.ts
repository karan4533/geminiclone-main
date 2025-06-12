import { NextResponse } from "next/server";
import { chattogemini } from "@/utils/geminiHelpers";
import { ChatHistory, ChatSettings, FileUpload, MessagePart } from "@/types";

export async function POST(request: Request) {
  try {
    const { userMessage, history, settings, files } = (await request.json()) as {
      userMessage: string;
      history: ChatHistory;
      settings: ChatSettings;
      files?: FileUpload[];
    };

    // Prepare message parts for multimodal content
    const messageParts: MessagePart[] = [];
    
    // Add text content if provided
    if (userMessage && userMessage.trim()) {
      messageParts.push({ text: userMessage });
    }
    
    // Add file content if provided
    if (files && files.length > 0) {
      for (const file of files) {
        messageParts.push({
          inlineData: {
            mimeType: file.type,
            data: file.data
          }
        });
      }
    }

    // If no content provided, return error
    if (messageParts.length === 0) {
      return NextResponse.json(
        { error: "No message content provided." },
        { status: 400 }
      );
    }

    const aiResponse = await chattogemini(messageParts, history, settings);
    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("API Error:", error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("quota") || error.message.includes("429")) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }
      
      if (error.message.includes("invalid_argument") || error.message.includes("400")) {
        return NextResponse.json(
          { error: "Invalid request. Please check your input and try again." },
          { status: 400 }
        );
      }
      
      if (error.message.includes("unauthorized") || error.message.includes("401")) {
        return NextResponse.json(
          { error: "Invalid API key. Please check your configuration." },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Error obtaining the AI model's response." },
      { status: 500 }
    );
  }
}
