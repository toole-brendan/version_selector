export default function Logo() {
  return (
    <div className="text-center mb-12">
      <h1 className="tracking-wide">
        <span className="logo-border">HandReceipt</span>
      </h1>
      <style>
        {`
          .logo-border {
            font-family: Georgia, serif;
            font-size: 2.5rem;
            font-weight: 100;
            color: white;
            -webkit-text-stroke: 0;
            letter-spacing: 0.05em;
            border: 2px solid white;
            padding: 0.25em 0.5em;
            display: inline-block;
          }
          @media (min-width: 768px) {
            .logo-border {
              font-size: 3rem;
              border: 2px solid white;
            }
          }
        `}
      </style>
    </div>
  );
}
