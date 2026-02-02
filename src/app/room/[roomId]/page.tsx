import { RoomPageClient } from './RoomPageClient';

// ダミーのパスを1つ生成（index として生成）
// Azure Static Web Apps のルーティング設定で実際の動的ルーティングを処理
export function generateStaticParams() {
  return [{ roomId: 'index' }];
}

export default function RoomPageWrapper({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  return <RoomPageClient />;
}
