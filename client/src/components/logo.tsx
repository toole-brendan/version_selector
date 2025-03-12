export default function Logo() {
  return (
    <div className="text-center mb-12">
      <h1 className="font-georgia text-4xl md:text-5xl lg:text-6xl tracking-wide">
        <span className="logo-border">HandReceipt</span>
      </h1>
      <style>
        {`
          .logo-border {
            font-family: Georgia, serif;
            font-weight: 100;
            color: white;
            -webkit-text-stroke: 2px white;
            border: 3px solid white;
            padding: 0.25em 0.5em;
            display: inline-block;
          }
          @media (min-width: 768px) {
            .logo-border {
              -webkit-text-stroke: 2.5px white;
              border: 4px solid white;
            }
          }
        `}
      </style>
    </div>
  );
}
