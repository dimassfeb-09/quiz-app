import React, { useEffect, useState } from "react";
import { Question } from "../types/Question";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Quiz: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{
    [key: number]: { answer: string; isCorrect: boolean };
  }>({});
  const [timeLeft, setTimeLeft] = useState(10);
  const [totalTimeLeft, setTotalTimeLeft] = useState(100);
  const [quizFinished, setQuizFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedQuestions = localStorage.getItem("questions");
    const savedAnswers = localStorage.getItem("userAnswers");
    const savedIndex = localStorage.getItem("currentQuestionIndex");
    const savedTotalTimeLeft = localStorage.getItem("totalTimeLeft");

    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions));
      setLoading(false);
    } else {
      fetchQuestions();
    }

    if (savedAnswers) {
      setUserAnswers(JSON.parse(savedAnswers));
    }

    if (savedIndex) {
      setCurrentQuestionIndex(parseInt(savedIndex, 10));
    }
    if (savedTotalTimeLeft) {
      setTotalTimeLeft(parseInt(savedTotalTimeLeft, 10));
    }
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://opentdb.com/api.php?amount=10&difficulty=easy&type=multiple"
      );

      const data = response.data;
      setQuestions(data.results);
      localStorage.setItem("questions", JSON.stringify(data.results));
      setTotalTimeLeft(data.results.length * 10);
    } catch (err: any) {
      if (err.response.data.response_code === 5) {
        setError(
          "Rate Limit Too many requests have occurred. Please wait and refresh in 5 seconds."
        );
      } else {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (totalTimeLeft <= 0) {
      finishQuiz();
    } else {
      const timer = setInterval(() => {
        setTotalTimeLeft((prev) => {
          const newTimeLeft = prev - 1;
          localStorage.setItem("totalTimeLeft", newTimeLeft.toString());
          return newTimeLeft;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [totalTimeLeft]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleNextQuestion();
    } else {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTimeLeft = prev - 1;
          return newTimeLeft;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const handleAnswer = (answer: string) => {
    const question = questions[currentQuestionIndex];
    const isCorrect = question.correct_answer === answer;

    setUserAnswers((prev) => {
      const updatedAnswers = {
        ...prev,
        [currentQuestionIndex]: { answer, isCorrect },
      };
      localStorage.setItem("userAnswers", JSON.stringify(updatedAnswers));
      return updatedAnswers;
    });

    if (isCorrect) setScore((prev) => prev + 1);

    handleNextQuestion();
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex >= questions.length - 1) {
      finishQuiz();
      return;
    }

    setCurrentQuestionIndex((prev) => {
      const nextIndex = prev + 1;
      localStorage.setItem("currentQuestionIndex", nextIndex.toString());
      return nextIndex;
    });

    setTimeLeft(10);
  };

  const finishQuiz = () => {
    setQuizFinished(true);
    localStorage.removeItem("questions");
    localStorage.removeItem("userAnswers");
    localStorage.removeItem("currentQuestionIndex");
    localStorage.removeItem("totalTimeLeft");
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserAnswers({});
    setTimeLeft(10);
    setTotalTimeLeft(100);
    setQuizFinished(false);
    localStorage.removeItem("questions");
    localStorage.removeItem("userAnswers");
    localStorage.removeItem("currentQuestionIndex");
    localStorage.removeItem("totalTimeLeft");
  };

  const handleLogout = () => {
    localStorage.removeItem("email");
    finishQuiz();
    navigate("/login");
  };

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-gradient-to-r from-blue-400 to-purple-400 p-6">
      <div className="flex flex-col justify-center items-center gap-5 bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Loading Questions...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    </div>
  );

  const renderProgressBar = () => {
    const progress = (currentQuestionIndex / questions.length) * 100;
    return (
      <div className="w-full mb-4">
        <div className="w-full bg-gray-300 rounded-full h-2 mb-1">
          <div
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-sm font-semibold">
          {Math.round(progress)}%
        </p>
      </div>
    );
  };

  const renderQuestion = () => {
    if (loading) return renderLoading();
    if (error) return <p>Error: {error}</p>;
    if (questions.length === 0) return <p>No questions available.</p>;

    const question = questions[currentQuestionIndex];
    const answers = [
      question.correct_answer,
      ...question.incorrect_answers,
    ].sort();

    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-400 to-purple-400 p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          {renderProgressBar()}
          <h1
            className="text-2xl font-bold mb-4"
            dangerouslySetInnerHTML={{ __html: question.question }}
          />
          <div className="flex flex-col mt-4">
            {answers.map((answer, index) => (
              <button
                key={index}
                className={`bg-gray-200 text-black p-3 rounded-lg mt-2 transition duration-300 ease-in-out hover:bg-blue-300 hover:text-white ${
                  userAnswers[currentQuestionIndex]?.answer === answer
                    ? "bg-blue-500 text-white"
                    : ""
                }`}
                onClick={() => handleAnswer(answer)}
                dangerouslySetInnerHTML={{ __html: answer }}
              ></button>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-lg font-semibold">
              Time Left for this Question:{" "}
              <span className="text-red-500">{timeLeft}s</span>
            </p>
            <p className="text-lg font-semibold">
              Total Time Left for Quiz:{" "}
              <span className="text-red-500">{totalTimeLeft}s</span>
            </p>
            <p className="text-md">
              Total Questions: {questions.length} | Answered:{" "}
              {Object.keys(userAnswers).length}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex fixed bg-white w-full justify-between p-4">
        <h1 className="text-2xl font-bold">Quiz App</h1>
        <button
          className="bg-red-500 text-white p-2 rounded-lg transition duration-300 ease-in-out hover:bg-red-700"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
      {quizFinished ? (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-400 to-purple-400 p-6">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-center">
            <h1 className="text-2xl font-bold mb-4">Quiz Finished!</h1>
            <p className="text-5xl font-bold mb-7">{score * 10}%</p>

            <p className="text-xl">
              Correct: {score}/{questions.length}
            </p>

            <p className="text-xl">
              Answered: {Object.keys(userAnswers).length} /{questions.length}
            </p>

            <p className="text-xl mb-5">
              Skipped: {questions.length - Object.keys(userAnswers).length}/
              {questions.length}
            </p>
            <button
              className="bg-blue-500 text-white p-2 rounded-lg mt-4 transition duration-300 ease-in-out hover:bg-blue-700"
              onClick={resetQuiz}
            >
              Restart Quiz
            </button>
          </div>
        </div>
      ) : (
        renderQuestion()
      )}
    </>
  );
};

export default Quiz;
