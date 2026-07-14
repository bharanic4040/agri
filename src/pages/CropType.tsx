import { Link } from "react-router-dom";
import ElementTile from "../components/ElementTile";
import cropTypes from "../data/paddy-type.json";
import mangoCropTypes from "../data/mango-type.json";
import type { CropProps, MangoDiagnosis, PaddyDiagnosis } from "../models/agri";
import { FaHome } from "react-icons/fa";
import { useEffect, useState } from "react";
import { fetchCropFertilizerSchedule, fetchPests, loadCropsAndReturnMap, parseLLMOutputAndFormat } from "../utils/utils";
import { CROP_TYPES, MANGO_GROWTH_STAGES, MANGO_WEATHER, PADDY_GROWTH_STAGES, PADDY_WEATHER } from "../utils/constants";


export default function CropType() {

    const [growthStage, setGrowthStage] = useState<string>("నారుమడి దశ");
     const [isFertilizerLoading, setIsFertilizerLoading] = useState<boolean>(false);
     const [isPestsLoading, setIsPestsLoading] = useState<boolean>(false);
    const [growthStages, setGrowthStages] = useState<string[]>(PADDY_GROWTH_STAGES);
    const [weather, setWeather] = useState<string>("ఎండ");
    const [weathers, setWeathers] = useState<string[]>(PADDY_WEATHER);
    const [cropType, setCropType] = useState<string>("వరి");
    const [cropSubType, setCropSubType] = useState<string>("సోనా మసూరి (BPT 3291)");
    const [cropSubTypes, setCropSubTypes] = useState<Map<string, CropProps>>(
        loadCropsAndReturnMap(cropTypes.types));
    const [paddyLLMOutput, setPaddyLLMOutput] = useState<Map<string, string[]> | null>(null);
    const [pestsLLMOutput, setPestsLLMOutput] = useState<MangoDiagnosis | PaddyDiagnosis | null>(null);


    useEffect(() => {
        getSubTypesBasedOnCrop(cropType);
        getGrowthStagesBasedOnCrop(cropType);
        getWeatherBasedOnCrop(cropType);
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
    const getGrowthStagesBasedOnCrop = (cropType: string) => {
        if (cropType === "మామిడి") {
            setGrowthStages(MANGO_GROWTH_STAGES);
            setGrowthStage("లేత మొక్క (0 నుండి 1 సంవత్సరం)");
        } else {
            setGrowthStages(PADDY_GROWTH_STAGES);
            setGrowthStage("నారుమడి దశ");
        }
    }

    const getWeatherBasedOnCrop = (cropType: string) => {
        if (cropType === "మామిడి") {
            setWeathers(MANGO_WEATHER);
            setWeather("అకాల వర్షం");
        } else {
            setWeathers(PADDY_WEATHER);
            setWeather("ఎండగా ఉండటం");
        }
    }

    const changeCropSubType = (selectedValue: string) => {
        setPaddyLLMOutput(null);
        setPestsLLMOutput(null);
        setCropSubType(selectedValue);
        setIsFertilizerLoading(false);
        setIsPestsLoading(false);
    };
    const changeCropType = (selectedValue: string) => {
        setPaddyLLMOutput(null);
        setPestsLLMOutput(null);
        setIsFertilizerLoading(false);
        setIsPestsLoading(false);
        setCropType(selectedValue);
    };
    const changeGrowthStage = (selectedValue: string) => {
        setPestsLLMOutput(null);
        setGrowthStage(selectedValue);
        setIsFertilizerLoading(false);
        setIsPestsLoading(false);
    };
    const changeWeather = (selectedValue: string) => {
        setPestsLLMOutput(null);
        setWeather(selectedValue);
        setIsFertilizerLoading(false);
        setIsPestsLoading(false);
    };

    const fetchPestsAndDiseases = async () => {
        if (isPestsLoading) {
            return;
        }
        try {
            setIsPestsLoading(true);
            setPestsLLMOutput(null);
            const data: MangoDiagnosis | PaddyDiagnosis | null
                = await fetchPests(cropType, cropSubType, "pests", weather, growthStage);
            if (!data) {
                return;
            }
            setPestsLLMOutput(data);
        } catch (err) {
            console.error(err);
        }
         setIsPestsLoading(false);
    };

    const fetchFertilizerSchedule = async () => {
        if (isFertilizerLoading) {
            return;
        }
        try {
            setIsFertilizerLoading(true);
            setPaddyLLMOutput(null);
            const data = await fetchCropFertilizerSchedule(cropType, cropSubType);
            if (!data) {
                return;
            }
            const paddyLLMOutput: Map<string, string[]> = parseLLMOutputAndFormat(data);
            setPaddyLLMOutput(paddyLLMOutput);
        } catch (err) {
            console.error(err);
        }
         setIsFertilizerLoading(false);
    };

    function getPhase(timelineAndPhase: string): string {
        return timelineAndPhase.split("|")[0];
    }

    function getTimeline(timelineAndPhase: string): string {
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
                    className="h-16 px-4 py-3 text-lg font-semibold  bg-white border border-gray-300 rounded-2xl shadow-md
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
                    className="h-16 px-4 py-3 text-lg font-semibold  bg-white border border-gray-300 rounded-2xl shadow-md
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
            <div style={{ marginTop: "10px" }}>
                <button onClick={fetchFertilizerSchedule} 
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow">
                    ఎరువుల యాజమాన్యం (ఎకరానికి) - నొక్కండి
                </button>
                {isFertilizerLoading && (
  <div className="flex justify-center items-center py-4">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
  </div>
)}
                </div>


            {paddyLLMOutput &&
                <div className="text-blue-700 bg-white rounded-lg shadow-md p-5 max-w-lg mx-auto"
                    style={{ marginTop: "10px" }}>
                    {[...paddyLLMOutput.entries()].map(([timeline, fertilizers]) => (
                        <div key={timeline} style={{ marginBottom: "10px" }}>
                            {cropType === "మామిడి" &&
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
            <div style={{ marginTop: "20px" }}>
                <hr />
            </div>

            <div  style={{ marginTop: "20px", marginBottom: "5px" }}>
                <button onClick={fetchPestsAndDiseases}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow">
                    తెగుళ్లు మరియు పురుగులు - నొక్కండి
                </button>
                        {isPestsLoading && (
  <div className="flex justify-center items-center py-4">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
  </div>
)}
            </div>
            <div>
                <label className="text-blue-700 text-s font-semibold whitespace-nowrap">
                    {"పంట దశ : "}
                </label>
            </div>
            <div className="flex items-center gap-2 mb-6 justify-center" >

                <select value={growthStage} onChange={(e) => changeGrowthStage(e.target.value)}
                    className="h-16 px-4 py-3 text-lg font-semibold  bg-white border border-gray-300 rounded-2xl shadow-md
                                       focus:outline-none  focus:ring-2 focus:ring-blue-500  focus:border-blue-500">
                    {Array.from(growthStages!.values()).map((element) => (
                        <option key={element} value={element}> {element} </option>
                    ))}

                </select>
            </div>
            <div>
                <label className="text-blue-700 text-s font-semibold whitespace-nowrap">
                    {"వాతావరణం : "}
                </label>
            </div>
            <div className="flex items-center gap-2 mb-6 justify-center" >

                <select value={weather} onChange={(e) => changeWeather(e.target.value)}
                    className="h-16 px-4 py-3 text-lg font-semibold  bg-white border border-gray-300 rounded-2xl shadow-md
                                       focus:outline-none  focus:ring-2 focus:ring-blue-500  focus:border-blue-500">
                    {Array.from(weathers!.values()).map((element) => (
                        <option key={element} value={element}> {element} </option>
                    ))}

                </select>
            </div>


            {pestsLLMOutput &&
                <div className="text-blue-700 bg-white rounded-lg shadow-md p-5 max-w-lg mx-auto"
                    style={{ marginTop: "10px" }}>

                   {pestsLLMOutput.diseases.high_risk.length >= 1 &&
                     <div className="text-red-700 font-semibold">తెగుళ్లు</div>}
                    {pestsLLMOutput.diseases.high_risk.map((disease) => (
                        <span key={disease.name}>
                            <div>పేరు : {disease.name}</div>
                            <div>లక్షణాలు : {disease.symptoms.join(".")}</div>
                            <div>రసాయన నివారణ : {disease.chemical_remediation.join(".")}</div>
                            <div>సేంద్రీయ నివారణ : {disease.organic_remediation.join(".")}</div>
                             <hr/>
                        </span>
                       
                    ))}
                     {pestsLLMOutput.pests.high_risk.length >= 1 &&
                    <div className="text-red-700 font-semibold">పురుగులు</div> }
                    {pestsLLMOutput.pests.high_risk.map((pest) => (
                        <span key={pest.name}>
                            <div>పేరు : {pest.name}</div>
                            <div>లక్షణాలు : {pest.symptoms.join(".")}</div>
                            <div>రసాయన నివారణ : {pest.chemical_remediation.join(".")}</div>
                            <div>సేంద్రీయ నివారణ : {pest.organic_remediation.join(".")}</div>
                             <hr/>
                        </span>

                    ))}
                </div>
            }

        </div>

    );
}