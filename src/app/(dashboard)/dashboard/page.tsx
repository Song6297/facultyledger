export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Overview</h1>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Stat Cards - Placeholders */}
                <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Teachers</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">24</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Present Today</h3>
                    <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">18</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Late Arrivals</h3>
                    <p className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">3</p>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Violations</h3>
                    <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">1</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 h-64 flex items-center justify-center text-gray-500">
                    Attendance Chart Placeholder
                </div>
                <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 h-64 flex items-center justify-center text-gray-500">
                    Recent Activity Placeholder
                </div>
            </div>
        </div>
    );
}
