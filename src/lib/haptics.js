let hapticsModule = null

async function getHaptics() {
  if (hapticsModule !== undefined) return hapticsModule
  try {
    const { Capacitor } = await import('@capacitor/core')
    if (Capacitor.isNativePlatform()) {
      const mod = await import('@capacitor/haptics')
      hapticsModule = mod.Haptics
      return hapticsModule
    }
  } catch {}
  hapticsModule = null
  return null
}

export async function hapticLight() {
  const h = await getHaptics()
  if (h) h.impact({ style: 'light' })
}

export async function hapticMedium() {
  const h = await getHaptics()
  if (h) h.impact({ style: 'medium' })
}

export async function hapticSuccess() {
  const h = await getHaptics()
  if (h) h.notification({ type: 'success' })
}

export async function hapticWarning() {
  const h = await getHaptics()
  if (h) h.notification({ type: 'warning' })
}
