import { NextRequest, NextResponse } from "next/server";
import { validateAuth } from "@/lib/auth";
import { eryxProvider } from "@/lib/ai/providers";

export async function GET(req: NextRequest) {
  const user = await validateAuth(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Extract models from the provider and map to user-friendly format
  const models = Object.entries(eryxProvider.languageModels).map(([key, model]) => {
    // The model is created via createOpenAI('gpt-xxx'), extract the actual model ID
    // The model object has a modelId property
    const modelId = (model as any).modelId || key;

    // Map to user-friendly labels
    const labelMap: Record<string, string> = {
      'eryx-fast': 'Eryx Fast',
      'eryx-nano': 'Eryx Nano',
      'eryx-standard': 'Eryx Standard',
      'eryx-plus': 'Eryx Plus',
      'eryx-pro': 'Eryx Pro',
      'eryx-ultra': 'Eryx Ultra',
      'eryx-max': 'Eryx Max',
      'eryx-next': 'Eryx Next',
      'eryx-prime': 'Eryx Prime',
      'eryx-flash': 'Eryx Flash',
      'eryx-reason': 'Eryx Reason',
      'eryx-mini-o3': 'O3 Mini',
      'eryx-mini-o4': 'O4 Mini',
    };

    return {
      value: key,
      label: labelMap[key] || key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      openAIModel: modelId,
    };
  });

  return NextResponse.json({ models });
}