// /scripts/game-platformer.ts

type Question = {
  question: string
  correct_answer: string
  options: string[]
}

type InitOpts = {
  width?: number
  height?: number
  level?: "easy" | "medium" | "hard"
  questions?: Question[]
  onScore?: (score: number) => void
  onError?: (err: Error) => void
}

let _animationId: number | null = null
let _canvas: HTMLCanvasElement | null = null
let _ctx: CanvasRenderingContext2D | null = null
let _keys: Record<string, boolean> = {}

function _handleKeyDown(e: KeyboardEvent) {
  _keys[e.key] = true
}

function _handleKeyUp(e: KeyboardEvent) {
  _keys[e.key] = false
}

export function destroyPlatformer() {
  if (typeof window === "undefined") return
  if (_animationId) cancelAnimationFrame(_animationId)
  window.removeEventListener("keydown", _handleKeyDown)
  window.removeEventListener("keyup", _handleKeyUp)
  window.removeEventListener("keydown", _handleQuestionInput)
  _animationId = null
  _canvas = null
  _ctx = null
  _keys = {}
}

let _handleQuestionInput = (e: KeyboardEvent) => {}

export function initPlatformer(canvasId: string, opts: InitOpts = {}) {
  try {
    destroyPlatformer()
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null
    if (!canvas) throw new Error(`Canvas not found: ${canvasId}`)

    _canvas = canvas
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("No 2D context")
    _ctx = ctx

    canvas.width = opts.width || 820
    canvas.height = opts.height || 360

    // ======= Setup base =======
    const groundY = 280
    const player = { x: 60, y: groundY - 32, w: 32, h: 32, vy: 0, jumping: false }
    const gravity = 0.9
    let score = 0
    let currentQuestion = 0
    let showQuestion = false
    let selectedAnswer: string | null = null

    // ======= Questions =======
    const baseQuestions: Record<string, Question[]> = {
      easy: [
        { question: "3 + 2 = ?", correct_answer: "5", options: ["4", "5", "6", "7"] },
        { question: "7 - 5 = ?", correct_answer: "2", options: ["1", "2", "3", "4"] },
      ],
      medium: [
        { question: "6 × 2 = ?", correct_answer: "12", options: ["10", "11", "12", "13"] },
        { question: "9 ÷ 3 = ?", correct_answer: "3", options: ["2", "3", "4", "5"] },
      ],
      hard: [
        { question: "15 ÷ (3 + 2) = ?", correct_answer: "3", options: ["2", "3", "4", "5"] },
        { question: "√81 = ?", correct_answer: "9", options: ["7", "8", "9", "10"] },
      ],
    }

    const questions = opts.questions || baseQuestions[opts.level || "easy"]

    // ======= Events =======
    window.addEventListener("keydown", _handleKeyDown)
    window.addEventListener("keyup", _handleKeyUp)

    _handleQuestionInput = (e: KeyboardEvent) => {
      if (!showQuestion) return
      const q = questions[currentQuestion]
      const index = parseInt(e.key) - 1
      if (isNaN(index) || index < 0 || index >= q.options.length) return
      selectedAnswer = q.options[index]

      if (selectedAnswer === q.correct_answer) {
        score += 10
      }
      currentQuestion++
      selectedAnswer = null
      showQuestion = false
    }
    window.addEventListener("keydown", _handleQuestionInput)

    // ======= HUD =======
    function drawHUD() {
      if (!_ctx) return
      _ctx.fillStyle = "#e2e8f0"
      _ctx.font = "18px monospace"
      _ctx.fillText(`Score: ${score}`, 12, 24)
      _ctx.fillText(`Q: ${currentQuestion + 1}/${questions.length}`, 12, 48)
    }

    // ======= Draw question =======
    function drawQuestion(q: Question) {
      if (!_ctx) return
      const ctx = _ctx
      ctx.fillStyle = "rgba(0,0,0,0.8)"
      ctx.fillRect(80, 60, 660, 220)
      ctx.fillStyle = "#fff"
      ctx.font = "20px sans-serif"
      ctx.fillText(q.question, 100, 100)
      q.options.forEach((opt, i) => {
        ctx.fillStyle = selectedAnswer === opt ? "#facc15" : "#fff"
        ctx.fillText(`${i + 1}. ${opt}`, 120, 140 + i * 30)
      })
      ctx.font = "14px monospace"
      ctx.fillText("→ Nhấn phím số 1-4 để chọn đáp án", 120, 250)
    }

    // ======= Update =======
    function update() {
      if (showQuestion) return
      if (_keys["ArrowLeft"] || _keys["a"]) player.x -= 4
      if (_keys["ArrowRight"] || _keys["d"]) player.x += 4
      if ((_keys[" "] || _keys["ArrowUp"] || _keys["w"]) && !player.jumping) {
        player.vy = -14
        player.jumping = true
      }

      player.vy += gravity
      player.y += player.vy
      if (player.y + player.h >= groundY) {
        player.y = groundY - player.h
        player.vy = 0
        player.jumping = false
      }

      // Giới hạn biên
      if (player.x < 0) player.x = 0
      if (player.x + player.w > canvas.width) player.x = canvas.width - player.w

      // Khi đến gần phải → hiển thị câu hỏi
      if (player.x + player.w > canvas.width - 80) {
        if (currentQuestion < questions.length) {
          showQuestion = true
          player.x = 60
        } else {
          opts.onScore?.(score)
          destroyPlatformer()
        }
      }
    }

    // ======= Draw =======
    function draw() {
      if (!_ctx) return
      const ctx = _ctx
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "#0f172a"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "#334155"
      ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY)
      ctx.fillStyle = "#facc15"
      ctx.fillRect(player.x, player.y, player.w, player.h)
      drawHUD()
      if (showQuestion && currentQuestion < questions.length)
        drawQuestion(questions[currentQuestion])
    }

    // ======= Loop =======
    function loop() {
      try {
        update()
        draw()
        _animationId = requestAnimationFrame(loop)
      } catch (err: any) {
        console.error("Platformer error:", err)
        opts.onError?.(err)
      }
    }

    loop()
    return { destroy: destroyPlatformer }
  } catch (err: any) {
    console.error(err)
    opts.onError?.(err)
    return { destroy: destroyPlatformer }
  }
}
