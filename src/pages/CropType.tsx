import { Link } from "react-router-dom";
import ElementTile from "../components/ElementTile";
import cropTypes from "../data/paddy-type.json";
import mangoCropTypes from "../data/mango-type.json";
import type { CropProps } from "../models/agri";
import { FaHome } from "react-icons/fa";
import { useEffect, useState } from "react";
import { fetchCropFertilizerSchedule, loadCropsAndReturnMap, parseLLMOutputAndFormat } from "../utils/utils";


export default function CropType() {

    const CROP_TYPES: string[] = ["వరి", "మామిడి"];
     const [cropType, setCropType] = useState<string>("వరి");
    const [cropSubType, setCropSubType] = useState<string>("సోనా మసూరి (BPT 3291)");
    const [cropSubTypes, setCropSubTypes] = useState<Map<string, CropProps>>(
        loadCropsAndReturnMap(cropTypes.types));
    const [paddyLLMOutput, setPaddyLLMOutput] = useState<Map<string, string[]> | null>(null);
    
    useEffect(() => {
        getSubTypesBasedOnCrop(cropType);
    }, [cropType]);

    const getSubTypesBasedOnCrop = (cropType: string) => {
        if (cropType === "మామిడి") {
            setCropSubTypes(loadCropsAndReturnMap(mangoCropTypes.types));
            setCropSubType("బంగనపల్లి");
        } else {
            setCropSubTypes(loadCropsAndReturnMap(cropTypes.types));
            setCropSubType("సోనా మసూరి (BPT 3291)");
        }
    }

    const changeCropSubType = (selectedValue: string) => {
        setPaddyLLMOutput(null);
        setCropSubType(selectedValue);
    };
    const changeCropType = (selectedValue: string) => {
        setPaddyLLMOutput(null);
        setCropType(selectedValue);
    };

    const fetchFertilizerSchedule = async () => {
        try {
            setPaddyLLMOutput(null);
            const data = await fetchCropFertilizerSchedule("paddy", cropSubType);
            if (!data) {
                return;
            }
            const paddyLLMOutput: Map<string, string[]> = parseLLMOutputAndFormat(data);
            setPaddyLLMOutput(paddyLLMOutput);
        } catch (err) {
            console.error(err);
        }
    };

    function getPhase(timelineAndPhase: string): string {
        return timelineAndPhase.split("|")[0];
    }

    function getTimeline(timelineAndPhase: string) : string {
        return timelineAndPhase.split("|")[1];
    }

    return (
        <div className="text-blue-700 min-h-screen flex flex-col p-8">

            <div className="w-full py-4 mb-6 bg-gradient-to-r from-blue-700 to-indigo-800 rounded-lg shadow-lg text-center">
                <h4 className=" text-3xl md:text-4xl font-extrabold text-white tracking-wide">
                    పంట సాగు
                </h4>
            </div>
            <div className="flex items-center gap-4">
                <Link to="/">
                    <FaHome size={45} />
                </Link>
            </div>
             <div className="flex items-center gap-4 mb-6 justify-center" >
                <label className="text-blue-700 text-s font-semibold whitespace-nowrap">
                    {"పంట : "}
                </label>
                <select value={cropType} onChange={(e) => changeCropType(e.target.value)}
                    className="px-4 py-3 text-lg font-semibold  bg-white border border-gray-300 rounded-2xl shadow-md
                                       focus:outline-none  focus:ring-2 focus:ring-blue-500  focus:border-blue-500">
                    {Array.from(CROP_TYPES!.values()).map((element) => (
                        <option key={element} value={element}> {element} </option>
                    ))}
                 
                </select>
            </div>
            <div className="flex items-center gap-4 mb-6 justify-center" >
                <label className="text-blue-700 text-s font-semibold whitespace-nowrap">
                    {"రకం : "}
                </label>
                <select value={cropSubType} onChange={(e) => changeCropSubType(e.target.value)}
                    className="px-4 py-3 text-lg font-semibold  bg-white border border-gray-300 rounded-2xl shadow-md
                                       focus:outline-none  focus:ring-2 focus:ring-blue-500  focus:border-blue-500">
                    {Array.from(cropSubTypes!.values()).map((element) => (
                        <option key={element.రకం} value={element.రకం}>
                            {element.రకం}
                        </option>
                    ))}
                 
                </select>
            </div>

            <div
                className=" gap-8 justify-center"
                style={{ marginTop: "10px" }}>
                <ElementTile element={cropSubTypes.get(cropSubType)} />
            </div>
            <div>
                <button onClick={fetchFertilizerSchedule} style={{ marginTop: "10px"}}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow">
                    ఎరువుల యాజమాన్యం (ఎకరానికి) చూడండి
                </button></div>

            {paddyLLMOutput &&
                <div className="text-blue-700 bg-white rounded-lg shadow-md p-5 max-w-lg mx-auto"
                    style={{ marginTop: "10px" }}>
                    {[...paddyLLMOutput.entries()].map(([timeline, fertilizers]) => (
                        <div key={timeline} style={{ marginBottom: "10px"}}>
                       { cropType === "మామిడి" &&    
                       <span className="text-red-700 font-bold">{getPhase(timeline)}</span>
                          }   <span className="text-red-700 font-bold">{getTimeline(timeline)}</span>
                            <span>
                                {fertilizers.map((item) => (
                                    <div key={item}>
                                        {item}
                                    </div>
                                ))}
                            </span>
                            <hr />
                        </div>
                    ))}
                </div>
            }

        </div>

    );
}