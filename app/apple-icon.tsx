import { ImageResponse } from 'next/og';

// Rendered on demand by the standalone server (static prerender of image
// routes isn't served reliably from the standalone output).
export const dynamic = 'force-dynamic';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// Silver X-Ray scan mark on ink — matches app/icon.svg.
const MARK = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"><defs><linearGradient id="s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#c9c9cf"/><stop offset="1" stop-color="#8f8f96"/></linearGradient></defs><g fill="none" stroke="url(#s)" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"><path d="M150 116 H128 A12 12 0 0 0 116 128 V150"/><path d="M362 116 H384 A12 12 0 0 1 396 128 V150"/><path d="M150 396 H128 A12 12 0 0 1 116 384 V362"/><path d="M362 396 H384 A12 12 0 0 0 396 384 V362"/><line x1="116" y1="256" x2="396" y2="256"/></g></svg>`,
)}`;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0A0A',
          borderRadius: 40,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MARK} width={128} height={128} alt="" />
      </div>
    ),
    { ...size },
  );
}
