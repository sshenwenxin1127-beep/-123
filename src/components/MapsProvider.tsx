import { APIProvider } from '@vis.gl/react-google-maps';
import { ReactNode, useEffect } from 'react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export function MapsProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    (window as any).gm_authFailure = () => {
      window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    };
    const origError = console.error;
    console.error = (...args: unknown[]) => {
      origError.apply(console, args);
      const msg = args.map((a) => String(a)).join(' ');
      if (msg.includes('OverQuotaMapError') || msg.includes('QuotaExceededError')) {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
      }
    };
  }, []);

  return (
    <APIProvider 
      apiKey={GOOGLE_MAPS_API_KEY} 
      libraries={['places', 'marker']}
    >
      {children}
    </APIProvider>
  );
}
