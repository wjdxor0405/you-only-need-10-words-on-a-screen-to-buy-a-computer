// navigator.clipboard needs a secure context (https or localhost). A phone opening the app at
// a plain-http address doesn't have one, so fall back to selecting a hidden textarea.
export async function copyText(text: string): Promise<boolean> {
  if (window.isSecureContext && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Denied: try the old way.
    }
  }
  const area = document.createElement('textarea')
  area.value = text
  area.readOnly = true // no keyboard on a phone
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.focus()
  area.setSelectionRange(0, text.length)
  let copied = false
  try {
    copied = document.execCommand('copy')
  } catch {
    copied = false
  }
  area.remove()
  return copied
}
