"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock, Calculator, CheckCircle, XCircle } from "lucide-react";

export default function MathCalculator() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);

  // tạo câu hỏi mới
  const generateQuestion = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const ops = ["+", "-", "*"];
    const op = ops[Math.floor(Math.random() * ops.length)];

    let correct;
    if (op === "+") correct = a + b;
    else if (op === "-") correct = a - b;
    else correct = a * b;

    setQuestion(`${a} ${op} ${b}`);
    setCorrectAnswer(correct);
  };

  const startGame = () => {
    setGameStarted(true);
    setGameEnded(false);
    setScore(0);
    setTimeLeft(30);
    generateQuestion();
  };

  const endGame = () => {
    setGameEnded(true);
    setGameStarted(false);
  };

  const checkAnswer = () => {
    if (Number(answer) === correctAnswer) {
      setScore((prev) => prev + 1);
    }
    setAnswer("");
    generateQuestion();
  };

  // FIX TIMER CLEANUP
  useEffect(() => {
    let active = true;

    if (gameStarted && !gameEnded && timeLeft > 0) {
      const timer = setTimeout(() => {
        if (active) setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => {
        active = false;
        clearTimeout(timer);
      };
    }

    if (timeLeft === 0 && !gameEnded) endGame();

    return () => {
      active = false;
    };
  }, [gameStarted, gameEnded, timeLeft]);

  return (
    <div className="flex justify-center mt-10">
      <Card className="w-[500px] text-center">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-2xl font-bold flex justify-center gap-2">
            <Calculator /> Math Calculator
          </h2>

          {gameStarted && (
            <>
              <div className="flex justify-center gap-4 items-center">
                <Badge variant="outline" className="text-lg gap-2">
                  <Trophy size={18} /> {score}
                </Badge>
                <Badge variant="outline" className="text-lg gap-2">
                  <Clock size={18} /> {timeLeft}s
                </Badge>
              </div>

              <Progress value={(timeLeft / 30) * 100} className="h-2" />

              <p className="text-xl font-semibold">{question}</p>

              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                placeholder="Nhập kết quả..."
              />

              <Button className="w-full mt-2" onClick={checkAnswer}>
                Trả lời
              </Button>
            </>
          )}

          {!gameStarted && !gameEnded && (
            <Button className="w-full" onClick={startGame}>
              Bắt đầu
            </Button>
          )}

          {gameEnded && (
            <>
              <h3 className="text-xl font-bold flex justify-center gap-2">
                <CheckCircle color="green" /> Kết thúc!
              </h3>
              <p className="text-lg">Điểm của bạn: {score}</p>
              <Button className="w-full mt-2" onClick={startGame}>
                Chơi lại
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
