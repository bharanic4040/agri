import type { CropProps } from "../models/agri";

interface ElementTileProps {
  element: CropProps | undefined;
}

export default function ElementTile({ element, }: ElementTileProps) {
  return (

    <div className="text-blue-700 bg-white rounded-lg shadow-md p-5 max-w-lg mx-auto">
      <div className="grid grid-cols-[130px_1fr] gap-y-2 gap-x-3">

        <div className="font-bold">రకం</div>
        <div>{element?.["రకం"]}</div>

        <div className="font-bold">విడుదల సంస్థ</div>
        <div>{element?.["విడుదల_సంస్థ"]}</div>

        <div className="font-bold">పెంపక విధానం</div>
        <div>{element?.["పెంపక_విధానం"]}</div>

        <div className="font-bold">పంట కాలం</div>
        <div>{element?.["పంట_కాలం"]}</div>

        <div className="font-bold">సీజన్</div>
        <div>{element?.["సీజన్"]}</div>

        <div className="font-bold">దిగుబడి</div>
        <div>{element?.["సంభావ్య_దిగుబడి"]}</div>

        <div className="font-bold">అనుకూల ప్రాంతం</div>
        <div>{element?.["అనుకూల_ప్రాంతం"]}</div>

        <div className="font-bold">ప్రత్యేక లక్షణాలు</div>
        <div>{element?.["ప్రత్యేక_లక్షణాలు"]}</div>

      </div>
    </div>
  );
}