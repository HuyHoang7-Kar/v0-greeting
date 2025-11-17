"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock, Star, Calculator, CheckCircle, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface GameQuestion {
  id: string;
  question: string;
  correct_answer: string;
  points: number;
}

interface MathCalculatorGameProps {
  gameId: string;
  questions: GameQuestion[];
  onGameComplete: (score: number, maxScore: number, timeTaken: number, pointsEarned: number) => void;
}

export function MathCalculatorGame({ gameId, questions, onGameComplete }: MathCalculatorGameProps) {
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
  const supabase = createClient();

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (!gameStarted || gameEnded) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameStarted, gameEnded]);

  const handleCalculatorInput = (value: string) => {
    if (value === "C") {
      setCalculatorDisplay("0");
      setOperation(null);
      setPreviousValue(null);
    } else if (value === "=" && operation && previousValue !== null) {
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
    } else if (["+", "-", "*", "/"].includes(value)) {
      setOperation(value);
      setPreviousValue(parseFloat(calculatorDisplay));
      setCalculatorDisplay("0");
    } else {
      setCalculatorDisplay((prev) => (prev === "0" ? value : prev + value));
    }
  };

  const handleSubmit = async () => {
    if (!userAnswer.trim()) return;
    const correct = Math.abs(parseFloat(userAnswer) - parseFloat(currentQuestion.correct_answer)) < 0.01;
    setIsCorrect(correct);
    setShowResult(true);
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
    }, 1200);
  };

  const endGame = async () => {
    setGameEnded(true);
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
    const timeTaken = 300 - timeLeft;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (!profile || profile.role !== "student") return;

      // Tìm hoặc tạo game
      let { data: game } = await supabase
        .from("game")
        .select("id")
        .eq("slug", gameId)
        .single();
      if (!game) {
        const { data: newGame } = await supabase
          .from("game")
          .insert({ slug: gameId, title: "Trò chơi Máy tính Toán học", description: "Luyện tính toán nhanh" })
          .select("id")
          .single();
        game = newGame;
      }

      // Insert play
      const { data: play } = await supabase
        .from("game_plays")
        .insert({ user_id: user.id, game_id: game.id, score })
        .select("id")
        .single();

      // Update game_scores (best_score & plays_count)
      const { data: existingScore } = await supabase
        .from("game_scores")
        .select("id,best_score,plays_count")
        .eq("user_id", user.id)
        .eq("game_id", game.id)
        .single();

      if (existingScore) {
        await supabase
          .from("game_scores")
          .update({
            best_score: Math.max(existingScore.best_score, score),
            plays_count: existingScore.plays_count + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingScore.id);
      } else {
        await supabase
          .from("game_scores")
          .insert({ user_id: user.id, game_id: game.id, best_score: score, plays_count: 1 });
      }

      // Update user_totals
      const { data: userTotal } = await supabase
        .from("user_totals")
        .select("total_score")
        .eq("user_id", user.id)
        .single();

      if (userTotal) {
        await supabase
          .from("user_totals")
          .update({ total_score: userTotal.total_score + score, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);
      } else {
        await supabase.from("user_totals").insert({ user_id: user.id, total_score: score });
      }

    } catch (e) {
      console.error("Error saving game result:", e);
    }

    onGameComplete(score, maxScore, timeTaken, score);
  };

  const progress = ((currentQuestionIndex + (showResult ? 1 : 0)) / questions.length) * 100;

  if (!gameStarted)
    return (
      <div className="text-center space-y-6">
        <h2 className="text-2xl font-bold">Trò chơi Máy tính Toán học</h2>
        <p>Giải nhanh các bài toán bằng máy tính ảo!</p>
        <Button onClick={() => setGameStarted(true)}>Bắt đầu</Button>
      </div>
    );

  if (gameEnded)
    return (
      <div className="text-center space-y-6">
        <Trophy className="w-16 h-16 mx-auto text-yellow-500" />
        <h2 className="text-2xl font-bold">Hoàn thành!</h2>
        <p>Bạn đã hoàn tất {questions.length} bài toán</p>
        <div className="text-3xl font-bold text-blue-600">{score} điểm</div>
        <Button
          onClick={() => {
            setGameStarted(false);
            setGameEnded(false);
            setScore(0);
            setTimeLeft(300);
            setCurrentQuestionIndex(0);
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

  if (!currentQuestion) return <div>Không có câu hỏi</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Máy tính Toán học</h2>
        <Badge variant="secondary">{currentQuestionIndex + 1}/{questions.length}</Badge>
      </div>
      <Progress value={progress} />
      <Card>
        <CardContent>
          {showResult ? (
            isCorrect ? (
              <div className="text-green-600 text-center">
                <CheckCircle className="mx-auto w-12 h-12" /> +{currentQuestion.points} điểm
              </div>
            ) : (
              <div className="text-red-600 text-center">
                <XCircle className="mx-auto w-12 h-12" /> Sai! Đáp án: {currentQuestion.correct_answer}
              </div>
            )
          ) : (
            <>
              <div className="text-2xl text-center font-bold bg-blue-50 p-3 rounded">{currentQuestion.question}</div>
              <Input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Nhập kết quả..."
              />
              <Button onClick={handleSubmit} disabled={!userAnswer.trim()}>Xác nhận</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
