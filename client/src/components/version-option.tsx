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
      className="w-full text-black py-2 px-4 text-sm transition-colors duration-200 flex justify-between items-center"
      style={{ 
        borderRadius: 0, 
        fontFamily: 'sans-serif',
        fontWeight: 300,
        letterSpacing: '0.05em',
        backgroundColor: '#8da9ca'
      }}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#7b97b8'}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#8da9ca'}
    >
      <span>{name}</span>
      <ChevronRight className="h-3 w-3" />
    </button>
  );
}
