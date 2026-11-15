import React from "react";
import {Loader2Icon} from "lucide-react";

const Loading = () => {
  return (
    <div role="status" arial-label="Loading" className="h-screen flex items-center justify-center bg-black">
      <Loader2Icon size={26} className="animate-spin text-white" />
    </div>
  );
};

export default Loading;
