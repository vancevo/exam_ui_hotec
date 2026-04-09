import { useState, useEffect } from 'react';
import { exam } from './data/exam';

// TS Interfaces
interface Answer {
  content: string;
  isCorrect: boolean;
  originalIndex?: number;
}

interface Question {
  id: number;
  level: string;
  content: string;
  answers: Answer[];
}

interface ExamType {
  subject: string;
  subjectCode: string;
  examCode: string;
  duration: number;
  questions: Question[];
}

interface HistoryEntry {
  id: string; // unique id for review
  name: string;
  score: number;
  total: number;
  date: string;
  questions: Question[]; // Exam snapshot used in this try
  userAnswers: Record<number, number>; // What user picked
}

// Utility: Fisher-Yates array shuffle
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function App() {
  const [userName, setUserName] = useState('');
  const [questionCount, setQuestionCount] = useState<number>(exam.questions.length);
  const [appState, setAppState] = useState<'login' | 'quiz' | 'result' | 'review'>('login');
  
  // Quiz State
  const [currentExam, setCurrentExam] = useState<ExamType | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  
  // Review specific state
  const [reviewEntry, setReviewEntry] = useState<HistoryEntry | null>(null);

  // History
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('quizHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch(e) { }
    }
  }, []);

  const saveHistory = (result: HistoryEntry) => {
    const newHistory = [result, ...history];
    setHistory(newHistory);
    localStorage.setItem('quizHistory', JSON.stringify(newHistory));
  };

  const startQuiz = () => {
    if (!userName.trim()) return;
    
    // Shuffle and slice questions based on questionCount
    let shuffledQuestions = shuffleArray(exam.questions);
    
    // Bounds check
    const validCount = Math.min(Math.max(1, questionCount), exam.questions.length);
    shuffledQuestions = shuffledQuestions.slice(0, validCount).map(q => ({
      ...q,
      answers: shuffleArray(q.answers)
    }));

    setCurrentExam({
      ...exam,
      questions: shuffledQuestions
    });
    
    setCurrentQIndex(0);
    setUserAnswers({});
    setAppState('quiz');
  };

  const submitQuiz = () => {
    if (!currentExam) return;
    
    // Validation: make sure all questions are answered
    if (Object.keys(userAnswers).length < currentExam.questions.length) {
      alert("Bạn phải chọn đầy đủ đáp án cho tất cả các câu hỏi trước khi nộp bài!");
      return;
    }
    
    // Calculate score
    let correctCount = 0;
    currentExam.questions.forEach(q => {
      const selectedIndex = userAnswers[q.id];
      if (selectedIndex !== undefined && q.answers[selectedIndex]?.isCorrect) {
        correctCount++;
      }
    });

    saveHistory({
      id: Date.now().toString(),
      name: userName,
      score: correctCount,
      total: currentExam.questions.length,
      date: new Date().toLocaleString(),
      questions: currentExam.questions,
      userAnswers: { ...userAnswers }
    });

    setAppState('result');
  };

  const selectAnswer = (questionId: number, answerIndex: number) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const resetState = () => {
    setAppState('login');
    setReviewEntry(null);
    setUserAnswers({});
    setCurrentQIndex(0);
  };

  const startReview = (entry: HistoryEntry) => {
    setReviewEntry(entry);
    setCurrentQIndex(0);
    setAppState('review');
  };

  // ---------------- Render Helpers ----------------
  const renderLogin = () => (
    <div className="pad-content text-center" style={{ justifyContent: 'center' }}>
      <h2>Chào mừng đến với {exam.subject}</h2>
      <p style={{ marginBottom: "2rem" }}>Môn học: {exam.subjectCode}</p>
      
      <input
        type="text"
        className="base-input"
        placeholder="Nhập tên của bạn..."
        value={userName}
        onChange={e => setUserName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && startQuiz()}
      />
      <div style={{ textAlign: "left", marginBottom: "1rem" }}>
        <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Số lượng câu hỏi (tối đa {exam.questions.length}):</label>
        <input
          type="number"
          className="base-input"
          min={1}
          max={exam.questions.length}
          value={questionCount}
          onChange={e => setQuestionCount(parseInt(e.target.value) || 1)}
          style={{ marginTop: "0.5rem" }}
        />
      </div>
      <button 
        className="btn btn-primary" 
        onClick={startQuiz}
        disabled={!userName.trim()}
        style={{ width: "100%" }}
      >
        Bắt đầu thi
      </button>

      {history.length > 0 && (
        <div className="history-list" style={{ textAlign: 'left', marginTop: '2rem' }}>
          <h3>Lịch sử thi (Local)</h3>
          {history.length === 0 && <p>Chưa có lịch sử.</p>}
          {history.slice(0, 5).map((h) => (
            <div className="history-item" key={h.id}>
              <div>
                <strong style={{ display: "block" }}>{h.name}</strong>
                <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{h.date}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span className="question-badge">{h.score}/{h.total}</span>
                <button className="btn btn-outline" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }} onClick={() => startReview(h)}>
                  Xem Lại
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderQuizLayout = (
    questions: Question[],
    answersRecord: Record<number, number>,
    isReview: boolean
  ) => {
    const q = questions[currentQIndex];
    if (!q) return null;

    return (
      <div className="quiz-layout">
        <div className="quiz-main">
          <div className="quiz-header">
            <span className="question-badge">
              Câu {currentQIndex + 1} / {questions.length}
              {isReview && ' (Chế độ xem lại)'}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {!isReview ? (
                <>
                  <button 
                    className="btn btn-outline" 
                    style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem" }} 
                    onClick={() => {
                      if(confirm("Bạn có chắc chắn muốn bỏ bài làm hiện tại và đổi đề khác?")) startQuiz();
                    }}
                  >
                    🔄 Đổi Đề
                  </button>
                  <button 
                    className="btn btn-danger" 
                    style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem" }} 
                    onClick={() => {
                      if(confirm("Bạn có muốn hủy bài làm này và quay về trang chủ?")) resetState();
                    }}
                  >
                    ✖ Bỏ bài
                  </button>
                </>
              ) : (
                <button 
                  className="btn btn-primary" 
                  style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem" }} 
                  onClick={resetState}
                >
                  🏠 Trang chủ
                </button>
              )}
            </div>
          </div>

          <div className="question-text">
            {currentQIndex + 1}. {q.content}
          </div>

          <div className="options-list">
            {q.answers.map((ans, idx) => {
              const isSelected = answersRecord[q.id] === idx;
              
              // CSS Classes based on state
              let cardClass = `option-card ${isReview ? 'read-only' : ''}`;
              
              if (isReview) {
                if (ans.isCorrect) {
                  cardClass += ' correct';
                } else if (isSelected && !ans.isCorrect) {
                  cardClass += ' wrong';
                }
              } else {
                if (isSelected) cardClass += ' selected';
              }

              return (
                <label 
                  key={idx} 
                  className={cardClass}
                  onClick={() => !isReview && selectAnswer(q.id, idx)}
                >
                  <input 
                    type="radio" 
                    name={`q-${q.id}`} 
                    checked={isSelected}
                    readOnly
                  />
                  <span>{ans.content}</span>
                  {isReview && ans.isCorrect && <span style={{ marginLeft: "auto", color: "var(--success)" }}>✓ Đáp án đúng</span>}
                  {isReview && isSelected && !ans.isCorrect && <span style={{ marginLeft: "auto", color: "var(--danger)" }}>✕ Đã chọn</span>}
                </label>
              );
            })}
          </div>

          <div className="quiz-footer">
            <button 
              className="btn btn-outline"
              disabled={currentQIndex === 0}
              onClick={() => setCurrentQIndex(prev => prev - 1)}
            >
              ← Quay lại
            </button>
            
            {currentQIndex < questions.length - 1 ? (
              <button 
                className="btn btn-outline"
                onClick={() => setCurrentQIndex(prev => prev + 1)}
              >
                Tiếp theo →
              </button>
            ) : (
              !isReview ? (
                <button 
                  className="btn btn-primary" style={{ backgroundColor: "var(--success)" }}
                  onClick={submitQuiz}
                >
                  Nộp bài ✓
                </button>
              ) : (
                <button 
                  className="btn btn-primary"
                  onClick={resetState}
                >
                  Hoàn tất Xem
                </button>
              )
            )}
          </div>
        </div>

        {/* Bảng Đáp Án (Question Matrix Sidebar) */}
        <div className="quiz-sidebar">
          <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Bảng câu hỏi</h3>
          <p style={{ fontSize: "0.875rem", marginBottom: "1rem" }}>
            {isReview ? 'Chi tiết đúng/sai' : 'Các câu đã trả lời'}
          </p>
          <div className="matrix-grid">
            {questions.map((mq, idx) => {
              const answered = answersRecord[mq.id] !== undefined;
              const isActive = idx === currentQIndex;
              let btnClass = `matrix-btn ${isActive ? 'active' : ''}`;
              
              if (isReview) {
                // In review logic, check if they got it right
                const selectedIdx = answersRecord[mq.id];
                const isCorrect = selectedIdx !== undefined && mq.answers[selectedIdx]?.isCorrect;
                
                if (selectedIdx === undefined) {
                  btnClass += ' wrong'; // Unanswered defaults to wrong styling in review
                } else if (isCorrect) {
                  btnClass += ' answered'; // green by default
                } else {
                  btnClass += ' wrong btn-danger';
                }
              } else {
                if (answered) btnClass += ' answered';
              }

              return (
                <button 
                  key={mq.id} 
                  className={btnClass}
                  onClick={() => setCurrentQIndex(idx)}
                  title={!isReview && !answered ? 'Chưa trả lời' : ''}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    const lastResult = history[0];
    return (
      <div className="pad-content text-center" style={{ justifyContent: 'center' }}>
        <h2>Kết Quả Bài Thi</h2>
        <div className="result-score">
          {lastResult?.score} <span style={{ color: "var(--text-muted)", fontSize: "1.5rem"}}> / {lastResult?.total}</span>
        </div>
        <p style={{ marginBottom: "2rem" }}>Chúc mừng <strong>{userName}</strong> đã hoàn thành bài thi!</p>
        
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button className="btn btn-primary" onClick={() => lastResult && startReview(lastResult)}>
            Xem lại bài làm
          </button>
          <button className="btn btn-outline" onClick={resetState}>
            Trang chủ
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      {appState === 'login' && renderLogin()}
      {appState === 'quiz' && currentExam && renderQuizLayout(currentExam.questions, userAnswers, false)}
      {appState === 'review' && reviewEntry && renderQuizLayout(reviewEntry.questions, reviewEntry.userAnswers, true)}
      {appState === 'result' && renderResult()}
    </div>
  );
}
