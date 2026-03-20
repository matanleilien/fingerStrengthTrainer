import { HOLDS } from '../data/holds';
import './Fingerboard.css';

// activeHand: null = both sides highlighted, 'left' = index 0 only, 'right' = index 1 only
export default function Fingerboard({ activeHoldIds = [], highlightColor = '#00e676', activeHand = null }) {
  return (
    <div className="fingerboard-container">
      <div className="fingerboard-wrapper">
        <img
          src="/fingerboard.png"
          alt="Metolius Simulator 3D Fingerboard"
          className="fingerboard-image"
          draggable={false}
        />
        <svg className="fingerboard-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
          {HOLDS.map(hold =>
            hold.positions.map((pos, i) => {
              const isActive = activeHoldIds.includes(hold.id);
              // For one-handed holds, only highlight the relevant side
              const isHandMatch = !activeHand
                || hold.positions.length === 1
                || (activeHand === 'left' && i === 0)
                || (activeHand === 'right' && i === 1);
              const show = isActive && isHandMatch;
              return (
                <rect
                  key={`${hold.id}-${i}`}
                  x={pos.x - pos.w / 2}
                  y={pos.y - pos.h / 2}
                  width={pos.w}
                  height={pos.h}
                  rx={1.5}
                  ry={1.5}
                  className={`hold-rect ${show ? 'active' : ''}`}
                  style={show ? {
                    fill: highlightColor,
                    fillOpacity: 0.35,
                    stroke: highlightColor,
                    strokeWidth: 0.8,
                    filter: `drop-shadow(0 0 4px ${highlightColor})`,
                  } : {}}
                />
              );
            })
          )}
        </svg>
        {/* Hold labels */}
        {activeHoldIds.length > 0 && HOLDS.filter(h => activeHoldIds.includes(h.id)).map(hold => {
          // Position label near the active side for one-handed holds
          let labelPos;
          if (activeHand === 'right' && hold.positions.length > 1) {
            labelPos = hold.positions[1];
          } else {
            labelPos = hold.positions[0];
          }
          return (
            <div
              key={`label-${hold.id}`}
              className="hold-label"
              style={{
                left: `${labelPos.x}%`,
                top: `${labelPos.y + labelPos.h / 2 + 1}%`,
              }}
            >
              {hold.name}
              {activeHand && hold.oneHanded && (
                <span className="hand-badge">
                  {activeHand === 'left' ? ' (L)' : ' (R)'}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
