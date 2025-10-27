"use client";
import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client"

export default function PlatformerGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const userIdRef = useRef<string | null>(null);
  const gameIdRef = useRef<string | null>(null);

  useEffect(() => {
    async function init() {
      // Lấy user hiện tại
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alert("Vui lòng đăng nhập trước khi chơi!");
      userIdRef.current = user.id;

      // Lấy hoặc tạo game platformer trong DB
      const { data: game } = await supabase
        .from("games")
        .select("id")
        .eq("type", "platformer")
        .single();
      if (!game) return alert("Không tìm thấy game platformer!");
      gameIdRef.current = game.id;

      startGame();
    }

    function startGame() {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      canvas.width = 800;
      canvas.height = 400;

      let player = { x: 50, y: 300, vy: 0, onGround: true };
      let score = 0;
      let gravity = 0.8;
      let gameOver = false;

      function draw() {
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Ground
        ctx.fillStyle = "#444";
        ctx.fillRect(0, 340, canvas.width, 60);

        // Player
        ctx.fillStyle = "#4ade80";
        ctx.fillRect(player.x, player.y, 40, 40);

        // Score
        ctx.fillStyle = "#fff";
        ctx.font = "20px monospace";
        ctx.fillText(`Score: ${score}`, 10, 30);
      }

      function update() {
        if (gameOver) return;

        player.vy += gravity;
        player.y += player.vy;

        if (player.y >= 300) {
          player.y = 300;
          player.vy = 0;
          player.onGround = true;
        }

        // Cộng điểm ngẫu nhiên giả lập nhiệm vụ
        if (Math.random() < 0.02) score += 5;
      }

      async function endGame() {
        if (gameOver) return;
        gameOver = true;

        const user_id = userIdRef.current!;
        const game_id = gameIdRef.current!;

        await supabase.from("game_results").insert({
          user_id,
          game_id,
          score,
          max_score: 200,
          time_taken: 120,
          points_earned: score,
        });

        await supabase.rpc("update_user_points", {
          p_user_id: user_id,
          p_points_earned: score,
        });

        alert(`🎮 Kết thúc game! Bạn ghi được ${score} điểm.`);
      }

      function loop() {
        update();
        draw();
        requestAnimationFrame(loop);
      }

      window.addEventListener("keydown", (e) => {
        if (e.code === "Space" && player.onGround) {
          player.vy = -12;
          player.onGround = false;
        }
        if (e.code === "Escape") endGame();
      });

      loop();
    }

    init();
  }, []);

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <canvas ref={canvasRef} className="border-2 border-gray-600 rounded-xl" />
    </div>
  );
}
