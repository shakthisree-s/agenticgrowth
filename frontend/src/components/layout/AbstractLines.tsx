import React from 'react';

export const AbstractLines: React.FC<{ style?: React.CSSProperties; opacity?: number }> = ({ style, opacity = 0.5 }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
        opacity,
        ...style
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1200 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMaxYMin slice"
        style={{ width: '100%', height: '100%' }}
      >
        <path
          d="M300 -50 C 550 120, 800 50, 1250 200"
          stroke="#000000"
          strokeWidth="0.75"
          strokeOpacity="0.08"
          strokeDasharray="none"
        />
        <path
          d="M250 -30 C 520 140, 780 70, 1280 230"
          stroke="#000000"
          strokeWidth="0.75"
          strokeOpacity="0.06"
        />
        <path
          d="M200 -10 C 490 160, 760 90, 1310 260"
          stroke="#000000"
          strokeWidth="0.75"
          strokeOpacity="0.05"
        />
        <path
          d="M150 10 C 460 180, 740 110, 1340 290"
          stroke="#000000"
          strokeWidth="0.75"
          strokeOpacity="0.04"
        />
        <path
          d="M100 30 C 430 200, 720 130, 1370 320"
          stroke="#000000"
          strokeWidth="0.75"
          strokeOpacity="0.04"
        />

        {/* Lower flowing curves */}
        <path
          d="M-50 400 C 400 350, 700 550, 1250 420"
          stroke="#000000"
          strokeWidth="0.75"
          strokeOpacity="0.06"
        />
        <path
          d="M-30 430 C 420 370, 720 570, 1270 450"
          stroke="#000000"
          strokeWidth="0.75"
          strokeOpacity="0.05"
        />
        <path
          d="M-10 460 C 440 390, 740 590, 1290 480"
          stroke="#000000"
          strokeWidth="0.75"
          strokeOpacity="0.04"
        />
      </svg>
    </div>
  );
};
