import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  highlight?: string        // coloured second word e.g. "DETAILS"
  subtitle: string
  action?: ReactNode        // button on the right
  gradient?: 'green' | 'yellow' | 'blue' | 'red'
}

const gradientMap: Record<string, string> = {
  green:  'linear-gradient(270deg,#1fd693,#4e8fff,#1fd693)',
  yellow: 'linear-gradient(270deg,#f5b731,#f04f5a,#f5b731)',
  blue:   'linear-gradient(270deg,#4e8fff,#b07eff,#4e8fff)',
  red:    'linear-gradient(270deg,#f04f5a,#f5b731,#f04f5a)',
}

export default function PageHeader({ title, highlight, subtitle, action, gradient = 'green' }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-2">
      <div>
        <h1
          style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: '34px',
            letterSpacing: '3px',
            lineHeight: 1,
            background: gradientMap[gradient],
            backgroundSize: '300% 300%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'gradientShift 5s ease infinite',
          }}
        >
          {title}{highlight && <> <span style={{ opacity: 0.85 }}>{highlight}</span></>}
        </h1>
        {/* Animated underline */}
        <div
          style={{
            height: '2px',
            width: '60px',
            marginTop: '6px',
            marginBottom: '6px',
            background: gradientMap[gradient],
            backgroundSize: '300% 100%',
            animation: 'gradientShift 3s ease infinite',
            borderRadius: '2px',
          }}
        />
        <p
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '11px',
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          {subtitle}
        </p>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
