
export interface CropProps {
    "రకం": string;
    "పెంపక_విధానం"?: string | null;
    "పంట_కాలం"?: string | null;
    "సీజన్"?: string | null;
    "సంభావ్య_దిగుబడి"?: string | null;
    "అనుకూల_ప్రాంతం"?: string | null;
    "ప్రత్యేక_లక్షణాలు"?: string | null;
    "ఇతర_పేర్లు"?: string | null;
    "పండు_పరిమాణం"?: string | null;
    "రుచి"?: string | null;
    "వినియోగం"?: string | null;
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

/* pests and diseases schema */
export interface RiskItem {
  name: string;
  symptoms: string[];
  organic_remediation: string[];
  chemical_remediation: string[];
}

export interface LowRiskItem {
  name: string;
  reason_for_low_risk: string;
}

export interface RiskCategory {
  high_risk: RiskItem[];
  low_risk_or_resistant: LowRiskItem[];
}

export interface MangoDiagnosis {
  mango_variety: string;
  tree_age: string;
  current_weather: string;

  diseases: RiskCategory;
  pests: RiskCategory;

  weather_and_age_specific_advice: string[];
}

export interface PaddyDiagnosis {
  paddy_variety: string;
  crop_growth_stage: string;
  current_weather: string;

  diseases: RiskCategory;
  pests: RiskCategory;

  weather_and_stage_specific_advice: string[];
}
/* ends */

/** LAW Advice */
export interface LegalAdviceResponse {
  "సమస్య విశ్లేషణ": string;
  "సంబంధిత చట్టాలు మరియు సెక్షన్లు": string[];
  "శిక్షల వివరాలు": string[];
  "ఉదాహరణలు": string[];
  "తదుపరి చర్యలు": string[];
  "legal_disclaimer": string;
}