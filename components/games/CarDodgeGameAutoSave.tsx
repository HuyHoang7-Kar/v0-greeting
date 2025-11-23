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

  // Lấy hoặc tạo game
  const getOrCreateGameId = async (): Promise<string | null> => {
    const { data: game, error } = await supabase
      .from("game")
      .select("id")
      .eq("slug", gameSlug)
      .maybeSingle();
    if (error) return null;
    if (game) return game.id;
    const { data: newGame, error: insertErr } = await supabase
      .from("game")
      .insert({ slug: gameSlug, title: "Car Dodge Game", description: "Xe vượt chướng ngại vật" })
      .select("id")
      .single();
    if (insertErr) return null;
    return newGame.id;
  };

  // Lưu điểm
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
          last_played: new Date(),
          average_score: finalScore
        });
      } else {
        const newCount = oldScore.plays_count + 1;
        const newAverage = (oldScore.average_score * oldScore.plays_count + finalScore) / newCount;
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const WIDTH = 400;
    const HEIGHT = 600;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    const carWidth = 50;
    const carHeight = 100;
    let carX = WIDTH / 2 - carWidth / 2;
    const carY = HEIGHT - carHeight - 20;
    const carSpeed = 20;

    let obstacles: Obstacle[] = [];
    const obstacleSpeed = 4;
    let gameOver = false;
    let started = false;
    let currentScore = 0;
    let laneOffset = 0; // Vẽ vạch đường

    const moveLeft = () => {
      carX = Math.max(0, carX - carSpeed);
      if (!started) started = true;
    };
    const moveRight = () => {
      carX = Math.min(WIDTH - carWidth, carX + carSpeed);
      if (!started) started = true;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft") moveLeft();
      if (e.code === "ArrowRight") moveRight();
      if (e.code === "Space") started = true;
    };
    window.addEventListener("keydown", handleKeyDown);

    const spawnObstacle = () => {
      const width = 30 + Math.random() * 50;
      const x = Math.random() * (WIDTH - width);
      const color = ["red","blue","orange","purple"][Math.floor(Math.random()*4)];
      obstacles.push({ x, y: -50, width, height: 50, color });
    };

    const drawRoad = () => {
      ctx.fillStyle = "#444";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 4;

      laneOffset += 4;
      if (laneOffset > 40) laneOffset = 0;

      for (let y = -40 + laneOffset; y < HEIGHT; y += 40) {
        ctx.beginPath();
        ctx.moveTo(WIDTH/2, y);
        ctx.lineTo(WIDTH/2, y+20);
        ctx.stroke();
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      drawRoad();

      // Xe
      ctx.fillStyle = "red";
      ctx.fillRect(carX, carY, carWidth, carHeight);

      // Obstacles
      obstacles.forEach(obs => {
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      });

      // Score
      ctx.fillStyle = "white";
      ctx.font = "24px sans-serif";
      ctx.fillText("Score: " + currentScore, 10, 30);

      if (!started) {
        ctx.fillStyle = "yellow";
        ctx.font = "20px sans-serif";
        ctx.fillText("Press Arrow or SPACE to start", WIDTH/2 - 130, HEIGHT/2);
      }
    };

    const update = () => {
      if (!started || gameOver) return;

      obstacles.forEach(obs => obs.y += obstacleSpeed);
      if (obstacles.length === 0 || obstacles[obstacles.length-1].y > 150) spawnObstacle();
      if (obstacles.length && obstacles[0].y > HEIGHT) obstacles.shift();

      // Va chạm
      for (const obs of obstacles) {
        if (
          carX < obs.x + obs.width &&
          carX + carWidth > obs.x &&
          carY < obs.y + obs.height &&
          carY + carHeight > obs.y
        ) gameOver = true;
      }

      obstacles.forEach(obs => {
        if (!obs.passed && obs.y + obs.height > carY) {
          obs.passed = true;
          currentScore += 10;
          setScore(currentScore);
        }
      });
    };

    const loop = () => {
      update();
      draw();
      if (!gameOver) animationRef.current = requestAnimationFrame(loop);
      else if (started) saveScore(currentScore);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ border: "2px solid black", display: "block", margin: "0 auto" }} />;
}
