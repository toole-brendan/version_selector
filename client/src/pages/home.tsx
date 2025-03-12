import VersionSelector from "@/components/version-selector";
import Logo from "@/components/logo";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <Logo />
        <VersionSelector />
        
        <div className="mt-8 text-center text-white text-sm">
          <p>&copy; {new Date().getFullYear()} HandReceipt. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
