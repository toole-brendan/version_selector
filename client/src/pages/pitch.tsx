import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import Logo from "@/components/logo";

export default function Pitch() {
  const [_, setLocation] = useLocation();

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <Logo />
        
        <div className="bg-white border border-gray-300 shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Pitch Deck</h2>
          <p className="mb-6 text-gray-700">
            This is the pitch deck page for HandReceipt. 
            In a real implementation, this would contain the pitch deck content.
          </p>
          
          <Button 
            className="w-full"
            onClick={() => setLocation("/")}
          >
            Back to Version Selector
          </Button>
        </div>
        
        <div className="text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} HandReceipt. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
