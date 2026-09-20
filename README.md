# 江浚盛 | 作品集網站

遊戲開發者・技術美術的個人作品集，使用純 HTML / CSS / JavaScript 製作，無需建置。

## 資料夾結構

```
Portfolio/
├── index.html            頁面內容（簡介、作品、經歷、聯絡）
├── favicon.svg           分頁小圖示
├── css/
│   └── style.css         樣式，含深海／紙本兩種主題（最上方 :root 是配色）
├── js/
│   └── script.js         互動：主題切換、深度計、氣泡、燈箱、分頁
└── images/
    ├── interstellar/     02 Interstellar Exploration
    ├── alley/            03 Alley
    ├── eiffel/           04 The Legend Of Eiffel
    └── silent-wreckage/  05 Silent Wreckage（含首頁海報 poster.webp）
```

## 本機預覽

直接用瀏覽器開啟 `index.html`，或執行：

```bash
python -m http.server 8123
```

然後前往 http://localhost:8123。

## 部署

透過 GitHub Pages 發佈：Repository → Settings → Pages → Branch 選 `main` / `(root)`。
