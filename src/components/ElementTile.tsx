import type { CropProps } from "../models/agri";

interface ElementTileProps {
  element: CropProps | undefined;
}

export default function ElementTile({ element, }: ElementTileProps) {
  return (

    <div className="text-blue-700 bg-white rounded-lg shadow-md p-5 max-w-lg mx-auto">
      <div className="grid grid-cols-[130px_1fr] gap-y-2 gap-x-3">
        {element?.["రకం"] && <>
          <div className="font-bold">రకం</div>
          <div>{element?.["రకం"]}</div> </>}

        {element?.["ఇతర_పేర్లు"] && <>
          <div className="font-bold">ఇతర పేర్లు</div>
          <div>{element?.["ఇతర_పేర్లు"]}</div></>}

        {element?.["పండు_పరిమాణం"] && <>
          <div className="font-bold">పండు పరిమాణం</div>
          <div>{element?.["పండు_పరిమాణం"]}</div></>}

        {element?.["రుచి"] && <>
          <div className="font-bold">రుచి</div>
          <div>{element?.["రుచి"]}</div></>}
        {element?.["పంట_కాలం"] && <>
          <div className="font-bold">పంట కాలం</div>
          <div>{element?.["పంట_కాలం"]}</div></>}

        {element?.["సీజన్"] && <>
          <div className="font-bold">సీజన్</div>
          <div>{element?.["సీజన్"]}</div></>}

        {element?.["సంభావ్య_దిగుబడి"] && <>
          <div className="font-bold">దిగుబడి</div>
          <div>{element?.["సంభావ్య_దిగుబడి"]}</div></>}

        {element?.["వినియోగం"] && <>
          <div className="font-bold">వినియోగం</div>
          <div>{element?.["వినియోగం"]}</div></>}

        {element?.["అనుకూల_ప్రాంతం"] && <>
          <div className="font-bold">అనుకూల ప్రాంతం</div>
          <div>{element?.["అనుకూల_ప్రాంతం"]}</div></>}
        {element?.["ప్రత్యేక_లక్షణాలు"] && <>
          <div className="font-bold">ప్రత్యేక లక్షణాలు</div>
          <div>{element?.["ప్రత్యేక_లక్షణాలు"]}</div></>}

      </div>
    </div>
  );
}