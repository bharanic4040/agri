import axios from "axios";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";

const GEMINI_FLASH_LITE_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent";


export default async function handler(req: VercelRequest, res: VercelResponse) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    let { cropType, cropSubType, queryType, weather, growthStage } = req.body;

    let bodyPostForGeminiLLM = {};
    if (queryType === "fertilizer") {
      bodyPostForGeminiLLM = createGeminiLLMBodyForPaddy(cropType, cropSubType);
      weather = "NA";
      growthStage = "NA";
    } else if (queryType === "pests") {
      if (cropType === "మామిడి") {
        bodyPostForGeminiLLM = createLLMBodyForPestAndDiseasesMango(growthStage, cropSubType, weather);
      } else {
        bodyPostForGeminiLLM = createLLMBodyForPestAndDiseasesPaddy(growthStage, cropSubType, weather);
      }

    }

    let text = null;

    const data = await checkInDB({ cropType, cropSubType, growthStage, weather, queryType });
    if (data) {
      text = data;
    } else {
      text = await makeLLMCall(bodyPostForGeminiLLM);
      updateInDB({ cropType, cropSubType, growthStage, weather, queryType }, text)
    }
    if (!text) {
      return res.status(500).json({
        error: "No response returned.",
      });
    }
    return res.status(200).json(JSON.parse(text));
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Unable to generate LLM Outputor Query DB.",
    });
  }
}

async function makeLLMCall(bodyPostForGeminiLLM: any): Promise<string | null> {
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
  return text;
}

function createGeminiLLMBodyForPaddy(CROP_TYPE: string, CROP_SUB_TYPE: string) {
  
  let MANGO_USER_PROMPT = `Generate a comprehensive fertilizer schedule for a ${CROP_SUB_TYPE} ${CROP_TYPE} orchard. Context: Assume standard soil test values (medium fertility). Provide the dosage per tree (and total per acre based on 80–110 trees/acre spacing) using standard straight fertilizers: Urea, Single Super Phosphate (SSP), and Muriate of Potash (MOP). Structure the output into clear timeline phases spanning Tree Age Tiers (Year 1, Annual Increments for Years 2–9, and Fully Bearing Year 10+ onwards). For the fully bearing years, divide the annual nutrition into a split application timeline: Phase 1: Post-Harvest / Early Monsoon (June–July - 50% N, 100% P, 50% K) and Phase 2: Post-Monsoon / Pre-Bud Break (September–October - remaining 50% N, 50% K). Explicitly include safety warnings against late nitrogen application near flowering, along with critical trace mineral foliar sprays (Zinc, Boron) to prevent fruit cracking and ensure maximum sugar development`;
  let PADDY_USER_PROMPT = `Generate a comprehensive fertilizer schedule for ${CROP_SUB_TYPE} ${CROP_TYPE} crop. Context: Assume standard standard soil test values (medium fertility). Provide the dosage per acre using standard fertilizers: Urea, Single Super Phosphate, and Muriate of Potash. Split the schedule into clear timeline phases: Basal, Tillering, Panicle Initiation, and Flowering/Heading.`;

  let prompt = PADDY_USER_PROMPT;
  if (CROP_TYPE === "మామిడి") {
    prompt = MANGO_USER_PROMPT;
  }
  const bodyPostForGeminiLLM = {
    "systemInstruction": {
      "parts": [
        {
          "text": "You are an expert agronomist specializing in South Indian paddy cultivation. Provide highly accurate, scientific, and region-appropriate fertilizer schedules. Always respond strictly in the requested JSON schema with proper formatting. Always return the complete output in telugu language only"
        }
      ]
    },
    "contents": [
      {
        "parts": [
          {
            "text": prompt
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


function createLLMBodyForPestAndDiseasesPaddy(growthStage: string, cropSubType: string,
  weather: string) {
  const PADDY_USER_PROMPT = `Paddy Variety: ${cropSubType}, Crop Growth Stage: ${growthStage} , Current Weather: ${weather}`;

  const bodyPostForGeminiLLM = {
    "systemInstruction": {
      "parts": [
        {
          "text": "You are an expert AI Agronomist specializing in paddy (rice) cultivation, plant pathology, and entomology.\n\nYour task is to analyze the paddy variety, crop growth stage, and current weather conditions provided by the user to generate a highly specific, real-time health report.\n\nCRITICAL PROCESSING RULES:\n\n1. Do not give a generic list. Tailor the threats strictly based on the variety'\''s genetic susceptibility, the crop'\''s precise growth stage (e.g., Nursery, Tillering, Panicle Initiation, Flowering, Maturity), and how the current weather (e.g., stagnant water, high humidity, continuous rain, cloudy days) accelerates specific pests or fungi.\n\n2. You MUST completely separate \"Diseases\" (fungal, bacterial, viral, physiological) from \"Pests\" (insects, mites, gall midge, borers, hoppers) into distinct JSON sections.\n\n3. Categorize both diseases and pests into:\n   - High-Risk: Severe threat to this variety under these specific weather and growth conditions.\n   - Low-Risk: Variety has natural resistance, or the threat is dormant in this stage/weather.\n\n4. Provide precise, actionable chemical and organic remediation steps tailored to:\n   - Crop growth stage.\n   - Current weather.\n   - Water management.\n   - Fertilizer limits.\n   - Chemical dosages.\n\n   Do NOT recommend:\n   - Dusting powders during high winds.\n   - Spraying immediately before rain.\n\n5. All text values inside the JSON MUST be written in fluent, grammatically correct Telugu (తెలుగు).\n\nOUTPUT FORMAT INSTRUCTIONS:\n\n- The entire output must be valid JSON only.\n- Do not wrap the JSON in markdown code blocks.\n- Do not include conversational text, introductions, or notes.\n- Follow the schema below exactly.\n\nJSON SCHEMA:\n\n{\n  \"paddy_variety\": \"వరి రకం పేరు\",\n  \"crop_growth_stage\": \"పంట ఎదుగుదల దశ\",\n  \"current_weather\": \"ప్రస్తుత వాతావరణం\",\n  \"diseases\": {\n    \"high_risk\": [\n      {\n        \"name\": \"తెగులు పేరు\",\n        \"symptoms\": [\n          \"లక్షణం 1\",\n          \"లక్షణం 2\"\n        ],\n        \"organic_remediation\": [\n          \"ఈ పంట దశ మరియు వాతావరణానికి సరిపోయే సేంద్రీయ నివారణ 1\"\n        ],\n        \"chemical_remediation\": [\n          \"ఈ దశకు సరిపోయే ఖచ్చితమైన మోతాదుతో కూడిన రసాయన నివారణ 1\"\n        ]\n      }\n    ],\n    \"low_risk_or_resistant\": [\n      {\n        \"name\": \"తెగులు పేరు\",\n        \"reason_for_low_risk\": \"ఈ రకానికి, లేదా ఈ దశ/వాతావరణంలో దీని ప్రభావం ఎందుకు తక్కువగా ఉందో వివరణ\"\n      }\n    ]\n  },\n  \"pests\": {\n    \"high_risk\": [\n      {\n        \"name\": \"పురుగు పేరు\",\n        \"symptoms\": [\n          \"లక్షణం 1\",\n          \"లక్షణం 2\"\n        ],\n        \"organic_remediation\": [\n          \"ఈ పంట దశ మరియు వాతావరణానికి సరిపోయే సేంద్రీయ నివారణ 1\"\n        ],\n        \"chemical_remediation\": [\n          \"ఈ దశకు సరిపోయే ఖచ్చితమైన మోతాదుతో కూడిన రసాయన నివారణ 1\"\n        ]\n      }\n    ],\n    \"low_risk_or_resistant\": [\n      {\n        \"name\": \"పురుగు పేరు\",\n        \"reason_for_low_risk\": \"ఈ పురుగు ప్రభావం ఈ పంట దశలో లేదా ఈ వాతావరణంలో ఎందుకు తక్కువగా ఉంటుందో వివరణ\"\n      }\n    ]\n  },\n  \"weather_and_stage_specific_advice\": [\n    \"ఈ వరి పంట దశ మరియు ప్రస్తుత వాతావరణాన్ని బట్టి తీసుకోవలసిన నీటి లేదా ఎరువుల యాజమాన్య ప్రత్యేక జాగ్రత్త 1\"\n  ]\n}"
        }
      ]
    },
    "contents": [
      {
        "role": "user",
        "parts": [
          {
            "text": PADDY_USER_PROMPT
          }
        ]
      }
    ],
    "generationConfig": {
      "responseMimeType": "application/json"
    }
  }

  return bodyPostForGeminiLLM
}

function createLLMBodyForPestAndDiseasesMango(growthStage: string, cropSubType: string,
  weather: string) {

  const MANGO_USER_PROMPT = `Please generate a dynamic mango health report based on the specific variety, tree age, and environmental factors provided below. Ensure the output strictly follows the required JSON format and is written entirely in Telugu. Mango Variety: ${cropSubType}, Phenological Growth:${growthStage}, Current Weather Conditions:${weather}`;

  const bodyPostForGeminiLLM = {
    "systemInstruction": {
      "parts": [
        {
          "text": "You are an expert AI Agronomist specializing in mango cultivation, plant pathology, and entomology. Your task is to analyze the mango variety, Phenological Growth , and current weather conditions provided by the user to generate a highly specific, real-time health report. CRITICAL PROCESSING RULES: 1. Do not give a generic list. Tailor the threats strictly based on the variety'\''s genetic susceptibility, the tree'\''s age group (e.g., young saplings vs. mature bearing trees), and how the current weather (e.g., high humidity, heavy rain, extreme heat) accelerates specific pests or fungi. 2. You MUST completely separate \"Diseases\" (fungal, bacterial, viral, physiological) from \"Pests\" (insects, mites, flies, borers) into distinct JSON sections. 3. Categorize both diseases and pests into High-Risk (severe threat to this variety under these specific weather conditions) and Low-Risk (variety has natural resistance, or threat is dormant in this weather) tiers. 4. Provide precise, actionable chemical and organic remediation steps tailored to the tree'\''s age (adjust chemical dosages accordingly) and weather (e.g., do not recommend spraying systemic fungicides right before heavy rainfall). 5. All text values inside the JSON MUST be written in fluent, grammatically correct Telugu (తెలుగు). OUTPUT FORMAT INSTRUCTIONS: - The entire output must be valid JSON only. - Do not wrap the JSON in markdown code blocks like \`\`\`json ... \`\`\`. - Do not include any conversational filler, introductory remarks, or post-response notes. - Use the exact JSON schema provided below. JSON SCHEMA TO ENFORCE: { \"mango_variety\": \"రకం పేరు\", \"tree_age\": \"చెట్టు వయస్సు\", \"current_weather\": \"ప్రస్తుత వాతావరణం\", \"diseases\": { \"high_risk\": [ { \"name\": \"తెగులు పేరు\", \"symptoms\": [\"లక్షణం 1\", \"లక్షణం 2\"], \"organic_remediation\": [\"ఈ వయస్సు మరియు వాతావరణానికి సరిపోయే సేంద్రీయ నివారణ 1\"], \"chemical_remediation\": [\"ఈ వయస్సుకు సరిపోయే ఖచ్చితమైన మోతాదుతో కూడిన రసాయన నివారణ 1\"] } ], \"low_risk_or_resistant\": [ { \"name\": \"తెగులు పేరు\", \"reason_for_low_risk\": \"ఈ రకానికి, లేదా ఈ వయస్సు/వాతావరణంలో దీని ప్రభావం ఎందుకు తక్కువగా ఉందో వివరణ\" } ] }, \"pests\": { \"high_risk\": [ { \"name\": \"పురుగు పేరు\", \"symptoms\": [\"లక్షణం 1\", \"లక్షణం 2\"], \"organic_remediation\": [\"ఈ వయస్సు మరియు వాతావరణానికి సరిపోయే సేంద్రీయ నివారణ 1\"], \"chemical_remediation\": [\"ఈ వయస్సుకు సరిపోయే ఖచ్చితమైన మోతాదుతో కూడిన రసాయన నివారణ 1\"] } ], \"low_risk_or_resistant\": [ { \"name\": \"పురుగు పేరు\", \"reason_for_low_risk\": \"ఈ పురుగు ప్రభావం ఈ వయస్సు లేదా వాతావరణంలో ఎందుకు తక్కువగా ఉంటుందో వివరణ\" } ] }, \"weather_and_age_specific_advice\": [\"ఈ వయస్సు మరియు ప్రస్తుత వాతావరణాన్ని బట్టి తీసుకోవలసిన ప్రత్యేక జాగ్రత్త 1\"] }"
        }
      ]
    },
    "contents": [
      {
        "role": "user",
        "parts": [
          {
            "text": MANGO_USER_PROMPT
          }
        ]
      }
    ],
    "generationConfig": {
      "responseMimeType": "application/json"
    }
  }
  return bodyPostForGeminiLLM;
}


async function checkInDB(params: CropParams) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set");
    return null;
  }
  try {
    const sql = neon(databaseUrl);
    let rows = null;
    if (params.queryType === "fertilizer") {
      rows = await sql`
SELECT response FROM fertilizer_cache WHERE crop_type=${params.cropType}
AND crop_sub_type=${params.cropSubType} AND expires_at > NOW()
`;
    } else {
      rows = await sql`
SELECT response FROM pests_cache WHERE crop_type=${params.cropType}
AND crop_sub_type=${params.cropSubType} AND growth_stage=${params.growthStage} AND weather=${params.weather}
 AND expires_at > NOW()
`;
    }
    if (rows.length) {
      return rows[0].response;
    }
  } catch (err) {
    console.error(`DB Select error for - ${params.queryType}` + err);
  }
  return null;
}


async function updateInDB(params: CropParams, llmResponse: any) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set");
    return;
  }
  try {
    const sql = neon(databaseUrl);
    if (params.queryType === "fertilizer") {
      await sql`
INSERT INTO fertilizer_cache(crop_type, crop_sub_type, response, expires_at)
VALUES( ${params.cropType}, ${params.cropSubType},${JSON.stringify(llmResponse)},
 NOW() + INTERVAL '60 days')
ON CONFLICT(crop_type,crop_sub_type)
DO UPDATE SET response = EXCLUDED.response, expires_at = EXCLUDED.expires_at;
`;
    } else {
      await sql`
INSERT INTO pests_cache(crop_type, crop_sub_type, response, expires_at)
VALUES( ${params.cropType}, ${params.cropSubType},${params.growthStage},
 ${params.weather}, ${JSON.stringify(llmResponse)},
 NOW() + INTERVAL '60 days')
ON CONFLICT(crop_type,crop_sub_type)
DO UPDATE SET response = EXCLUDED.response, expires_at = EXCLUDED.expires_at;`;
    }

  } catch (err) {
    console.error(`DB Update error for - ${params.queryType}` + err);
  }
}


export interface CropParams {
  cropType: string;
  cropSubType: string;
  growthStage?: string | null;
  weather?: string | string;
  queryType?: "fertilizer" | "pests";
}

