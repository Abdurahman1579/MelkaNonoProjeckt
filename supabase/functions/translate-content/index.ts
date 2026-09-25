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
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent",
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
        const errBody = await res.text();
        console.warn(`❌ ${res.status}: ${errBody}`);
        lastError = `${res.status} from ${url.split('/').pop()}`;
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