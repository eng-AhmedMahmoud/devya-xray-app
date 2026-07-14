import { ImageResponse } from 'next/og';

// Rendered on demand by the standalone server (static prerender of image
// routes isn't served reliably from the standalone output).
export const dynamic = 'force-dynamic';
export const alt = 'Devya X-Ray — engineering review consultancy';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const MARK = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"><defs><linearGradient id="s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#c9c9cf"/><stop offset="1" stop-color="#8f8f96"/></linearGradient></defs><rect width="512" height="512" rx="112" fill="#141414"/><rect x="6" y="6" width="500" height="500" rx="106" fill="none" stroke="#2a2a2a" stroke-width="4"/><g fill="none" stroke="url(#s)" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"><path d="M150 116 H128 A12 12 0 0 0 116 128 V150"/><path d="M362 116 H384 A12 12 0 0 1 396 128 V150"/><path d="M150 396 H128 A12 12 0 0 1 116 384 V362"/><path d="M362 396 H384 A12 12 0 0 0 396 384 V362"/><line x1="116" y1="256" x2="396" y2="256"/></g></svg>`,
)}`;

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 88px',
          background:
            'radial-gradient(1100px 620px at 50% -10%, #17181c 0%, #0a0a0b 55%, #08090b 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MARK} width={72} height={72} alt="" />
          <div style={{ display: 'flex', fontSize: 30, color: '#A3A3A3', letterSpacing: 6 }}>
            DEVYA · X-RAY
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 44,
            fontSize: 82,
            fontWeight: 700,
            color: '#F5F5F5',
            lineHeight: 1.05,
            letterSpacing: -1,
          }}
        >
          They interview you.
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 82,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -1,
            background: 'linear-gradient(90deg,#ffffff,#c9c9cf,#8f8f96)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          We read your code.
        </div>
        <div style={{ display: 'flex', marginTop: 40, fontSize: 30, color: '#A3A3A3' }}>
          Engineering review · 7 pillars · verified against your code · delivered in 2 weeks
        </div>
      </div>
    ),
    { ...size },
  );
}
