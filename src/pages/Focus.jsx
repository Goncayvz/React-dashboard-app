import { useCallback, useEffect, useMemo, useState, useRef } from "react"
import { useNotification } from "../context/NotificationContext"
import "../styles/focus-mode.css"

const getYoutubeEmbedUrl = (url) => {
  try {
    const parsed = new URL(url)

    let videoId = ""

    // youtube.com/watch?v=
    if (parsed.hostname.includes("youtube.com")) {
      videoId = parsed.searchParams.get("v")
    }

    // youtu.be/
    if (parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.slice(1)
    }

    if (!videoId) return ""

    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&loop=1&playlist=${videoId}&controls=1&modestbranding=1&enablejsapi=1`
  } catch {
    return ""
  }
}

const PRESETS = {
  pomodoro: { work: 25, shortBreak: 5, longBreak: 15 },
  quick: { work: 15, shortBreak: 5, longBreak: 10 },
  extended: { work: 50, shortBreak: 10, longBreak: 20 }
}

const WORK_MOTTOS = [
  "Bir adım daha. Devam.",
  "Odak = özgürlük.",
  "Bugün küçük, yarın büyük.",
  "Sadece 5 dakika daha.",
  "Dikkatini seç, sonucu yaşa."
]

const BREAK_MOTTOS = [
  "Nefes al, gevşe.",
  "Su içmeyi unutma.",
  "Omuzlarını rahat bırak.",
  "Gözlerini dinlendir.",
  "Harika gidiyorsun."
]

const SOUND_TYPES = {
  warning: { label: "Uyarı", key: "warning" },
  work: { label: "Çalışma", key: "work" },
  break: { label: "Mola", key: "break" },
  chime: { label: "Chime", key: "chime" },
  soft: { label: "Yumuşak", key: "soft" },
  digital: { label: "Dijital", key: "digital" },
  none: { label: "Sessiz", key: "none" }
}

const AMBIENT_SOUNDS = {
  rain: { 
    label: "🌧️ Yağmur", 
    key: "rain", 
    forBreak: true, 
    forWork: true,
    url: "https://cdn.pixabay.com/download/audio/2024/01/15/audio_f87f76cdc5.mp3"
  },
  stream: { 
    label: "💧 Dere", 
    key: "stream", 
    forBreak: true, 
    forWork: true,
    url: "https://cdn.pixabay.com/download/audio/2023/04/12/audio_8ddf3e1f1c.mp3"
  },
  forest: { 
    label: "🌲 Orman", 
    key: "forest", 
    forBreak: false, 
    forWork: true,
    url: "https://cdn.pixabay.com/download/audio/2023/08/03/audio_ed5d4d63bb.mp3"
  },
  wind: { 
    label: "💨 Rüzgar", 
    key: "wind", 
    forBreak: false, 
    forWork: true,
    url: "https://cdn.pixabay.com/download/audio/2023/06/15/audio_5f5d2e4b1a.mp3"
  },
  ocean: { 
    label: "🌊 Okyanus", 
    key: "ocean", 
    forBreak: true, 
    forWork: true,
    url: "https://cdn.pixabay.com/download/audio/2023/05/20/audio_6c1e4f2a3d.mp3"
  },
  none: { 
    label: "🔇 Hiçbiri", 
    key: "none", 
    forBreak: true, 
    forWork: true,
    url: null
  }
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
}

const defaultSettings = {
  mode: "pomodoro",
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  isWorkSession: true,
  secondsLeft: 25 * 60,
  cycleCount: 0,
  soundType: "break",
  ambientSound: "rain",
  ambientVolume: 0.3,
  bgSoundOn: true,

  // YouTube (arka plan sesi) - kullanıcıdan gelen link
  youtubeUrl: ""
}

const loadFocusSettings = () => {
  if (typeof window === "undefined") return { ...defaultSettings }

  try {
    const saved = localStorage.getItem("focus-settings")
    const parsed = saved ? JSON.parse(saved) : {}

    return {
      ...defaultSettings,
      ...parsed,
      bgSoundOn: typeof parsed.bgSoundOn === "boolean" ? parsed.bgSoundOn : defaultSettings.bgSoundOn,
      youtubeUrl: typeof parsed.youtubeUrl === "string" ? parsed.youtubeUrl : defaultSettings.youtubeUrl
    }
  } catch {
    return { ...defaultSettings }
  }
}


function Focus() {
  const { addNotification } = useNotification()
  const initialSettings = loadFocusSettings()

  const [mode, setMode] = useState(initialSettings.mode)
  const [workMinutes, setWorkMinutes] = useState(initialSettings.workMinutes)
  const [shortBreakMinutes, setShortBreakMinutes] = useState(initialSettings.shortBreakMinutes)
  const [longBreakMinutes, setLongBreakMinutes] = useState(initialSettings.longBreakMinutes)
  const [isWorkSession, setIsWorkSession] = useState(initialSettings.isWorkSession)
  const [secondsLeft, setSecondsLeft] = useState(initialSettings.secondsLeft)
  const [isRunning, setIsRunning] = useState(false)
  const [cycleCount, setCycleCount] = useState(initialSettings.cycleCount)
  const [customWork, setCustomWork] = useState(initialSettings.workMinutes)
  const [customShortBreak, setCustomShortBreak] = useState(initialSettings.shortBreakMinutes)
  const [customLongBreak, setCustomLongBreak] = useState(initialSettings.longBreakMinutes)
  const [soundType, setSoundType] = useState(initialSettings.soundType)
  const [ambientSound] = useState(initialSettings.ambientSound)
  const [ambientVolume, setAmbientVolume] = useState(initialSettings.ambientVolume)
  const [soundOn, setSoundOn] = useState(true)
  const [bgSoundOn, setBgSoundOn] = useState(initialSettings.bgSoundOn)

  // User-provided YouTube link
  const [youtubeUrl, setYoutubeUrl] = useState(initialSettings.youtubeUrl)

  
  const ambientAudioRef = useRef(null)
  const youtubeVolumeRef = useRef(ambientVolume)

  useEffect(() => {
    localStorage.setItem(
      "focus-settings",
      JSON.stringify({
        mode,
        workMinutes,
        shortBreakMinutes,
        longBreakMinutes,
        soundType,
        ambientSound,
        ambientVolume,
        bgSoundOn,
        youtubeUrl
      })
    )
  }, [mode, workMinutes, shortBreakMinutes, longBreakMinutes, soundType, ambientSound, ambientVolume, bgSoundOn, youtubeUrl])

  const youtubeEmbedUrl = useMemo(() => {
    if (!youtubeUrl || typeof window === "undefined") return ""
    return getYoutubeEmbedUrl(youtubeUrl.trim())
  }, [youtubeUrl])

  const youtubeIframeKey = useMemo(() => {
    return `${isRunning ? "run" : "stop"}:${bgSoundOn ? "bg1" : "bg0"}:${isWorkSession ? "work" : "break"}:${youtubeEmbedUrl}`
  }, [bgSoundOn, isRunning, isWorkSession, youtubeEmbedUrl])

  useEffect(() => {
    if (!isRunning || !bgSoundOn) {
      stopAmbientSound()
      return
    }

    // Autoplay politikası nedeniyle bazı tarayıcılarda user-gesture anında iframe yeniden mount edilmesi gerekir.
    // YouTube arka plan sesi sadece çalışma süresince kullanılır.
    if (isWorkSession && youtubeEmbedUrl && youtubeEmbedUrl.trim()) {
      // iframe key değişimi remount sağlar
    } else {
      playAmbientSound(ambientSound)
    }

    return () => {
      // durdurma tarafı yalnızca effect dışı cleanup'da
      if (!isRunning) stopAmbientSound()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, bgSoundOn, youtubeEmbedUrl, ambientSound, isWorkSession])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("Notification" in window)) return
    if (Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  // YouTube IFrame API yükleme
  useEffect(() => {
    if (typeof window === "undefined") return
    
    // YouTube API'yi yükle
    if (!window.YT) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName("script")[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    }

    // onYouTubeIframeAPIReady global fonksiyonunu tanımla
    window.onYouTubeIframeAPIReady = () => {
      // API hazır olduğunda yapılacak işlemler
    }
  }, [])

  const endSessionRef = useRef(null)

  useEffect(() => {
    if (!isRunning) return

    const timeoutId = setTimeout(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          endSessionRef.current?.()
          return prev
        }
        return prev - 1
      })
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [isRunning, secondsLeft])

  const sendBrowserNotification = useCallback((message) => {
    if (typeof window === "undefined" || !("Notification" in window)) return
    if (Notification.permission === "granted") {
      new Notification(message)
    }
  }, [])

  const playTone = useCallback((frequency, duration = 0.16, type = "sine") => {
    if (!soundOn) return
    if (typeof window === "undefined") return

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      const audioCtx = new AudioContext()
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()

      oscillator.type = type
      oscillator.frequency.value = frequency
      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)

      const now = audioCtx.currentTime

      // Daha yumuşak envelope: keskin click yerine yumuşak attack/decay
      const startGain = 0.0001
      const peakGain = 0.045
      const attack = 0.02
      const release = 0.12

      gainNode.gain.setValueAtTime(startGain, now)
      gainNode.gain.exponentialRampToValueAtTime(peakGain, now + attack)

      oscillator.start(now)
      oscillator.stop(now + duration + release)

      // Release fazı
      gainNode.gain.setValueAtTime(peakGain, now + Math.max(0, duration))
      gainNode.gain.exponentialRampToValueAtTime(startGain, now + duration + release)

      oscillator.onended = () => {
        try {
          audioCtx.close()
        } catch {
          // ignore
        }
      }
    } catch (error) {
      console.warn("Ses oynatılamadı", error)
    }
  }, [soundOn])

  const playSound = useCallback((type) => {
    if (!soundOn) return

    if (type === "warning") {
      // Daha melodik ve yumuşak "uyarı": kısa iniş (pentatonik hissi)
      playTone(784, 0.11, "sine") // G5
      setTimeout(() => playTone(659, 0.11, "sine"), 120) // E5
      setTimeout(() => playTone(523, 0.14, "sine"), 240) // C5
	      return
	    }

	    if (type === "chime") {
	      // Parlak chime: kısa major arpej (C6-E6-G6)
	      playTone(1046.5, 0.11, "sine") // C6
	      setTimeout(() => playTone(1318.5, 0.11, "sine"), 120) // E6
	      setTimeout(() => playTone(1568, 0.14, "sine"), 240) // G6
	      return
	    }

	    if (type === "soft") {
	      // Yumuşak: düşük sesli 2 nota (A4->D5)
	      playTone(440, 0.14, "triangle")
	      setTimeout(() => playTone(587.3, 0.18, "sine"), 170) // D5
	      return
	    }

	    if (type === "digital") {
	      // Dijital: kısa "blip" çift vuruş
	      playTone(880, 0.08, "square")
	      setTimeout(() => playTone(1174.7, 0.08, "square"), 110) // D6
	      return
	    }

	    if (type === "work") {
	      // Çalışma başlangıcı: "başla" chime (2 nota)
	      playTone(440, 0.12, "sine") // A4
	      setTimeout(() => playTone(659, 0.14, "sine"), 130) // E5
      return
    }

    if (type === "break") {
      // Mola: küçük major arpej (daha "tatlı")
      playTone(523, 0.14, "sine") // C5
      setTimeout(() => playTone(659, 0.14, "sine"), 140) // E5
      setTimeout(() => playTone(784, 0.16, "sine"), 280) // G5
      return
    }
  }, [playTone, soundOn])

  const applyPreset = (presetKey) => {
    const preset = PRESETS[presetKey]
    setMode(presetKey)
    setWorkMinutes(preset.work)
    setShortBreakMinutes(preset.shortBreak)
    setLongBreakMinutes(preset.longBreak)
    setCustomWork(preset.work)
    setCustomShortBreak(preset.shortBreak)
    setCustomLongBreak(preset.longBreak)
    setIsWorkSession(true)
    setMottoIndex(0)
    setSecondsLeft(preset.work * 60)
    setCycleCount(0)
    setIsRunning(false)
  }

  const resetTimer = () => {
    setSecondsLeft((isWorkSession ? workMinutes : (cycleCount >= 4 ? longBreakMinutes : shortBreakMinutes)) * 60)
    setIsRunning(false)
  }

  const endSession = useCallback(() => {
    if (isWorkSession) {
      const nextCycle = cycleCount + 1
      const nextBreak = nextCycle >= 4 ? longBreakMinutes : shortBreakMinutes
      const isLongBreak = nextCycle >= 4
      setIsWorkSession(false)
      setMottoIndex(0)
      setSecondsLeft(nextBreak * 60)
      setCycleCount(isLongBreak ? 0 : nextCycle)

      const message = isLongBreak ? "Uzun mola zamanı!" : "Kısa mola zamanı!"
      addNotification(message, "success", 4500)
      sendBrowserNotification(message)
      playSound("break")
    } else {
      setIsWorkSession(true)
      setMottoIndex(0)
      setSecondsLeft(workMinutes * 60)
      addNotification("Çalışma zamanı! Odaklanmaya geri dön.", "info", 4500)
      sendBrowserNotification("Çalışma zamanı! Odaklanmaya geri dön.")
      playSound("work")
    }
  }, [
    addNotification,
    cycleCount,
    isWorkSession,
    longBreakMinutes,
    playSound,
    sendBrowserNotification,
    shortBreakMinutes,
    workMinutes
  ])

  useEffect(() => {
    endSessionRef.current = endSession
  }, [endSession])

  function stopAmbientSound() {
    if (!ambientAudioRef.current) return
    ambientAudioRef.current.pause()
    ambientAudioRef.current.currentTime = 0
  }

  function smoothSetAmbientVolume(targetVolume) {
    const audio = ambientAudioRef.current
    if (!audio) return

    const now = typeof audio.volume === "number" ? audio.volume : 0
    const target = Math.max(0, Math.min(1, targetVolume))

    if (Math.abs(now - target) < 0.005) {
      audio.volume = target
      return
    }

    const start = performance.now()
    const duration = 220 // ms (yavaşça aç/kıs)
    const rafIdRef = (smoothSetAmbientVolume._rafIdRef ??= { current: null })

    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)

    const tick = (t) => {
      const elapsed = t - start
      const p = Math.min(1, elapsed / duration)
      // smoothstep
      const eased = p * p * (3 - 2 * p)
      audio.volume = now + (target - now) * eased
      if (p < 1) {
        rafIdRef.current = requestAnimationFrame(tick)
      }
    }

    rafIdRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    // Mp3 preset çalarken volume slider oynadıkça yumuşak değişsin
    if (!ambientAudioRef.current) return
    if (!soundOn) return
    if (!ambientSound) return
    if (youtubeEmbedUrl && youtubeEmbedUrl.trim()) return // youtube çalışıyorsa mp3 ses devre dışı
    if (!isRunning) return

    const targetVolume = Math.max(0.1, ambientVolume * 0.6)
    smoothSetAmbientVolume(targetVolume)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ambientVolume])

  // YouTube ses seviyesini kontrol et
  useEffect(() => {
    if (!youtubeEmbedUrl || !youtubeEmbedUrl.trim()) return
    if (!isRunning || !soundOn) return

    youtubeVolumeRef.current = Math.round(ambientVolume * 100)

    try {
      const iframe = document.querySelector('iframe[title="YouTube Ambient"]')
      if (!iframe || !window.YT) return

      // YouTube player'ı iframe'den al
      const player = iframe.contentWindow?.getYoutubePlayer?.()
      if (player && player.setVolume) {
        player.setVolume(youtubeVolumeRef.current)
      }
    } catch {
      // Cross-origin nedeniyle doğrudan erişim başarısız olabilir
      // Bu durumda tarayıcının ses kontrolünü kullanmasına izin ver
    }
  }, [ambientVolume, isRunning, soundOn, youtubeEmbedUrl])
  
  function playAmbientSound(soundKey) {
    if (!soundOn || soundKey === "none" || typeof window === "undefined") {
      stopAmbientSound()
      return
    }

    // YouTube iframe yönetecekse mp3/audio çalma. (Seçenek A)
    if (youtubeEmbedUrl && youtubeEmbedUrl.trim()) {
      stopAmbientSound()
      return
    }

    // Varsayılan preset sesleri
    const sound = AMBIENT_SOUNDS[soundKey]
    if (!sound || !sound.url) {
      stopAmbientSound()
      return
    }

    try {
      if (!ambientAudioRef.current) {
        ambientAudioRef.current = new Audio()
        ambientAudioRef.current.loop = true
      }

      ambientAudioRef.current.src = sound.url

      const targetVolume = Math.max(0.1, ambientVolume * 0.6)
      // Kesilme olmaması için direkt set yerine smooth ramp
      ambientAudioRef.current.volume = ambientAudioRef.current.volume || 0.0001
      smoothSetAmbientVolume(targetVolume)

      const playPromise = ambientAudioRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Ambient audio playback error", error)
        })
      }
    } catch (error) {
      console.warn("Ambient sound setup error", error)
    }
  }

  const handleCustomSave = () => {
    const newWork = Math.max(1, Number(customWork) || 0)
    const newShort = Math.max(1, Number(customShortBreak) || 0)
    const newLong = Math.max(1, Number(customLongBreak) || 0)
    setWorkMinutes(newWork)
    setShortBreakMinutes(newShort)
    setLongBreakMinutes(newLong)
    setMode("custom")
    setSecondsLeft(newWork * 60)
    setCycleCount(0)
    setIsWorkSession(true)
    setMottoIndex(0)
    setIsRunning(false)
    addNotification("Özel süreler kaydedildi.", "success", 3000)
  }

  const isWarning = isRunning && secondsLeft <= 10
  const sessionLabel = isWorkSession ? "Çalışma" : "Mola"
  const sessionSubLabel = isWorkSession
    ? "Tam konsantre ol"
    : "Rahatlamak için zaman"
  const [mottoIndex, setMottoIndex] = useState(0)
  const mottos = isWorkSession ? WORK_MOTTOS : BREAK_MOTTOS
  const motto = mottos[mottoIndex % mottos.length]

  useEffect(() => {
    if (!isRunning) return

    const intervalId = setInterval(() => {
      setMottoIndex((prev) => prev + 1)
    }, 6000)

    return () => clearInterval(intervalId)
  }, [isRunning, isWorkSession])

  const sessionTotalSeconds = isWorkSession
    ? workMinutes * 60
    : (cycleCount >= 4 ? longBreakMinutes : shortBreakMinutes) * 60

  const progress = Math.min(
    1,
    Math.max(0, sessionTotalSeconds > 0 ? 1 - secondsLeft / sessionTotalSeconds : 0)
  )

  const ringRadius = 148
  const ringCircumference = 2 * Math.PI * ringRadius
  const ringOffset = ringCircumference * (1 - progress)

  useEffect(() => {
    if (isRunning && isWarning) {
      playSound("warning")
    }
  }, [isRunning, isWarning, playSound])




  const shouldPlayYoutube = isWorkSession && isRunning && bgSoundOn && !!(youtubeEmbedUrl && youtubeEmbedUrl.trim())

  return (
    <div
      className={`focus-page px-4 py-6 sm:p-8 min-h-screen overflow-hidden relative text-white ${
        isWorkSession ? "focus-page--work" : "focus-page--break"
      }`}
    >
      {shouldPlayYoutube && (
        <div
          id="youtube-player-container"
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            opacity: 0,
            pointerEvents: "none"
          }}
        />
      )}
      <iframe
        key={youtubeIframeKey}
        width="0"
        height="0"
        src={shouldPlayYoutube ? youtubeEmbedUrl : ""}
        title="YouTube Ambient"
        allow="autoplay; encrypted-media"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none"
        }}
      />
      <div className="focus-wave focus-wave--work" aria-hidden="true" />
      <div className={`focus-wave focus-wave--break ${isWorkSession ? "focus-wave--hidden" : ""}`} aria-hidden="true" />
      <div className={`focus-mode-animation ${isWorkSession ? "focus-mode-animation--work" : "focus-mode-animation--break"}`} aria-hidden="true">
        <span className="focus-mode-dot" />
        <span className="focus-mode-dot focus-mode-dot--secondary" />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10 relative z-10">
        <section className="glass-card p-5 sm:p-8 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Odaklanma Modları</h1>
              <p className="text-zinc-300 mt-2 max-w-2xl text-sm sm:text-base">
                Pomodoro tempo, çalışma ve mola sürelerini özelleştirebileceğin bir odak alanı. Zamanın sonuna yaklaştığında görsel uyarılar ve ekran bildirimleri alırsın.
              </p>
            </div>
	            <div className="flex flex-wrap items-center gap-3">
	              <label className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm text-zinc-200">
	                <input
	                  type="checkbox"
	                  checked={soundOn}
	                  onChange={() => setSoundOn((prev) => !prev)}
	                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-blue-500 focus:ring-blue-400"
	                />
	                Ses efektleri
	              </label>

	              <label className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm text-zinc-200">
	                <input
	                  type="checkbox"
	                  checked={bgSoundOn}
	                  onChange={() => setBgSoundOn((prev) => !prev)}
	                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-blue-500 focus:ring-blue-400"
	                />
	                Arka plan sesi
	              </label>

              <div className="flex flex-wrap gap-2 sm:gap-3">
                {Object.keys(PRESETS).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`rounded-2xl px-4 sm:px-5 py-3 text-sm font-semibold transition ${mode === preset ? "bg-blue-500 text-white" : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"}`}
                  >
                    {preset === "pomodoro" ? "Pomodoro" : preset === "quick" ? "Hızlı" : "Uzun"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="glass-card p-5 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-blue-300">{sessionLabel} Zamanlayıcı</p>
                <h2 className="text-3xl sm:text-4xl font-bold mt-3">{formatTime(secondsLeft)}</h2>
              </div>
              <div className="text-right">
                <p className="text-zinc-300 text-sm sm:text-base">{sessionSubLabel}</p>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isWorkSession ? "bg-green-500/20 text-green-300" : "bg-sky-500/20 text-sky-300"}`}>
                  {isWorkSession ? "Çalışma" : "Mola"}
                </span>
              </div>
            </div>

            <div className={`focus-timer-card ${isWarning ? "focus-timer-card--warning" : ""}`}>
              <div
                className={`focus-timer-ring ${isWorkSession ? "focus-timer-ring--work" : "focus-timer-ring--break"} ${
                  isRunning ? "focus-timer-ring--running" : ""
                }`}
              >
                <svg
                  className="focus-timer-ring__svg"
                  viewBox="0 0 320 320"
                  width="320"
                  height="320"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="ringGradientWork" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="rgba(56, 189, 248, 0.95)" />
                      <stop offset="55%" stopColor="rgba(59, 130, 246, 0.85)" />
                      <stop offset="100%" stopColor="rgba(14, 165, 233, 0.90)" />
                    </linearGradient>
                    <linearGradient id="ringGradientBreak" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="rgba(52, 211, 153, 0.95)" />
                      <stop offset="55%" stopColor="rgba(16, 185, 129, 0.85)" />
                      <stop offset="100%" stopColor="rgba(34, 211, 238, 0.90)" />
                    </linearGradient>
                  </defs>

                  <circle
                    className="focus-timer-ring__track"
                    cx="160"
                    cy="160"
                    r={ringRadius}
                  />
                  <circle
                    className="focus-timer-ring__progress"
                    cx="160"
                    cy="160"
                    r={ringRadius}
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                    stroke={`url(#${isWorkSession ? "ringGradientWork" : "ringGradientBreak"})`}
                  />
                </svg>
                <div className="focus-timer-ring__content">
                  <span className="focus-timer-ring__label">{sessionLabel}</span>
                  <span className="focus-timer-ring__motto" key={`${sessionLabel}-${mottoIndex}`}>
                    {motto}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsRunning((prev) => !prev)}
                className="flex-1 sm:flex-none rounded-2xl bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-400"
              >
                {isRunning ? "Duraklat" : "Başlat"}
              </button>
              <button
                type="button"
                onClick={resetTimer}
                className="flex-1 sm:flex-none rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-white hover:bg-white/10"
              >
                Sıfırla
              </button>
              <button
                type="button"
                onClick={handleCustomSave}
                className="rounded-2xl border border-emerald-500 bg-emerald-500/10 px-6 py-3 text-emerald-200 hover:bg-emerald-500/20"
              >
                Ayarları Kaydet
              </button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Çalışma süresi</p>
                <p className="mt-3 text-3xl font-semibold">{workMinutes} dk</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Kısa mola</p>
                <p className="mt-3 text-3xl font-semibold">{shortBreakMinutes} dk</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Uzun mola</p>
                <p className="mt-3 text-3xl font-semibold">{longBreakMinutes} dk</p>
              </div>
            </div>
          </section>

          <section className="glass-card p-8 rounded-3xl border border-white/10 shadow-2xl">
            <h3 className="text-2xl font-semibold mb-4">Özelleştirilebilir Süreler</h3>
            <p className="text-zinc-400 mb-6">
              Kendi çalışma ve mola sürelerini gir. Pomodoro dışında tamamen kişisel tempo ile çalış.
            </p>

            <div className="space-y-4 mb-8">
              <label className="block">
                <span className="text-sm text-zinc-200">Çalışma süresi (dakika)</span>
                <input
                  type="number"
                  min="1"
                  value={customWork}
                  onChange={(e) => setCustomWork(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-white outline-none focus:border-blue-400"
                />
              </label>
              <label className="block">
                <span className="text-sm text-zinc-200">Kısa mola (dakika)</span>
                <input
                  type="number"
                  min="1"
                  value={customShortBreak}
                  onChange={(e) => setCustomShortBreak(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-white outline-none focus:border-blue-400"
                />
              </label>
              <label className="block">
                <span className="text-sm text-zinc-200">Uzun mola (dakika)</span>
                <input
                  type="number"
                  min="1"
                  value={customLongBreak}
                  onChange={(e) => setCustomLongBreak(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-white outline-none focus:border-blue-400"
                />
              </label>
            </div>

	            <div className="border-t border-white/10 pt-6">
	              <h4 className="text-lg font-semibold mb-3">Ses Efektleri</h4>
	              <label className="block mb-4">
	                <span className="text-sm text-zinc-200">Bildirim sesi seç</span>
	                <div className="mt-2 grid grid-cols-2 gap-2">
	                  {Object.values(SOUND_TYPES).map((sound) => (
                    <button
                      key={sound.key}
                      type="button"
                      onClick={() => setSoundType(sound.key)}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        soundType === sound.key
                          ? "bg-purple-500 text-white"
                          : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                      }`}
                    >
                      {sound.label}
                    </button>
                  ))}
                </div>
              </label>
	              <button
	                type="button"
	                onClick={() => {
	                  if (soundOn) playSound(soundType)
	                }}
	                disabled={!soundOn}
	                className={`w-full rounded-lg px-4 py-2 text-sm font-semibold transition ${
	                  soundOn
	                    ? "bg-purple-500/20 text-purple-200 hover:bg-purple-500/30"
	                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
	                }`}
	              >
		                🔊 Sesi Test Et
		              </button>
	            </div>

            <div className="border-t border-white/10 pt-6 mt-6">
              <h4 className="text-lg font-semibold mb-3">YouTube Arka Plan Sesi</h4>

              <div className="mb-4">
                <span className="text-sm text-zinc-200 mb-2 block">Kendi ses URL’in (mp3/aac direkt link)</span>
                <input
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://.../audio.mp3 veya YouTube video linki"
                  className="w-full mt-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white outline-none focus:border-blue-400"
                />

                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      const v = youtubeUrl.trim()
                      if (!v) {
                        addNotification("Lütfen bir ses URL'i gir.", "error", 3000)
                        return
                      }
                      setYoutubeUrl(v)
                      addNotification("YouTube/Link kaydedildi. Timer ile otomatik açılmaz.", "success", 3000)
                    }}
                    className="bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    Uygula
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setYoutubeUrl("")
                    }}
                    className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    Temizle
                  </button>
                </div>
              </div>

              <label className="block mt-4">
                <span className="text-sm text-zinc-200 mb-2 block">Ses seviyesi: {Math.round(ambientVolume * 100)}%</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolume}
                  onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  disabled={isRunning && !soundOn}
                />
              </label>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Focus
