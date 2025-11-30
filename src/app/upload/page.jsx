import { redirect } from "next/navigation";
import { UploadForm } from "@/components/upload-form";
import { getServerAuthSession } from "@/lib/auth";

export const metadata = {
  title: "자료 올리기 - 컴파일룸",
  description: "컴퓨터공학과 학생들과 공유할 자료를 업로드하세요.",
};

export default async function UploadPage() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/login?callbackUrl=/upload");
  }

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-primary">자료 올리기</p>
        <h1 className="text-3xl font-bold text-text-primary-light">
          컴파일룸에 새로운 자료를 추가하세요
        </h1>
        <p className="text-sm text-text-secondary-light">
          모든 자료는 팀원 검수 후에 메인 피드에 노출됩니다.
        </p>
      </div>
      <div className="rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm">
        <UploadForm />
      </div>
    </div>
  );
}
