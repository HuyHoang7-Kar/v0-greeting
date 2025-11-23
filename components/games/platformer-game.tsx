"use client";

import { useEffect, useRef, useState } from "react";
import { initPlatformer } from "@/scripts/game-platformer";
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

  // ==========================================================
  // Lấy hoặc tạo game
  // ==========================================================
  const getOrCreateGameId = async () => {
    let { data: game } = await supabase
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
        description: "Trò chơi học toán kiểu Mario"
      })
      .select("id")
      .single();

    return newGame.id;
  };

  // ==========================================================
  // Hàm lưu điểm đầy đủ theo cấu trúc database mới
  // ==========================================================
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

      // 1️⃣ LƯU LỊCH SỬ CHƠI (game_plays)
      await supabase.from("game_plays").insert({
        user_id: user.id,
        game_id: gameId,
        score,
        duration: null,   // hoặc thời gian chơi thực nếu game trả về
        combo: 0,
        metadata: {}
      });

      // 2️⃣ LƯU HOẶC CẬP NHẬT game_scores
      const { data: oldScore } = await supabase
        .from("game_scores")
        .select("*")
        .eq("user_id", user.id)
        .eq("game_id", gameId)
        .maybeSingle();

      if (!oldScore) {
        // ➕ Tạo record lần đầu
        await supabase.from("game_scores").insert({
          user_id: user.id,
          game_id: gameId,
          best_score: score,
          last_score: score,
          plays_count: 1,
          last_played: new Date(),
          max_combo: 0,
          average_score: score
        });
      } else {
        // 🔄 Update bản ghi cũ
        const newCount = oldScore.plays_count + 1;
        const newAverage = (oldScore.average_score * oldScore.plays_count + score) / newCount;

        await supabase
          .from("game_scores")
          .update({
            best_score: Math.max(oldScore.best_score, score),
            last_score: score,
            plays_count: newCount,
            last_played: new Date(),
            average_score: newAverage,
            updated_at: new Date()
          })
          .eq("id", oldScore.id);
      }

      // 3️⃣ Cộng điểm leaderboard
      await supabase.rpc("add_points", {
        user_uuid: user.id,
        plus: score
      });

      setLastScore(score);
      onGameComplete?.(score);

    } catch (err) {
      console.error("Error saving score:", err);
    }
  };

  // ==========================================================
  // INIT GAME
  // ==========================================================
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
      onError: (err) => console.error(err)
    });

    destroyRef.current = destroy;
    setLoading(false);

    return () => {
      mountedRef.current = false;
      destroyRef.current?.();
    };
  }, [gameSlug]);

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="w-full max-w-3xl">
        <canvas id={canvasId.current} className="w-full border rounded-lg bg-black" />
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={() => destroyRef.current?.()}>
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
