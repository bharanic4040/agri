import type { CropProps, FertilizerScheduleResponse, LegalAdviceResponse, Loc, MangoDiagnosis, PaddyDiagnosis } from "../models/agri";

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
    if (!schedule.timeline || !schedule.fertilizers || schedule.fertilizers?.length === 0) {
      return;
    }
    let fertArray: string[] = [];
    schedule.fertilizers?.forEach((fertilizer, _) => {
      const fertItem = fertilizer.name + " - " + fertilizer.quantity_kg_per_acre + " KG."
      fertArray.push(fertItem);
    });
    cropMap.set(schedule.phase + "|" +schedule.timeline, fertArray);
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

//weather report API 
const OPEN_METEO_BASE_URL = 
"https://api.open-meteo.com/v1/forecast?daily=temperature_2m_max,precipitation_sum&timezone=auto&";

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
  if (!date.includes("-")) {
    return date;
  }
  const [year, month, day] = date.split("-");
  return `${day}-${month}-${year}`;
}

export async function fetchCropFertilizerSchedule(
  cropType: string,
  cropSubType: string
): Promise<FertilizerScheduleResponse | null> {

  try {
    const res = await fetch("/api/agentCall", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cropType, cropSubType, queryType: "fertilizer", 
        weather: null, growthStage: null }),
    });

    if (!res.ok) {
      return null;
    }
    const data: FertilizerScheduleResponse =  await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
  return null;
}

export async function fetchPests(
  cropType: string, cropSubType: string, queryType: string,
   weather: string, growthStage: string ): 
   Promise<MangoDiagnosis | PaddyDiagnosis | null> {

  try {
    const res = await fetch("/api/agentCall", {
      method: "POST",
      headers: { "Content-Type": "application/json", },
      body: JSON.stringify({ cropType, cropSubType, queryType, weather, growthStage }),
    });

    if (!res.ok) {
      return null;
    }
    const data: MangoDiagnosis | PaddyDiagnosis =  await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
  return null;
}


export async function fetchLawDetails(userQuery: string):
 Promise<LegalAdviceResponse | null> {

  try {
    const res = await fetch("/api/lawCall", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userQuery }),
    });

    if (!res.ok) {
      return null;
    }
    const data: LegalAdviceResponse =  await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
  return null;
}


