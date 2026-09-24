// ============================================
// TRANSLATE CONTENT — Gemini API
// ============================================

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { text, source = "om", targets = ["am", "en"] } = body;

    if (!text || typeof text !== "string") {
      throw new Error("Text barbaachisa");
    }
    if (text.length > 5000) {
      throw new Error("Text gabaabaa ta'uu qaba");
    }

    const validLangs = ["om", "am", "en"];
    const validTargets = targets.filter((t: string) => validLangs.includes(t) && t !== source);

    if (validTargets.length === 0) {
      throw new Error("Target lang sirrii miti");
    }

    console.log(`🌐 Translating ${source} → ${validTargets.join(", ")}`);

    const translations: Record<string, string> = {};
    for (const target of validTargets) {
      translations[target] = await translateText(text, source, target);
    }

    return new Response(
      JSON.stringify({ success: true, source_text: text, source_lang: source, translations }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("❌ Error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ============================================
// TRANSLATE HELPER — Multiple endpoints
// ============================================
async function translateText(text: string, source: string, target: string): Promise<string> {
  const langNames: Record<string, string> = {
    om: "Afaan Oromoo (Oromo language)",
    am: "Amharic (አማርኛ)",
    en: "English",
  };

  const prompt = `You are a professional translator for an Islamic organization (Malka Noonoo Islamic Affairs Council) in Ethiopia.

TASK: Translate from ${langNames[source]} to ${langNames[target]}.

RULES:
1. Keep Islamic terms ACCURATE: Allah, Prophet Muhammad ﷺ, Qur'an, Hadith, Masjid
2. Formal, respectful tone
3. Return ONLY the translation

TEXT: ${text}

TRANSLATION (${target}):`;

  const endpoints = [
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
    "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent",
  ];

  let lastError = "";

  for (const url of endpoints) {
    try {
      console.log(`🔄 Trying: ${url.split('/').pop()}`);

      const res = await fetch(`${url}?key=${GEMINI_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
        }),
      });

      if (!res.ok) {
        lastError = `${res.status} from ${url}`;
        continue;
      }

      const data = await res.json();
      const candidate = data.candidates?.[0];
      if (!candidate?.content?.parts?.[0]?.text) {
        lastError = "No translation in response";
        continue;
      }

      let translation = candidate.content.parts[0].text.trim();
      translation = translation
        .replace(/^["'`]|["'`]$/g, "")
        .replace(/^(Translation|Hiikkaa|ትርጉም):\s*/i, "")
        .trim();

      console.log(`✅ Success: ${url.split('/').pop()}`);
      return translation;
    } catch (err) {
      lastError = err.message;
    }
  }

  throw new Error(`All endpoints failed: ${lastError}`);
}