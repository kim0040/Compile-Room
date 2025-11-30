export function StatsGrid({ materials, downloads, members, likes, favorites }) {
  const stats = [
    { label: "공유된 자료", value: materials.toLocaleString() },
    { label: "누적 다운로드", value: downloads.toLocaleString() },
    { label: "활성 팀원", value: `${members.toLocaleString()}명` },
    { label: "좋아요 · 공감", value: likes.toLocaleString() },
    { label: "즐겨찾기 누적", value: favorites.toLocaleString() },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-border-light/60 bg-surface-light px-4 py-3 text-center shadow-sm"
        >
          <p className="text-2xl font-bold text-text-primary-light">
            {stat.value}
          </p>
          <p className="text-sm text-text-secondary-light">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
