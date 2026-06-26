'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, Square } from 'lucide-react'

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Dictée vocale via l'API navigateur (Web Speech API) — 100 % gratuit, sans clé,
 * fonctionne dans Chrome/Edge. Bouton Enregistrer → Arrêter ; le texte transcrit
 * (fr-FR) est renvoyé en continu via onResult. Réutilisable partout (cockpit de
 * validation, fiches, réponses…).
 */
export default function VoiceInput({
  onResult,
  label = 'Dicter',
  className = '',
}: {
  onResult: (text: string) => void
  label?: string
  className?: string
}) {
  const [supported, setSupported] = useState(true)
  const [listening, setListening] = useState(false)
  const recRef = useRef<any>(null)
  const finalRef = useRef('')
  // On garde le callback dans une ref pour ne PAS recréer la reconnaissance à chaque rendu.
  const cbRef = useRef(onResult)
  useEffect(() => { cbRef.current = onResult }, [onResult])

  useEffect(() => {
    const SR = (typeof window !== 'undefined') && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    if (!SR) { setSupported(false); return }
    const rec = new SR()
    rec.lang = 'fr-FR'
    rec.continuous = true
    rec.interimResults = true
    rec.onresult = (e: any) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) finalRef.current += t + ' '
        else interim += t
      }
      cbRef.current((finalRef.current + interim).trim())
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recRef.current = rec
    return () => { try { rec.stop() } catch { /* déjà arrêté */ } }
  }, [])

  const toggle = useCallback(() => {
    const rec = recRef.current
    if (!rec) return
    if (listening) {
      try { rec.stop() } catch { /* noop */ }
      setListening(false)
    } else {
      finalRef.current = ''
      try { rec.start(); setListening(true) } catch { /* déjà démarré */ }
    }
  }, [listening])

  if (!supported) {
    return <span className="text-xs" style={{ color: '#D97706' }}>Dictée vocale indisponible ici — ouvre le CMS dans Chrome.</span>
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${className}`}
      style={listening
        ? { background: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5' }
        : { background: '#fff', color: '#6B7280', border: '1px solid #E5E7EB' }}
      title={listening ? 'Arrêter la dictée' : 'Dicter au micro'}
    >
      {listening
        ? <><Square className="w-3 h-3" /> Arrêter</>
        : <><Mic className="w-3 h-3" /> {label}</>}
      {listening && <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#DC2626' }} /><span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: '#DC2626' }} /></span>}
    </button>
  )
}
