"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createBrowserClient } from "@supabase/ssr";
import { User, Target, BookOpen, Calendar, Gamepad } from "lucide-react";

interface UserStats {
  id: string;
  full_name: string;
  email: string;
  points: number;
  last_activity: string;
}

interface ActivityStats {
  total_games_played: number;
  total_quizzes_taken: number;
}

export function UserProfile() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 🔹 Lấy thông tin từ bảng profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, points, updated_at")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      setUserStats({
        id: profile.id,
        full_name: profile.full_name || "Chưa cập nhật",
        email: profile.email,
        points: profile.points || 0,
        last_activity: profile.updated_at || new Date().toISOString(),
      });

      // 🔹 Lấy số trò chơi & bài kiểm tra
      const { data: gameResults } = await supabase
        .from("game_results")
        .select("id")
        .eq("user_id", user.id);

      const { data: quizResults } = await supabase
        .from("results")
        .select("id")
        .eq("user_id", user.id);

      setActivityStats({
        total_games_played: gameResults?.length || 0,
        total_quizzes_taken: quizResults?.length || 0,
      });
    } catch (error) {
      console.error("❌ Lỗi tải hồ sơ:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-12 text-gray-600">
        Đang tải hồ sơ...
      </div>
    );

  if (!userStats)
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Không tìm thấy hồ sơ
        </h3>
        <p className="text-gray-600">
          Vui lòng đăng nhập để xem hồ sơ của bạn.
        </p>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <Avatar className="w-20 h-20 mx-auto mb-4">
            <AvatarFallback className="bg-yellow-100 text-yellow-700 text-2xl">
              {userStats.full_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-xl font-semibold">
            {userStats.full_name}
          </CardTitle>
          <p className="text-gray-600">{userStats.email}</p>
        </CardHeader>

        <CardContent className="grid md:grid-cols-2 gap-4 pt-6">
          <StatBox
            icon={<Target className="text-yellow-600" />}
            label="Tổng điểm"
            value={userStats.points}
            color="bg-yellow-50"
          />
          <StatBox
            icon={<Gamepad className="text-blue-600" />}
            label="Trò chơi đã chơi"
            value={activityStats?.total_games_played ?? 0}
            color="bg-blue-50"
          />
          <StatBox
            icon={<BookOpen className="text-green-600" />}
            label="Bài kiểm tra đã làm"
            value={activityStats?.total_quizzes_taken ?? 0}
            color="bg-green-50"
          />
          <StatBox
            icon={<Calendar className="text-orange-600" />}
            label="Hoạt động cuối"
            value={new Date(userStats.last_activity).toLocaleDateString("vi-VN")}
            color="bg-orange-50"
          />
        </CardContent>
      </Card>
    </div>
  );
}

// 🔹 Component hiển thị từng thống kê
function StatBox({
  icon,
  label,
  value,
  color,
}: {
  icon: JSX.Element;
  label: string;
  value: any;
  color: string;
}) {
  return (
    <div className={`text-center p-4 rounded-lg ${color}`}>
      <div className="w-8 h-8 mx-auto mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}
