import Groq from "groq-sdk";

const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

if (!apiKey) {
    console.warn("[AI] EXPO_PUBLIC_GROQ_API_KEY is not set in .env");
}

const groq = new Groq({ apiKey: apiKey ?? "", dangerouslyAllowBrowser: true });

// Free models: llama-3.1-8b-instant (text), llama-3.2-90b-vision-preview (photo)
const TEXT_MODEL = "llama-3.1-8b-instant";
const VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

export interface MealEstimation {
    name: string;
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
}

const SYSTEM_PROMPT = `You are a nutrition expert. When given a meal name or image, 
respond ONLY with a valid JSON object in this exact format, no markdown, no explanation:
{"name":"<meal name>","kcal":<number>,"protein":<grams as integer>,"carbs":<grams as integer>,"fat":<grams as integer>}
Use realistic average portion sizes. All numbers must be integers.`;

function parseResponse(text: string): MealEstimation {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
}

// Estimate calories from a text meal description
export async function estimateByText(mealName: string): Promise<MealEstimation> {
    if (!apiKey) throw new Error("Groq API key not set. Add EXPO_PUBLIC_GROQ_API_KEY to your .env file.");

    const response = await groq.chat.completions.create({
        model: TEXT_MODEL,
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Estimate nutritional content for: "${mealName}"` },
        ],
        temperature: 0.3,
        max_tokens: 150,
    });

    const text = response.choices[0]?.message?.content ?? "";
    return parseResponse(text);
}

// Estimate calories from a base64-encoded image
export async function estimateByPhoto(base64Image: string, mimeType = "image/jpeg"): Promise<MealEstimation> {
    if (!apiKey) throw new Error("Groq API key not set. Add EXPO_PUBLIC_GROQ_API_KEY to your .env file.");

    const response = await groq.chat.completions.create({
        model: VISION_MODEL,
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
                role: "user",
                content: [
                    {
                        type: "image_url",
                        image_url: { url: `data:${mimeType};base64,${base64Image}` },
                    },
                    {
                        type: "text",
                        text: "Estimate the nutritional content of this food.",
                    },
                ],
            },
        ],
        temperature: 0.3,
        max_tokens: 150,
    });

    const text = response.choices[0]?.message?.content ?? "";
    return parseResponse(text);
}
