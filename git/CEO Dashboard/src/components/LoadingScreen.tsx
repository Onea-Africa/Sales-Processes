import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 1200);
    const hideTimer = setTimeout(() => setVisible(false), 1700);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
      style={{ transition: 'opacity 0.5s ease', opacity: fading ? 0 : 1, pointerEvents: fading ? 'none' : 'all' }}
    >
      <div className="flex flex-col items-center gap-lg">
        <img src="/Clean_Backround.png" alt="Onea Africa" className="h-16 w-auto" />
        <div className="flex gap-sm">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: '#8CC444', animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
