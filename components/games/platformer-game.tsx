"use client"

import { useEffect, useRef, useState } from "react"
import { initPlatformer, destroyPlatformer } from "@/scripts/game-platformer"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

interface Props {
  gameId?: string
  questions?: any[]
  onGameComplete?: (score: number, maxScore?: number, timeTaken?: number, pointsEarned?: number) => void
  onScore?: (score: number) => void // backward compatibility
}

export function PlatformerGame({ gameId, onGameComplete, onScore }: Props) {
  const canvasId = useRef(`platformer-canvas-${Math.random().toString(36).slice(2, 9)}`)
  const [running, setRunning] = useState(true)
  const [lastScore, setLastScore] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // init platformer when mounted (client)
    const { destroy } = initPlatformer(canvasId.current, {
      width: 820,
      height: 360,
      onScore: async (score: number) => {
        try {
          setLastScore(score)
          onScore?.(score)
          // guardar en db: insert game_results and update user_points via RPC
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
          // call RPC update_user_points if exists, fallback to upsert user_points
          const { error: rpcErr } = await supabase.rpc("update_user_points", {
            p_user_id: user.id,
            p_points_earned: score,
          }).catch(() => ({ error: true }))
          if (rpcErr) {
            // fallback: upsert user_points
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
        console.error("Platformer reported error:", err)
      },
    })

    return () => {
      destroy()
      destroyPlatformer()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="w-full max-w-3xl">
        <canvas id={canvasId.current} className="w-full border rounded-lg bg-black" />
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={() => { setRunning((v) => !v); /* pausing not implemented in engine; you can destroy/init */ }}>
          {running ? "Tạm dừng" : "Tiếp tục"}
        </Button>

        <Button variant="ghost" onClick={async () => {
          // manual save lastScore
          if (lastScore == null) return alert("Chưa có điểm để lưu")
          try {
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
            await supabase.rpc("update_user_points", { p_user_id: user.id, p_points_earned: lastScore }).catch(()=>{})
            alert("Đã lưu điểm: " + lastScore)
          } catch (err) {
            console.error(err)
            alert("Lỗi khi lưu điểm, xem console")
          }
        }}>
          Lưu điểm ({lastScore ?? 0})
        </Button>
      </div>

      <p className="text-sm text-gray-400">Dùng ← → để di chuyển, Space/ArrowUp để nhảy. Tiến đến cạnh phải để hoàn thành một lượt.</p>
    </div>
  )
}
