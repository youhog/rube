// -----------------------------------------------------------
// ⬇️⬇️⬇️ Firebase 設定 ⬇️⬇️⬇️
// -----------------------------------------------------------
const firebaseConfig = window.FIREBASE_CONFIG || {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
// -----------------------------------------------------------
// ⬆️⬆️⬆️ Firebase 設定 ⬆️⬆️⬆️
// ----------------------------------------------------------- 

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"; 
import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    onSnapshot, 
    serverTimestamp,
    limit, // 🆕 新增 limit
    enableIndexedDbPersistence // 🆕 新增離線持久化
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"; 

// 初始化變數 
let db; 
let drinksCollection; 
let currentRecords = []; 
let limitCount = 50; // 🆕 初始載入筆數
let unsubscribe = null; // 🆕 用來管理監聽器

// 檢查並啟動 Firebase 
if (!firebaseConfig.apiKey) { 
    alert("⚠️ 請注意！\n\n您尚未在 script.js 中填入 Firebase 設定檔。"); 
} else { 
    const app = initializeApp(firebaseConfig); 
    db = getFirestore(app); 
    drinksCollection = collection(db, "drinks"); 

    // 🆕 啟用離線持久化 (Offline Persistence)
    enableIndexedDbPersistence(db).catch((err) => {
        if (err.code == 'failed-precondition') {
             console.log('多個分頁同時開啟，離線模式僅在第一個分頁啟用');
        } else if (err.code == 'unimplemented') {
             console.log('瀏覽器不支援離線模式');
        }
    });

    startListening(); 
} 

// 🆕 監聽資料庫 (改為支援分頁)
function startListening() { 
    // 如果已經有監聽器，先取消，避免重複監聽
    if (unsubscribe) {
        unsubscribe();
    }

    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    
    // 建立查詢：排序並限制筆數
    const q = query(drinksCollection, orderBy("timestamp", "desc"), limit(limitCount)); 
    
    unsubscribe = onSnapshot(q, (snapshot) => { 
        const records = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
        })); 
        
        currentRecords = records; 
        updateRecordList(records); 
        
        // 🆕 判斷是否還有更多資料
        // 如果抓回來的資料量少於我們要求的 limitCount，代表已經到底了
        if (records.length < limitCount) {
            loadMoreContainer.classList.add('hidden');
        } else {
            loadMoreContainer.classList.remove('hidden');
        }

    }, (error) => { 
        console.error("讀取資料失敗:", error); 
        showMessage("讀取資料失敗，請檢查權限設定", "error"); 
    }); 
} 

// 🆕「載入更多」按鈕邏輯
const loadMoreBtn = document.getElementById('loadMoreBtn');
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
        loadMoreBtn.textContent = "載入中...";
        loadMoreBtn.disabled = true;

        // 增加載入筆數 (例如每次多載 50 筆)
        limitCount += 50;
        
        // 重新設定監聽器 (因為有 Cache，這樣做效能其實很好，且能保持即時更新)
        startListening();
        
        // 稍微延遲一下讓按鈕恢復，避免連點
        setTimeout(() => {
            loadMoreBtn.textContent = "👇 載入更多紀錄";
            loadMoreBtn.disabled = false;
        }, 500);
    });
}

// UI 互動邏輯 
document.getElementById('date').valueAsDate = new Date(); 

function setupOptions(containerId, hiddenInputId) { 
    const container = document.getElementById(containerId); 
    const hiddenInput = document.getElementById(hiddenInputId); 
    if (!container) return; 
    const buttons = container.querySelectorAll('button'); 

    buttons.forEach(btn => { 
        btn.addEventListener('click', () => { 
            buttons.forEach(b => b.classList.remove('active')); 
            btn.classList.add('active'); 
            hiddenInput.value = btn.getAttribute('data-value'); 
        }); 
    }); 
} 

setupOptions('iceOptions', 'iceValue'); 
setupOptions('sugarOptions', 'sugarValue'); 

// 表單提交 
const drinkForm = document.getElementById('drinkForm'); 
const submitBtn = document.getElementById('submitBtn'); 

drinkForm.addEventListener('submit', async (e) => { 
    e.preventDefault(); 
    if (!db) { 
        alert("資料庫尚未就緒，請檢查設定"); 
        return; 
    } 

    submitBtn.disabled = true; 
    submitBtn.textContent = "紀錄中..."; 

    const drinkData = { 
        date: document.getElementById('date').value, 
        store: document.getElementById('store').value, 
        item: document.getElementById('item').value, 
        ice: document.getElementById('iceValue').value, 
        sugar: document.getElementById('sugarValue').value, 
        note: document.getElementById('note').value, 
        timestamp: serverTimestamp() 
    }; 

    if (!drinkData.ice || !drinkData.sugar) { 
        showMessage('別忘了選擇冰塊與甜度喔！', 'error'); 
        submitBtn.disabled = false; 
        submitBtn.textContent = "收藏這杯紀錄"; 
        return; 
    } 

    try { 
        await addDoc(drinksCollection, drinkData); 
        drinkForm.reset(); 
        document.getElementById('date').valueAsDate = new Date(); 
        document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active')); 
        showMessage('成功紀錄一杯美味！✨'); 
    } catch (error) { 
        showMessage('紀錄失敗：' + error.message, 'error'); 
    } finally { 
        submitBtn.disabled = false; 
        submitBtn.textContent = "收藏這杯紀錄"; 
    } 
}); 

// 輔助函式 
function showMessage(msg, type = 'success') { 
    const box = document.getElementById('messageBox'); 
    box.textContent = msg; 
    box.className = `p-4 rounded-2xl text-center font-bold mb-6 transition-all ${type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`; 
    box.classList.remove('hidden'); 
    setTimeout(() => box.classList.add('hidden'), 3000); 
} 

function updateRecordList(records) { 
    const recordList = document.getElementById('recordList'); 
    const recordCountText = document.getElementById('recordCount'); 
    
    // 顯示目前載入的數量，如果是全部載入則顯示總數
    recordCountText.textContent = `已載入 ${records.length} 筆`; 
    
    if (records.length === 0) { 
        recordList.innerHTML = `<p class="text-center py-10 text-stone-400">目前還沒有紀錄喔！</p>`; 
        return; 
    } 

    recordList.innerHTML = records.map(r => ` 
        <div class="border border-orange-100 bg-orange-50/20 p-5 rounded-2xl transition-all hover:bg-white hover:shadow-md"> 
            <div class="flex justify-between items-start mb-2"> 
                <span class="text-[10px] font-black tracking-tighter text-orange-400 bg-white border border-orange-100 px-2 py-0.5 rounded-full uppercase">${r.date}</span> 
                <span class="text-sm font-bold text-stone-500">${r.store}</span> 
            </div> 
            <div class="text-lg font-black text-stone-800 mb-3">${r.item}</div> 
            <div class="flex gap-2 text-xs"> 
                <span class="bg-orange-100 text-orange-700 font-bold px-3 py-1 rounded-full">❄️ ${r.ice}</span> 
                <span class="bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-full">🍯 ${r.sugar}</span> 
            </div> 
            ${r.note ? `<div class="mt-4 pt-3 border-t border-orange-100/50 text-sm text-stone-500 italic"># ${r.note}</div>` : ''} 
        </div> 
    `).join(''); 
} 

// -----------------------------------------------------------
// 🆕 匯出 Excel 功能 (動態載入版)
// -----------------------------------------------------------
const exportBtn = document.getElementById('exportBtn');

// 輔助函式：動態載入 Script
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
        if (currentRecords.length === 0) {
            showMessage("目前沒有紀錄可以匯出喔！", "error");
            return;
        }

        // 🆕 檢查並動態載入 XLSX 套件
        if (typeof window.XLSX === 'undefined') {
            try {
                showMessage("正在下載匯出模組...", "success");
                await loadScript('https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js');
            } catch (err) {
                console.error(err);
                showMessage("匯出模組載入失敗，請檢查網路", "error");
                return;
            }
        }

        // 1. 整理資料格式
        const excelData = currentRecords.map(r => {
            let timeStr = '';
            if (r.timestamp && r.timestamp.seconds) {
                timeStr = new Date(r.timestamp.seconds * 1000).toLocaleString();
            }

            return {
                "日期": r.date,
                "店家": r.store,
                "品項": r.item,
                "冰塊": r.ice,
                "甜度": r.sugar,
                "備註": r.note,
                "紀錄時間": timeStr
            };
        });

        // 2. 建立工作表
        const worksheet = window.XLSX.utils.json_to_sheet(excelData);
        
        const wscols = [
            {wch: 12}, // 日期
            {wch: 15}, // 店家
            {wch: 15}, // 品項
            {wch: 8},  // 冰塊
            {wch: 8},  // 甜度
            {wch: 20}, // 備註
            {wch: 20}  // 紀錄時間
        ];
        worksheet['!cols'] = wscols;

        // 3. 建立活頁簿 (Workbook) 並加入工作表
        const workbook = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(workbook, worksheet, "飲料紀錄");

        // 4. 下載檔案
        const today = new Date().toISOString().split('T')[0];
        window.XLSX.writeFile(workbook, `飲料紀錄_${today}.xlsx`);
        showMessage("匯出成功！檔案已下載", "success");
    });
}