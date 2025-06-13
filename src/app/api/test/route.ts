import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check environment variables
    const hasApiKey = !!process.env.GEMINI_API_KEY;
    const apiKeyLength = process.env.GEMINI_API_KEY?.length || 0;
    
    return NextResponse.json({
      status: "OK",
      environment: "production",
      hasApiKey,
      apiKeyLength,
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform
    });
  } catch (error) {
    console.error("Diagnostic test error:", error);
    return NextResponse.json(
      { 
        status: "ERROR", 
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      status: "OK",
      receivedData: {
        hasBody: !!body,
        bodyKeys: Object.keys(body || {}),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("POST test error:", error);
    return NextResponse.json(
      { 
        status: "ERROR", 
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

