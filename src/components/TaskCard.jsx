function TaskCard({ title, description, status, deadline, onDelete, onToggle,onEdit }){
    return(
        <div className="glass-card p-5 rounded-3xl border border-white/10">
            
            <h3 className="text-xl font-semibold mb-2">
                {title}
            </h3>

            <p className="text-zinc-400 text-sm mb-4">
                {description}
            </p>

            <div className="flex items-center justify-between">
                <span className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">
                    {status}
                </span>

                <span className="text-sm text-zinc-500">
                    {deadline}
                </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                <button
                    onClick={onToggle}
                    className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg flex-1 sm:flex-none"
                >
                Toggle Status
                </button>
                <button
                    onClick={onEdit}
                    className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg flex-1 sm:flex-none"
                >
                     Edit  
                </button>
                <button
                    onClick={onDelete}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg flex-1 sm:flex-none"
                >
                    Delete
                </button>
            </div>
        </div>
    )
}

export default TaskCard
