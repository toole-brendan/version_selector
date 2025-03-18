import { useLocation } from "wouter";
import { ChevronRight } from "lucide-react";

interface VersionOptionProps {
  name: string;
  route: string;
}

export default function VersionOption({ name, route }: VersionOptionProps) {
  const [_, setLocation] = useLocation();

  const handleVersionSelect = () => {
    // For defense and commercial routes, redirect to the separate applications
    if (route === "/defense") {
      // Direct routing to the actual index.html file
      window.location.href = "/defense/index.html";
    } else if (route === "/commercial") {
      // Direct routing to the actual index.html file
      window.location.href = "/commercial/index.html";
    } else {
      // For internal routes like pitch, use wouter's navigation
      setLocation(route);
    }
  };

  return (
    <button 
      onClick={handleVersionSelect}
      className="w-full text-white py-2 px-4 text-sm transition-colors duration-200 flex justify-between items-center border border-white font-sans font-light tracking-wider bg-[#495D87] hover:bg-[#3E5BA8]"
    >
      <span>{name}</span>
      <ChevronRight className="h-3 w-3" />
    </button>
  );
}
