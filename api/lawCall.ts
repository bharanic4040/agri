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
        let { userQuery } = req.body;
        let bodyPostForGeminiLLM = createGeminiLLMBodyForLaw(userQuery);
        /*const data = await checkInDB({ userQuery });
        if (data) {
            text = data;
        } else {
            text = await makeLLMCall(bodyPostForGeminiLLM);
            await updateInDB({ userQuery }, text)
        }*/
        let text = await makeLLMCall(bodyPostForGeminiLLM);
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

function createGeminiLLMBodyForLaw(userQuery: string) {

    const bodyPostForGeminiLLM = {
        "systemInstruction": {
            "parts": [
                {
                    "text": "You are an expert legal assistant specializing in Indian Law. The user queries can be civil, criminal or property related mainly. Analyze user legal queries and provide comprehensive legal guidance strictly in the Telugu language.If there are any laws related to Andhra Pradesh or Telangana state, they take preference always. Structure your response using these headers: 1. సమస్య విశ్లేషణ, 2. సంబంధిత చట్టాలు మరియు సెక్షన్లు, 3. శిక్షల వివరాలు (output is array),  4. ఉదాహరణలు (output is array), 5. తదుపరి చర్యలు.Strict JSON schema always.The json keys can be in english.if the json key has multiple items, it should be output as an array, no delimiters. The entire output must be valid JSON only. Do not wrap the JSON in markdown code blocks like \`\`\`json ... \`\`\`. - Do not include any conversational filler, introductory remarks, or post-response notes.if user enters query in english, translate it to telugu and proceed."
                }
            ]
        },
        "contents": [
            {
                "parts": [
                    {
                        "text": `${userQuery}`
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 1000
        }
    };
    return bodyPostForGeminiLLM;
}
/*
async function checkInDB(params: LawParams) {
    const databaseUrl = process.env.AGRI_DATABASE_URL;
    if (!databaseUrl) {
        console.error("DATABASE_URL is not set");
        return null;
    }
    try {
        const sql = neon(databaseUrl);
        let rows = await sql`
SELECT response FROM law_cache WHERE user_query=${params.userQuery} AND expires_at > NOW()
`;

        if (rows.length) {
            return rows[0].response;
        }
    } catch (err) {
        console.error(`DB Select error for - ${params.userQuery}` + err);
    }
    return null;
}


async function updateInDB(params: LawParams, llmResponse: any) {
    const databaseUrl = process.env.AGRI_DATABASE_URL;
    if (!databaseUrl) {
        console.error("DATABASE_URL is not set");
        return;
    }
    try {
        const sql = neon(databaseUrl);
        await sql`
INSERT INTO law_cache(user_query, response, expires_at)
VALUES( ${params.userQuery}, ${llmResponse},
 NOW() + INTERVAL '180 days')
ON CONFLICT(user_query)
DO UPDATE SET response = EXCLUDED.response, expires_at = EXCLUDED.expires_at;
`;
    } catch (err) {
        console.error(`DB Update error for - ${params.userQuery}` + err);
    }
}


export interface LawParams {
    userQuery: string;
}
*/
