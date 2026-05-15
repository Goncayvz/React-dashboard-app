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
            <button
                onClick={onToggle}
                className="mt-4 mr-2 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg"
            >
            Toggle Status
            </button>
            <button
                onClick={onDelete}
                className="mt-4 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
            >
                Delete
            </button>
            <button
                onClick={onEdit}
                className="mt-4 mr-2 bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg"
            >
                 Edit  
            </button>
        </div>
    )
}

export default TaskCard