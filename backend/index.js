import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

app.use(cors());
app.use(express.json());

const firstNames = ['Amira', 'Youssef', 'Salma', 'Nour', 'Omar', 'Lina', 'Sara', 'Karim', 'Hana', 'Adam', 'Meriem', 'Rayen'];
const lastNames = ['Ben Ali', 'Trabelsi', 'Mansour', 'Fakhri', 'Cherif', 'Bouzid', 'Khelifi', 'Ayari', 'Sassi', 'Jaziri'];

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function studentName(index) {
  return `${randomFrom(firstNames)} ${randomFrom(lastNames)} #${index + 1}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function generateStudent(index) {
  const logins = Math.floor(Math.random() * 180) + 10;
  const assignments = Math.floor(Math.random() * 101);
  const quizzes = Math.floor(Math.random() * 101);
  const forum = Math.floor(Math.random() * 61);
  const attendance = Math.floor(Math.random() * 41) + 60;
  const studyHours = Math.floor(Math.random() * 16) + 1;

  const engagement = (logins / 2.2) + forum + studyHours * 2;
  const performance = (assignments + quizzes + attendance) / 3;
  const overallScore = clamp(Math.round(engagement * 0.35 + performance * 0.65), 0, 100);

  return {
    id: index + 1,
    name: studentName(index),
    email: `student${index + 1}@example.com`,
    logins,
    assignments,
    quizzes,
    forum,
    attendance,
    studyHours,
    overallScore
  };
}

function summarizePredictions(rows) {
  return rows.reduce((acc, row) => {
    acc[row.prediction.risk] += 1;
    return acc;
  }, { Low: 0, Medium: 0, High: 0 });
}

app.get('/api/health', (_, res) => {
  res.json({ ok: true, service: 'backend' });
});

app.post('/api/predict-risk', async (req, res) => {
  try {
    const response = await axios.post(`${ML_API_URL}/predict`, req.body, {
      timeout: 8000
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'ML service error',
      details: error.response?.data || error.message
    });
  }
});

app.get('/api/dashboard', async (req, res) => {
  const count = Number(req.query.count || 12);
  const students = Array.from({ length: count }, (_, index) => generateStudent(index));

  try {
    const predictions = await Promise.all(
      students.map(async (student) => {
        const { data } = await axios.post(`${ML_API_URL}/predict`, student, { timeout: 8000 });
        return { ...student, prediction: data };
      })
    );

    const counts = summarizePredictions(predictions);
    const avgScore = Math.round(
      predictions.reduce((sum, student) => sum + student.overallScore, 0) / predictions.length
    );

    const atRiskStudents = predictions
      .filter((student) => student.prediction.risk !== 'Low')
      .sort((a, b) => b.prediction.confidence - a.prediction.confidence)
      .slice(0, 5);

    res.json({
      generatedAt: new Date().toISOString(),
      summary: {
        totalStudents: predictions.length,
        averageScore: avgScore,
        highRisk: counts.High,
        mediumRisk: counts.Medium,
        lowRisk: counts.Low,
        atRiskRate: Math.round(((counts.High + counts.Medium) / predictions.length) * 100)
      },
      students: predictions,
      topAlerts: atRiskStudents
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate dashboard',
      details: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
