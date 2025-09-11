



export default function BookPage() {
  return (
    <section className="max-w-lg mx-auto bg-white p-8 shadow rounded-2xl">
      <h2 className="text-2xl font-bold mb-6">Make a Booking</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input type="text" className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-300" placeholder="Enter your name" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-300" placeholder="Enter your email" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input type="date" className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-300" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Time</label>
          <input type="time" className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-300" />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg shadow hover:bg-blue-700">
          Confirm Booking
        </button>
      </form>
    </section>
  )
}
