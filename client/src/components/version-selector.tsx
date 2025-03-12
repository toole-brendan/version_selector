import VersionOption from "./version-option";

export default function VersionSelector() {
  const versions = [
    { name: "Defense Version", route: "/defense" },
    { name: "Commercial Version", route: "/commercial" },
    { name: "Pitch Deck", route: "/pitch" }
  ];

  return (
    <div className="bg-white border border-gray-300 shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Select Version</h2>
      
      {versions.map((version, index) => (
        <div key={version.route} className={`${index < versions.length - 1 ? 'mb-4' : ''} border border-gray-300`}>
          <VersionOption name={version.name} route={version.route} />
        </div>
      ))}
    </div>
  );
}
