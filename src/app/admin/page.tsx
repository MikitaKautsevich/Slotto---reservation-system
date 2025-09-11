export default function AdminPage() {
  const mockBookings = [
    { id: 1, name: "Alice", email: "alice@example.com", date: "2025-09-10", status: "Booked" },
    { id: 2, name: "John", email: "john@example.com", date: "2025-09-05", status: "Completed" },
  ]

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
      <table className="w-full border-collapse bg-white shadow rounded-lg">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3 border">Name</th>
            <th className="p-3 border">Email</th>
            <th className="p-3 border">Date</th>
            <th className="p-3 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {mockBookings.map((b) => (
            <tr key={b.id} className="hover:bg-gray-50">
              <td className="p-3 border">{b.name}</td>
              <td className="p-3 border">{b.email}</td>
              <td className="p-3 border">{b.date}</td>
              <td className="p-3 border">{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
