// theme.js - 控制深色模式切換

document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('themeToggle');
    
    // 1. 檢查是否有儲存的設定，或是系統預設為深色
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // 2. 初始化：如果存過 dark 或 沒存但系統是 dark，就開啟深色模式
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
        document.body.classList.add('dark-mode');
        updateBtnIcon(true);
    }

    // 3. 點擊事件
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            
            // 儲存設定
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            
            // 更新按鈕圖示
            updateBtnIcon(isDark);
        });
    }

    function updateBtnIcon(isDark) {
        // 切換月亮與太陽圖示
        toggleBtn.textContent = isDark ? '☀️' : '🌙';
    }
});