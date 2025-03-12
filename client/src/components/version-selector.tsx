import VersionOption from "./version-option";

export default function VersionSelector() {
  const versions = [
    { name: "Defense", route: "/defense" },
    { name: "Commercial", route: "/commercial" },
    { name: "Pitch Deck", route: "/pitch" }
  ];

  return (
    <div>
      <h2 className="text-white text-center text-sm font-sans font-light tracking-wider uppercase mb-4">Select Version:</h2>
      <div className="flex flex-col space-y-5 max-w-[140px] mx-auto">
        {versions.map((version) => (
          <div key={version.route} className="border border-black">
            <VersionOption name={version.name} route={version.route} />
          </div>
        ))}
      </div>
    </div>
  );
}
