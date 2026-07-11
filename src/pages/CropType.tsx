import { Link } from "react-router-dom";
import ElementTile from "../components/ElementTile";
import cropTypes from "../data/paddy-type.json";
import type { CropProps } from "../models/agri";
import { FaHome } from "react-icons/fa";
import { useState } from "react";
import { loadCropsAndReturnMap } from "../utils/utils";


export default function CropType() {

    const [cropSubType, setSubCropType] = useState<string>("సోనా మసూరి (BPT 3291)");
    const crop_types: Map<string, CropProps> = loadCropsAndReturnMap(cropTypes.types);

    const changeCropSubType = (selectedValue: string) => {
        setSubCropType(selectedValue);
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
                <select  value={cropSubType} onChange={(e) => changeCropSubType(e.target.value)}
                    className="px-4 py-3 text-lg
                                       font-semibold  bg-white border border-gray-300 rounded-2xl shadow-md
                                       focus:outline-none  focus:ring-2 focus:ring-blue-500  focus:border-blue-500">
                    {Array.from(crop_types.values()).map((element) => (
                        <option key={element.రకం} value={element.రకం}>
                            {element.రకం}
                        </option>
                    ))}

                     {[...crop_types.entries()].map(([name, _]) => (
                        <option key={name} value={name}>
                            {name}
                        </option>
                    ))}
                </select>
               
            </div>
            <div
                className=" gap-8 justify-center"
                style={{ marginTop: "10px" }}>
                    <ElementTile
                        element={crop_types.get(cropSubType)}
                    />
                
            </div>
        </div>

    );
}