


export const DashboardSkeleton = () => {
      return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden md:flex flex-col w-64 p-6 bg-white border-r border-gray-200 space-y-4 animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-32" />
        <div className="h-10 bg-gray-300 rounded" />
        <div className="space-y-2 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-300 rounded w-full" />
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="md:hidden flex items-center justify-between bg-white shadow-sm p-4 border-b animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-40" />
          <div className="h-6 bg-gray-300 rounded w-6" />
        </div>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-10 max-w-5xl mx-auto space-y-6 animate-pulse">
            {/* Top section: Avatar + Summary */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center" />
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-300 rounded w-48" />
                <div className="h-4 bg-gray-300 rounded w-32" />
                <div className="h-4 bg-gray-300 rounded w-36" />
                <div className="h-3 bg-gray-300 rounded w-40 mt-1" />
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-2">
              <div className="h-5 bg-gray-300 rounded w-40" />
              <div className="h-4 bg-gray-300 rounded w-full" />
              <div className="h-4 bg-gray-300 rounded w-5/6" />
              <div className="h-4 bg-gray-300 rounded w-2/3" />
            </div>

            {/* Form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-1/2" />
                  <div className="h-10 bg-gray-300 rounded w-full" />
                </div>
              ))}
            </div>

            {/* Save button */}
            <div className="h-12 bg-gray-300 rounded w-full mt-4" />
          </div>
        </main>
      </div>
    </div>
  );
}