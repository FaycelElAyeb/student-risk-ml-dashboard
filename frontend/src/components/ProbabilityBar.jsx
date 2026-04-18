export default function ProbabilityBar({ probabilities }) {
  return (
    <div className="probability-wrapper" aria-label="Risk probabilities">
      <div className="bar low" style={{ width: `${probabilities.low}%` }} />
      <div className="bar medium" style={{ width: `${probabilities.medium}%` }} />
      <div className="bar high" style={{ width: `${probabilities.high}%` }} />
    </div>
  );
}
