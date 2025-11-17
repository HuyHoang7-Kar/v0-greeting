"use client";

import { useEffect, useRef, useState } from "react";
import { initPlatformer } from "@/scripts/game-platformer"; // ❗ bỏ destroyPlatformer
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface Props {
  gameSlug?: string;
  onGameComplete?: (score: number) => void;
}

export function PlatformerGame({ gameSlug = "platformer-mario", onGameComplete }: Props) {
  const canvasId = useRef(`platformer-${Math.random().toString(36).slice(2, 9)}`);
  const destroyRef = useRef<() => void>(() => {});
  const mountedRef = useRef(true);

  const [lastScore, setLastScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const getOrCreateGameId = async () => {
    const { data: game } = await supabase
      .from("game")
      .select("id")
      .eq("slug", gameSlug)
      .single();

    if (game) return game.id;

    const { data: newGame } = await supabase
      .from("game")
      .insert({
        slug: gameSlug,
        title: "Mario Platformer",
        description: "Trò chơi học toán kiểu Mario",
      })
      .select("id")
      .single();

    return newGame.id;
  };

  const saveScore = async (score: number) => {
    try {
      if (!mountedRef.current) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alert("Bạn cần đăng nhập để lưu điểm!");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "student")
        return alert("⚠️ Chỉ học sinh mới có thể lưu điểm!");

      const gameId = await getOrCreateGameId();

      await supabase.from("game_plays").insert({
        user_id: user.id,
        game_id: gameId,
        score
      });

      const { data: oldScore } = await supabase
        .from("game_scores")
        .select("*")
        .eq("user_id", user.id)
        .eq("game_id", gameId)
        .single();

      if (!oldScore) {
        await supabase.from("game_scores").insert({
          user_id: user.id,
          game_id: gameId,
          best_score: score,
          plays_count: 1,
        });
      } else {
        await supabase
          .from("game_scores")
          .update({
            best_score: Math.max(oldScore.best_score, score),
            plays_count: oldScore.plays_count + 1,
            updated_at: new Date(),
          })
          .eq("id", oldScore.id);
      }

      await supabase.rpc("add_points", { user_uuid: user.id, plus: score });

      setLastScore(score);
      onGameComplete?.(score);
    } catch (err) {
      console.error("Error saving score:", err);
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    const marioImg = new Image();
    marioImg.src = "/sprites/mario.png";
    const blockImg = new Image();
    blockImg.src = "/sprites/block.png";

    const { destroy } = initPlatformer(canvasId.current, {
      width: 820,
      height: 360,
      sprite: marioImg,
      block: blockImg,
      onScore: async (score: number) => {
        if (!mountedRef.current) return;
        setLastScore(score);
        await saveScore(score);
      },
      onError: (err) => console.error(err),
    });

    destroyRef.current = destroy;
    setLoading(false);

    return () => {
      mountedRef.current = false;
      if (destroyRef.current) destroyRef.current(); // 🧹 cleanup duy nhất
    };
  }, [gameSlug]);

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="w-full max-w-3xl">
        <canvas id={canvasId.current} className="w-full border rounded-lg bg-black" />
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={() => {
            if (destroyRef.current) destroyRef.current();
          }}
        >
          ⏸️ Tạm dừng
        </Button>

        <Button
          variant="ghost"
          onClick={() => {
            if (lastScore === 0) return alert("Chưa có điểm để lưu");
            saveScore(lastScore);
          }}
        >
          💾 Lưu điểm ({lastScore})
        </Button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Đang tải trò chơi...</p>
      ) : (
        <p className="text-sm text-gray-400 text-center">
          Dùng ← → để di chuyển, Space/↑ để nhảy. Chạm vào đáp án đúng để nhận điểm! 🚀
        </p>
      )}
    </div>
  );
}
