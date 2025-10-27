"use client"

import { useEffect, useRef, useState } from "react"
import { destroyPlatformer, initPlatformer } from "@/scripts/game-platformer"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

interface Props {
  slug?: string // định danh trò chơi
  onGameComplete?: (score: number) => void
}

export function PlatformerGame({ slug = "platformer-math", onGameComplete }: Props) {
  const supabase = createClient()
  const canvasId = useRef(`canvas-${Math.random().toString(36).slice(2, 9)}`)
  const [gameId, setGameId] = useState<string | null>(null)
  const [lastScore, setLastScore] = useState(0)

  // 🔹 Lấy hoặc tạo game_id trong bảng game
  useEffect(() => {
    const fetchGameId = async () => {
      const { data: existing } = await supabase
        .from("game")
        .select("id")
        .eq("slug", slug)
        .maybeSingle()

      if (existing) {
        setGameId(existing.id)
      } else {
        const { data: newGame, error } = await supabase
          .from("game")
          .insert({
            slug,
            title: "Mario Platformer",
            description: "Trò chơi Mario nhảy giải toán"
          })
          .select("id")
          .single()

        if (error) console.error("Lỗi tạo game:", error)
        else setGameId(newGame.id)
      }
    }

    fetchGameId()
  }, [slug, supabase])

  // 🔹 Khởi tạo game khi đã có game_id
  useEffect(() => {
    if (!gameId) return

    const marioImg = new Image()
    marioImg.src = "/sprites/mario.png"
    const blockImg = new Image()
    blockImg.src = "/sprites/block.png"

    const { destroy } = initPlatformer(canvasId.current, {
      width: 820,
      height: 360,
      sprite: marioImg,
      block: blockImg,
      onScore: async (score: number) => {
        setLastScore(score)
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return

          // Kiểm tra user có role student
          const { data: profile } = await supabase
            .from("profile")
            .select("role")
            .eq("user_id", user.id)
            .single()

          if (!profile || profile.role !== "student") return

          // Lưu điểm
          await supabase.from("game_results").upsert({
            user_id: user.id,
            game_id: gameId,
            score,
            max_score: score,
            time_taken: 0,
            points_earned: score
          }, { onConflict: ["user_id", "game_id"] })

          onGameComplete?.(score)
        } catch (err) {
          console.error("Lỗi lưu điểm:", err)
        }
      },
      onError: (err) => console.error(err),
    })

    return () => destroy()
  }, [gameId, supabase, onGameComplete])

  // 🔹 Giao diện
  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="w-full max-w-3xl">
        <canvas id={canvasId.current} className="w-full border rounded-lg bg-black" />
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={() => destroyPlatformer()}>
          ⏸️ Tạm dừng
        </Button>

        <Button variant="ghost" onClick={async () => {
          if (!gameId) return alert("Chưa có game ID.")
          if (lastScore === 0) return alert("Chưa có điểm để lưu")

          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return alert("Chưa đăng nhập")

          const { data: profile } = await supabase
            .from("profile")
            .select("role")
            .eq("user_id", user.id)
            .single()

          if (!profile || profile.role !== "student")
            return alert("Chỉ học sinh mới được lưu điểm.")

          await supabase.from("game_results").upsert({
            user_id: user.id,
            game_id: gameId,
            score: lastScore,
            max_score: lastScore,
            time_taken: 0,
            points_earned: lastScore,
          }, { onConflict: ["user_id", "game_id"] })

          alert(`🎯 Đã lưu điểm: ${lastScore}`)
        }}>
          💾 Lưu điểm ({lastScore})
        </Button>
      </div>

      <p className="text-sm text-gray-400 text-center">
        Dùng ← → để di chuyển, Space/↑ để nhảy. Chạm vào đáp án đúng để nhận điểm! 🚀
      </p>
    </div>
  )
}
