function TaskCard({ title, description, status, deadline, onDelete, onToggle,onEdit }){
    return(
        <div className="glass-card min-w-0 p-5 rounded-3xl border border-white/10">
            
            <h3 className="mb-2 break-words text-lg font-semibold sm:text-xl">
                {title}
            </h3>

            <p className="mb-4 break-words text-sm text-zinc-400">
                {description}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-400">
                    {status}
                </span>

                <span className="break-words text-sm text-zinc-500">
                    {deadline}
                </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                <button
                    onClick={onToggle}
                    className="min-h-10 flex-1 rounded-lg bg-green-500 px-4 py-2 text-sm hover:bg-green-600 sm:flex-none"
                >
                Toggle Status
                </button>
                <button
                    onClick={onEdit}
                    className="min-h-10 flex-1 rounded-lg bg-yellow-500 px-4 py-2 text-sm hover:bg-yellow-600 sm:flex-none"
                >
                     Edit  
                </button>
                <button
                    onClick={onDelete}
                    className="min-h-10 flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm hover:bg-red-600 sm:flex-none"
                >
                    Delete
                </button>
            </div>
        </div>
    )
}

export default TaskCard
