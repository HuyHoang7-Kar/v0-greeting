// /scripts/game-platformer.ts
// Lightweight platformer engine suitable for embedding in React components.
// Exports initPlatformer(canvasId, opts) so React can call it inside useEffect.

type InitOpts = {
  width?: number
  height?: number
  onScore?: (score: number) => void
  onError?: (err: Error) => void
}

let _animationId: number | null = null
let _canvas: HTMLCanvasElement | null = null
let _ctx: CanvasRenderingContext2D | null = null

export function destroyPlatformer() {
  if (typeof window === "undefined") return
  if (_animationId) {
    cancelAnimationFrame(_animationId)
    _animationId = null
  }
  window.removeEventListener("keydown", _handleKeyDown)
  window.removeEventListener("keyup", _handleKeyUp)
  _canvas = null
  _ctx = null
}

let _keys: Record<string, boolean> = {}
function _handleKeyDown(e: KeyboardEvent) {
  _keys[e.key] = true
}
function _handleKeyUp(e: KeyboardEvent) {
  _keys[e.key] = false
}

export function initPlatformer(canvasId: string, opts: InitOpts = {}) {
  try {
    if (typeof window === "undefined") {
      throw new Error("Platformer must be initialized on the client")
    }

    destroyPlatformer() // ensure clean start

    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null
    if (!canvas) throw new Error(`Canvas element not found: ${canvasId}`)
    _canvas = canvas
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Cannot get 2D context")
    _ctx = ctx

    canvas.width = opts.width || 800
    canvas.height = opts.height || 380

    // Simple player + world state
    const player = { x: 60, y: 240, w: 32, h: 32, vy: 0, jumping: false }
    const groundY = 280
    const gravity = 0.9
    let score = 0
    let tick = 0

    _keys = {}
    window.addEventListener("keydown", _handleKeyDown)
    window.addEventListener("keyup", _handleKeyUp)

    function draw() {
      if (!_ctx || !_canvas) return
      const ctx = _ctx
      ctx.clearRect(0, 0, _canvas.width, _canvas.height)

      // background (retro pixel-ish)
      ctx.fillStyle = "#0f172a"
      ctx.fillRect(0, 0, _canvas.width, _canvas.height)

      // ground
      ctx.fillStyle = "#334155"
      ctx.fillRect(0, groundY, _canvas.width, _canvas.height - groundY)

      // player (pixel block)
      ctx.fillStyle = "#f59e0b"
      ctx.fillRect(player.x, player.y, player.w, player.h)

      // HUD
      ctx.fillStyle = "#e2e8f0"
      ctx.font = "18px monospace"
      ctx.fillText(`Score: ${score}`, 12, 26)
    }

    function update() {
      // input
      if (_keys["ArrowLeft"] || _keys["a"]) player.x -= 4
      if (_keys["ArrowRight"] || _keys["d"]) player.x += 4
      if ((_keys[" "] || _keys["ArrowUp"] || _keys["w"]) && !player.jumping) {
        player.vy = -14
        player.jumping = true
      }

      // physics
      player.vy += gravity
      player.y += player.vy
      if (player.y + player.h >= groundY) {
        player.y = groundY - player.h
        player.vy = 0
        player.jumping = false
      }

      // keep player inside canvas
      if (_canvas) {
        if (player.x < 0) player.x = 0
        if (player.x + player.w > _canvas.width) player.x = _canvas.width - player.w
      }

      // scoring mechanic: every N ticks add points
      tick++
      if (tick % 60 === 0) {
        score += 1
      }

      // small hazard simulation: if player x near right edge -> "finish" and award big points
      if (_canvas && player.x + player.w > _canvas.width - 60) {
        // finish run
        const finalScore = score + 10
        opts.onScore?.(finalScore)
        // then reset score locally but keep playing
        score = 0
        player.x = 60
        player.y = groundY - player.h
      }
    }

    function loop() {
      try {
        update()
        draw()
        _animationId = requestAnimationFrame(loop)
      } catch (err: any) {
        console.error("Platformer loop error:", err)
        opts.onError?.(err)
        destroyPlatformer()
      }
    }

    loop()
    return { destroy: destroyPlatformer }
  } catch (err: any) {
    console.error("initPlatformer error:", err)
    opts.onError?.(err)
    return { destroy: destroyPlatformer }
  }
}
