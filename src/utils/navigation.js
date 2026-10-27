export function appUrl(path = '') {
  return `${window.location.href.split('#')[0]}#${path}`
}

export function openAppPage(path) {
  window.open(appUrl(path), '_blank')
}

export function redirectAppPage(path) {
  window.location.href = appUrl(path)
}
