import React, { useRef, useEffect, useState } from "react";

export default function RabbitMathGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [question, setQuestion] = useState("? + ? = ?");
  const [currentAnswer, setCurrentAnswer] = useState(0);

  const player = useRef({ x: 175, y: 500, w: 60, h: 60, speed: 7 }).current;
  const items = useRef<any[]>([]).current;
  const spawnTimer = useRef(0);
  const speed = useRef(2);
  const move = useRef({ left: false, right: false });

  function startGame() {
    setScore(0);
    setLives(3);
    items.length = 0;
    speed.current = 2;
    setIsPlaying(true);
    generateQuestion();
  }

  function generateQuestion() {
    const op = Math.random() > 0.5 ? "+" : "-";
    let a = 0, b = 0;
    if (op === "+") {
      a = Math.floor(Math.random() * 10);
      b = Math.floor(Math.random() * 10);
      setCurrentAnswer(a + b);
    } else {
      a = Math.floor(Math.random() * 10) + 5;
      b = Math.floor(Math.random() * a);
      setCurrentAnswer(a - b);
    }
    setQuestion(`${a} ${op} ${b} = ?`);
  }

  function spawnItem() {
    let value = Math.random() < 0.4 ? currentAnswer : Math.floor(Math.random() * 20);
    if (value === currentAnswer) value++;
    items.push({
      x: Math.random() * 350,
      y: -50,
      value,
      w: 50,
      h: 70,
    });
  }

  function update() {
    if (!isPlaying) return;
    if (move.current.left && player.x > 0) player.x -= player.speed;
    if (move.current.right && player.x < 340) player.x += player.speed;

    spawnTimer.current++;
    if (spawnTimer.current > 60) {
      spawnItem();
      spawnTimer.current = 0;
    }

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      it.y += speed.current;

      if (
        player.x < it.x + it.w &&
        player.x + player.w > it.x &&
        player.y < it.y + it.h &&
        player.y + player.h > it.y
      ) {
        if (it.value === currentAnswer) {
          setScore((s) => s + 10);
          speed.current += 0.2;
          generateQuestion();
          items.length = 0;
        } else {
          setLives((l) => l - 1);
        }
        items.splice(i, 1);
        return;
      }

      if (it.y > 600) {
        items.splice(i, 1);
        i--;
      }
    }
  }

  function draw() {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d")!;
    ctx.clearRect(0, 0, 400, 600);
    ctx.font = "60px Arial";
    ctx.fillText("🐰", player.x, player.y + 50);

    for (let it of items) {
      ctx.font = "50px Arial";
      ctx.fillText("🥕", it.x, it.y + 50);
      ctx.font = "bold 20px Arial";
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 3;
      ctx.strokeText(String(it.value), it.x + 15, it.y + 35);
      ctx.fillText(String(it.value), it.x + 15, it.y + 35);
    }
  }

  useEffect(() => {
    const loop = () => {
      if (!isPlaying) return;
      update();
      draw();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }, [isPlaying]);

  return (
    <div className="w-full flex flex-col items-center select-none">
      <div
        className="relative border-4 border-orange-500 rounded-xl overflow-hidden"
        style={{ width: 400, height: 600, background: "#90EE90" }}
      >
        <div className="absolute top-2 left-2 text-white font-bold text-xl drop-shadow">
          Điểm: {score}
        </div>
        <div className="absolute top-2 right-2 text-white font-bold text-xl drop-shadow">
          Mạng: {"❤️".repeat(lives)}
        </div>

        <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-full border-2 border-pink-400 text-2xl font-bold">
          {question}
        </div>

        <canvas ref={canvasRef} width={400} height={600} className="absolute top-0 left-0" />

        {!isPlaying && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white">
            <h1 className="text-4xl font-bold mb-4 text-yellow-300 drop-shadow">THỎ CON HAM HỌC</h1>
            <button
              className="bg-green-500 px-6 py-3 text-2xl rounded-lg shadow"
              onClick={startGame}
            >
              Bắt đầu chơi
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-6 mt-4">
        <button
          className="w-20 h-20 rounded-full bg-yellow-400 border-4 border-orange-500 text-4xl shadow"
          onMouseDown={() => (move.current.left = true)}
          onMouseUp={() => (move.current.left = false)}
        >
          ⬅️
        </button>
        <button
          className="w-20 h-20 rounded-full bg-yellow-400 border-4 border-orange-500 text-4xl shadow"
          onMouseDown={() => (move.current.right = true)}
          onMouseUp={() => (move.current.right = false)}
        >
          ➡️
        </button>
      </div>
    </div>
  );
}
