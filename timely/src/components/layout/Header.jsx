import { Bell } from "lucide-react";

export default function Header() {
    return (
        <header className="flex items-center justify-between h-16 px-6 app-header">
            
            <div>
                <span className="text-sm text-muted-foreground">
                    TIMELY AI
                </span>
            </div>

            <div className="flex items-center gap-4">

                <button
                    type="button"
                    className="p-2 transition-colors rounded-full hover:bg-slate-700"
                >
                    <Bell size={20} />
                </button>

                <div className="flex items-center justify-center w-10 h-10 text-sm font-semibold bg-slate-700 rounded-full">
                    AJ
                </div>

            </div>
        </header>
    );
}