import { useState } from "react"
import { useBadge } from "../context/BadgeContext"
import { useUser } from "../context/UserContext"

const avatarOptions = [
  "👤",
  "🧑",
  "🧑‍💻",
  "👩‍💻",
  "🧑‍🎨",
  "🧑‍🚀",
  "🧑‍🔧",
  "🧑‍🏫",
  "🧑‍⚕️",
  "👩‍💼",
  "👩‍🎨",
  "👩‍🏫",
  "👩‍⚕️",
  "🧑‍🎓"
]

function Profile() {
  const { user, updateUser } = useUser()
  const { getEarnedBadgesList } = useBadge()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(user)

  const savedTasks = localStorage.getItem("tasks")
  const tasks = savedTasks ? JSON.parse(savedTasks) : []
  const completedTasks = tasks.filter((task) => task.status === "Completed").length
  const inProgressTasks = tasks.filter((task) => task.status === "In Progress").length
  const badgeCount = getEarnedBadgesList().length

  const profileFields = [
    "name",
    "email",
    "phone",
    "bio",
    "jobTitle",
    "avatar"
  ]

  const completedFields = profileFields.filter(
    (key) => formData[key] && formData[key].toString().trim().length > 0
  ).length

  const profileCompletion = Math.round((completedFields / profileFields.length) * 100)

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleAvatarSelect(avatar) {
    setFormData((prev) => ({ ...prev, avatar }))
  }

  function handleAvatarUpload(event) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, avatar: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  function handleSave() {
    updateUser(formData)
    setIsEditing(false)
  }

  function handleCancel() {
    setFormData(user)
    setIsEditing(false)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:p-8">
      <h1 className="mb-8 text-2xl font-bold sm:text-3xl">Kullanıcı Profili (User Profile)</h1>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="glass-card p-5 sm:p-8 rounded-3xl border border-white/10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            {user.avatar?.startsWith("data:image") ? (
              <img
                src={user.avatar}
                alt="Profil resmi (Profile image)"
                className="w-28 h-28 rounded-full object-cover border border-white/10"
              />
            ) : (
              <div className="text-7xl bg-blue-500/20 w-28 h-28 rounded-full flex items-center justify-center">
                {user.avatar}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h2 className="break-words text-2xl font-bold sm:text-3xl">{user.name}</h2>
              <p className="text-blue-300 text-sm uppercase tracking-wide mb-2">
                {user.jobTitle || "Görev tutkunu (Task enthusiast)"}
              </p>
              <p className="break-words leading-7 text-zinc-300">{user.bio}</p>
            </div>
          </div>

          <div className="grid gap-4 mt-8 sm:grid-cols-2 xl:grid-cols-4">
            <div className="glass-card p-5 rounded-3xl border border-white/10">
              <p className="text-zinc-400 text-sm">Tamamlanan Görevler (Completed Tasks)</p>
              <p className="text-3xl font-semibold mt-3">{completedTasks}</p>
            </div>
            <div className="glass-card p-5 rounded-3xl border border-white/10">
              <p className="text-zinc-400 text-sm">Devam Edenler (In Progress)</p>
              <p className="text-3xl font-semibold mt-3">{inProgressTasks}</p>
            </div>
            <div className="glass-card p-5 rounded-3xl border border-white/10">
              <p className="text-zinc-400 text-sm">Kazandığın Rozetler (Earned Badges)</p>
              <p className="text-3xl font-semibold mt-3">{badgeCount}</p>
            </div>
            <div className="glass-card p-5 rounded-3xl border border-white/10">
              <p className="text-zinc-400 text-sm">Profil Tamamlanması (Profile Completion)</p>
              <p className="text-3xl font-semibold mt-3">{profileCompletion}%</p>
            </div>
          </div>

          <div className="mt-8 glass-card p-5 rounded-3xl border border-white/10 bg-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-zinc-400">Profil durumu (Profile status)</span>
              <span className="text-sm text-zinc-200 font-medium">{profileCompletion}%</span>
            </div>
            <div className="h-3 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
        </div>

        <div className="glass-card p-5 sm:p-8 rounded-3xl border border-white/10">
          {!isEditing ? (
            <>
              <h2 className="text-2xl font-bold mb-6">Profil Detayları (Profile Details)</h2>

              <div className="grid gap-5">
                <div className="grid gap-2">
                  <span className="text-zinc-400 text-sm">E-posta (Email)</span>
                  <p className="break-words text-white">{user.email}</p>
                </div>

                <div className="grid gap-2">
                  <span className="text-zinc-400 text-sm">Telefon (Phone)</span>
                  <p className="break-words text-white">{user.phone}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setFormData(user)
                  setIsEditing(true)
                }}
                className="mt-8 w-full bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-3xl"
              >
                Profili Düzenle (Edit Profile)
              </button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-6">Profili Düzenle (Edit Profile)</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Ad (Name)</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 bg-zinc-950 rounded-3xl border border-white/10"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-2">E-posta (Email)</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 bg-zinc-950 rounded-3xl border border-white/10"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Telefon (Phone)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-3 bg-zinc-950 rounded-3xl border border-white/10"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Meslek (Job Title)</label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    className="w-full p-3 bg-zinc-950 rounded-3xl border border-white/10"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="3"
                    className="w-full p-3 bg-zinc-950 rounded-3xl border border-white/10"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="block text-zinc-400 text-sm mb-2">Avatar Seçimi (Avatar Selection)</label>
                  <div className="flex flex-wrap gap-2">
                    {avatarOptions.map((avatar) => (
                      <button
                        key={avatar}
                        type="button"
                        onClick={() => handleAvatarSelect(avatar)}
                        className={`w-12 h-12 rounded-full border flex items-center justify-center text-2xl ${
                          formData.avatar === avatar
                            ? "border-blue-400 bg-blue-500/20"
                            : "border-white/10 bg-white/5"
                        }`}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Profil Fotoğrafı Yükle (Upload Profile Photo)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="w-full text-sm text-zinc-400 file:bg-blue-500 file:text-white file:px-4 file:py-2 file:rounded-full"
                  />
                  {formData.avatar?.startsWith("data:image") && (
                    <img
                      src={formData.avatar}
                      alt="Avatar önizleme (Avatar preview)"
                      className="mt-3 w-24 h-24 rounded-full object-cover border border-white/10"
                    />
                  )}
                </div>

              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-green-500 hover:bg-green-600 px-6 py-3 rounded-3xl"
                >
                  Kaydet (Save)
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-red-500 hover:bg-red-600 px-6 py-3 rounded-3xl"
                >
                  İptal (Cancel)
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
