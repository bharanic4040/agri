    
import type { CropProps } from "../models/agri";

export function loadCropsAndReturnMap(cropTypesArray: CropProps[]) : Map<string, CropProps> {
  const dictionaryMap = new Map<string, CropProps>();

  cropTypesArray.forEach((entry: any) => {
     dictionaryMap.set(entry["రకం"], entry);
  });

  return dictionaryMap;
}