import { Bell } from "lucide-react";

export default function Header() {
    return (
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b">
            
            <div>
                <span className="text-sm text-muted-foreground">
                    TIMELY AI
                </span>
            </div>

            <div className="flex items-center gap-4">

                <button
                    type="button"
                    className="p-2 transition-colors rounded-full hover:bg-gray-100"
                >
                    <Bell size={20} />
                </button>

                <div className="flex items-center justify-center w-10 h-10 text-sm font-semibold bg-gray-100 rounded-full">
                    AJ
                </div>

            </div>
        </header>
    );
}