"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Star, Target, TrendingUp, Calendar, Award, Zap, BookOpen, Brain, Clock } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

interface UserStats {
  id: string
  full_name: string
  email: string
  points: number
  level: number
  experience: number
  badges: any[]
  streak_days: number
  last_activity: string
}

interface ActivityStats {
  total_games_played: number
  total_quizzes_taken: number
  total_flashcards_studied: number
  average_score: number
  best_streak: number
  total_study_time: number
}

export function UserProfile() {
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Get user points and profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(`
          *,
          user_points (*)
        `)
        .eq("id", user.id)
        .single()

      if (profileError) throw profileError

      const userPoints = profile.user_points[0]
      if (userPoints) {
        setUserStats({
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          points: userPoints.points,
          level: userPoints.level,
          experience: userPoints.experience,
          badges: userPoints.badges || [],
          streak_days: userPoints.streak_days,
          last_activity: userPoints.last_activity,
        })
      }

      // Get activity statistics
      const { data: gameResults } = await supabase.from("game_results").select("*").eq("user_id", user.id)

      const { data: quizResults } = await supabase.from("results").select("*").eq("user_id", user.id)

      // Calculate stats
      const totalGames = gameResults?.length || 0
      const totalQuizzes = quizResults?.length || 0
      const avgGameScore = gameResults?.length
        ? gameResults.reduce((sum, r) => sum + (r.score / r.max_score) * 100, 0) / gameResults.length
        : 0
      const avgQuizScore = quizResults?.length
        ? quizResults.reduce((sum, r) => sum + (r.score / r.total_questions) * 100, 0) / quizResults.length
        : 0
      const averageScore =
        totalGames + totalQuizzes > 0
          ? (avgGameScore * totalGames + avgQuizScore * totalQuizzes) / (totalGames + totalQuizzes)
          : 0

      const totalStudyTime = (gameResults?.reduce((sum, r) => sum + (r.time_taken || 0), 0) || 0) / 60 // in minutes

      setActivityStats({
        total_games_played: totalGames,
        total_quizzes_taken: totalQuizzes,
        total_flashcards_studied: 0, // Would need to track this separately
        average_score: Math.round(averageScore),
        best_streak: userPoints?.streak_days || 0,
        total_study_time: Math.round(totalStudyTime),
      })
    } catch (error) {
      console.error("Error fetching user profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const getNextLevelXP = (currentLevel: number) => {
    return currentLevel * 100
  }

  const getCurrentLevelProgress = (experience: number, level: number) => {
    const currentLevelXP = (level - 1) * 100
    const nextLevelXP = level * 100
    const progressXP = experience - currentLevelXP
    const neededXP = nextLevelXP - currentLevelXP
    return (progressXP / neededXP) * 100
  }

  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case "level_up":
        return <Star className="w-4 h-4" />
      case "streak":
        return <TrendingUp className="w-4 h-4" />
      case "perfect_score":
        return <Target className="w-4 h-4" />
      default:
        return <Award className="w-4 h-4" />
    }
  }

  const getBadgeName = (badge: any) => {
    switch (badge.type) {
      case "level_up":
        return `Lên cấp ${badge.level}`
      case "streak":
        return `Chuỗi ${badge.days} ngày`
      case "perfect_score":
        return "Điểm tuyệt đối"
      default:
        return badge.type
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="text-gray-600">Đang tải hồ sơ...</p>
        </div>
      </div>
    )
  }

  if (!userStats) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy hồ sơ</h3>
        <p className="text-gray-600">Vui lòng đăng nhập để xem hồ sơ của bạn.</p>
      </div>
    )
  }

  const levelProgress = getCurrentLevelProgress(userStats.experience, userStats.level)
  const nextLevelXP = getNextLevelXP(userStats.level)

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <User className="w-8 h-8 text-yellow-600" />
          Hồ sơ cá nhân
        </h1>
        <p className="text-gray-600">Theo dõi tiến độ học tập và thành tích của bạn</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarFallback className="bg-yellow-100 text-yellow-700 text-2xl">
                  {userStats.full_name?.charAt(0) || userStats.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">{userStats.full_name || "Học sinh"}</CardTitle>
              <p className="text-gray-600">{userStats.email}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Level Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Level {userStats.level}</span>
                  <span className="text-sm text-gray-500">
                    {userStats.experience}/{nextLevelXP} XP
                  </span>
                </div>
                <Progress value={levelProgress} className="h-2" />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{userStats.points}</div>
                  <div className="text-sm text-gray-600">Tổng điểm</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{userStats.streak_days}</div>
                  <div className="text-sm text-gray-600">Chuỗi ngày</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-yellow-600" />
                <span>Huy hiệu ({userStats.badges.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userStats.badges.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {userStats.badges.map((badge, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1 p-2">
                      {getBadgeIcon(badge.type)}
                      <span className="text-xs">{getBadgeName(badge)}</span>
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Award className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Chưa có huy hiệu nào</p>
                  <p className="text-xs text-gray-500">Hoàn thành các hoạt động để nhận huy hiệu!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Statistics */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Thống kê hoạt động</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activityStats ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">{activityStats.total_games_played}</div>
                    <div className="text-sm text-gray-600">Trò chơi đã chơi</div>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">{activityStats.total_quizzes_taken}</div>
                    <div className="text-sm text-gray-600">Bài kiểm tra</div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">{activityStats.average_score}%</div>
                    <div className="text-sm text-gray-600">Điểm trung bình</div>
                  </div>

                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Zap className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-600">{activityStats.best_streak}</div>
                    <div className="text-sm text-gray-600">Chuỗi tốt nhất</div>
                  </div>

                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <Clock className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-indigo-600">{activityStats.total_study_time}</div>
                    <div className="text-sm text-gray-600">Phút học tập</div>
                  </div>

                  <div className="text-center p-4 bg-pink-50 rounded-lg">
                    <Calendar className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-pink-600">
                      {new Date(userStats.last_activity).toLocaleDateString("vi-VN")}
                    </div>
                    <div className="text-sm text-gray-600">Hoạt động cuối</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có hoạt động</h3>
                  <p className="text-gray-600">Bắt đầu học tập để xem thống kê của bạn!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <span>Hoạt động gần đây</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sắp có tính năng này</h3>
                <p className="text-gray-600">Theo dõi các hoạt động học tập gần đây của bạn.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
