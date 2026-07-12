
export interface CropProps {
    "రకం": string;
    "మూలవంశం"?: string | null;
    "పెంపక_విధానం"?: string | null;
    "విడుదల_సంవత్సరం"?: number | null;
    "విడుదల_సంస్థ"?: string | null;
    "పంట_కాలం"?: string | null;
    "సీజన్"?: string | null;
    "సంభావ్య_దిగుబడి"?: string | null;
    "అనుకూల_ప్రాంతం"?: string | null;
    "ప్రత్యేక_లక్షణాలు"?: string | null;
}

export interface RainForecast {
    date: string;
    maxTemp?: number;
    rain?: number;
}

export interface Loc {
    longitude: number;
    latitude: number;
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