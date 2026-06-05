// Timer alert: sound + vibration + (optional) browser notification
// Works in PWA on iOS (16.4+) when added to home screen, and as inline fallback.

let audioCtx = null

function getAudioContext() {
  if (audioCtx) return audioCtx
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    if (AC) audioCtx = new AC()
  } catch (e) { /* ignore */ }
  return audioCtx
}

// "Unlock" audio on first user gesture (required by iOS Safari).
// Call this once when user starts the timer.
export function unlockAudio() {
  const ctx = getAudioContext()
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
}

function beep(freq = 880, duration = 0.18, delay = 0, gain = 0.25) {
  const ctx = getAudioContext()
  if (!ctx) return
  const t0 = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  g.gain.setValueAtTime(0, t0)
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01)
  g.gain.linearRampToValueAtTime(0, t0 + duration)
  osc.connect(g).connect(ctx.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

export function playTimerEndAlert() {
  // Triple beep pattern: rising tones
  try {
    const ctx = getAudioContext()
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {})
    beep(660, 0.15, 0)
    beep(880, 0.15, 0.2)
    beep(1100, 0.32, 0.4, 0.3)
  } catch (e) { /* ignore */ }

  // Vibration (Android + some iOS PWA): pulse-pulse-long
  try {
    if (navigator.vibrate) navigator.vibrate([180, 100, 180, 100, 380])
  } catch (e) { /* ignore */ }

  // Browser notification if permission granted and page is hidden
  try {
    if ('Notification' in window
      && Notification.permission === 'granted'
      && document.visibilityState !== 'visible') {
      new Notification('Riposo finito 💪', {
        body: 'Pronto per la prossima serie',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: 'ironlog-rest',
        silent: false,
      })
    }
  } catch (e) { /* ignore */ }
}

export async function requestNotificationPermission() {
  try {
    if (!('Notification' in window)) return 'unsupported'
    if (Notification.permission === 'granted') return 'granted'
    if (Notification.permission === 'denied') return 'denied'
    const res = await Notification.requestPermission()
    return res
  } catch (e) {
    return 'error'
  }
}
