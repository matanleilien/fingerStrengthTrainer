import { HOLDS } from '../data/holds';
import './Fingerboard.css';

export default function Fingerboard({ activeHoldIds = [], highlightColor = '#00e676' }) {
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
              return (
                <rect
                  key={`${hold.id}-${i}`}
                  x={pos.x - pos.w / 2}
                  y={pos.y - pos.h / 2}
                  width={pos.w}
                  height={pos.h}
                  rx={1.5}
                  ry={1.5}
                  className={`hold-rect ${isActive ? 'active' : ''}`}
                  style={isActive ? {
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
        {activeHoldIds.length > 0 && HOLDS.filter(h => activeHoldIds.includes(h.id)).map(hold => (
          <div
            key={`label-${hold.id}`}
            className="hold-label"
            style={{
              left: `${hold.positions[0].x}%`,
              top: `${hold.positions[0].y + hold.positions[0].h / 2 + 2}%`,
            }}
          >
            {hold.name}
          </div>
        ))}
      </div>
    </div>
  );
}
