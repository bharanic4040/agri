import { Link } from "react-router-dom";
import ElementTile from "../components/ElementTile";
import cropTypes from "../data/paddy-type.json";
import type { CropProps } from "../models/agri";
import { FaHome } from "react-icons/fa";
import { useState } from "react";
import { fetchCropFertilizerSchedule, loadCropsAndReturnMap, parseLLMOutputAndFormat } from "../utils/utils";


export default function CropType() {

    const [cropSubType, setSubCropType] = useState<string>("సోనా మసూరి (BPT 3291)");
    const crop_types: Map<string, CropProps> = loadCropsAndReturnMap(cropTypes.types);
    const [paddyLLMOutput, setPaddyLLMOutput] = useState<Map<string, string[]> | null>(null);


    const changeCropSubType = (selectedValue: string) => {
        setPaddyLLMOutput(null);
        setSubCropType(selectedValue);
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

    return (
        <div className="text-blue-700 min-h-screen flex flex-col p-8">

            <div className="w-full py-4 mb-6 bg-gradient-to-r from-blue-700 to-indigo-800 rounded-lg shadow-lg text-center">
                <h4 className=" text-3xl md:text-4xl font-extrabold text-white tracking-wide">
                    వరి రకాలు
                </h4>
            </div>
            <div className="flex items-center gap-4">
                <Link to="/">
                    <FaHome size={45} />
                </Link>
            </div>
            <div className="flex items-center gap-4 mb-6 justify-center" >
                <label className="text-blue-700 text-s font-semibold whitespace-nowrap">
                    {"వరి రకం : "}
                </label>
                <select value={cropSubType} onChange={(e) => changeCropSubType(e.target.value)}
                    className="px-4 py-3 text-lg
                                       font-semibold  bg-white border border-gray-300 rounded-2xl shadow-md
                                       focus:outline-none  focus:ring-2 focus:ring-blue-500  focus:border-blue-500">
                    {Array.from(crop_types.values()).map((element) => (
                        <option key={element.రకం} value={element.రకం}>
                            {element.రకం}
                        </option>
                    ))}
                    {[...crop_types.entries()].map(([name, _]) => (
                        <option key={name} value={name}> {name}  </option>
                    ))}
                </select>
            </div>
            <div
                className=" gap-8 justify-center"
                style={{ marginTop: "10px" }}>
                <ElementTile element={crop_types.get(cropSubType)} />
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
                            <span className="text-red-700 font-bold">{timeline}</span>
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