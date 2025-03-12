import { useLocation } from "wouter";
import { ChevronRight } from "lucide-react";

interface VersionOptionProps {
  name: string;
  route: string;
}

export default function VersionOption({ name, route }: VersionOptionProps) {
  const [_, setLocation] = useLocation();

  const handleVersionSelect = () => {
    // For external routes (in different codebases), we redirect to the full URL
    if (route === "/defense") {
      window.location.href = import.meta.env.VITE_DEFENSE_URL || "https://defense.handreceipt.com";
    } else if (route === "/commercial") {
      window.location.href = import.meta.env.VITE_COMMERCIAL_URL || "https://commercial.handreceipt.com";
    } else {
      // For internal routes, we use wouter's navigation
      setLocation(route);
    }
  };

  return (
    <button 
      onClick={handleVersionSelect}
      className="w-full text-white py-2 px-4 text-sm transition-colors duration-200 flex justify-between items-center border border-white"
      style={{ 
        borderRadius: 0, 
        fontFamily: 'sans-serif',
        fontWeight: 300,
        letterSpacing: '0.05em',
        backgroundColor: '#001f3f' // Navy blue
      }}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0033a0'} // Slightly lighter navy blue on hover
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#001f3f'}  // Back to navy blue
    >
      <span>{name}</span>
      <ChevronRight className="h-3 w-3" />
    </button>
  );
}
