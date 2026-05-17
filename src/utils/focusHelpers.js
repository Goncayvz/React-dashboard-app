export const getYoutubeEmbedUrl = (url) => {
  try {
    const parsed = new URL(url)

    let videoId = ""

    if (parsed.hostname.includes("youtube.com")) {
      videoId = parsed.searchParams.get("v")
    }

    if (parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.slice(1)
    }

    if (!videoId) return ""

    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&loop=1&playlist=${videoId}&controls=1&modestbranding=1&enablejsapi=1`
  } catch {
    return ""
  }
}

export const getDirectAudioUrl = (url) => {
  const trimmedUrl = url.trim()
  if (!trimmedUrl || getYoutubeEmbedUrl(trimmedUrl)) return ""

  try {
    const parsed = new URL(trimmedUrl)
    if (!["http:", "https:"].includes(parsed.protocol)) return ""
    return trimmedUrl
  } catch {
    return ""
  }
}

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
}
