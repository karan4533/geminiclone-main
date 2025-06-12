export type MessageRole = "user" | "model";

export interface TextPart {
  text: string;
}

export interface InlineDataPart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

export type MessagePart = TextPart | InlineDataPart;

export interface Message {
  role: MessageRole;
  parts: MessagePart[];
}

export type ChatHistory = Message[];

export interface GenerationConfig {
  temperature: number;
  topP: number;
  responseMimeType: string;
}

export interface ChatSettings {
  temperature: number;
  model: string;
  systemInstruction: string;
}

export interface FileUpload {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string;
  preview?: string;
}

export interface ChatMessage extends Message {
  id: string;
  timestamp: Date;
  files?: FileUpload[];
  isLoading?: boolean;
}
