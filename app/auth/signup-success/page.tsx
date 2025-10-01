import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Tạo tài khoản thành công!
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Vui lòng kiểm tra email để xác minh tài khoản của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                Chúng tôi đã gửi một email xác nhận đến hộp thư của bạn. 
                Hãy nhấp vào liên kết trong email để kích hoạt tài khoản và bắt đầu học tập!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
