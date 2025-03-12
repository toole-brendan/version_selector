export default function Logo() {
  return (
    <div className="text-center mb-12">
      <h1 className="font-georgia text-4xl md:text-5xl lg:text-6xl font-light text-black tracking-wide logo-border">
        HandReceipt
      </h1>
      <style jsx>{`
        .logo-border {
          -webkit-text-stroke: 2px black;
        }
        @media (min-width: 768px) {
          .logo-border {
            -webkit-text-stroke: 3px black;
          }
        }
      `}</style>
    </div>
  );
}
