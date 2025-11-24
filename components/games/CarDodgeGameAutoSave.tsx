"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  gameSlug?: string;
  onGameComplete?: (score: number) => void;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  passed?: boolean;
}

export function CarDodgeGameAutoSave({ gameSlug = "car-dodge", onGameComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const supabase = createClient();
  const [score, setScore] = useState(0);

  // -------------------------
  // TOÁN HỌC
  // -------------------------
  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
  const [showQuestion, setShowQuestion] = useState(false);

  const generateMathQuestion = () => {
    const type = Math.floor(Math.random() * 5); // 5 dạng toán

    let a = Math.floor(1 + Math.random() * 9);
    let b = Math.floor(1 + Math.random() * 9);
    let q = "";
    let r = 0;

    switch (type) {
      case 0:
        q = `${a} + ${b} = ?`;
        r = a + b;
        break;

      case 1:
        q = `${a} - ${b} = ?`;
        r = a - b;
        break;

      case 2:
        q = `${a} × ${b} = ?`;
        r = a * b;
        break;

      case 3:
        // chia có nghiệm nguyên
        r = a;
        b = Math.floor(1 + Math.random() * 9);
        a = a * b;
        q = `${a} ÷ ${b} = ?`;
        break;

      case 4:
        q = `${a}² = ?`;
        r = a * a;
        break;
    }

    setQuestion(q);
    setCorrectAnswer(r);
    setAnswer("");
    setShowQuestion(true);
  };

  const handleAnswer = () => {
    if (Number(answer) === correctAnswer) {
      obstacleSpeedRef.current *= 1.3; // thưởng: tăng tốc
      setScore((s) => s + 30);
    } else {
      obstacleSpeedRef.current *= 0.6; // phạt: chậm
      setTimeout(() => {
        obstacleSpeedRef.current *= 1.4; // 5s sau trở lại tốc độ cũ
      }, 5000);
    }
    setShowQuestion(false);
  };

  // -------------------------
  // SUPABASE SAVE
  // -------------------------

  const getOrCreateGameId = async (): Promise<string | null> => {
    const { data: game } = await supabase
      .from("game")
      .select("id")
      .eq("slug", gameSlug)
      .maybeSingle();

    if (game) return game.id;

    const { data: newGame } = await supabase
      .from("game")
      .insert({
        slug: gameSlug,
        title: "Car Dodge Math Game",
        description: "Xe né vật cản + bài toán"
      })
      .select("id")
      .single();

    return newGame?.id ?? null;
  };

  const saveScore = async (finalScore: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const gameId = await getOrCreateGameId();
      if (!gameId) return;

      await supabase.from("game_plays").insert({
        user_id: user.id,
        game_id: gameId,
        score: finalScore,
        played_at: new Date()
      });

      const { data: oldScore } = await supabase
        .from("game_scores")
        .select("*")
        .eq("user_id", user.id)
        .eq("game_id", gameId)
        .maybeSingle();

      if (!oldScore) {
        await supabase.from("game_scores").insert({
          user_id: user.id,
          game_id: gameId,
          best_score: finalScore,
          last_score: finalScore,
          plays_count: 1,
          average_score: finalScore,
          last_played: new Date()
        });
      } else {
        const newCount = oldScore.plays_count + 1;
        const newAverage =
          (oldScore.average_score * oldScore.plays_count + finalScore) /
          newCount;

        await supabase
          .from("game_scores")
          .update({
            best_score: Math.max(oldScore.best_score, finalScore),
            last_score: finalScore,
            plays_count: newCount,
            average_score: newAverage,
            last_played: new Date(),
            updated_at: new Date()
          })
          .eq("id", oldScore.id);
      }

      onGameComplete?.(finalScore);
    } catch (err) {
      console.error("Lỗi lưu điểm:", err);
    }
  };

  // -------------------------
  // GAME LOGIC
  // -------------------------

  const obstacleSpeedRef = useRef(4);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const WIDTH = 400;
    const HEIGHT = 600;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    const carWidth = 55;
    const carHeight = 110;
    let carX = WIDTH / 2 - carWidth / 2;
    const carY = HEIGHT - carHeight - 20;
    const carSpeed = 20;

    let obstacles: Obstacle[] = [];
    let gameOver = false;
    let started = false;
    let currentScore = 0;
    let laneOffset = 0;

    let nextQuestionTime = performance.now() + 5000 + Math.random() * 4000;

    const moveLeft = () => {
      carX = Math.max(20, carX - carSpeed);
      started = true;
    };
    const moveRight = () => {
      carX = Math.min(WIDTH - carWidth - 20, carX + carSpeed);
      started = true;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showQuestion) return;

      if (e.code === "ArrowLeft") moveLeft();
      if (e.code === "ArrowRight") moveRight();
      if (e.code === "Space") started = true;
    };
    window.addEventListener("keydown", handleKeyDown);

    const spawnObstacle = () => {
      const width = 35 + Math.random() * 40;
      const x = Math.random() * (WIDTH - width - 40) + 20;
      const color = ["#ff4b4b", "#3399ff", "#ffaa00", "#8e44ad"][Math.floor(Math.random() * 4)];
      obstacles.push({ x, y: -60, width, height: 70, color });
    };

    // -------------------------
    // VẼ ĐỒ HỌA
    // -------------------------

    const drawRoad = () => {
      const grd = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      grd.addColorStop(0, "#2e2e2e");
      grd.addColorStop(1, "#1b1b1b");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.strokeStyle = "white";
      ctx.lineWidth = 4;

      laneOffset += 4;
      if (laneOffset > 40) laneOffset = 0;

      for (let y = -40 + laneOffset; y < HEIGHT; y += 40) {
        ctx.beginPath();
        ctx.moveTo(WIDTH / 2, y);
        ctx.lineTo(WIDTH / 2, y + 20);
        ctx.stroke();
      }
    };

    const drawCar = () => {
      const grd = ctx.createLinearGradient(carX, carY, carX, carY + carHeight);
      grd.addColorStop(0, "#ff5555");
      grd.addColorStop(1, "#aa0000");
      ctx.fillStyle = grd;

      ctx.shadowColor = "black";
      ctx.shadowBlur = 20;
      ctx.fillRect(carX, carY, carWidth, carHeight);
      ctx.shadowBlur = 0;
    };

    const drawObstacles = () => {
      obstacles.forEach((obs) => {
        ctx.fillStyle = obs.color;
        ctx.shadowColor = "black";
        ctx.shadowBlur = 20;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.shadowBlur = 0;

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
      });
    };

    const drawUI = () => {
      ctx.fillStyle = "white";
      ctx.font = "24px Monospace";
      ctx.fillText(`Score: ${currentScore}`, 10, 30);

      if (!started) {
        ctx.fillStyle = "yellow";
        ctx.font = "20px sans-serif";
        ctx.fillText("Press ← → or SPACE to start", WIDTH / 2 - 130, HEIGHT / 2);
      }
    };

    const drawMathQuestion = () => {
      if (!showQuestion) return;

      ctx.fillStyle = "rgba(0,0,0,0.75)";
      ctx.fillRect(0, HEIGHT / 2 - 90, WIDTH, 180);

      ctx.fillStyle = "white";
      ctx.font = "30px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(question!, WIDTH / 2, HEIGHT / 2 - 10);

      ctx.font = "22px sans-serif";
      ctx.fillText("Trả lời: " + answer, WIDTH / 2, HEIGHT / 2 + 40);

      ctx.textAlign = "left";
    };

    // -------------------------
    // UPDATE GAME
    // -------------------------

    const update = () => {
      if (!started || gameOver || showQuestion) return;

      const now = performance.now();

      // Xuất câu hỏi toán
      if (now >= nextQuestionTime) {
        obstacleSpeedRef.current *= 0.4;
        generateMathQuestion();
        nextQuestionTime = now + 6000 + Math.random() * 4000;
      }

      // Di chuyển obstacle
      obstacles.forEach((obs) => (obs.y += obstacleSpeedRef.current));
      if (obstacles.length === 0 || obstacles[obstacles.length - 1].y > 180) spawnObstacle();
      if (obstacles[0]?.y > HEIGHT) obstacles.shift();

      // Va chạm
      for (const obs of obstacles) {
        if (
          carX < obs.x + obs.width &&
          carX + carWidth > obs.x &&
          carY < obs.y + obs.height &&
          carY + carHeight > obs.y
        ) gameOver = true;
      }

      // tính điểm
      obstacles.forEach((obs) => {
        if (!obs.passed && obs.y + obs.height > carY) {
          obs.passed = true;
          currentScore += 10;
          setScore(currentScore);
        }
      });
    };

    const loop = () => {
      update();
      drawRoad();
      drawCar();
      drawObstacles();
      drawUI();
      drawMathQuestion();

      if (!gameOver) animationRef.current = requestAnimationFrame(loop);
      else saveScore(currentScore);
    };

    loop();

    // Nhập số cho câu hỏi toán
    const handleInput = (e: KeyboardEvent) => {
      if (!showQuestion) return;

      if (e.key === "Enter") {
        handleAnswer();
        return;
      }

      if (/[0-9-]/.test(e.key)) setAnswer((a) => a + e.key);
      if (e.key === "Backspace") setAnswer((a) => a.slice(0, -1));
    };

    window.addEventListener("keydown", handleInput);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keydown", handleInput);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        border: "2px solid black",
        display: "block",
        margin: "0 auto",
        borderRadius: "10px"
      }}
    />
  );
}
