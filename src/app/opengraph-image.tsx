import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt =
  'Casamento Events Management — Full-Service Event Planning & Production Philippines';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

const logoDataPromise = readFile(join(process.cwd(), 'src/app/icon.png'), 'base64')
  .then((data) => `data:image/png;base64,${data}`)
  .catch(() => null);

export default async function OpenGraphImage() {
  const logoSrc = await logoDataPromise;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#F7F3E8',
          color: '#3A4F1C',
          padding: '64px 72px',
          border: '12px solid #3A4F1C',
        }}
      >
        {/* Top Eyebrow + Brand Mark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {logoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoSrc}
                alt=""
                width={84}
                height={84}
                style={{ objectFit: 'contain' }}
              />
            ) : null}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  color: '#BC6F07',
                  textTransform: 'uppercase',
                }}
              >
                Philippines • Nationwide Production
              </span>
              <span
                style={{
                  fontSize: 34,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: '#3A4F1C',
                  textTransform: 'uppercase',
                }}
              >
                Casamento Events Management
              </span>
            </div>
          </div>
        </div>

        {/* Center Value Proposition */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            maxWidth: '960px',
          }}
        >
          <div
            style={{
              width: '88px',
              height: '4px',
              backgroundColor: '#BC6F07',
            }}
          />
          <div
            style={{
              fontSize: 54,
              fontWeight: 700,
              lineHeight: 1.15,
              color: '#2A3A14',
            }}
          >
            Full-Service Events Management &amp; Creative Production
          </div>
          <div
            style={{
              fontSize: 24,
              lineHeight: 1.45,
              color: '#3A4F1C',
              opacity: 0.85,
            }}
          >
            Corporate Events • Brand Activations &amp; Roadshows • Social Celebrations • Event Styling • Livestreaming &amp; E-Commerce Production
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '2px solid rgba(58, 79, 28, 0.18)',
            paddingTop: '24px',
            fontSize: 20,
            color: '#3A4F1C',
          }}
        >
          <span>Metro Manila • Luzon • Visayas • Mindanao</span>
          <span style={{ color: '#BC6F07', fontWeight: 700 }}>casamentoevents.com</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
