import { NavLink } from 'react-router-dom';

const links = [
  { to: '/',    label: 'OVERVIEW' },
  { to: '/v2',  label: 'V2 CLASSIC' },
];

export default function DashboardNav() {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        gap: 2,
        padding: '8px 12px',
        background: 'rgba(10, 12, 18, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          style={({ isActive }) => ({
            fontFamily: "'Orbitron', monospace",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: 4,
            color: isActive ? '#00FFCC' : 'rgba(255,255,255,0.45)',
            background: isActive ? 'rgba(0,255,204,0.08)' : 'transparent',
            border: isActive ? '1px solid rgba(0,255,204,0.2)' : '1px solid transparent',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          })}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
