// SafeWander — Generates an AI safety brief for a destination
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { destination, travellerProfile, tripLength, arrivalWindow, priority, weather, country } =
      await req.json();

    if (!destination || typeof destination !== "string") {
      return new Response(JSON.stringify({ error: "destination is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const sys = `You are SafeWander, an expert travel safety analyst for solo travellers and students. \
You produce concise, practical, accurate safety briefs. Be calm, factual, never alarmist. \
Always tailor advice to the traveller profile. Use known general safety information about destinations; \
never invent specific incidents or fake statistics.`;

    const userPrompt = `Generate a safety brief for this trip.

Destination: ${destination}
${country ? `Country: ${country}` : ""}
Traveller profile: ${travellerProfile || "Solo traveller"}
Trip length (days): ${tripLength || "Unspecified"}
Arrival window: ${arrivalWindow || "Daytime"}
Priority: ${priority || "Balanced"}
${weather ? `Current weather: ${weather.temp}°C, ${weather.condition}` : ""}

Return ONLY a JSON object via the function call.`;

    const tool = {
      type: "function",
      function: {
        name: "safewander_brief",
        description: "Structured safety brief for the destination",
        parameters: {
          type: "object",
          properties: {
            safety_score: { type: "number", description: "0-100 score where 100 is safest" },
            score_label: { type: "string", description: "One of: Very Safe, Safe, Caution, High Caution, Avoid" },
            summary: { type: "string", description: "2-3 sentence overall summary" },
            advisory_status: { type: "string", description: "e.g. Exercise normal precautions, Exercise increased caution, Reconsider travel" },
            risk_snapshot: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  level: { type: "string", enum: ["low", "medium", "high"] },
                  note: { type: "string" },
                },
                required: ["category", "level", "note"],
              },
              description: "4-6 key risk categories like Petty crime, Scams, Transport, Health, Natural, Political",
            },
            arrival_tips: { type: "array", items: { type: "string" }, description: "5-7 actionable arrival & local movement tips" },
            packing_checklist: { type: "array", items: { type: "string" }, description: "8-12 packing items tailored to weather and trip" },
            local_safety_notes: { type: "array", items: { type: "string" }, description: "5-8 specific local warnings, scams, areas to avoid" },
            money_tips: { type: "array", items: { type: "string" }, description: "4-6 money & budget tips for this destination" },
            cultural_etiquette: { type: "array", items: { type: "string" }, description: "4-6 cultural do's and don'ts" },
            emergency_phrases: {
              type: "array",
              items: {
                type: "object",
                properties: { phrase: { type: "string" }, local: { type: "string" }, pronunciation: { type: "string" } },
                required: ["phrase", "local"],
              },
              description: "4-6 essential emergency/help phrases in local language with pronunciation",
            },
          },
          required: ["safety_score", "score_label", "summary", "advisory_status", "risk_snapshot", "arrival_tips", "packing_checklist", "local_safety_notes", "money_tips", "cultural_etiquette", "emergency_phrases"],
          additionalProperties: false,
        },
      },
    };

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: userPrompt },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "safewander_brief" } },
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI error", aiResp.status, t);
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No structured response from AI" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const brief = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ brief }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("trip-brief error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
