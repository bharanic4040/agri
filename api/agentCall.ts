import axios from "axios";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const GEMINI_FLASH_LITE_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent";


export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
 
  try {
    const { cropType, cropSubType } = req.body;
    const bodyPostForGeminiLLM = createGeminiLLMBody(cropType, cropSubType);

    const response = await axios.post(
      `${GEMINI_FLASH_LITE_BASE_URL}?key=${process.env.GOOGLE_GEMINI_KEY}`,
      bodyPostForGeminiLLM,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = response.data;
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({
        error: "No response returned. Unable to generate fertilizer schedule.",
      });
    }
    return res.status(200).json(JSON.parse(text));
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Unable to generate fertilizer schedule.",
    });
  }
}

function createGeminiLLMBody(CROP_TYPE: string, CROP_SUB_TYPE: string) {
  const bodyPostForGeminiLLM = {
    "systemInstruction": {
      "parts": [
        {
          "text": `You are an expert agronomist specializing in South Indian ${CROP_TYPE} cultivation. Provide highly accurate, scientific, and region-appropriate fertilizer schedules. Always respond strictly in the requested JSON schema with proper formatting. Always return the complete output in telugu language only`
        }
      ]
    },
    "contents": [
      {
        "parts": [
          {
            "text": `Generate a comprehensive fertilizer schedule for ${CROP_SUB_TYPE} ${CROP_TYPE} crop. Context: Assume standard standard soil test values (medium fertility). Provide the dosage per acre using standard fertilizers: Urea, Single Super Phosphate, and Muriate of Potash. Split the schedule into clear timeline phases: Basal, Tillering, Panicle Initiation, and Flowering/Heading.`
          }
        ]
      }
    ],
    "generationConfig": {
      "responseMimeType": "application/json",
      "responseSchema": {
        "type": "OBJECT",
        "properties": {
          "crop_variety": {
            "type": "STRING"
          },
          "total_duration_days": {
            "type": "INTEGER"
          },
          "recommended_npk_ratio_kg_per_acre": {
            "type": "STRING"
          },
          "schedule": {
            "type": "ARRAY",
            "items": {
              "type": "OBJECT",
              "properties": {
                "phase": {
                  "type": "STRING"
                },
                "timeline": {
                  "type": "STRING"
                },
                "fertilizers": {
                  "type": "ARRAY",
                  "items": {
                    "type": "OBJECT",
                    "properties": {
                      "name": {
                        "type": "STRING"
                      },
                      "quantity_kg_per_acre": {
                        "type": "NUMBER"
                      }
                    },
                    "required": [
                      "name",
                      "quantity_kg_per_acre"
                    ]
                  }
                },
                "application_method": {
                  "type": "STRING"
                },
                "agronomist_notes": {
                  "type": "STRING"
                }
              },
              "required": [
                "phase",
                "timeline",
                "fertilizers",
                "application_method",
                "agronomist_notes"
              ]
            }
          },
          "critical_precautions": {
            "type": "ARRAY",
            "items": {
              "type": "STRING"
            }
          }
        },
        "required": [
          "crop_variety",
          "total_duration_days",
          "recommended_npk_ratio_kg_per_acre",
          "schedule",
          "critical_precautions"
        ]
      }
    }
  };
  return bodyPostForGeminiLLM;
}


export interface FertilizerScheduleResponse {
  crop_variety?: string | null;
  total_duration_days?: number | null;
  recommended_npk_ratio_kg_per_acre?: string | null;
  schedule?: FertilizerSchedule[] | null;
  critical_precautions?: (string | null)[] | null;
}

export interface FertilizerSchedule {
  phase?: string | null;
  timeline?: string | null;
  fertilizers?: Fertilizer[] | null;
  application_method?: string | null;
  agronomist_notes?: string | null;
}

export interface Fertilizer {
  name?: string | null;
  quantity_kg_per_acre?: number | null;
}