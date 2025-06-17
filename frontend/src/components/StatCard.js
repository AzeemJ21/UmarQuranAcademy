export default function StatCard({ title, value }) {
  return (
    <div className="bg-[#2E4D3B] p-6 rounded-xl shadow hover:shadow-lg transition duration-300">
      <h3 className="text-xl text-white font-semibold mb-2">{title}</h3>
      <p className="text-3xl font-bold text-yellow-600">{value}</p>
    </div>
  );
}
