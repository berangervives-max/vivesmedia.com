'use client'
import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring } from 'framer-motion'

type Props = {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}

// Compteur qui s'anime de 0 vers `value` quand il entre dans le viewport (micro-détail premium).
export default function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 0, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const mv = useMotionValue(0)
  const spring = useSpring(mv, { stiffness: 55, damping: 18 })

  useEffect(() => {
    if (inView) mv.set(value)
  }, [inView, value, mv])

  useEffect(() => {
    return spring.on('change', (v) => {
      if (ref.current) ref.current.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`
    })
  }, [spring, prefix, suffix, decimals])

  return <span ref={ref} className={className}>{`${prefix}0${suffix}`}</span>
}
