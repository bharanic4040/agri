import { Link } from "react-router-dom";
import type { LegalAdviceResponse } from "../models/agri";
import { FaHome } from "react-icons/fa";
import { useState } from "react";
import { fetchLawDetails } from "../utils/utils";
import SpeechRecognition, { useSpeechRecognition, } from "react-speech-recognition";

export default function CropType() {

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
    } = useSpeechRecognition();

    const language = "te-IN";

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [userQuery, setUserQuery] = useState<string>("");
    const [lawOutput, setLawOutput] = useState<LegalAdviceResponse | null>(null);

    const resetListening = () => {
      
        if (listening) {
            if (transcript) {
                setUserQuery(transcript);
            }
            SpeechRecognition.stopListening();
        } else {
            resetTranscript();
            SpeechRecognition.startListening({
                continuous: true,
                language: language,
            });
        }
    };

    const fetchLegalDetails = async () => {
        if (isLoading) {
            return;
        }
        try {
           
            setLawOutput(null);
            if (userQuery.trim() === "" || userQuery.trim().length >= 150) {
                return;
            }
             setIsLoading(true);
            const data = await fetchLawDetails(userQuery.trim());
            if (!data) {
                return;
            }
            setLawOutput(data);
        } catch (err) {
            console.error(err);
        }
        setIsLoading(false);
    };

    return (
        <div className="text-blue-700 min-h-screen flex flex-col p-8">

            <div className="w-full py-4 mb-6 bg-gradient-to-r from-blue-700 to-indigo-800 rounded-lg shadow-lg text-center">
                <h4 className=" text-3xl md:text-4xl font-extrabold text-white tracking-wide">
                    న్యాయ సలహా
                </h4>
            </div>
            <div className="flex items-center gap-4">
                <Link to="/">
                    <FaHome size={45} />
                </Link>
            </div>
            <div className="text-red-700 font-semibold">మీ సమస్యను వివరించండి</div>
            <div style={{ marginTop: "10px" }}>

                {browserSupportsSpeechRecognition && (
                    listening ? (
                        <button
                            onClick={resetListening}
                            className="px-2 py-2 rounded-xl bg-red-600 text-white font-bold shadow-lg hover:bg-red-700"
                        >
                            ఆపండి 🎤
                        </button>
                    ) : (
                        <button
                            onClick={resetListening}
                            className="px-2 py-2 rounded-xl bg-green-600 text-white font-bold shadow-lg hover:bg-green-700"
                        >
                            మాట్లాడండి 🎤
                        </button>
                       
                    )
                )}
                 <button
  onClick={() => setUserQuery("")} style={{ marginLeft: "10px"}}
  className="px-3 py-2 rounded-xl bg-gray-600 text-white font-semibold shadow hover:bg-gray-700 transition"
>
  🗑️  క్లియర్
</button>
                <textarea style={{ marginTop: "10px"}}
                    rows={3}
                    placeholder=""
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    className="
    w-full
    rounded-xl
    border border-gray-300
    bg-white
    px-4 py-3
    text-gray-800
    placeholder:text-gray-400
    shadow-sm
    resize-none
    transition
    duration-200
    focus:border-red-600
    focus:ring-2
    focus:ring-red-200
    focus:outline-none
  "
                />
            </div>

            <div style={{ marginTop: "10px" }}>
                <button onClick={fetchLegalDetails}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow">
                    న్యాయ సలహా - నొక్కండి
                </button>
                {isLoading && (
                    <div className="flex justify-center items-center py-4">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                    </div>
                )}
            </div>


            {lawOutput &&
                <div className="text-blue-700 bg-white rounded-lg shadow-md p-5 max-w-lg mx-auto"
                    style={{ marginTop: "10px" }}>
                    <div className="text-red-700 font-semibold">సమస్య విశ్లేషణ</div>
                    <div>{lawOutput["సమస్య విశ్లేషణ"]}</div>
                    <hr />
                    {lawOutput["సంబంధిత చట్టాలు మరియు సెక్షన్లు"] &&
                        <div className="text-red-700 font-semibold">సంబంధిత చట్టాలు మరియు సెక్షన్లు</div>}
                    {lawOutput["సంబంధిత చట్టాలు మరియు సెక్షన్లు"].map((item) => (
                        <div key={item}>{item}</div>
                    ))}
                    <hr />
                    {lawOutput["శిక్షల వివరాలు"] &&
                        <div className="text-red-700 font-semibold">శిక్షల వివరాలు</div>}
                    {lawOutput["శిక్షల వివరాలు"].map((item) => (
                        <div key={item}>{item}</div>
                    ))}
                    <hr />
                    {lawOutput["ఉదాహరణలు"] &&
                        <div className="text-red-700 font-semibold">ఉదాహరణలు</div>}
                    {lawOutput["ఉదాహరణలు"].map((item) => (
                        <div key={item}>{item}</div>
                    ))}
                    <hr />
                    {lawOutput["తదుపరి చర్యలు"] &&
                        <div className="text-red-700 font-semibold">తదుపరి చర్యలు</div>}
                    {lawOutput["తదుపరి చర్యలు"].map((item) => (
                        <div key={item}>{item}</div>
                    ))}
                    <hr />

                    <div className="text-red-700 font-semibold">ముఖ్య గమనిక</div>
                    <div>ఈ సమాచారం కేవలం అవగాహన కోసం మాత్రమే. ఇది వృత్తిపరమైన న్యాయ సలహాకు ప్రత్యామ్నాయం కాదు. మీ కేసు యొక్క ప్రత్యేక పరిస్థితులను బట్టి న్యాయ సలహా మారుతుంది, కాబట్టి దయచేసి ఒక అర్హత కలిగిన న్యాయవాదిని సంప్రదించండి.</div>


                </div>
            }


        </div>

    );
}