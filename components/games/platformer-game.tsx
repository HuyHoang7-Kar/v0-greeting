"use client"

import { useEffect, useRef, useState } from "react"
import { destroyPlatformer, initPlatformer } from "@/scripts/game-platformer"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

interface Props {
  gameId?: string
  onGameComplete?: (score: number, maxScore?: number, timeTaken?: number, pointsEarned?: number) => void
}

export function PlatformerGame({ gameId, onGameComplete }: Props) {
  const canvasId = useRef(`platformer-canvas-${Math.random().toString(36).slice(2, 9)}`)
  const [running, setRunning] = useState(true)
  const [lastScore, setLastScore] = useState<number | null>(null)
  const supabase = createClient()
  const destroyRef = useRef<() => void>(() => {})

  useEffect(() => {
    const { destroy } = initPlatformer(canvasId.current, {
      width: 820,
      height: 360,
      onScore: async (score: number) => {
        setLastScore(score)
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return

          await supabase.from("game_results").insert({
            user_id: user.id,
            game_id: gameId || "platformer-math",
            score,
            max_score: score,
            time_taken: 0,
            points_earned: score,
          })

          const { error: rpcErr } = await supabase.rpc("update_user_points", {
            p_user_id: user.id,
            p_points_earned: score,
          }).catch(() => ({ error: true }))

          if (rpcErr) {
            await supabase.from("user_points").upsert({
              user_id: user.id,
              points: score,
            }, { onConflict: "user_id" })
          }

          onGameComplete?.(score, score, 0, score)
        } catch (err) {
          console.error("Error saving score:", err)
        }
      },
      onError: (err) => {
        console.error("Platformer error:", err)
      },
    })

    destroyRef.current = destroy

    return () => {
      destroy()
      destroyPlatformer()
    }
  }, [gameId, onGameComplete, supabase])

  // Tạm dừng/tiếp tục bằng cách remove/add animation frame
  useEffect(() => {
    if (running) {
      // Chạy lại game
      initPlatformer(canvasId.current)
    } else {
      destroyPlatformer()
    }
  }, [running])

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="w-full max-w-3xl">
        <canvas id={canvasId.current} className="w-full border rounded-lg bg-black" />
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={() => setRunning(v => !v)}>
          {running ? "⏸️ Tạm dừng" : "▶️ Tiếp tục"}
        </Button>

        <Button variant="ghost" onClick={async () => {
          if (lastScore == null) return alert("Chưa có điểm để lưu")
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return alert("Chưa đăng nhập")

          await supabase.from("game_results").insert({
            user_id: user.id,
            game_id: gameId || "platformer-math",
            score: lastScore,
            max_score: lastScore,
            time_taken: 0,
            points_earned: lastScore,
          })
          alert("🎯 Đã lưu điểm: " + lastScore)
        }}>
          💾 Lưu điểm ({lastScore ?? 0})
        </Button>
      </div>

      <p className="text-sm text-gray-400 text-center">
        Dùng ← → để di chuyển, Space/↑ để nhảy. Chạm vào đáp án đúng để nhận điểm! 🚀
      </p>
    </div>
  )
}
