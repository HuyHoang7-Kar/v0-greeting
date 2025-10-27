"use client";
import { useEffect } from "react";
import { initPlatformer } from "@/scripts/game-platformer";

export default function PlatformerGame() {
  useEffect(() => {
    initPlatformer("gameCanvas");
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold mb-4 text-green-600">
        🕹️ Trò chơi Platformer
      </h2>
      <canvas
        id="gameCanvas"
        className="border border-gray-400 rounded-lg"
      ></canvas>
      <p className="text-sm text-gray-500 mt-3">
        Dùng ⬅️ ➡️ để di chuyển, ⬆️ hoặc Space để nhảy
      </p>
    </div>
  );
}
