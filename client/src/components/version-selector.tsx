import VersionOption from "./version-option";

export default function VersionSelector() {
  const versions = [
    { name: "Defense Version", route: "/defense" },
    { name: "Commercial Version", route: "/commercial" },
    { name: "Pitch Deck", route: "/pitch" }
  ];

  return (
    <div>
      <h2 className="text-white text-center text-sm font-sans font-light tracking-wider uppercase mb-4">Select Version:</h2>
      <div className="flex flex-col space-y-5 max-w-[180px] mx-auto">
        {versions.map((version) => (
          <div key={version.route} className="border border-gray-300">
            <VersionOption name={version.name} route={version.route} />
          </div>
        ))}
      </div>
    </div>
  );
}
