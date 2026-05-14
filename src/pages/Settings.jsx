import { useState } from "react"

function Settings() {

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  function handleSave() {
    alert("Settings saved!")
  }

  return (
    <div className="p-8 max-w-xl">

      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <input
        className="w-full p-3 mb-3 bg-zinc-800 rounded"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="w-full p-3 mb-3 bg-zinc-800 rounded"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="w-full p-3 mb-3 bg-zinc-800 rounded"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleSave}
        className="bg-blue-600 px-6 py-2 rounded"
      >
        Save Settings
      </button>

    </div>
  )
}

export default Settings