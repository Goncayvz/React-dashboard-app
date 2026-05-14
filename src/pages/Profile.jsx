import { useState } from "react"
import { useUser } from "../context/UserContext"

function Profile() {
  const { user, updateUser } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(user)

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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
    <div className="p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Kullanıcı Profili</h1>

      {!isEditing ? (
        <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
          <div className="flex items-center mb-8">
            <div className="text-6xl mr-6 bg-blue-500/20 w-20 h-20 rounded-full flex items-center justify-center">
              {user.avatar}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-zinc-400">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div>
              <label className="text-zinc-400 text-sm">Telefon</label>
              <p className="text-lg">{user.phone}</p>
            </div>
            <div>
              <label className="text-zinc-400 text-sm">Bio</label>
              <p className="text-lg text-zinc-300">{user.bio}</p>
            </div>
            <div>
              <label className="text-zinc-400 text-sm">Doğum Tarihi</label>
              <p className="text-lg">{user.birthDate}</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg"
          >
            Profili Düzenle
          </button>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
          <h2 className="text-xl font-bold mb-6">Profili Düzenle</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-sm mb-2">Ad</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 bg-zinc-800 rounded-lg border border-zinc-700"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-sm mb-2">E-posta</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 bg-zinc-800 rounded-lg border border-zinc-700"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-sm mb-2">Telefon</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 bg-zinc-800 rounded-lg border border-zinc-700"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-sm mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="3"
                className="w-full p-3 bg-zinc-800 rounded-lg border border-zinc-700"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-sm mb-2">Avatar Emoji</label>
              <input
                type="text"
                name="avatar"
                value={formData.avatar}
                onChange={handleChange}
                maxLength="2"
                className="w-full p-3 bg-zinc-800 rounded-lg border border-zinc-700 text-2xl"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-sm mb-2">Doğum Tarihi</label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full p-3 bg-zinc-800 rounded-lg border border-zinc-700"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg"
            >
              Kaydet
            </button>
            <button
              onClick={handleCancel}
              className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg"
            >
              İptal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
