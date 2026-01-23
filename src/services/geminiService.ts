import { GoogleGenAI } from "@google/genai";

// NOTE: In a real production app, this interaction might happen on the backend 
// to protect the API key, or use a proxy.
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeJobDiagnostics = async (
  jobLogs: string,
  metrics: string
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "AI Analysis unavailable: Missing API Key.";

  try {
    const prompt = `
      You are an expert ML Systems Engineer (MLE). 
      Analyze the following job logs and system metrics for a distributed training job.
      
      Metrics: ${metrics}
      Logs: ${jobLogs}

      Provide a concise Root Cause Analysis (RCA). 
      Identify if this is a hardware failure (Bad Node), network issue, or code issue (OOM/Gradient Explosion).
      Keep it under 100 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Analysis failed to generate text.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Failed to generate analysis due to an API error.";
  }
};