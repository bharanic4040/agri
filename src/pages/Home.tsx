import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center gap-4" style={{ marginTop: "100px" }}>
       
        
         <Link to="/crop-types" className="w-1/2">
          <div className="w-full py-4 bg-gradient-to-r from-blue-700 to-indigo-800 rounded-lg shadow-lg text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-wide">
             వరి రకాలు
            </h2>
          </div>
        </Link>
      
       
       

      </div>


      <div
        style={{
          margin: "40px",
          fontSize: "20px",
          fontWeight: "bold",
          color: "#fbbf24",
        }}
      >
        💬 Feedback bharanic404@gmail.com
      </div>

    </>
  );
}