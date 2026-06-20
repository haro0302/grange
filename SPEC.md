# 年代別グランジ名曲Top20 — アプリ仕様書

## 概要

1990〜2002年のグランジ楽曲を年ごとに検索し、Top20をカード型UIで表示・30秒試聴できるWebアプリ。

---

## 技術スタック

| 項目 | 採用技術 |
|------|----------|
| フレームワーク | Next.js 14+ (App Router) + TypeScript |
| スタイリング | Tailwind CSS |
| 音楽API | Spotify Web API |
| デプロイ | Vercel |
| 認証方式 | Spotify Client Credentials Flow（サーバーサイド） |

---

## Spotify API セットアップ手順

### 1. Spotify Developer登録

1. [Spotify for Developers](https://developer.spotify.com/) でアカウント作成
2. Dashboard → "Create App" でアプリを作成
3. `Client ID` と `Client Secret` を取得

### 2. 環境変数の設定

`.env.local` ファイルに以下を追加（Vercelのダッシュボードにも同じ値を設定）：

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

### 3. 認証フロー

ユーザーログイン不要の **Client Credentials Flow** を使用。  
Next.js API Route（`/api/spotify/token`）でアクセストークンを取得し、クライアントには直接露出させない。

---

## 機能仕様

### 年代検索

- 対象年: **1990〜2002年（1年ごと）**
- UIはドロップダウンまたはタブ形式で年を選択
- 選択後、Spotify APIで該当年のグランジ楽曲Top20を取得・表示

### Spotify検索クエリ戦略

**⚠️ 制約事項**  
Spotify の `genre:grunge` タグは不完全であり、検索結果にグランジ以外の楽曲が混入する可能性がある。

**推奨クエリ方式**（複合検索）:

```
/v1/search?q=genre:grunge+year:{YEAR}&type=track&limit=50&market=JP
```

取得後、以下の既知グランジアーティスト名でフィルタリングして精度を上げる:

```
Nirvana, Pearl Jam, Soundgarden, Alice in Chains, Stone Temple Pilots,
Mudhoney, Screaming Trees, Dinosaur Jr., L7, Hole, Bush, Silverchair,
Foo Fighters, Live, Candlebox, Smashing Pumpkins, Beck, Blind Melon,
Mad Season, Temple of the Dog, Chris Cornell, Eddie Vedder
```

- 上記アーティストにヒットした楽曲を優先的に上位に並べ替え
- 不足分は `popularity` スコア降順で補完
- 最終的に上位20件を返す

### 表示データ（楽曲単位）

- 順位（1〜20位）
- ジャケット写真（小: 64×64px 推奨）
- 曲名
- アーティスト名
- アルバム名

### 試聴機能

- 楽曲カードをクリックで30秒プレビュー再生（Spotify `preview_url`）
- **画面遷移なし**、その場でオーディオプレイヤーが展開
- 30秒終了後、自動で次の曲（リスト順）へ進む
- 再生中の曲はカードをハイライト表示
- 再生/停止ボタンを各カードに表示

**⚠️ 注意**: Spotify の `preview_url` は一部楽曲で `null` になることがある。  
その場合は「試聴不可」バッジを表示し、スキップして次の曲に自動進行。

---

## UI/UXデザイン

### 画面構成

```
┌─────────────────────────────────────────┐
│  🎸 年代別グランジ名曲Top20              │  ← ヘッダー
├─────────────────────────────────────────┤
│  [ 1990 ▼ ]  年を選択                  │  ← 年選択UI
├─────────────────────────────────────────┤
│  ♪ NOW PLAYING: Track Name ━━━━━━━━▶  │  ← 固定プレイヤーバー（再生中のみ表示）
├─────────────────────────────────────────┤
│  #1  [🖼]  Song Name           ▶        │
│            Artist / Album              │
│  #2  [🖼]  Song Name           ▶        │  ← 楽曲カード × 20
│            Artist / Album              │
│  ...                                   │
└─────────────────────────────────────────┘
```

### カラーパレット

ネオンカラーは使用しない。かすれた・くすんだ質感を基調とするグランジらしい配色。

| 役割 | カラーコード | 用途 |
|------|-------------|------|
| メインアクセント | `#a39c90` | テキスト強調、ボーダー、アイコン |
| 背景（ベース） | `#1c1a18` | ページ全体の背景 |
| カード背景 | `#252220` | 楽曲カードの背景 |
| カード背景（ホバー） | `#2e2a27` | ホバー時の変化 |
| テキスト（主） | `#d4cdc6` | 曲名など主要テキスト |
| テキスト（副） | `#7a7268` | アーティスト名・アルバム名など補足テキスト |
| 再生中ハイライト | `#5c5248` | 再生中カードの背景色 |
| 再生中ボーダー | `#a39c90` | 再生中カードの左ボーダーライン |
| 試聴不可バッジ | `#4a4540` | 試聴不可の表示色 |

### カードデザイン仕様

- 背景色: `#252220`、ホバー時: `#2e2a27`（明度を少し上げる）
- アクセント: `#a39c90`（かすれたグレーベージュ）を基調とし、ネオン・蛍光色は使わない
- 順位数字: 大きめのフォントで左端に表示、色は `#5c5248`（控えめに）
- 再生中カード: 左ボーダー `#a39c90` + 背景 `#5c5248` でハイライト
- ホバー時: 背景色変化のみ（スケールアップ不要）
- フォント: セリフ or モノスペース系を検討（グランジ感を演出）

### レスポンシブ対応

- モバイル: 1列
- タブレット以上: 最大2列

---

## ディレクトリ構成（想定）

```
/
├── app/
│   ├── page.tsx                  # メインページ
│   ├── layout.tsx
│   └── api/
│       └── tracks/
│           └── route.ts          # Spotify API呼び出し（サーバーサイド）
├── components/
│   ├── YearSelector.tsx          # 年選択UI
│   ├── TrackList.tsx             # 楽曲リスト
│   ├── TrackCard.tsx             # 楽曲カード
│   └── PlayerBar.tsx             # 固定プレイヤーバー
├── lib/
│   └── spotify.ts                # Spotify API クライアント
├── types/
│   └── track.ts                  # 型定義
├── .env.local                    # 環境変数（gitignore済み）
└── SPEC.md                       # 本ファイル
```

---

## APIルート仕様

### `GET /api/tracks?year={YEAR}`

**リクエスト例**: `/api/tracks?year=1994`

**レスポンス例**:
```json
[
  {
    "rank": 1,
    "id": "spotify_track_id",
    "name": "Come as You Are",
    "artist": "Nirvana",
    "album": "Nevermind",
    "albumArt": "https://i.scdn.co/...",
    "previewUrl": "https://p.scdn.co/...",
    "externalUrl": "https://open.spotify.com/track/..."
  }
]
```

---

## Vercelデプロイ手順（後で実施）

1. GitHubにリポジトリをpush
2. Vercelダッシュボードでリポジトリを連携
3. Environment Variables に `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` を追加
4. デプロイ実行

---

## 開発ステップ

1. `npx create-next-app@latest` でプロジェクト作成
2. Spotify Developer Appの登録 → 環境変数設定
3. `lib/spotify.ts` でトークン取得・検索関数を実装
4. `/api/tracks` ルートの実装
5. UIコンポーネント実装（YearSelector → TrackList → TrackCard）
6. 音声再生ロジック実装（PlayerBar + 自動進行）
7. デザイン調整（Tailwind）
8. Vercelデプロイ

---

## 既知の制約・注意事項

| 制約 | 内容 |
|------|------|
| preview_url | 全楽曲で利用可能とは限らない（null になる場合あり） |
| グランジ検索精度 | Spotifyのgenreタグは不完全。アーティストフィルタで補完 |
| Spotifyレート制限 | Client Credentials の制限内で使用（通常問題なし） |
| 地域制限 | `market=JP` 指定でJP対応楽曲のみ取得 |
