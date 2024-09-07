import { Button } from "@headlessui/react";
import { MdOutlinePanTool, MdAdd, MdRemove } from "react-icons/md";
import { HiArrowsPointingIn, HiArrowsPointingOut } from "react-icons/hi2";

export default function BtnsGroupRow({
  togglePanMode,
  isPanMode,
  scrollToCenter,
  toggleFullScreen,
  handleZoom,
}) {
  return (
    <div className="flex flex-col md:flex-row md:space-x-4">
      <div className="btns-group justify-center w-12 h-12 mb-4 md:mb-0">
        <Button
          className={`btn aspect-square relative group w-full ${
            isPanMode && "bg-primary text-white hover:bg-primary"
          }`}
          onClick={togglePanMode}
        >
          <MdOutlinePanTool size={24} />
          <span className="absolute whitespace-nowrap shadow-lg -left-16 md:-left-2 md:bottom-12 opacity-0 group-hover:opacity-100 bg-gray-700 text-white p-1 px-2 text-xs rounded z-10 pointer-events-none">
            Space
          </span>
        </Button>
      </div>
      <div className="btns-group md:h-12 flex-col md:flex-row">
        <Button
          className="btn aspect-square relative group"
          onClick={() => scrollToCenter("smooth")}
        >
          <HiArrowsPointingIn size={24} />
          <span className="absolute whitespace-nowrap shadow-lg -left-9 md:left-1.5 md:bottom-12 opacity-0 group-hover:opacity-100 bg-gray-700 text-white p-1 px-2 text-xs rounded z-10 pointer-events-none">
            F1
          </span>
        </Button>
        <Button
          className="btn aspect-square relative group"
          onClick={toggleFullScreen}
        >
          <HiArrowsPointingOut size={24} />
          <span className="absolute whitespace-nowrap shadow-lg -left-10 md:left-1 md:bottom-12 opacity-0 group-hover:opacity-100 bg-gray-700 text-white p-1 px-2 text-xs rounded z-10 pointer-events-none">
            F2
          </span>
        </Button>

        <Button
          className="btn aspect-square relative group"
          onClick={() => handleZoom("in")}
        >
          <MdAdd size={24} />
          <span className="absolute whitespace-nowrap shadow-lg  -left-9 md:left-1.5 md:bottom-12 opacity-0 group-hover:opacity-100 bg-gray-700 text-white p-1 px-2 text-xs rounded z-10 pointer-events-none">
            +
          </span>
        </Button>
        <Button className="btn aspect-square relative group">
          <MdRemove size={24} onClick={() => handleZoom("out")} />
          <span className="absolute whitespace-nowrap shadow-lg  -left-9 md:left-2 md:bottom-12 opacity-0 group-hover:opacity-100 bg-gray-700 text-white p-1 px-2 text-xs rounded z-10 pointer-events-none">
            -
          </span>
        </Button>
      </div>
    </div>
  );
}
