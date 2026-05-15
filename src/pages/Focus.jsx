import { useEffect, useState, useRef } from "react"
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

    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&loop=1&playlist=${videoId}&controls=0&enablejsapi=1`
  } catch {
    return ""
  }
}

const PRESETS = {
  pomodoro: { work: 25, shortBreak: 5, longBreak: 15 },
  quick: { work: 15, shortBreak: 5, longBreak: 10 },
  extended: { work: 50, shortBreak: 10, longBreak: 20 }
}

const SOUND_TYPES = {
  warning: { label: "Uyarı", key: "warning" },
  work: { label: "Çalışma", key: "work" },
  break: { label: "Mola", key: "break" },
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

  // YouTube (arka plan sesi) - kullanıcıdan gelen link
  youtubeUrl: ""
}



function Focus() {
  const { addNotification } = useNotification()
  const [mode, setMode] = useState(defaultSettings.mode)
  const [workMinutes, setWorkMinutes] = useState(defaultSettings.workMinutes)
  const [shortBreakMinutes, setShortBreakMinutes] = useState(defaultSettings.shortBreakMinutes)
  const [longBreakMinutes, setLongBreakMinutes] = useState(defaultSettings.longBreakMinutes)
  const [isWorkSession, setIsWorkSession] = useState(defaultSettings.isWorkSession)
  const [secondsLeft, setSecondsLeft] = useState(defaultSettings.secondsLeft)
  const [isRunning, setIsRunning] = useState(false)
  const [cycleCount, setCycleCount] = useState(defaultSettings.cycleCount)
  const [customWork, setCustomWork] = useState(defaultSettings.workMinutes)
  const [customShortBreak, setCustomShortBreak] = useState(defaultSettings.shortBreakMinutes)
  const [customLongBreak, setCustomLongBreak] = useState(defaultSettings.longBreakMinutes)
  const [soundType, setSoundType] = useState(defaultSettings.soundType)
  const [ambientSound, setAmbientSound] = useState(defaultSettings.ambientSound)
  const [ambientVolume, setAmbientVolume] = useState(defaultSettings.ambientVolume)
  const [soundOn, setSoundOn] = useState(true)

  // User-provided YouTube link
  const [youtubeUrl, setYoutubeUrl] = useState(defaultSettings.youtubeUrl)

  
  const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState("")
  const [youtubePlayKey, setYoutubePlayKey] = useState(0)

  const audioContextRef = useRef(null)
  const ambientAudioRef = useRef(null)

  useEffect(() => {
    const saved = localStorage.getItem("focus-settings")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setMode(parsed.mode || defaultSettings.mode)
        setWorkMinutes(parsed.workMinutes || defaultSettings.workMinutes)
        setShortBreakMinutes(parsed.shortBreakMinutes || defaultSettings.shortBreakMinutes)
        setLongBreakMinutes(parsed.longBreakMinutes || defaultSettings.longBreakMinutes)
        setCustomWork(parsed.workMinutes || defaultSettings.workMinutes)
        setCustomShortBreak(parsed.shortBreakMinutes || defaultSettings.shortBreakMinutes)
        setCustomLongBreak(parsed.longBreakMinutes || defaultSettings.longBreakMinutes)
        setSoundType(parsed.soundType || defaultSettings.soundType)
        setAmbientSound(parsed.ambientSound || defaultSettings.ambientSound)
        setAmbientVolume(parsed.ambientVolume || defaultSettings.ambientVolume)
        setSecondsLeft((parsed.workMinutes || defaultSettings.workMinutes) * 60)
      } catch (error) {
        console.warn("Focus settings parse error", error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      "focus-settings",
      JSON.stringify({ mode, workMinutes, shortBreakMinutes, longBreakMinutes, soundType, ambientSound, ambientVolume })
    )
  }, [mode, workMinutes, shortBreakMinutes, longBreakMinutes, soundType, ambientSound, ambientVolume])

  useEffect(() => {
    if (!youtubeUrl || typeof window === "undefined") {
      setYoutubeEmbedUrl("")
      return
    }

    const embed = getYoutubeEmbedUrl(youtubeUrl.trim())
    setYoutubeEmbedUrl(embed)
  }, [youtubeUrl])

  useEffect(() => {
    if (!isRunning || !soundOn) {
      stopAmbientSound()
      return
    }

    // Autoplay politikası nedeniyle bazı tarayıcılarda user-gesture anında iframe yeniden mount edilmesi gerekir
    if (youtubeEmbedUrl && youtubeEmbedUrl.trim()) {
      setYoutubePlayKey((k) => k + 1)
    } else {
      playAmbientSound(ambientSound)
    }

    return () => {
      // durdurma tarafı yalnızca effect dışı cleanup'da
      if (!isRunning) stopAmbientSound()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, soundOn, youtubeEmbedUrl, ambientSound])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("Notification" in window)) return
    if (Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    if (!isRunning) return

    const timeoutId = setTimeout(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          endSession()
          return prev
        }
        return prev - 1
      })
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [isRunning, secondsLeft, isWorkSession, workMinutes, shortBreakMinutes, longBreakMinutes, cycleCount])

  const sendBrowserNotification = (message) => {
    if (typeof window === "undefined" || !("Notification" in window)) return
    if (Notification.permission === "granted") {
      new Notification(message)
    }
  }

  const playTone = (frequency, duration = 0.18, type = "sine") => {
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

      gainNode.gain.setValueAtTime(0.0001, audioCtx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.02)
      oscillator.start()
      oscillator.stop(audioCtx.currentTime + duration)

      oscillator.onended = () => {
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.02)
        audioCtx.close()
      }
    } catch (error) {
      console.warn("Ses oynatılamadı", error)
    }
  }

  const playSound = (type) => {
    if (!soundOn) return

    if (type === "warning") {
      playTone(880, 0.08, "square")
      playTone(1040, 0.06, "square")
      return
    }

    if (type === "work") {
      playTone(660, 0.16, "triangle")
      return
    }

    if (type === "break") {
      playTone(420, 0.24, "sine")
      playTone(520, 0.12, "sine")
      return
    }
  }

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
    setSecondsLeft(preset.work * 60)
    setCycleCount(0)
    setIsRunning(false)
  }

  const resetTimer = () => {
    setSecondsLeft((isWorkSession ? workMinutes : (cycleCount >= 4 ? longBreakMinutes : shortBreakMinutes)) * 60)
    setIsRunning(false)
  }

  const endSession = () => {
    if (isWorkSession) {
      const nextCycle = cycleCount + 1
      const nextBreak = nextCycle >= 4 ? longBreakMinutes : shortBreakMinutes
      const isLongBreak = nextCycle >= 4
      setIsWorkSession(false)
      setSecondsLeft(nextBreak * 60)
      setCycleCount(isLongBreak ? 0 : nextCycle)

      const message = isLongBreak ? "Uzun mola zamanı!" : "Kısa mola zamanı!"
      addNotification(message, "success", 4500)
      sendBrowserNotification(message)
      playSound("break")
    } else {
      setIsWorkSession(true)
      setSecondsLeft(workMinutes * 60)
      addNotification("Çalışma zamanı! Odaklanmaya geri dön.", "info", 4500)
      sendBrowserNotification("Çalışma zamanı! Odaklanmaya geri dön.")
      playSound("work")
    }
  }

  const stopAmbientSound = () => {
    if (!ambientAudioRef.current) return
    ambientAudioRef.current.pause()
    ambientAudioRef.current.currentTime = 0
  }

  const smoothSetAmbientVolume = (targetVolume) => {
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
  
  const playAmbientSound = (soundKey) => {
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
    setIsRunning(false)
    addNotification("Özel süreler kaydedildi.", "success", 3000)
  }

  const isWarning = isRunning && secondsLeft <= 10
  const sessionLabel = isWorkSession ? "Çalışma" : "Mola"
  const sessionSubLabel = isWorkSession
    ? "Tam konsantre ol"
    : "Rahatlamak için zaman"

  useEffect(() => {
    if (isRunning && isWarning) {
      playSound("warning")
    }
  }, [isRunning, isWarning])



  const shouldPlayYoutube = Boolean(isRunning && soundOn && youtubeEmbedUrl && youtubeEmbedUrl.trim())

  return (
    <div
      className={`focus-page p-8 min-h-screen overflow-hidden relative text-white ${
        isWorkSession ? "focus-page--work" : "focus-page--break"
      }`}
    >
      <iframe
        key={youtubePlayKey}
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

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        <section className="glass-card p-8 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold">Odaklanma Modları</h1>
              <p className="text-zinc-300 mt-2 max-w-2xl">
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

              <div className="flex flex-wrap gap-3">
                {Object.keys(PRESETS).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${mode === preset ? "bg-blue-500 text-white" : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"}`}
                  >
                    {preset === "pomodoro" ? "Pomodoro" : preset === "quick" ? "Hızlı" : "Uzun"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="glass-card p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-blue-300">{sessionLabel} Zamanlayıcı</p>
                <h2 className="text-3xl font-bold mt-3">{formatTime(secondsLeft)}</h2>
              </div>
              <div className="text-right">
                <p className="text-zinc-300">{sessionSubLabel}</p>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isWorkSession ? "bg-green-500/20 text-green-300" : "bg-sky-500/20 text-sky-300"}`}>
                  {isWorkSession ? "Çalışma" : "Mola"}
                </span>
              </div>
            </div>

            <div className={`focus-timer-card ${isWarning ? "focus-timer-card--warning" : ""}`}>
              <div className="focus-timer-ring">
                <span className="focus-timer-ring__label">{sessionLabel}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsRunning((prev) => !prev)}
                className="rounded-2xl bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-400"
              >
                {isRunning ? "Duraklat" : "Başlat"}
              </button>
              <button
                type="button"
                onClick={resetTimer}
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-white hover:bg-white/10"
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
              <h4 className="text-lg font-semibold mb-3">Arka Plan Sesleri</h4>
              <p className="text-xs text-zinc-400 mb-4">Çalışma veya mola sırasında doğa seslerini dinle</p>

              <label className="block mb-4">
                <span className="text-sm text-zinc-200 mb-2 block">Ortam sesi seç</span>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {Object.values(AMBIENT_SOUNDS).map((sound) => (
                    <button
                      key={sound.key}
                      type="button"
                      onClick={() => setAmbientSound(sound.key)}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        ambientSound === sound.key
                          ? "bg-cyan-500 text-white"
                          : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                      }`}
                    >
                      {sound.label}
                    </button>
                  ))}
                </div>
              </label>

              <div className="mb-4">
                <span className="text-sm text-zinc-200 mb-2 block">Kendi ses URL’in (mp3/aac direkt link)</span>
                <input
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://.../audio.mp3"
                  className="w-full mb-3 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white outline-none focus:border-blue-400"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const v = youtubeUrl.trim()
                      if (!v) {
                        addNotification("Lütfen bir ses URL'i gir.", "error", 3000)
                        return
                      }
                      setYoutubeUrl(v)
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

              <label className="block">
                <span className="text-sm text-zinc-200 mb-2 block">Ses seviyesi: {Math.round(ambientVolume * 100)}%</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolume}
                  onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                />
              </label>
            </div>

            <div className="mt-8 rounded-3xl border border-blue-400/20 bg-blue-500/5 p-4">
              <p className="text-sm text-blue-200">Mola zamanı geldiğinde tarayıcı bildirimleri ve ekran içi uyarılar alırsın.</p>
              <p className="mt-2 text-sm text-zinc-400">Tarayıcı izinlerini verdiysen, bildirimler otomatik olarak gösterilir.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Focus
