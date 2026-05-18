import { useCallback, useEffect, useMemo, useState, useRef } from "react"
import { useNotification } from "../context/NotificationContext"
import { formatTime, getDirectAudioUrl, getYoutubeEmbedUrl } from "../utils/focusHelpers"
import "../styles/focus-mode.css"

const PRESETS = {
  pomodoro: { work: 25, shortBreak: 5, longBreak: 15 },
  quick: { work: 15, shortBreak: 5, longBreak: 10 },
  extended: { work: 50, shortBreak: 10, longBreak: 20 }
}

const WORK_MOTTOS = [
  "Bir adım daha. Devam. (One more step. Keep going.)",
  "Odak = özgürlük. (Focus = freedom.)",
  "Bugün küçük, yarın büyük. (Small today, big tomorrow.)",
  "Sadece 5 dakika daha. (Just 5 more minutes.)",
  "Dikkatini seç, sonucu yaşa. (Choose your attention, live the result.)"
]

const BREAK_MOTTOS = [
  "Nefes al, gevşe. (Breathe and relax.)",
  "Su içmeyi unutma. (Remember to drink water.)",
  "Omuzlarını rahat bırak. (Relax your shoulders.)",
  "Gözlerini dinlendir. (Rest your eyes.)",
  "Harika gidiyorsun. (You are doing great.)"
]

const SOUND_TYPES = {
  warning: { label: "Uyarı (Warning)", key: "warning" },
  work: { label: "Çalışma (Work)", key: "work" },
  break: { label: "Mola (Break)", key: "break" },
  chime: { label: "Chime", key: "chime" },
  soft: { label: "Yumuşak (Soft)", key: "soft" },
  digital: { label: "Dijital", key: "digital" },
  none: { label: "Sessiz (Silent)", key: "none" }
}

const formatCompletedTime = (dateString) => {
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(dateString))
  } catch {
    return "--:--"
  }
}

const loadCompletedPomodoros = () => {
  if (typeof window === "undefined") return []

  try {
    const saved = localStorage.getItem("focus-completed-pomodoros")
    const parsed = saved ? JSON.parse(saved) : []
    return Array.isArray(parsed) ? parsed.slice(0, 8) : []
  } catch {
    return []
  }
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
  const [completedPomodoros, setCompletedPomodoros] = useState(loadCompletedPomodoros)
  const [customWork, setCustomWork] = useState(initialSettings.workMinutes)
  const [customShortBreak, setCustomShortBreak] = useState(initialSettings.shortBreakMinutes)
  const [customLongBreak, setCustomLongBreak] = useState(initialSettings.longBreakMinutes)
  const [soundType, setSoundType] = useState(initialSettings.soundType)
  const [ambientVolume, setAmbientVolume] = useState(initialSettings.ambientVolume)
  const [soundOn, setSoundOn] = useState(true)
  const [bgSoundOn, setBgSoundOn] = useState(initialSettings.bgSoundOn)

  // User-provided YouTube link
  const [youtubeUrl, setYoutubeUrl] = useState(initialSettings.youtubeUrl)

  const ambientAudioRef = useRef(null)
  const ambientVolumeRafRef = useRef(null)

  const ytPlayerRef = useRef(null)
  const ytReadyRef = useRef(false)
  const ytPlayerBuiltForUrlRef = useRef("")
  const ytVolumeRef = useRef(ambientVolume)
  const shouldPlayYoutubeRef = useRef(false)

  useEffect(() => {
    localStorage.setItem(
      "focus-settings",
      JSON.stringify({
        mode,
        workMinutes,
        shortBreakMinutes,
        longBreakMinutes,
        soundType,
        ambientVolume,
        bgSoundOn,
        youtubeUrl
      })
    )
  }, [mode, workMinutes, shortBreakMinutes, longBreakMinutes, soundType, ambientVolume, bgSoundOn, youtubeUrl])

  useEffect(() => {
    localStorage.setItem("focus-completed-pomodoros", JSON.stringify(completedPomodoros))
  }, [completedPomodoros])

  const youtubeEmbedUrl = useMemo(() => {
    if (!youtubeUrl || typeof window === "undefined") return ""
    return getYoutubeEmbedUrl(youtubeUrl.trim())
  }, [youtubeUrl])

  const directAudioUrl = useMemo(() => {
    if (!youtubeUrl || typeof window === "undefined") return ""
    return getDirectAudioUrl(youtubeUrl)
  }, [youtubeUrl])

  const youtubeIframeKey = useMemo(() => {
    return youtubeEmbedUrl || "empty-youtube-url"
  }, [youtubeEmbedUrl])

  const shouldPlayYoutube = isWorkSession && isRunning && bgSoundOn && !!(youtubeEmbedUrl && youtubeEmbedUrl.trim())

  useEffect(() => {
    shouldPlayYoutubeRef.current = shouldPlayYoutube
  }, [shouldPlayYoutube])

  const setYoutubeVolume = useCallback((volume) => {
    const player = ytPlayerRef.current
    if (!player || typeof player.setVolume !== "function") return

    try {
      player.setVolume(Math.round(Math.max(0, Math.min(1, volume)) * 100))
    } catch {
      // ignore
    }
  }, [])

  // YouTube IFrame API yükleme
  useEffect(() => {
    if (typeof window === "undefined") return

    if (window.YT?.Player) {
      ytReadyRef.current = true
      return
    }

    if (!document.getElementById("youtube-iframe-api")) {
      const tag = document.createElement("script")
      tag.id = "youtube-iframe-api"
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName("script")[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    }

    window.onYouTubeIframeAPIReady = () => {
      ytReadyRef.current = true
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === "function") {
      try {
        ytPlayerRef.current.destroy()
      } catch {
        // ignore
      }
    }

    ytPlayerRef.current = null
    ytPlayerBuiltForUrlRef.current = ""

    if (!youtubeEmbedUrl) return

    const buildPlayer = () => {
      const el = document.getElementById("youtube-ambient-iframe")
      if (!el || el.tagName !== "IFRAME" || !window.YT?.Player || ytPlayerRef.current) return

      try {
        ytPlayerRef.current = new window.YT.Player(el, {
          events: {
            onReady: (event) => {
              ytPlayerBuiltForUrlRef.current = youtubeEmbedUrl
              setYoutubeVolume(ytVolumeRef.current)

              try {
                if (shouldPlayYoutubeRef.current) {
                  event.target.playVideo()
                } else {
                  event.target.pauseVideo()
                }
              } catch {
                // ignore
              }
            }
          }
        })
      } catch {
        // ignore
      }
    }

    if (window.YT?.Player) {
      buildPlayer()
      return
    }

    const existingReady = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      existingReady?.()
      ytReadyRef.current = true
      buildPlayer()
    }
  }, [setYoutubeVolume, youtubeEmbedUrl])

  // Volume'ü YouTube player'a bas
  useEffect(() => {
    ytVolumeRef.current = ambientVolume
    setYoutubeVolume(ambientVolume)
  }, [ambientVolume, setYoutubeVolume])

  // Timer start/stop'a göre YouTube play/pause
  useEffect(() => {
    if (!youtubeEmbedUrl || !youtubeEmbedUrl.trim()) return

    if (!ytPlayerRef.current) return

    if (shouldPlayYoutube && (ytPlayerBuiltForUrlRef.current !== youtubeEmbedUrl)) {
      ytPlayerBuiltForUrlRef.current = youtubeEmbedUrl
    }

    try {
      if (shouldPlayYoutube) {
        ytPlayerRef.current.playVideo()
      } else {
        ytPlayerRef.current.pauseVideo()
      }
    } catch {
      // ignore
    }
  }, [shouldPlayYoutube, youtubeEmbedUrl])

  useEffect(() => {
    if (!isRunning || !bgSoundOn) {
      stopAmbientSound()
      return
    }

    // Autoplay politikası: YouTube set edilecekse mp3 çalma
    if (isWorkSession && youtubeEmbedUrl && youtubeEmbedUrl.trim()) {
      // YouTube mp3 yerine iframe/player tarafından yönetilir
      stopAmbientSound()
    } else {
      playAmbientSound()
    }

    return () => {
      if (!isRunning) stopAmbientSound()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, bgSoundOn, youtubeEmbedUrl, directAudioUrl, isWorkSession])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("Notification" in window)) return
    if (Notification.permission === "default") {
      Notification.requestPermission()
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

  const playTone = useCallback(
    (frequency, duration = 0.16, type = "sine") => {
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

        const startGain = 0.0001
        const peakGain = 0.045
        const attack = 0.02
        const release = 0.12

        gainNode.gain.setValueAtTime(startGain, now)
        gainNode.gain.exponentialRampToValueAtTime(peakGain, now + attack)

        oscillator.start(now)
        oscillator.stop(now + duration + release)

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
    },
    [soundOn]
  )

  const playSound = useCallback(
    (type) => {
      if (!soundOn) return

      if (type === "warning") {
        playTone(784, 0.11, "sine")
        setTimeout(() => playTone(659, 0.11, "sine"), 120)
        setTimeout(() => playTone(523, 0.14, "sine"), 240)
        return
      }

      if (type === "chime") {
        playTone(1046.5, 0.11, "sine")
        setTimeout(() => playTone(1318.5, 0.11, "sine"), 120)
        setTimeout(() => playTone(1568, 0.14, "sine"), 240)
        return
      }

      if (type === "soft") {
        playTone(440, 0.14, "triangle")
        setTimeout(() => playTone(587.3, 0.18, "sine"), 170)
        return
      }

      if (type === "digital") {
        playTone(880, 0.08, "square")
        setTimeout(() => playTone(1174.7, 0.08, "square"), 110)
        return
      }

      if (type === "work") {
        playTone(440, 0.12, "sine")
        setTimeout(() => playTone(659, 0.14, "sine"), 130)
        return
      }

      if (type === "break") {
        playTone(523, 0.14, "sine")
        setTimeout(() => playTone(659, 0.14, "sine"), 140)
        setTimeout(() => playTone(784, 0.16, "sine"), 280)
        return
      }
    },
    [playTone, soundOn]
  )

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
    setSecondsLeft((isWorkSession ? workMinutes : cycleCount >= 4 ? longBreakMinutes : shortBreakMinutes) * 60)
    setIsRunning(false)
  }

  const endSession = useCallback(() => {
    if (isWorkSession) {
      const completedAt = new Date().toISOString()
      const nextCycle = cycleCount + 1
      const nextBreak = nextCycle >= 4 ? longBreakMinutes : shortBreakMinutes
      const isLongBreak = nextCycle >= 4
      setCompletedPomodoros((prev) =>
        [
          {
            id: `${completedAt}-${prev.length}`,
            completedAt,
            minutes: workMinutes,
            mode: mode === "extended" ? "Uzun (Long)" : mode === "quick" ? "Hızlı (Quick)" : mode === "custom" ? "Özel (Custom)" : "Pomodoro"
          },
          ...prev
        ].slice(0, 8)
      )
      setIsWorkSession(false)
      setMottoIndex(0)
      setSecondsLeft(nextBreak * 60)
      setCycleCount(isLongBreak ? 0 : nextCycle)

      const message = isLongBreak ? "Uzun mola zamanı! (Long break time!)" : "Kısa mola zamanı! (Short break time!)"
      addNotification(message, "success", 4500)
      sendBrowserNotification(message)
      playSound("break")
    } else {
      setIsWorkSession(true)
      setMottoIndex(0)
      setSecondsLeft(workMinutes * 60)
      addNotification("Çalışma zamanı! Odaklanmaya geri dön. (Work time! Return to focus.)", "info", 4500)
      sendBrowserNotification("Çalışma zamanı! Odaklanmaya geri dön. (Work time! Return to focus.)")
      playSound("work")
    }
  }, [
    addNotification,
    cycleCount,
    isWorkSession,
    longBreakMinutes,
    mode,
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

  const smoothSetAmbientVolume = useCallback((targetVolume) => {
    const audio = ambientAudioRef.current
    if (!audio) return

    const now = typeof audio.volume === "number" ? audio.volume : 0
    const target = Math.max(0, Math.min(1, targetVolume))

    if (Math.abs(now - target) < 0.005) {
      audio.volume = target
      return
    }

    const start = performance.now()
    const duration = 220

    if (ambientVolumeRafRef.current) cancelAnimationFrame(ambientVolumeRafRef.current)

    const tick = (t) => {
      const elapsed = t - start
      const p = Math.min(1, elapsed / duration)
      const eased = p * p * (3 - 2 * p)
      audio.volume = now + (target - now) * eased
      if (p < 1) ambientVolumeRafRef.current = requestAnimationFrame(tick)
    }

    ambientVolumeRafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    if (!ambientAudioRef.current) return
    if (youtubeEmbedUrl && youtubeEmbedUrl.trim()) return
    if (!directAudioUrl) return

    const targetVolume = Math.max(0, Math.min(1, ambientVolume))
    smoothSetAmbientVolume(targetVolume)
  }, [ambientVolume, isRunning, youtubeEmbedUrl, directAudioUrl, smoothSetAmbientVolume])

  function playAmbientSound() {
    if (typeof window === "undefined") {
      stopAmbientSound()
      return
    }

    if (youtubeEmbedUrl && youtubeEmbedUrl.trim()) {
      stopAmbientSound()
      return
    }

    if (!directAudioUrl) {
      stopAmbientSound()
      return
    }

    try {
      if (!ambientAudioRef.current) {
        ambientAudioRef.current = new Audio()
        ambientAudioRef.current.loop = true
      }

      if (ambientAudioRef.current.src !== directAudioUrl) {
        ambientAudioRef.current.src = directAudioUrl
      }

      const targetVolume = Math.max(0, Math.min(1, ambientVolume))
      ambientAudioRef.current.volume = ambientAudioRef.current.volume || 0.0001
      smoothSetAmbientVolume(targetVolume)

      const playPromise = ambientAudioRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch((error) => console.warn("Ambient audio playback error", error))
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
    addNotification("Özel süreler kaydedildi. (Custom durations saved.)", "success", 3000)
  }

  const isWarning = isRunning && secondsLeft <= 10
  const sessionLabel = isWorkSession ? "Çalışma (Work)" : "Mola (Break)"
  const sessionSubLabel = isWorkSession ? "Tam konsantre ol (Stay fully focused)" : "Rahatlamak için zaman (Time to relax)"

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

  const progress = Math.min(1, Math.max(0, sessionTotalSeconds > 0 ? 1 - secondsLeft / sessionTotalSeconds : 0))

  const ringRadius = 148
  const ringCircumference = 2 * Math.PI * ringRadius
  const ringOffset = ringCircumference * (1 - progress)

  useEffect(() => {
    if (isRunning && isWarning) {
      playSound("warning")
    }
  }, [isRunning, isWarning, playSound])

  return (
    <div
      className={`focus-page px-4 py-6 sm:p-8 min-h-screen overflow-hidden relative text-white ${
        isWorkSession ? "focus-page--work" : "focus-page--break"
      }`}
    >
      <iframe
        id="youtube-ambient-iframe"
        key={youtubeIframeKey}
        width="0"
        height="0"
        src={youtubeEmbedUrl || ""}
        title="YouTube Ambient"
        allow="autoplay; encrypted-media"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
      />

      <div className="focus-wave focus-wave--work" aria-hidden="true" />
      <div className={`focus-wave focus-wave--break ${isWorkSession ? "focus-wave--hidden" : ""}`} aria-hidden="true" />
      <div
        className={`focus-mode-animation ${isWorkSession ? "focus-mode-animation--work" : "focus-mode-animation--break"}`}
        aria-hidden="true"
      >
        <span className="focus-mode-dot" />
        <span className="focus-mode-dot focus-mode-dot--secondary" />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10 relative z-10">
        <section className="glass-card p-5 sm:p-8 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Odaklanma Modları (Focus Modes)</h1>
              <p className="text-zinc-300 mt-2 max-w-2xl text-sm sm:text-base">
                Pomodoro tempo, çalışma ve mola sürelerini özelleştirebileceğin bir odak alanı.
                Zamanın sonuna yaklaştığında görsel uyarılar ve ekran bildirimleri alırsın.
                (A focus area where you can customize Pomodoro, work, and break durations. You get visual alerts and screen notifications near the end.)
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
                Ses efektleri (Sound effects)
              </label>

              <label className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm text-zinc-200">
                <input
                  type="checkbox"
                  checked={bgSoundOn}
                  onChange={() => setBgSoundOn((prev) => !prev)}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-blue-500 focus:ring-blue-400"
                />
                Arka plan sesi (Background sound)
              </label>

              <div className="flex flex-wrap gap-2 sm:gap-3">
                {Object.keys(PRESETS).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`rounded-2xl px-4 sm:px-5 py-3 text-sm font-semibold transition ${
                      mode === preset ? "bg-blue-500 text-white" : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                    }`}
                  >
                    {preset === "pomodoro" ? "Pomodoro" : preset === "quick" ? "Hızlı (Quick)" : "Uzun (Long)"}
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
                <p className="text-sm uppercase tracking-[0.3em] text-blue-300">{sessionLabel} Zamanlayıcı (Timer)</p>
                <h2 className="text-3xl sm:text-4xl font-bold mt-3">{formatTime(secondsLeft)}</h2>
              </div>
              <div className="text-right">
                <p className="text-zinc-300 text-sm sm:text-base">{sessionSubLabel}</p>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    isWorkSession ? "bg-green-500/20 text-green-300" : "bg-sky-500/20 text-sky-300"
                  }`}
                >
                  {isWorkSession ? "Çalışma (Work)" : "Mola (Break)"}
                </span>
              </div>
            </div>

            <div className={`focus-timer-card ${isWarning ? "focus-timer-card--warning" : ""}`}>
              <div
                className={`focus-timer-ring ${isWorkSession ? "focus-timer-ring--work" : "focus-timer-ring--break"} ${
                  isRunning ? "focus-timer-ring--running" : ""
                }`}
              >
                <svg className="focus-timer-ring__svg" viewBox="0 0 320 320" width="320" height="320" aria-hidden="true">
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

                  <circle className="focus-timer-ring__track" cx="160" cy="160" r={ringRadius} />
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
                {isRunning ? "Duraklat (Pause)" : "Başlat (Start)"}
              </button>
              <button
                type="button"
                onClick={resetTimer}
                className="flex-1 sm:flex-none rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-white hover:bg-white/10"
              >
                Sıfırla (Reset)
              </button>
              <button
                type="button"
                onClick={handleCustomSave}
                className="flex-1 rounded-2xl border border-emerald-500 bg-emerald-500/10 px-6 py-3 text-emerald-200 hover:bg-emerald-500/20 sm:flex-none"
              >
                Ayarları Kaydet (Save Settings)
              </button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Çalışma süresi (Work duration)</p>
                <p className="mt-3 text-3xl font-semibold">{workMinutes} dk</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Kısa mola (Short break)</p>
                <p className="mt-3 text-3xl font-semibold">{shortBreakMinutes} dk</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Uzun mola (Long break)</p>
                <p className="mt-3 text-3xl font-semibold">{longBreakMinutes} dk</p>
              </div>
            </div>
            <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-950/30 p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">Tamamlanan Pomodorolar (Completed Pomodoros)</h3>
                  <p className="text-sm text-zinc-400">Son odak oturumların burada listelenir. (Your latest focus sessions are listed here.)</p>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-300">
                  {completedPomodoros.length} oturum (sessions)
                </span>
              </div>

              {completedPomodoros.length > 0 ? (
                <div className="space-y-3">
                  {completedPomodoros.map((pomodoro, index) => (
                    <div
                      key={pomodoro.id}
                      className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-200">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">{pomodoro.mode}</p>
                          <p className="text-sm text-zinc-400">{pomodoro.minutes} dk odak ({pomodoro.minutes} min focus)</p>
                        </div>
                      </div>
                      <span className="shrink-0 text-sm font-medium text-zinc-300">
                        {formatCompletedTime(pomodoro.completedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-6 text-center text-sm text-zinc-400">
                  İlk çalışma oturumunu tamamladığında burada görünecek. (It will appear here after your first work session.)
                </div>
              )}
            </div>
          </section>

          <section className="glass-card rounded-3xl border border-white/10 p-5 shadow-2xl sm:p-8">
            <h3 className="text-2xl font-semibold mb-4">Özelleştirilebilir Süreler (Custom Durations)</h3>
            <p className="text-zinc-400 mb-6">Kendi çalışma ve mola sürelerini gir. (Enter your own work and break durations.)</p>

            <div className="space-y-4 mb-8">
              <label className="block">
                <span className="text-sm text-zinc-200">Çalışma süresi (dakika) (Work duration in minutes)</span>
                <input
                  type="number"
                  min="1"
                  value={customWork}
                  onChange={(e) => setCustomWork(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-white outline-none focus:border-blue-400"
                />
              </label>
              <label className="block">
                <span className="text-sm text-zinc-200">Kısa mola (dakika) (Short break in minutes)</span>
                <input
                  type="number"
                  min="1"
                  value={customShortBreak}
                  onChange={(e) => setCustomShortBreak(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-white outline-none focus:border-blue-400"
                />
              </label>
              <label className="block">
                <span className="text-sm text-zinc-200">Uzun mola (dakika) (Long break in minutes)</span>
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
              <h4 className="text-lg font-semibold mb-3">Ses Efektleri (Sound Effects)</h4>
              <label className="block mb-4">
                <span className="text-sm text-zinc-200">Bildirim sesi seç (Choose notification sound)</span>
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
                🔊 Sesi Test Et (Test Sound)
              </button>
            </div>

            <div className="border-t border-white/10 pt-6 mt-6">
              <h4 className="text-lg font-semibold mb-3">Arka Plan Sesi (Background Sound)</h4>

              <div className="mb-4">
                <span className="text-sm text-zinc-200 mb-2 block">Kendi ses URL’in (mp3/aac direkt link) (Your audio URL)</span>
                <input
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://.../audio.mp3 veya YouTube video linki"
                  className="w-full mt-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white outline-none focus:border-blue-400"
                />

                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      const v = youtubeUrl.trim()
                      if (!v) {
                        addNotification("Lütfen bir ses URL'i gir. (Please enter an audio URL.)", "error", 3000)
                        return
                      }
                      setYoutubeUrl(v)
                      addNotification("YouTube/Link kaydedildi. Timer ile otomatik açılır. (YouTube/link saved. It starts automatically with the timer.)", "success", 3000)
                    }}
                    className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold hover:bg-blue-400"
                  >
                    Uygula (Apply)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setYoutubeUrl("")
                    }}
                    className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-semibold hover:bg-zinc-700"
                  >
                    Temizle (Clear)
                  </button>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!bgSoundOn) {
                      addNotification("Arka plan sesi kapalı. (Background sound is off.)", "warning", 2500)
                      return
                    }

                    if (youtubeEmbedUrl) {
                      addNotification("YouTube sesi zamanlayıcı başlayınca çalar. (YouTube sound plays when the timer starts.)", "info", 3000)
                      return
                    }

                    if (!directAudioUrl) {
                      addNotification("Lütfen önce direkt audio URL veya YouTube linki gir. (Please enter a direct audio URL or YouTube link first.)", "warning", 3000)
                      return
                    }

                    playAmbientSound()
                  }}
                  className="rounded-lg bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-200 hover:bg-blue-500/30"
                >
                  Arka Planı Test Et (Test Background)
                </button>
                <button
                  type="button"
                  onClick={stopAmbientSound}
                  className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-700"
                >
                  Sesi Durdur (Stop Sound)
                </button>
              </div>

              <label className="mt-5 block rounded-2xl border border-white/10 bg-white/5 p-4">
                <span className="mb-3 flex items-center justify-between gap-3 text-sm text-zinc-200">
                  <span>Ses seviyesi (Volume)</span>
                  <span className="rounded-full bg-zinc-900 px-3 py-1 font-semibold text-blue-200">
                    {Math.round(ambientVolume * 100)}%
                  </span>
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolume}
                  onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                  className="focus-volume-slider"
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

