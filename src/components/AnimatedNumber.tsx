import { useEffect, useState } from 'react'
import { animate, useMotionValue } from 'framer-motion'

interface Props {
  value: number
  duration?: number
}

/** Zählt weich auf einen neuen Zahlenwert – ersetzt die QTimer-MMR-Animation. */
export function AnimatedNumber({ value, duration = 0.6 }: Props) {
  const motionValue = useMotionValue(value)
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => controls.stop()
  }, [value, duration, motionValue])

  return <>{display}</>
}
