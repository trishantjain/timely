import { ChevronRight } from "lucide-react";

export default function PageHeader({
    breadcrumbs = [],
    title,
    badge,
    description,
    actions,
}) {
    return (
        <div className="mb-5">

            {/* Breadcrumb Navigation */}
            {breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-1.5 mb-2 text-sm text-gray-500">

                    {breadcrumbs.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-1.5"
                        >
                            {item.onClick ? (
                                <button
                                    type="button"
                                    onClick={item.onClick}
                                    className="transition-colors hover:text-gray-900"
                                >
                                    {item.label}
                                </button>
                            ) : (
                                <span
                                    className={
                                        index === breadcrumbs.length - 1
                                            ? "font-medium text-gray-900"
                                            : ""
                                    }
                                >
                                    {item.label}
                                </span>
                            )}

                            {index < breadcrumbs.length - 1 && (
                                <ChevronRight
                                    size={14}
                                    className="text-gray-400"
                                />
                            )}
                        </div>
                    ))}

                </nav>
            )}

            {/* Page Information */}
            <div className="flex items-start justify-between gap-4">

                <div className="min-w-0">

                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                            {title}
                        </h1>

                        {badge && badge}
                    </div>

                    {description && (
                        <p className="mt-1.5 text-sm text-gray-500">
                            {description}
                        </p>
                    )}

                </div>

                {actions && (
                    <div className="flex items-center gap-2 shrink-0">
                        {actions}
                    </div>
                )}

            </div>
        </div>
    );
}