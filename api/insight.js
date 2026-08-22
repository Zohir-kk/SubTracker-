import { generateObject } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
  baseURL: "https://api.anthropic.com/v1",
});

let ratelimit = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, "1 h"),
    });
  }
} catch (e) {
  console.warn("[api/insight] Upstash Redis not configured, bypassing rate limiting:", e.message);
}

export default async function handler(req, res) {
  const origin = req.headers.origin ?? "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY is not configured." });
  }

  if (ratelimit) {
    try {
      const ip = String(req.headers["x-forwarded-for"] ?? "anonymous").split(",")[0].trim();
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return res.status(429).json({ error: "Too many requests. Try again later." });
      }
    } catch (rlErr) {
      console.warn("[api/insight] Rate limiting check error:", rlErr);
    }
  }

  const { context, lang = "en" } = req.body ?? {};
  
  const system = `You are a financial advisor for an Algerian user managing their subscriptions.
Analyze their data and provide EXACTLY 3 personalized, actionable advices.
Keep each advice short, impactful, and written in ${lang}. Focus on saving money or managing subscriptions better in Algeria (e.g. Djezzy, Mobilis, Shahid, Netflix, etc.).

USER DATA:
${context || "No subscription data available."}`;

  try {
    const { object } = await generateObject({
      model: anthropic("claude-haiku-4-5-20251001"),
      system,
      prompt: "Generate 3 actionable insights based on my subscriptions and budget.",
      schema: z.object({
        insights: z.array(z.object({
          title: z.string(),
          before: z.string().describe("The text before the currency amount (if any)"),
          amount: z.number().nullable().describe("A relevant currency amount to save or spend, or null if none"),
          after: z.string().describe("The text after the currency amount (if any)"),
          cta: z.string().describe("A short call to action (e.g. 'Manage Plan', 'Review Subscriptions')")
        })).length(3)
      })
    });

    return res.status(200).json(object);
  } catch (err) {
    console.error("[api/insight] Error generating insights:", err);
    return res.status(500).json({ error: "Failed to generate insights." });
  }
}
