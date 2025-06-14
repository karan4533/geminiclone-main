import { NextResponse } from "next/server";
import { chattogemini } from "@/utils/geminiHelpers";
import { ChatHistory, ChatSettings, FileUpload, MessagePart } from "@/types";

export async function POST(request: Request) {
  try {
    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      return NextResponse.json(
        { error: "API key not configured. Please check your environment variables." },
        { status: 500 }
      );
    }

    const { userMessage, history, settings, files } = (await request.json()) as {
      userMessage: string;
      history: ChatHistory;
      settings: ChatSettings;
      files?: FileUpload[];
    };

    console.log("API Request received:", {
      hasMessage: !!userMessage?.trim(),
      filesCount: files?.length || 0,
      model: settings?.model,
      timestamp: new Date().toISOString()
    });

    // Prepare message parts for multimodal content
    const messageParts: MessagePart[] = [];
    
    // Add text content if provided
    if (userMessage && userMessage.trim()) {
      messageParts.push({ text: userMessage });
    }
    
    // Add file content if provided
    if (files && files.length > 0) {
      console.log("Processing files:", files.map(f => ({ name: f.name, type: f.type, size: f.size })));
      
      for (const file of files) {
        // Validate file data
        if (!file.data || file.data.length === 0) {
          console.error("File has no data:", file.name);
          return NextResponse.json(
            { error: `File ${file.name} has no data. Please try uploading again.` },
            { status: 400 }
          );
        }
        
        // Check for supported file types
        const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'];
        if (!supportedTypes.includes(file.type)) {
          console.error("Unsupported file type:", file.type);
          return NextResponse.json(
            { error: `File type ${file.type} is not supported.` },
            { status: 400 }
          );
        }
        
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
    console.log("AI response generated successfully");
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
