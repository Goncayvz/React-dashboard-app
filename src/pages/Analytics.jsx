function Analytics() {
  return (
    <div className="p-8 text-white">
      
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

      {/* stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">

        <div className="bg-zinc-900 p-5 rounded-xl">
          <h2 className="text-gray-400">Total Tasks</h2>
          <p className="text-2xl font-bold">12</p>
        </div>

        <div className="bg-zinc-900 p-5 rounded-xl">
          <h2 className="text-gray-400">Completed</h2>
          <p className="text-2xl font-bold text-green-500">7</p>
        </div>

        <div className="bg-zinc-900 p-5 rounded-xl">
          <h2 className="text-gray-400">In Progress</h2>
          <p className="text-2xl font-bold text-blue-500">5</p>
        </div>

      </div>

      {/* fake chart */}
      <div className="bg-zinc-900 h-64 rounded-xl flex items-center justify-center text-gray-500">
        Chart Area (later real chart ekleriz)
      </div>

    </div>
  )
}

export default Analytics