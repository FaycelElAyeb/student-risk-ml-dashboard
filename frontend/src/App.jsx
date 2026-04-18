import { useEffect, useState } from 'react';
import StatCard from './components/StatCard';
import ProbabilityBar from './components/ProbabilityBar';
import logo from './assets/logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function getRiskClass(risk) {
  if (risk === 'High') return 'risk-high';
  if (risk === 'Medium') return 'risk-medium';
  return 'risk-low';
}

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_URL}/dashboard`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <div className="screen-message">Loading dashboard…</div>;
  }

  if (error) {
    return (
      <div className="screen-message">
        <p>{error}</p>
        <button onClick={loadDashboard}>Retry</button>
      </div>
    );
  }

  return (
    <div className="page">
      {/*<header className="hero">
        <div>
          <p className="eyebrow">AI student success monitoring</p>
          <h1>Student Risk Prediction Dashboard</h1>
          <p className="hero-subtitle">
           
          </p>
        </div>
        <button className="refresh-btn" onClick={loadDashboard}>Refresh simulated data</button>
      </header>
      <header className="hero">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        
     
        <img 
          src={logo} 
          alt="logo" 
          style={{ height: '50px', position: 'absolute', left: '10px' }} 
        />

        
        <div style={{ textAlign: 'center' }}>
          <p className="eyebrow">AI student success monitoring</p>
          <h1>Student Risk Prediction Dashboard</h1>
        </div>

      </div>

      <button className="refresh-btn" onClick={loadDashboard}>
        Refresh simulated data
      </button>
      </header>*/}
      <header className="hero">
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '10px 0' }}>

          {/* LEFT: logo */}
          <div style={{ position: 'absolute', left: '20px' }}>
            <img 
              src={logo} 
              alt="logo"
              style={{
                height: '70px',
                objectFit: 'contain',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            />
          </div>

          {/* CENTER: title */}
          <div style={{ margin: '0 auto', textAlign: 'center' }}>
            <p className="eyebrow">AI student success monitoring</p>
            <h1 style={{ margin: 0 }}>Student Risk Prediction Dashboard</h1>
          </div>

          {/* RIGHT: button */}
          <div style={{ position: 'absolute', right: '20px' }}>
            <button className="refresh-btn" onClick={loadDashboard}>
              Refresh simulated data
            </button>
          </div>

        </div>
      </header>

      <section className="stats-grid">
        <StatCard title="Total students" value={data.summary.totalStudents} subtitle="Current simulated cohort" />
        <StatCard title="Average score" value={`${data.summary.averageScore}%`} subtitle="Computed from performance indicators" />
        <StatCard title="At-risk rate" value={`${data.summary.atRiskRate}%`} subtitle="Medium + High risk students" />
        <StatCard title="High risk" value={data.summary.highRisk} subtitle="Immediate intervention priority" />
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Live alerts</p>
              <h2>Priority follow-ups</h2>
            </div>
          </div>
          <div className="alert-list">
            {data.topAlerts.map((student) => (
              <article key={student.id} className="alert-card">
                <div>
                  <h3>{student.name}</h3>
                  <p>{student.email}</p>
                </div>
                <span className={`risk-pill ${getRiskClass(student.prediction.risk)}`}>
                  {student.prediction.risk} · {student.prediction.confidence}%
                </span>
                <p className="advice">{student.prediction.advice}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Cohort table</p>
              <h2>Students overview</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Logins</th>
                  <th>Assignments</th>
                  <th>Quizzes</th>
                  <th>Forum</th>
                  <th>Attendance</th>
                  <th>Study hours</th>
                  <th>Prediction</th>
                </tr>
              </thead>
              <tbody>
                {data.students.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <strong>{student.name}</strong>
                      <div className="muted">Score: {student.overallScore}%</div>
                    </td>
                    <td>{student.logins}</td>
                    <td>{student.assignments}%</td>
                    <td>{student.quizzes}%</td>
                    <td>{student.forum}</td>
                    <td>{student.attendance}%</td>
                    <td>{student.studyHours}h</td>
                    <td>
                      <div className={`risk-box ${getRiskClass(student.prediction.risk)}`}>
                        <div className="risk-line">
                          <span>{student.prediction.risk}</span>
                          <strong>{student.prediction.confidence}%</strong>
                        </div>
                        <ProbabilityBar probabilities={student.prediction.probabilities} />
                        <div className="probability-legend">
                          <span>L {student.prediction.probabilities.low}%</span>
                          <span>M {student.prediction.probabilities.medium}%</span>
                          <span>H {student.prediction.probabilities.high}%</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
