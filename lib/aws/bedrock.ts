/**
 * AWS Bedrock client for LLM analysis
 *
 * Uses Claude Sonnet via Bedrock to generate SEO recommendations
 * from SEMRush data.
 */

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({
  region: process.env.APP_AWS_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY ?? "",
  },
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID ?? "anthropic.claude-sonnet-4-20250514";

interface AnalysisRequest {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
}

interface AnalysisResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
}

/** Invoke Bedrock model for analysis */
export async function analyze(req: AnalysisRequest): Promise<AnalysisResponse> {
  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: req.maxTokens ?? 4096,
    temperature: req.temperature ?? 0.3,
    system: req.systemPrompt,
    messages: [{ role: "user", content: req.userPrompt }],
  });

  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: new TextEncoder().encode(body),
  });

  const response = await client.send(command);
  const result = JSON.parse(new TextDecoder().decode(response.body));

  return {
    text: result.content?.[0]?.text ?? "",
    inputTokens: result.usage?.input_tokens ?? 0,
    outputTokens: result.usage?.output_tokens ?? 0,
  };
}

/** Generate SEO analysis from SEMRush data */
export async function generateSeoAnalysis(data: {
  domain: string;
  keywords: { keyword: string; position: number; volume: number; inAiOverview: boolean }[];
  competitors: { domain: string; commonKeywords: number }[];
  backlinks: { total: number; domains: number };
}): Promise<string> {
  const systemPrompt = `You are an expert SEO analyst specializing in GEO (Generative Engine Optimization) and AEO (Answer Engine Optimization). Analyze the provided SEMRush data and generate actionable recommendations. Focus on:
1. AI visibility (keywords appearing in AI Overviews)
2. Content optimization opportunities
3. Competitive gaps
4. Technical SEO priorities
Respond in a structured format with scores, priorities, and specific action items.`;

  const userPrompt = `Analyze this SEO data for ${data.domain}:

## Keywords (${data.keywords.length} tracked)
${data.keywords
  .slice(0, 20)
  .map((k) => `- "${k.keyword}" — Position: ${k.position}, Volume: ${k.volume}, AI Overview: ${k.inAiOverview ? "Yes" : "No"}`)
  .join("\n")}

## Top Competitors
${data.competitors
  .slice(0, 10)
  .map((c) => `- ${c.domain} — ${c.commonKeywords} shared keywords`)
  .join("\n")}

## Backlinks
- Total: ${data.backlinks.total}
- Referring domains: ${data.backlinks.domains}

Provide a comprehensive analysis with:
1. Overall SEO health score (0-100)
2. AI visibility assessment
3. Top 5 priority recommendations
4. Content gap analysis
5. Quick wins (things to fix immediately)`;

  const result = await analyze({ systemPrompt, userPrompt });
  return result.text;
}
