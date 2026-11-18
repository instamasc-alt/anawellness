const POSE = {
  push: 'M54 18 a5 5 0 1 1 0.1 0 M54 24 L40 40 L22 34 M40 40 L46 58 L38 70 M40 40 L30 56 L34 70',
  pull: 'M26 20 a5 5 0 1 1 0.1 0 M26 26 L40 42 L58 36 M40 42 L34 60 L42 72 M40 42 L50 58 L46 72',
  legs: 'M40 14 a5 5 0 1 1 0.1 0 M40 20 L40 36 L24 52 L20 66 M40 36 L56 52 L60 66 M28 28 L52 28',
  core: 'M16 28 a5 5 0 1 1 0.1 0 M20 30 L58 36 L70 48 M34 32 L30 50 L24 62 M46 34 L50 52 L58 64',
  move: 'M40 16 a5 5 0 1 1 0.1 0 M40 22 L40 44 L28 64 M40 44 L54 64 M40 28 L24 18 M40 28 L56 16',
  test: 'M40 14 a5 5 0 1 1 0.1 0 M40 20 L40 46 L26 66 M40 46 L54 66 M22 30 H58',
  full: 'M48 16 a5 5 0 1 1 0.1 0 M48 22 L38 40 L18 46 M38 40 L32 60 L26 72 M38 40 L52 56 L60 70',
}

export function Pose({ name = 'full' }) {
  return (
    <svg className="pose" viewBox="0 0 80 80" aria-hidden="true">
      <path d={POSE[name] || POSE.full} />
    </svg>
  )
}

function Svg({ children }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

export const IconHome = () => (
  <Svg>
    <path d="M4 11.2 12 4l8 7.2V20a1 1 0 0 1-1 1h-5.2v-6.2H10.2V21H5a1 1 0 0 1-1-1v-8.8Z" />
  </Svg>
)
export const IconTrain = () => (
  <Svg>
    <path d="M6 9v6M18 9v6M3 10.5v3M21 10.5v3M6 12h12" />
  </Svg>
)
export const IconCoach = () => (
  <Svg>
    <path d="M6 16.5 4 20l4.2-1.4A8 8 0 1 0 6 16.5Z" />
  </Svg>
)
export const IconPlan = () => (
  <Svg>
    <rect x="4" y="5" width="16" height="15" rx="2" />
    <path d="M8 3.5V7M16 3.5V7M4 10h16" />
  </Svg>
)
export const IconChart = () => (
  <Svg>
    <path d="M4 19h16" />
    <path d="M7 16V10M12 16V5M17 16v-6" />
  </Svg>
)
export const IconUser = () => (
  <Svg>
    <circle cx="12" cy="8" r="3.2" />
    <path d="M5.5 19.2c1.4-2.8 3.6-4.2 6.5-4.2s5.1 1.4 6.5 4.2" />
  </Svg>
)
export const IconMenu = () => (
  <Svg>
    <path d="M5 7h14M5 12h14M5 17h14" />
  </Svg>
)
export const IconBell = () => (
  <Svg>
    <path d="M6.5 16.5h11l-1.1-1.6V10a4.4 4.4 0 0 0-8.8 0v4.9L6.5 16.5Z" />
    <path d="M10 16.5a2 2 0 0 0 4 0" />
  </Svg>
)
export const IconClose = () => (
  <Svg>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
)
export const IconBack = () => (
  <Svg>
    <path d="M15 5 8 12l7 7" />
  </Svg>
)
export const IconPlay = () => (
  <Svg>
    <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" stroke="none" />
  </Svg>
)
export const IconPause = () => (
  <Svg>
    <path d="M8 6v12M16 6v12" />
  </Svg>
)
export const IconPrev = () => (
  <Svg>
    <path d="M15 6 9 12l6 6" />
  </Svg>
)
export const IconNext = () => (
  <Svg>
    <path d="M9 6l6 6-6 6" />
  </Svg>
)
export const IconCheck = () => (
  <Svg>
    <path d="M5 12.5 9.2 17 19 7" />
  </Svg>
)
export const IconSend = () => (
  <Svg>
    <path d="M5 12h12M13 6l6 6-6 6" />
  </Svg>
)
export const IconHeart = ({ on }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
    <path d="M12 19s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9Z" />
  </svg>
)
