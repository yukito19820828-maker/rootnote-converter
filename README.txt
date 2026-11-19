RootNote Converter - HTTPS/PWA配布用
=======================================

このZIPはWebサイトとしてHTTPS公開するためのファイル一式です。
Androidの「ファイル」アプリから index.html を直接開かないでください。
content:// / file:// ではWorkerが起動できず、今回のエラーが再発します。

公開後の使い方
1. HTTPSのURLをSamsung InternetまたはChromeで開く
2. WAVを選択して変換
3. ブラウザメニューから「ホーム画面に追加」または「アプリをインストール」
4. 次回からホーム画面のRootNoteアイコンで起動

ファイル
- index.html : アプリ本体
- manifest.webmanifest : PWA設定
- sw.js : アプリ画面のキャッシュ

変換条件
FLAC / 16bit / 44,100Hz / Stereo / 音量補正なし / WAV入力80MBまで

今回の修正
FFmpeg worker.jsをBlob URLとして読み込み、HTTPSで開いたページのorigin null / cross-origin Worker制限を避ける構成に変更しています。
FFmpeg本体・WASMは初回起動時にCDNから取得します。音源データは端末内で処理し、音源をサーバーへ送信しません。

重要な制約
このZIPを作成しただけではインターネット上のHTTPSサイトにはなりません。HTTPS公開先（例：GitHub Pages等）へファイルを配置する必要があります。こちらからユーザーのアカウントにログインしたり、公開操作を代行したりはしていません。
実機での動作確認はまだです。今回の構成でWorker読み込みを修正していますが、Samsung Internetのバージョンや端末のメモリにより追加調整が必要な場合があります。
