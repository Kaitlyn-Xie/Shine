const defaults = { width: 20, height: 20, stroke: 'currentColor', fill: 'none', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }

const I = ({ size = 20, color = 'currentColor', sw = 1.8, children, viewBox = '0 0 24 24', style }) => (
  <svg width={size} height={size} viewBox={viewBox} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>{children}</svg>
)

export const SunIcon = ({ size = 20, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2" x2="12" y2="4" />
    <line x1="12" y1="20" x2="12" y2="22" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="2" y1="12" x2="4" y2="12" />
    <line x1="20" y1="12" x2="22" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </I>
)

export const SearchIcon = ({ size = 20, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <circle cx="11" cy="11" r="7" />
    <line x1="16.5" y1="16.5" x2="22" y2="22" />
  </I>
)

export const PlusIcon = ({ size = 20, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </I>
)

export const UserIcon = ({ size = 20, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </I>
)

export const HeartIcon = ({ size = 20, color = 'currentColor', filled = false }) => (
  <I size={size} color={color}>
    <path fill={filled ? color : 'none'} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </I>
)

export const MessageIcon = ({ size = 20, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </I>
)

export const BookmarkIcon = ({ size = 20, color = 'currentColor', filled = false }) => (
  <I size={size} color={color}>
    <path fill={filled ? color : 'none'} d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </I>
)

export const QuestionIcon = ({ size = 20, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
  </I>
)

export const ChatIcon = ({ size = 20, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </I>
)

export const MapIcon = ({ size = 20, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </I>
)

export const LockIcon = ({ size = 20, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </I>
)

export const ChevronDownIcon = ({ size = 16, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <polyline points="6 9 12 15 18 9" />
  </I>
)

export const ChevronLeftIcon = ({ size = 20, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <polyline points="15 18 9 12 15 6" />
  </I>
)

export const SendIcon = ({ size = 20, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </I>
)

export const ThumbsUpIcon = ({ size = 16, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </I>
)

export const PinIcon = ({ size = 16, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </I>
)

export const TargetIcon = ({ size = 20, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </I>
)

export const TrophyIcon = ({ size = 20, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <polyline points="8 16 10 21 12 19 14 21 16 16" />
    <path d="M8 3H5v4a7 7 0 0 0 14 0V3h-3" />
    <line x1="5" y1="3" x2="19" y2="3" />
  </I>
)

export const EditIcon = ({ size = 20, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </I>
)

export const PaperclipIcon = ({ size = 20, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </I>
)

export const MicIcon = ({ size = 20, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </I>
)

export const SmileIcon = ({ size = 20, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 13s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" />
    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" />
  </I>
)

export const CloseIcon = ({ size = 20, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </I>
)

export const MoreIcon = ({ size = 20, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <circle cx="5" cy="12" r="1" fill={color} stroke="none" />
    <circle cx="12" cy="12" r="1" fill={color} stroke="none" />
    <circle cx="19" cy="12" r="1" fill={color} stroke="none" />
  </I>
)

export const CameraIcon = ({ size = 18, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </I>
)

export const VideoIcon = ({ size = 18, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </I>
)

export const GlobeIcon = ({ size = 18, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </I>
)

export const CheckIcon = ({ size = 18, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <polyline points="20 6 9 17 4 12" />
  </I>
)

export const ArrowRightIcon = ({ size = 18, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </I>
)

export const StarIcon = ({ size = 18, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </I>
)

export const UsersIcon = ({ size = 20, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </I>
)

// 2×2 grid — represents a post feed / gallery
export const GridIcon = ({ size = 20, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <rect x="3"  y="3"  width="7" height="7" rx="1.5" />
    <rect x="14" y="3"  width="7" height="7" rx="1.5" />
    <rect x="3"  y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </I>
)

export const ListIcon = ({ size = 20, color = 'currentColor' }) => (
  <I size={size} color={color}>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" strokeWidth="2.5" />
    <line x1="3" y1="12" x2="3.01" y2="12" strokeWidth="2.5" />
    <line x1="3" y1="18" x2="3.01" y2="18" strokeWidth="2.5" />
  </I>
)

// Avatar component — initials in a colored circle, no flag emojis
export const Avatar = ({ name = '', size = 40, bg = 'linear-gradient(135deg, #FFC94A, #FF9A3C)', color = '#1A1A1A' }) => {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, color,
      letterSpacing: '-0.5px',
    }}>
      {initials}
    </div>
  )
}
