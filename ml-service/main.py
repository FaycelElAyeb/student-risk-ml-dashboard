from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
from sklearn.linear_model import LogisticRegression

app = FastAPI(title="Student Risk ML API", version="1.0.0")


def build_synthetic_dataset(n_samples: int = 1200, random_seed: int = 42):
    rng = np.random.default_rng(random_seed)

    logins = rng.integers(10, 190, n_samples)
    assignments = rng.integers(0, 101, n_samples)
    quizzes = rng.integers(0, 101, n_samples)
    forum = rng.integers(0, 61, n_samples)
    attendance = rng.integers(60, 101, n_samples)
    study_hours = rng.integers(1, 17, n_samples)

    X = np.column_stack([
        logins,
        assignments,
        quizzes,
        forum,
        attendance,
        study_hours,
    ]).astype(float)

    noise = rng.normal(0, 4.5, X.shape)
    X_noisy = X + noise

    labels = []
    for row in X:
        login, assignment, quiz, forum_posts, attend, study = row
        engagement = login * 0.22 + forum_posts * 1.2 + study * 2.5
        performance = assignment * 0.35 + quiz * 0.45 + attend * 0.20
        risk_score = 100 - (engagement * 0.28 + performance * 0.72)

        if risk_score >= 55 or (quiz < 45 and assignment < 50):
            labels.append(2)  # High
        elif risk_score >= 35 or quiz < 65:
            labels.append(1)  # Medium
        else:
            labels.append(0)  # Low

    return X_noisy, np.array(labels)


X_train, y_train = build_synthetic_dataset()
model = LogisticRegression(max_iter=1200, multi_class="multinomial")
model.fit(X_train, y_train)

LABELS = ["Low", "Medium", "High"]


class StudentFeatures(BaseModel):
    logins: int
    assignments: int
    quizzes: int
    forum: int
    attendance: int = 80
    studyHours: int = 8


@app.get("/")
def root():
    return {"ok": True, "service": "ml-api"}


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/predict")
def predict(student: StudentFeatures):
    features = np.array([
        [
            student.logins,
            student.assignments,
            student.quizzes,
            student.forum,
            student.attendance,
            student.studyHours,
        ]
    ], dtype=float)

    prediction = int(model.predict(features)[0])
    probabilities = model.predict_proba(features)[0]

    confidence = round(float(np.max(probabilities)) * 100, 2)

    return {
        "risk": LABELS[prediction],
        "confidence": confidence,
        "probabilities": {
            "low": round(float(probabilities[0]) * 100, 2),
            "medium": round(float(probabilities[1]) * 100, 2),
            "high": round(float(probabilities[2]) * 100, 2),
        },
        "advice": get_recommendation(LABELS[prediction], student)
    }


def get_recommendation(risk: str, student: StudentFeatures):
    if risk == "High":
        return "Schedule an immediate academic follow-up and assign a mentor."
    if risk == "Medium":
        return "Monitor weekly progress and encourage more quiz practice."
    return "Keep current progress and maintain engagement."
