"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ClassDetailsPage() {
  const { id: classId } = useParams();

  const [classInfo, setClassInfo] = useState(null);
  const [members, setMembers] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const { data: classData } = await supabase
      .from("classes")
      .select("*")
      .eq("id", classId)
      .single();

    const { data: memberData } = await supabase
      .from("class_members")
      .select("*, profiles(*)")
      .eq("class_id", classId);

    const { data: scoreData } = await supabase
      .from("game_scores")
      .select("*, game(*)")
      .eq("class_id", classId);

    setClassInfo(classData);
    setMembers(memberData || []);
    setScores(scoreData || []);
    setLoading(false);
  }

  if (loading) return <p className="p-10 text-center">Đang tải lớp...</p>;

  return (
    <div className="p-10 max-w-5xl mx-auto">
      {/* CLASS HEADER */}
      <h1 className="text-4xl font-bold mb-4">{classInfo?.name}</h1>
      <p className="text-gray-700 mb-10">{classInfo?.description}</p>

      {/* MEMBERS */}
      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Danh sách học sinh</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p>Chưa có học sinh.</p>
          ) : (
            <ul className="list-disc pl-6">
              {members.map((m) => (
                <li key={m.id} className="mb-2">
                  {m.profiles?.full_name || m.profiles?.username} —{" "}
                  <span className="text-sm text-gray-500">{m.role}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* SCORES */}
      <Card>
        <CardHeader>
          <CardTitle>Điểm trò chơi</CardTitle>
        </CardHeader>
        <CardContent>
          {scores.length === 0 ? (
            <p>Chưa có điểm.</p>
          ) : (
            <div className="space-y-4">
              {scores.map((s) => (
                <div key={s.id} className="border-b pb-2">
                  <p className="font-bold">
                    {s.game?.title} – Điểm cao nhất: {s.best_score}
                  </p>
                  <p className="text-sm text-gray-600">
                    Lần cuối chơi: {new Date(s.updated_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
