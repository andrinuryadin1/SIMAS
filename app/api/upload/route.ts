import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadToBunny, generateStudentPhotoPath, validateStudentPhoto } from "@/lib/bunny";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "admin" && role !== "guru") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const nis = formData.get("nis") as string | null;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    if (!nis) {
      return NextResponse.json({ error: "NIS wajib diisi" }, { status: 400 });
    }

    const validation = validateStudentPhoto(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const extension = file.name.split(".").pop() || "jpg";
    const bunnyPath = generateStudentPhotoPath(nis, extension);

    const uploadResult = await uploadToBunny(file, bunnyPath);

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error || "Gagal mengupload file ke CDN" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      path: bunnyPath,
    });
  } catch (error) {
    console.error("API Upload Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat upload" },
      { status: 500 }
    );
  }
}
