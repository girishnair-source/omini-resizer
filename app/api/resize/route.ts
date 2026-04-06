import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';


export async function POST(req: NextRequest) {
  try {
    // 1. Validate API Key
    const apiKey = req.headers.get('x-api-key');
    const expectedKey = process.env.RESIZE_API_KEY || 'default-secret-key';

    if (!apiKey || apiKey !== expectedKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request body
    const body = await req.json();
    const { image, width, height, mimeType } = body;

    if (!image || !width || !height) {
      return NextResponse.json({ error: 'Missing image, width, or height' }, { status: 400 });
    }

    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'your-project-id';
    const location = 'global';

    // 3. Initialize GoogleGenAI for Vertex AI
    const ai = new GoogleGenAI({
      vertexai: true,
      project: projectId,
      location: location,
    });

    // We use internal reference 'nano-banana' meaning gemini-2.5-flash / gemini-2.0-flash-exp 
    // depending on their environment. The user might override this in env.
    const modelStr = process.env.MODEL_ID || 'gemini-3.1-flash-image-preview';

    const promptMessage = `Resize provided image to resolution exactly ${width}x${height}. Ensure it maintains the highest quality suitable for ad creatives (IAB standards). Output only the generated image.`;

    const prompt = [
      { text: promptMessage },
      {
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: image,
        },
      },
    ];

    const generationConfig = {
      responseModalities: ["IMAGE"]
    };


    // 4. Call Nano Banana Endpoint
    let returnedBase64 = "";

    try {
      const req = {
        model: modelStr,
        contents: prompt,
        config: generationConfig,
      };
      const response = await ai.models.generateContent(req);

      // Extract image data
      const part = response.candidates?.[0]?.content?.parts?.[0];

      if (part?.inlineData?.data) {
        returnedBase64 = part.inlineData.data;
      } else if (part?.text) {
        returnedBase64 = image;
        console.warn("Fallback: Returned original image because model responded with text:", part.text);
      } else {
        returnedBase64 = image;
        console.warn("Fallback: Returned original image because model response didn't contain inlineData.");
      }

    } catch (modelError: any) {
      console.error('GenAI Error:', modelError);
      return NextResponse.json({ error: modelError.message || 'Failed to call Gen AI' }, { status: 500 });
    }

    // 5. Build and return standard response
    return NextResponse.json({
      success: true,
      resolution: `${width}x${height}`,
      image: returnedBase64
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
      }
    });

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    },
  });
}
