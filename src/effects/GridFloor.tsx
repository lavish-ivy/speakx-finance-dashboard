const GRID_COLOR = 'rgba(0, 242, 255, 0.04)';
const GRID_SPACING = 60;

const keyframesStyle = `
@keyframes grid-scroll {
  0% { background-position: 0 0; }
  100% { background-position: 0 ${GRID_SPACING}px; }
}
`;

export default function GridFloor() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      <style>{keyframesStyle}</style>

      {/* Perspective grid surface */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '-50%',
          width: '200%',
          height: '70%',
          transformOrigin: 'bottom center',
          transform: 'perspective(800px) rotateX(60deg)',
          backgroundImage: [
            `repeating-linear-gradient(0deg, transparent, transparent ${GRID_SPACING - 1}px, ${GRID_COLOR} ${GRID_SPACING - 1}px, ${GRID_COLOR} ${GRID_SPACING}px)`,
            `repeating-linear-gradient(90deg, transparent, transparent ${GRID_SPACING - 1}px, ${GRID_COLOR} ${GRID_SPACING - 1}px, ${GRID_COLOR} ${GRID_SPACING}px)`,
          ].join(', '),
          backgroundSize: `${GRID_SPACING}px ${GRID_SPACING}px`,
          animation: 'grid-scroll 3s linear infinite',
        }}
      />

      {/* Radial fade overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background:
            'radial-gradient(ellipse at 50% 100%, transparent 20%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.95) 100%)',
        }}
      />
    </div>
  );
}
