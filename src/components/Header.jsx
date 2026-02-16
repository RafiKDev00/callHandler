import './Header.css';

// Bold cross SVG component - Red Cross style with outlined vertices
function CrossLogo({ size = 32, color = "white", className = "" }) {
  return (
    <svg
      viewBox="-2 -2 28 28"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ transform: 'skewX(-12deg)' }}
    >
      {/* Outer thin white outline */}
      <path
        d="M8 0H16V8H24V16H16V24H8V16H0V8H8V0Z"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="2"
      />
      {/* Inner subtle outline */}
      <path
        d="M8 0H16V8H24V16H16V24H8V16H0V8H8V0Z"
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="0.5"
      />
      {/* Main bold cross */}
      <path
        d="M8 0H16V8H24V16H16V24H8V16H0V8H8V0Z"
        fill={color}
      />
    </svg>
  );
}

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo-icon">
            <CrossLogo size={32} color="white" />
          </div>
          <div className="title-section">
            <h1 className="app-title">CallHandler</h1>
            <div className="powered-by">
              <span>powered by</span>
              <img
                src="https://static.scribemd.ai/assets/prod/logo-b2c84ae1eb5833070341ede85b5c1f9bf2d8f5ca345b105d914f43a9a279242b.svg"
                alt="ScribeMD"
                className="scribemd-logo"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
