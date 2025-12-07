import { NextResponse } from "next/server";
import { searchMaterials } from "@/lib/materials";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword") ?? undefined;
  const sortParam = searchParams.get("sort");
  const sort = sortParam === "popular" ? "popular" : "latest";

  const materials = await searchMaterials({ keyword, sort });

  return NextResponse.json({ materials });
}
