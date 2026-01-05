# 飲料紀錄表 (Drink Record App)

這是一個簡單的飲料紀錄網頁應用程式。

## 如何部屬到 GitHub Pages

已經為您設定好 GitHub Actions Workflow，只要將程式碼推送到 GitHub，網頁就會自動部屬。

### 步驟 1: 在 GitHub 上建立新倉庫 (Repository)
1. 登入 GitHub。
2. 點擊右上角的 "+" 號，選擇 "New repository"。
3. 輸入 Repository name (例如: `drink-record`)。
4. 點擊 "Create repository"。

### 步驟 2: 將此專案推送到 GitHub
打開終端機 (Terminal) 或命令提示字元 (Command Prompt)，在專案資料夾執行以下指令 (請將 `<你的GitHub帳號>` 和 `<你的倉庫名稱>` 替換成實際資訊)：

```bash
# 1. 加入所有檔案
git add .

# 2. 提交變更
git commit -m "Initial commit: Setup drink record app with GitHub Actions"

# 3. 設定主分支名稱為 main
git branch -M main

# 4. 連結到遠端倉庫
git remote add origin https://github.com/<你的GitHub帳號>/<你的倉庫名稱>.git

# 5. 推送程式碼
git push -u origin main
```

### 步驟 3: 設定 GitHub Pages
1. 推送成功後，回到 GitHub 倉庫頁面。
2. 點擊 "Settings" (設定)。
3. 在左側選單找到 "Pages"。
4. 在 "Build and deployment" 區塊：
   - Source 選擇 "GitHub Actions"。
5. 等待幾分鐘，Actions 執行完畢後，您就會看到您的網址了！
