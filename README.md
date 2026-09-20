# 江浚盛 | 作品集網站

遊戲開發者・技術美術的個人作品集，使用純 HTML / CSS / JavaScript 製作，無需建置。

## 結構

| 檔案 | 說明 |
| --- | --- |
| `index.html` | 頁面內容（簡介、作品、經歷、聯絡） |
| `style.css` | 樣式，含深海／紙本兩種主題 |
| `script.js` | 互動：主題切換、深度計、氣泡、燈箱、分頁 |
| `images/` | 從作品集 PDF 匯出並壓縮的 WebP 圖片 |

## 本機預覽

```bash
python -m http.server 8123
```

然後前往 http://localhost:8123。

## 部署

透過 GitHub Pages 發佈：Repository → Settings → Pages → Branch 選 `main` / `(root)`。
