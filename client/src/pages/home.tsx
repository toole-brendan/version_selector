import VersionSelector from "@/components/version-selector";
import Logo from "@/components/logo";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
      <div className="w-full max-w-md mx-auto">
        <Logo />
        <VersionSelector />
      </div>
    </div>
  );
}
