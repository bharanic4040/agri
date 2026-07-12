
import type { CropProps, FertilizerScheduleResponse, Loc } from "../models/agri";

export function loadCropsAndReturnMap(cropTypesArray: CropProps[]): Map<string, CropProps> {
  const dictionaryMap = new Map<string, CropProps>();

  cropTypesArray.forEach((entry: any) => {
    dictionaryMap.set(entry["రకం"], entry);
  });

  return dictionaryMap;
}

export function parseLLMOutputAndFormat(paddyOutput: FertilizerScheduleResponse): Map<string, string[]> {
  const cropMap = new Map<string, string[]>();
  if (!paddyOutput.schedule) {
    return cropMap;
  }
  paddyOutput.schedule?.forEach((schedule, _) => {
    if (!schedule.timeline ||  !schedule.fertilizers || schedule.fertilizers?.length === 0) {
      return;
    }
    let fertArray: string[] = [];
    schedule.fertilizers?.forEach((fertilizer, _) => {
      const fertItem = fertilizer.name + " - " + fertilizer.quantity_kg_per_acre + " KG."
      fertArray.push(fertItem);
    });
    cropMap.set(schedule.timeline, fertArray);
  });

  return cropMap;
}

/*
===================
You can make the forecast more useful by requesting additional fields such as:

precipitation_probability_max – chance of rain (%)
temperature_2m_min – minimum temperature
relative_humidity_2m_mean – average humidity
wind_speed_10m_max – maximum wind speed
soil_temperature_0cm – soil temperature
soil_moisture_0_to_1cm – surface soil moisture
et0_fao_evapotranspiration – estimated water loss from soil and plants
*/

/**
0 mm - No rain
0.1 mm - Almost dry
1.8 mm - Light rain
10 mm - Moderate rain
50+ mm - Heavy rain
 */
export function getRainDescription(rainfallMM: number | undefined): string {
  if (rainfallMM === undefined) {
    return "";
  }
  if (rainfallMM === 0) {
    return "☀️ వర్షం లేదు";
  } else if (rainfallMM < 2.5) {
    return "🌤️ చాలా తేలికపాటి వర్షం";
  } else if (rainfallMM < 7.5) {
    return "🌦️ తేలికపాటి వర్షం";
  } else if (rainfallMM < 35) {
    return "🌧️ మోస్తరు వర్షం";
  } else if (rainfallMM < 65) {
    return "⛈️ భారీ వర్షం";
  } else {
    return "🌊 అతి భారీ వర్షం";
  }
}

const OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast?daily=temperature_2m_max,precipitation_sum&timezone=auto&";

export async function fetchWeatherData(latitude?: string, longitude?: string) {
  try {
    const url = `${OPEN_METEO_BASE_URL}latitude=${latitude}&longitude=${longitude}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`weather data not found for - ${latitude} and ${longitude}.`);
    }
    const data = await res.json();
    const forecast = data.daily.time.map((date: string, index: number) => ({
      date,
      maxTemp: data.daily.temperature_2m_max[index],
      rain: data.daily.precipitation_sum[index],
    }));
    return forecast;
  } catch (err) {
    console.error(`weather data not found for - ${latitude} and ${longitude}.`, err);
    return [];
  }
}

export function getLocation(): Promise<Loc> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => reject(error)
    );
  });
}

export function formatDateToDDMMYYYY(date: string): string {
  const [year, month, day] = date.split("-");
  return `${day}-${month}-${year}`;
}

function createGeminiLLMBody(CROP_TYPE: string, CROP_SUB_TYPE: string) {
  const bodyPostForGeminiLLM = {
    "systemInstruction": {
      "parts": [
        {
          "text": `"You are an expert agronomist specializing in South Indian ${CROP_TYPE} cultivation. Provide highly accurate, scientific, and region-appropriate fertilizer schedules. Always respond strictly in the requested JSON schema with proper formatting. Always return the complete output in telugu language only`
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

const GEMINI_FLASH_LITE_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=AIzaSyAqsGTVzcyZjB4ez4SYFc1TypzarVpVBMM";

export async function fetchCropFertilizerSchedule(cropSubType: string, cropType: string): Promise<FertilizerScheduleResponse | null> {
  try {
    const url = `${GEMINI_FLASH_LITE_BASE_URL}`;
    const bodyPostForGeminiLLM = createGeminiLLMBody(cropType, cropSubType);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyPostForGeminiLLM)
    });

    if (!res.ok) {
      return null;
    }

    const result = await res.json();
    if (!result || !result.candidates[0]) {
      return null;
    }
    const data: FertilizerScheduleResponse = JSON.parse(
      result.candidates[0].content.parts[0].text
    );

    return data;
  } catch (err) {
    console.error(`Error fetching ${cropSubType} fertilizer details.`, err);
    return null;
  }
}