"use client";

import { useEffect, useRef, useState } from "react";
import { destroyPlatformer, initPlatformer } from "@/scripts/game-platformer";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface Props {
  gameId?: string;
  onGameComplete?: (score: number) => void;
}

export function PlatformerGame({ gameId = "platformer-mario", onGameComplete }: Props) {
  const canvasId = useRef(`platformer-canvas-${Math.random().toString(36).slice(2, 9)}`);
  const [lastScore, setLastScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const destroyRef = useRef<() => void>(() => {});

  useEffect(() => {
    const marioImg = new Image();
    marioImg.src = "/sprites/mario.png"; // ✅ Đường dẫn public (NextJS cho phép)

    const blockImg = new Image();
    blockImg.src = "/sprites/block.png"; // ✅ Đường dẫn public

    const { destroy } = initPlatformer(canvasId.current, {
      width: 820,
      height: 360,
      sprite: marioImg,
      block: blockImg,
      onScore: async (score: number) => {
        setLastScore(score);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          // 🧠 Lưu điểm trực tiếp vào bảng game
          await supabase.from("game").upsert(
            {
              slug: gameId,
              title: "Mario Platformer",
              description: "Trò chơi học toán kiểu Mario",
              user_id: user.id,
              score,
              points_earned: score,
            },
            { onConflict: ["slug", "user_id"] }
          );

          onGameComplete?.(score);
        } catch (err) {
          console.error("Error saving score:", err);
        }
      },
      onError: (err) => console.error(err),
    });

    destroyRef.current = destroy;
    setLoading(false);

    return () => destroy();
  }, [gameId, onGameComplete, supabase]);

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="w-full max-w-3xl">
        <canvas
          id={canvasId.current}
          className="w-full border rounded-lg bg-black"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={() => destroyPlatformer()}>
          ⏸️ Tạm dừng
        </Button>

        <Button
          variant="ghost"
          onClick={async () => {
            if (lastScore === 0) return alert("Chưa có điểm để lưu");
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return alert("Chưa đăng nhập");

            await supabase.from("game").upsert(
              {
                slug: gameId,
                title: "Mario Platformer",
                description: "Trò chơi học toán kiểu Mario",
                user_id: user.id,
                score: lastScore,
                points_earned: lastScore,
              },
              { onConflict: ["slug", "user_id"] }
            );

            alert(`🎯 Đã lưu điểm: ${lastScore}`);
          }}
        >
          💾 Lưu điểm ({lastScore})
        </Button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Đang tải trò chơi...</p>
      ) : (
        <p className="text-sm text-gray-400 text-center">
          Dùng ← → để di chuyển, Space/↑ để nhảy.  
          Chạm vào đáp án đúng để nhận điểm! 🚀
        </p>
      )}
    </div>
  );
}
