type Col<T> = { header: string; render: (row: T) => React.ReactNode };

export default function Table<T>({ columns, data }: { columns: Col<T>[]; data: T[] }) {
  return (
    <div className="overflow-auto rounded-lg border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="text-left px-3 py-2 font-medium">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              {columns.map((col, i) => (
                <td key={i} className="px-3 py-2">
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && <div className="p-4 text-center text-muted">Aucune donnée</div>}
    </div>
  );
}
