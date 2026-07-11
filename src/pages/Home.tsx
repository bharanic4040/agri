import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Loc, RainForecast } from "../models/agri";
import { fetchWeatherData, formatDateToDDMMYYYY, getLocation, getRainDescription } from "../utils/utils";

export default function Home() {

  const [forecast, setForecast] = useState<RainForecast[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const loc: Loc = await getLocation();
        if (loc && loc.longitude && loc.latitude) {
          const lat = loc.latitude.toFixed(4);
          const lon = loc.longitude.toFixed(4);
          const data: RainForecast[] = await fetchWeatherData(lat, lon);
          setForecast(data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, []);

  return (
    <>
      <div className="flex flex-col items-center gap-4" style={{ marginTop: "100px", marginBottom: "20px" }}>


        <Link to="/crop-types" className="w-1/2">
          <div className="w-full py-4 bg-gradient-to-r from-blue-700 to-indigo-800 rounded-lg shadow-lg text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-wide">
               వరి రకాలు
            </h2>
          </div>
        </Link>

      </div>
      <div className="text-blue-700">
        <div className="font-bold">వాతావరణం</div>
        <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-blue-700 text-white">
            <tr>
              <th className="px-2 py-2 text-center">తేదీ</th>
              <th className="px-2 py-2 text-center">🌡 ఉష్ణోగ్రత</th>
              <th className="px-2 py-2 text-center">🌧 వర్ష సూచన</th>
            </tr>
          </thead>

          <tbody>
            {forecast.map((day, index) => (
              <tr
                key={day.date}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="border px-2 py-2">{formatDateToDDMMYYYY(day.date)}</td>
                <td className="border px-2 py-2 text-center">
                  {day.maxTemp}°C
                </td>

                <td className="border px-2 py-2">
                  {getRainDescription(day.rain)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>

      <div
        style={{
          margin: "40px",
          fontSize: "20px",
          fontWeight: "bold",
          color: "#fbbf24",
        }}
      >
        💬 సూచనలు bharanic404@gmail.com
      </div>

    </>
  );
}
