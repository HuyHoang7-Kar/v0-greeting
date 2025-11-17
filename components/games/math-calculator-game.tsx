"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Clock,
  Star,
  Calculator,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface GameQuestion {
  id: string;
  question: string;
  correct_answer: string;
  options?: string[];
  points: number;
}

interface MathCalculatorGameProps {
  gameId: string;
  questions: GameQuestion[];
  onGameComplete: (
    score: number,
    maxScore: number,
    timeTaken: number,
    pointsEarned: number
  ) => void;
}

export function MathCalculatorGame({
  gameId,
  questions,
  onGameComplete,
}: MathCalculatorGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [calculatorDisplay, setCalculatorDisplay] = useState("0");
  const [operation, setOperation] = useState<string | null>(null);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const supabase = createClient();

  const currentQuestion = questions[currentQuestionIndex];

  // TIMER FIX - cleanup đúng cách
  useEffect(() => {
    if (!gameStarted || gameEnded) return;

    let active = true;
    const timer = setTimeout(() => {
      if (active) setTimeLeft((t) => t - 1);
    }, 1000);

    if (timeLeft === 0) endGame();

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [gameStarted, gameEnded, timeLeft]);

  // Calculator
  const handleCalculatorInput = (value: string) => {
    if (value === "C") {
      setCalculatorDisplay("0");
      setOperation(null);
      setPreviousValue(null);
    } else if (value === "=") {
      if (operation && previousValue !== null) {
        const current = parseFloat(calculatorDisplay);
        let result = 0;
        switch (operation) {
          case "+": result = previousValue + current; break;
          case "-": result = previousValue - current; break;
          case "*": result = previousValue * current; break;
          case "/": result = previousValue / current; break;
        }
        setCalculatorDisplay(result.toString());
        setUserAnswer(result.toString());
        setOperation(null);
        setPreviousValue(null);
      }
    } else if (["+", "-", "*", "/"].includes(value)) {
      setOperation(value);
      setPreviousValue(parseFloat(calculatorDisplay));
      setCalculatorDisplay("0");
    } else {
      setCalculatorDisplay((prev) => (prev === "0" ? value : prev + value));
    }
  };

  // SAVE SCORE
  const saveGameResult = async (finalScore: number, maxScore: number, timeTaken: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "student") return;

      // find/create game
      let { data: game } = await supabase
        .from("game")
        .select("id")
        .eq("slug", gameId)
        .single();

      if (!game) {
        const { data: newGame } = await supabase
          .from("game")
          .insert({
            slug: gameId,
            title: "Trò chơi Máy tính Toán học",
            description: "Luyện tính toán nhanh với máy tính ảo",
          })
          .select("id")
          .single();
        game = newGame;
      }

      // insert play
      const { data: play } = await supabase
        .from("game_plays")
        .insert({
          user_id: user.id,
          game_id: game.id,
          score: finalScore,
        })
        .select("id")
        .single();

      // detailed scores - FIX
      const detailedScores = questions.map((q, index) => ({
        play_id: play.id,
        question_id: q.id,
        points: q.points,
        is_correct:
          Math.abs(
            parseFloat(answers[index] || "0") -
            parseFloat(q.correct_answer)
          ) < 0.01,
      }));

      await supabase.from("game_scores").insert(detailedScores);

      // update total
      const { data: existingTotal } = await supabase
        .from("user_totals")
        .select("total_score,total_plays")
        .eq("user_id", user.id)
        .single();

      if (existingTotal) {
        await supabase
          .from("user_totals")
          .update({
            total_score: existingTotal.total_score + finalScore,
            total_plays: existingTotal.total_plays + 1,
          })
          .eq("user_id", user.id);
      } else {
        await supabase.from("user_totals").insert({
          user_id: user.id,
          total_score: finalScore,
          total_plays: 1,
        });
      }

    } catch (e) {
      console.error("Error saving:", e);
    }
  };

  const handleSubmit = () => {
    if (!userAnswer.trim()) return;

    const correct =
      Math.abs(parseFloat(userAnswer) - parseFloat(currentQuestion.correct_answer)) < 0.01;
    setIsCorrect(correct);
    setShowResult(true);

    setAnswers((prev) => [...prev, userAnswer]);

    if (correct) setScore((prev) => prev + currentQuestion.points);

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setUserAnswer("");
        setCalculatorDisplay("0");
        setOperation(null);
        setPreviousValue(null);
        setShowResult(false);
        setIsCorrect(null);
      } else endGame();
    }, 1500);
  };

  const endGame = () => {
    setGameEnded(true);
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
    const timeTaken = 300 - timeLeft;

    saveGameResult(score, maxScore, timeTaken);
    onGameComplete(score, maxScore, timeTaken, score);
  };

  const progress =
    ((currentQuestionIndex + (showResult ? 1 : 0)) / questions.length) * 100;

  // UI
  if (!gameStarted) return (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Trò chơi Máy tính Toán học</h2>
        <p className="text-gray-600">Giải nhanh các bài toán bằng máy tính ảo!</p>
      </div>
      <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
        <Clock className="w-4 h-4" />
        <span>Thời gian: 5 phút</span>
        <Calculator className="w-4 h-4" />
        <span>{questions.length} bài toán</span>
      </div>
      <Button onClick={() => setGameStarted(true)} size="lg" className="bg-blue-500 hover:bg-blue-600">
        Bắt đầu
      </Button>
    </div>
  );

  if (gameEnded) {
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = Math.round((score / maxScore) * 100);

    return (
      <div className="text-center space-y-6">
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900">Hoàn thành!</h2>
        <p className="text-gray-600">Bạn đã hoàn tất {questions.length} bài toán</p>
        <div className="text-3xl font-bold text-blue-600">{score} điểm ({percentage}%)</div>

        <Button
          variant="outline"
          onClick={() => {
            setGameStarted(false);
            setGameEnded(false);
            setScore(0);
            setTimeLeft(300);
            setCurrentQuestionIndex(0);
            setAnswers([]);
            setUserAnswer("");
            setCalculatorDisplay("0");
            setOperation(null);
            setPreviousValue(null);
          }}
        >
          Chơi lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900">Máy tính Toán học</h2>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <Clock className="w-4 h-4" /> {Math.floor(timeLeft / 60)}:
            {(timeLeft % 60).toString().padStart(2, "0")}
            <Star className="w-4 h-4 ml-4" /> {score} điểm
          </div>
        </div>
        <Badge variant="secondary">
          {currentQuestionIndex + 1}/{questions.length}
        </Badge>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <CardContent className="space-y-4">
            {showResult ? (
              isCorrect ? (
                <div className="text-center text-green-600">
                  <CheckCircle className="w-12 h-12 mx-auto" />
                  +{currentQuestion.points} điểm
                </div>
              ) : (
                <div className="text-center text-red-600">
                  <XCircle className="w-12 h-12 mx-auto" />
                  Sai rồi! Đáp án đúng: {currentQuestion.correct_answer}
                </div>
              )
            ) : (
              <>
                <h3 className="text-lg font-medium">Bài toán:</h3>
                <div className="text-2xl font-bold text-blue-600 text-center bg-blue-50 p-3 rounded-lg">
                  {currentQuestion.question}
                </div>
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Nhập kết quả..."
                  type="number"
                  step="0.01"
                  className="text-center text-lg"
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!userAnswer.trim()}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  Xác nhận
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Máy tính</h3>
            <div className="bg-gray-900 text-white p-4 rounded-lg text-right text-2xl font-mono">
              {calculatorDisplay}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {["C", "/", "*", "-", "7", "8", "9", "+", "4", "5", "6", "1", "2", "3", "0", ".", "="].map(
                (val) => (
                  <Button
                    key={val}
                    onClick={() => handleCalculatorInput(val)}
                    variant="outline"
                    className={
                      val === "C"
                        ? "bg-red-50 hover:bg-red-100"
                        : ["+", "-", "*", "/", "="].includes(val)
                        ? "bg-blue-50 hover:bg-blue-100"
                        : ""
                    }
                  >
                    {val}
                  </Button>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
