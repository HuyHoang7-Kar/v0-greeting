"use client";

import { useEffect, useRef, useState } from "react";
import { destroyPlatformer, initPlatformer } from "@/scripts/game-platformer";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface Props {
  gameSlug?: string;
  onGameComplete?: (score: number) => void;
}

export function PlatformerGame({ gameSlug = "platformer-mario", onGameComplete }: Props) {
  const canvasId = useRef(`platformer-${Math.random().toString(36).slice(2, 9)}`);
  const [lastScore, setLastScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const destroyRef = useRef<() => void>(() => {});

  // 🧩 Lấy hoặc tạo game_id từ slug
  const getOrCreateGameId = async () => {
    const { data: game, error: fetchErr } = await supabase
      .from("game")
      .select("id")
      .eq("slug", gameSlug)
      .single();

    if (fetchErr && fetchErr.code !== "PGRST116") console.error(fetchErr);

    if (game) return game.id;

    // Nếu chưa có thì tạo mới
    const { data: newGame, error: insertErr } = await supabase
      .from("game")
      .insert({
        slug: gameSlug,
        title: "Mario Platformer",
        description: "Trò chơi học toán kiểu Mario",
      })
      .select("id")
      .single();

    if (insertErr) throw insertErr;
    return newGame.id;
  };

  // 🧠 Lưu điểm vào bảng `game_plays`
  const saveScore = async (score: number) => {
    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      if (!user) return alert("Bạn cần đăng nhập trước!");

      // Kiểm tra role trong bảng profiles
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileErr) throw profileErr;
      if (!profile || profile.role !== "student") {
        return alert("⚠️ Chỉ học sinh mới có thể lưu điểm!");
      }

      const gameId = await getOrCreateGameId();

      // ✅ Ghi vào bảng mới `game_plays`
      const { error: insertError } = await supabase.from("game_plays").insert({
        user_id: user.id,
        game_id: gameId,
        score,
      });

      if (insertError) throw insertError;

      alert(`🎯 Điểm ${score} đã được lưu!`);
      setLastScore(score);
      onGameComplete?.(score);
    } catch (err) {
      console.error("Error saving score:", err);
      alert("⚠️ Lỗi khi lưu điểm!");
    }
  };

  // 🎮 Khởi tạo game platformer
  useEffect(() => {
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
        setLastScore(score);
        await saveScore(score);
      },
      onError: (err) => console.error(err),
    });

    destroyRef.current = destroy;
    setLoading(false);

    return () => destroy();
  }, [gameSlug]);

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="w-full max-w-3xl">
        <canvas
          id={canvasId.current}
          className="w-full border rounded-lg bg-black"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={() => destroyPlatformer()}>⏸️ Tạm dừng</Button>

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
          Dùng ← → để di chuyển, Space/↑ để nhảy.  
          Chạm vào đáp án đúng để nhận điểm! 🚀
        </p>
      )}
    </div>
  );
}
