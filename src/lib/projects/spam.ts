import { gateway } from "@ai-sdk/gateway";
import { generateObject, zodSchema } from "ai";
import { z } from "zod";
import { env } from "@/env";
import type { ProjectFormInput } from "./schema";

const spamResultSchema = z.object({
  isSpam: z.boolean(),
  confidence: z.number().min(0).max(1),
  reason: z.string().max(500),
});

export async function checkProjectForSpam(input: ProjectFormInput) {
  if (!env.AI_GATEWAY_API_KEY) {
    return {
      isSpam: false,
      confidence: 0,
      reason: "AI Gateway is not configured.",
    };
  }

  try {
    const result = await generateObject({
      model: gateway("anthropic/claude-sonnet-4.6"),
      schema: zodSchema(spamResultSchema),
      system:
        "You review hackathon/community project submissions. Flag only clear spam, scams, unrelated ads, malicious links, gibberish, or abusive content. Do not reject legitimate rough drafts or early-stage civic projects.",
      prompt: JSON.stringify(
        {
          name: input.name,
          slug: input.slug,
          projectUrl: input.projectUrl,
          countries: input.countries,
          participantName: input.participantName,
          videoUrl: input.videoUrl,
          descriptionMarkdown: input.descriptionMarkdown,
        },
        null,
        2,
      ),
    });

    return result.object;
  } catch (error) {
    console.error("Project spam check failed", error);
    return {
      isSpam: false,
      confidence: 0,
      reason: "AI spam check failed open.",
    };
  }
}
