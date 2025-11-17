// memory-match-game.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { initMemoryMatchScene, destroyMemoryMatchScene, showConfetti } from "@/scripts/memory-match";

interface GameQuestion {
  id: string;
  question: string;
  correct_answer: string;
  points?: number;
}

interface MemoryCard {
  id: string;
  content: string;
  type: "question" | "answer";
  matched: boolean;
  flipped: boolean;
}

interface MemoryMatchGameProps {
  gameSlug?: string;
  questions: GameQuestion[];
  onGameComplete?: (score: number) => void;
}

export function MemoryMatchGame({
  gameSlug = "memory-match",
  questions,
  onGameComplete
}: MemoryMatchGameProps) {
  const mountedRef = useRef(true);
  const supabase = createClient();

  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mountedRef.current = true;
    initMemoryMatchScene(); // overlay confetti

    return () => {
      mountedRef.current = false;
      destroyMemoryMatchScene();
    };
  }, []);

  useEffect(() => {
    const gameCards: MemoryCard[] = [];
    questions.forEach((q, index) => {
      gameCards.push({ id: `q-${index}`, content: q.question, type: "question", matched: false, flipped: false });
      gameCards.push({ id: `a-${index}`, content: q.correct_answer, type: "answer", matched: false, flipped: false });
    });
    setCards(gameCards.sort(() => Math.random() - 0.5));
    setLoading(false);
  }, [questions]);

  const handleCardClick = (cardId: string) => {
    if (!gameStarted || gameEnded || flippedCards.length >= 2) return;

    const card = cards.find((c) => c.id === cardId);
    if (!card || card.flipped || card.matched) return;

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, flipped: true } : c)));

    if (newFlipped.length === 2) setTimeout(() => checkMatch(newFlipped), 500);
  };

  const checkMatch = (flippedCardIds: string[]) => {
    const [id1, id2] = flippedCardIds;
    const card1 = cards.find((c) => c.id === id1);
    const card2 = cards.find((c) => c.id === id2);
    if (!card1 || !card2) return;

    const index1 = card1.id.split("-")[1];
    const index2 = card2.id.split("-")[1];
    const isMatch = index1 === index2 && card1.type !== card2.type;

    if (isMatch) {
      setCards((prev) =>
        prev.map((c) =>
          c.id === id1 || c.id === id2 ? { ...c, matched: true, flipped: true } : c
        )
      );
      showConfetti();
      const q = questions[Number.parseInt(index1)];
      setScore((prev) => prev + (q.points ?? 10));
      setMatchedPairs((prev) => prev + 1);

      if (matchedPairs + 1 === questions.length) endGame();
    } else {
      setCards((prev) =>
        prev.map((c) => (c.id === id1 || c.id === id2 ? { ...c, flipped: false } : c))
      );
    }

    setFlippedCards([]);
  };

  const endGame = async () => {
    setGameEnded(true);
    if (!mountedRef.current) return;
    onGameComplete?.(score);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: game } = await supabase.from("game").select("id").eq("slug", gameSlug).single();
      const gameId = game?.id ?? (await supabase.from("game").insert({ slug: gameSlug, title: "Memory Match Game" }).select("id").single()).id;
      await supabase.from("game_plays").insert({ user_id: user.id, game_id: gameId, score });
    } catch (err) {
      console.error("Lưu điểm thất bại:", err);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setGameEnded(false);
    setScore(0);
    setMatchedPairs(0);
    setCards((prev) => prev.map((c) => ({ ...c, matched: false, flipped: false })));
  };

  return (
    <div className="flex flex-col items-center space-y-3 relative">
      {loading && <p className="text-gray-400 text-sm">Đang tải trò chơi...</p>}

      {!gameStarted && (
        <Button onClick={startGame} size="lg" className="bg-yellow-500 hover:bg-yellow-600">
          Bắt đầu chơi Memory Match
        </Button>
      )}

      {gameStarted && (
        <>
          <div className="grid grid-cols-4 gap-3 max-w-xl w-full relative z-10">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`aspect-square border rounded-lg flex items-center justify-center cursor-pointer text-xl font-bold transition-all duration-300 ${
                  card.flipped || card.matched ? "bg-yellow-50 border-yellow-400" : "bg-gray-50 hover:bg-gray-100"
                } ${card.matched ? "ring-2 ring-green-200" : ""}`}
                onClick={() => handleCardClick(card.id)}
              >
                {card.flipped || card.matched ? card.content : "?"}
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-4 z-10 relative">
            <div>Điểm: {score}</div>
            <div>Cặp đã ghép: {matchedPairs}/{questions.length}</div>
          </div>

          {gameEnded && (
            <Button onClick={startGame} variant="outline">
              Chơi lại
            </Button>
          )}
        </>
      )}
    </div>
  );
}
