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
    if (route === "/defense" || route === "/commercial") {
      window.location.href = route;
    } else {
      // For internal routes, we use wouter's navigation
      setLocation(route);
    }
  };

  return (
    <button 
      onClick={handleVersionSelect}
      className="w-full text-black py-2 px-4 text-sm transition-all duration-200 flex justify-between items-center backdrop-blur-sm"
      style={{ 
        borderRadius: 0, 
        fontFamily: 'sans-serif',
        fontWeight: 300,
        letterSpacing: '0.05em',
        backgroundColor: 'rgba(141, 169, 202, 0.85)', // Polo blue with transparency
        boxShadow: 'inset 0 0 15px rgba(255, 255, 255, 0.25)'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(123, 151, 184, 0.9)';
        e.currentTarget.style.boxShadow = 'inset 0 0 20px rgba(255, 255, 255, 0.3)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(141, 169, 202, 0.85)';
        e.currentTarget.style.boxShadow = 'inset 0 0 15px rgba(255, 255, 255, 0.25)';
      }}
    >
      <span>{name}</span>
      <ChevronRight className="h-3 w-3" />
    </button>
  );
}
