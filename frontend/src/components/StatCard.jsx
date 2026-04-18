export default function StatCard({ title, value, subtitle }) {
  return (
    <div className="stat-card">
      <p className="stat-title">{title}</p>
      <h3>{value}</h3>
      <p className="stat-subtitle">{subtitle}</p>
    </div>
  );
}
