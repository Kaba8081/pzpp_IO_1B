const createBanner = (title: string, from: string, to: string) =>
  `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 360">
      <defs>
        <linearGradient id="sky" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${from}"/>
          <stop offset="1" stop-color="${to}"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="360" fill="url(#sky)"/>
      <path d="M0 260 L145 135 L280 248 L405 110 L580 270 L690 190 L815 275 L990 120 L1200 265 L1200 360 L0 360 Z" fill="#020808" opacity="0.82"/>
      <path d="M0 308 C160 260 315 330 500 286 C710 235 865 330 1200 270 L1200 360 L0 360 Z" fill="#061010" opacity="0.86"/>
      <circle cx="930" cy="88" r="46" fill="#ffffff" opacity="0.2"/>
      <text x="68" y="94" fill="#ffffff" opacity="0.42" font-family="Cinzel, serif" font-size="44" font-weight="700" letter-spacing="12">${title}</text>
    </svg>
  `)}`;

export const bannerPool = [
  createBanner("CAVE", "#102f2d", "#3d254c"),
  createBanner("MOUNTAIN", "#113947", "#182541"),
  createBanner("KINGDOM", "#343018", "#0f3e38"),
  createBanner("TEMPLE", "#193b2d", "#3b2b19"),
];
