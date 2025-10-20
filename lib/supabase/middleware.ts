import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // ⚠️ Chỉ dùng anon key ở đây
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 🔹 Lấy thông tin user hiện tại
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Các trang công khai (không cần login)
  const publicPaths = ["/login", "/signup", "/auth"];

  const { pathname } = request.nextUrl;

  // 🔸 Nếu chưa login và không ở trong public path → redirect về login
  if (!user && !publicPaths.some((path) => pathname.startsWith(path))) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Nếu có user → lấy role trong metadata (hoặc bạn có thể fetch bảng profiles nếu cần)
  const role = user?.user_metadata?.role;

  // 🔹 Nếu là học sinh hoặc giáo viên cố vào trang admin → chặn
  if (pathname.startsWith("/admin") && role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // 🔹 Nếu là admin nhưng đang ở trang học sinh → tự động chuyển vào admin dashboard
  if (
    user &&
    role === "admin" &&
    (pathname === "/" || pathname.startsWith("/student") || pathname.startsWith("/teacher"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  // ✅ Cho phép đi tiếp nếu mọi thứ hợp lệ
  return supabaseResponse;
}
