export default function HistoryPage() {
  const mockHistory = [
    { id: 1, service: "Consultation", date: "2025-09-10", status: "Booked" },
    { id: 2, service: "Training", date: "2025-09-05", status: "Completed" },
  ]

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">Booking History</h2>
      <div className="space-y-4">
        {mockHistory.map((item) => (
          <div key={item.id} className="p-4 border rounded-lg bg-white shadow-sm flex justify-between">
            <div>
              <p className="font-semibold">{item.service}</p>
              <p className="text-gray-600 text-sm">{item.date}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">{item.status}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
