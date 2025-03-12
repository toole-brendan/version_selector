import VersionOption from "./version-option";

export default function VersionSelector() {
  const versions = [
    { name: "Defense Version", route: "/defense" },
    { name: "Commercial Version", route: "/commercial" },
    { name: "Pitch Deck", route: "/pitch" }
  ];

  return (
    <div className="flex flex-col space-y-5">
      {versions.map((version) => (
        <div key={version.route} className="border border-gray-300">
          <VersionOption name={version.name} route={version.route} />
        </div>
      ))}
    </div>
  );
}
