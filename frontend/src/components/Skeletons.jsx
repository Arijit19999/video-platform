export const CardSkeleton = () => (
  <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden animate-pulse">
    <div className="aspect-video bg-gray-700" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-700 rounded w-3/4" />
      <div className="h-3 bg-gray-700 rounded w-1/2" />
      <div className="h-6 bg-gray-700 rounded-full w-20" />
    </div>
  </div>
);

export const StatSkeleton = () => (
  <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-3 bg-gray-700 rounded w-20" />
        <div className="h-8 bg-gray-700 rounded w-12" />
      </div>
      <div className="w-12 h-12 bg-gray-700 rounded-xl" />
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 bg-gray-700 rounded-full" /><div className="h-4 bg-gray-700 rounded w-24" /></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-32" /></td>
    <td className="px-6 py-4"><div className="h-8 bg-gray-700 rounded w-20" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-20" /></td>
    <td className="px-6 py-4"><div className="h-8 bg-gray-700 rounded w-8 ml-auto" /></td>
  </tr>
);

export const VideoGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);
