import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatHistory, GenerationConfig, ChatSettings, MessagePart } from "@/types";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY is not defined in the environment variables."
  );
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function chattogemini(
  messageParts: MessagePart[],
  history: ChatHistory,
  settings: ChatSettings
): Promise<string> {
  console.log("Starting Gemini chat with:", {
    partsCount: messageParts.length,
    historyLength: history.length,
    model: settings.model
  });
  
  // Choose appropriate model based on content type
  let modelName = settings.model || "gemini-1.5-flash";
  
  // Check if we have multimodal content (images/files)
  const hasMultimodalContent = messageParts.some(part => 'inlineData' in part);
  console.log("Has multimodal content:", hasMultimodalContent);
  
  // Ensure we use a vision-capable model for multimodal content
  if (hasMultimodalContent) {
    // Use vision-capable models for multimodal content
    if (modelName.includes('flash-8b')) {
      console.log("Switching from flash-8b to flash for multimodal content");
      modelName = 'gemini-1.5-flash'; // 8B doesn't support vision
    }
  }

  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: settings.systemInstruction || "You are a helpful AI assistant. When analyzing images or files, provide detailed and accurate descriptions. Always be precise and informative in your responses.",
  });

  const generationConfig: GenerationConfig = {
    temperature: settings.temperature || 0.7, // Slightly lower for more consistent responses with files
    topP: 0.95,
    responseMimeType: "text/plain",
  };

  // Filter history to only include fields expected by Gemini API (role and parts)
  const cleanHistory = history.map(message => ({
    role: message.role,
    parts: message.parts
  }));

  const chatSession = model.startChat({
    generationConfig,
    history: cleanHistory,
  });

  try {
    // For multimodal content, send as array of parts
    const result = await chatSession.sendMessage(messageParts);
    return result.response.text();
  } catch (error) {
    console.error("Error interacting with the model:", error);
    
    // Enhanced error handling
    if (error instanceof Error) {
      if (error.message.includes('QUOTA_EXCEEDED') || error.message.includes('quota')) {
        throw new Error('API quota exceeded. Please try again later.');
      }
      
      if (error.message.includes('INVALID_ARGUMENT') || error.message.includes('invalid_argument')) {
        throw new Error('Invalid request format. Please check your input.');
      }
      
      if (error.message.includes('PERMISSION_DENIED') || error.message.includes('unauthorized')) {
        throw new Error('API key is invalid or expired.');
      }
      
      if (error.message.includes('RESOURCE_EXHAUSTED')) {
        throw new Error('Rate limit exceeded. Please wait before trying again.');
      }
      
      if (error.message.includes('UNAVAILABLE') || error.message.includes('SERVICE_UNAVAILABLE')) {
        throw new Error('Service temporarily unavailable. Please try again later.');
      }
    }
    
    throw error;
  }
}

// Helper function to validate file types for different models
export function isSupportedFileType(mimeType: string, modelName: string): boolean {
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const documentTypes = ['application/pdf', 'text/plain'];
  
  // All current Gemini models support images
  if (imageTypes.includes(mimeType)) {
    return true;
  }
  
  // Some models support documents
  if (documentTypes.includes(mimeType)) {
    return !modelName.includes('flash-8b'); // 8B model has limited capabilities
  }
  
  return false;
}

// Helper function to get optimal model for content type
export function getOptimalModel(hasFiles: boolean, preferredModel: string): string {
  if (!hasFiles) {
    return preferredModel;
  }
  
  // For files, ensure we use a capable model
  if (preferredModel.includes('flash-8b')) {
    return 'gemini-1.5-flash';
  }
  
  return preferredModel;
}
