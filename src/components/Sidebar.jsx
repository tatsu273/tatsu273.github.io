import logoImg from '../assets/antigravity.png';

/**
 * アプリケーションの左側に表示されるメインナビゲーション（サイドバー）コンポーネント
 * * @param {Object} props
 * @param {string} props.currentMain - 現在開かれているメインメニューのID (例: 'home', 'record')
 * @param {string} props.activeMain - 現在選択されてハイライト表示されているメインメニューのID
 * @param {boolean} props.isSubOpen - サブメニュー（アコーディオン）が開いているかどうかのフラグ
 * @param {Function} props.handleMainClick - メニューボタンクリック時の画面遷移・開閉処理を担う関数
 * @returns {JSX.Element}
 */
export default function Sidebar({ 
    currentMain,
    activeMain,
    isSubOpen, 
    handleMainClick
}){
    return (
        <aside className="sidebar" style={{ minWidth: '60px', zIndex: 300 }}>
            <img src={logoImg} alt="サイトロゴ" className="site-logo" />

            {/* ホーム */}
            <button 
                className={`nav-btn ${activeMain === 'home' ? 'active' : ''}`} 
                onClick={() => handleMainClick('home')}
                style={{ 
                borderLeft: currentMain === 'home' && isSubOpen ? '4px solid white' : '4px solid transparent' ,
                borderRadius: '3px 0 0 3px'
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                <path d="M226.67-186.67h140v-246.66h226.66v246.66h140v-380L480-756.67l-253.33 190v380ZM160-120v-480l320-240 320 240v480H526.67v-246.67h-93.34V-120H160Zm320-352Z"/>
                </svg>
                <span className="nav-text" style={{fontSize: '10px'}}>ホーム</span>
            </button>

            {/* 勤務記録 */}
            <button 
                className={`nav-btn ${activeMain === 'record' ? 'active' : ''}`} 
                onClick={() => handleMainClick('record')}
                style={{ 
                borderLeft: currentMain === 'record' && isSubOpen ? '4px solid white' : '4px solid transparent',
                borderRadius: '3px 0 0 3px'
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                <path d="M320-453.33h320V-520H320v66.67Zm0 120h320V-400H320v66.67Zm0 120h200V-280H320v66.67ZM226.67-80q-27 0-46.84-19.83Q160-119.67 160-146.67v-666.66q0-27 19.83-46.84Q199.67-880 226.67-880H574l226 226v507.33q0 27-19.83 46.84Q760.33-80 733.33-80H226.67Zm314-542.67v-190.66h-314v666.66h506.66v-476H540.67Zm-314-190.66v190.66-190.66 666.66-666.66Z"/>
                </svg>
                <span className="nav-text" style={{fontSize: '10px'}}>勤務記録</span>
            </button>

            {/* 出退勤管理 */}
            <button 
                className={`nav-btn ${activeMain === 'entry' ? 'active' : ''}`} 
                onClick={() => handleMainClick('entry')}
                style={{ 
                borderLeft: currentMain === 'entry' && isSubOpen ? '4px solid white' : '4px solid transparent',
                borderRadius: '3px 0 0 3px'
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                <path d="m622-288.67 48.67-48.66-155.34-156v-195.34h-66.66v222l173.33 178ZM480-80q-82.33 0-155.33-31.5-73-31.5-127.34-85.83Q143-251.67 111.5-324.67T80-480q0-82.33 31.5-155.33 31.5-73 85.83-127.34Q251.67-817 324.67-848.5T480-880q82.33 0 155.33 31.5 73 31.5 127.34 85.83Q817-708.33 848.5-635.33T880-480q0 82.33-31.5 155.33-31.5 73-85.83 127.34Q708.33-143 635.33-111.5T480-80Zm0-400Zm0 333.33q137.67 0 235.5-97.83 97.83-97.83 97.83-235.5 0-137.67-97.83-235.5-97.83-97.83-235.5-97.83-137.67 0-235.5 97.83-97.83 97.83-97.83 235.5 0 137.67 97.83 235.5 97.83 97.83 235.5 97.83Z"/>
                </svg>
                <span className="nav-text" style={{fontSize: '10px'}}>出退勤管理</span>
            </button>

            {/* 従業員管理 */}
            <button 
                className={`nav-btn ${activeMain === 'employee' ? 'active' : ''}`} 
                onClick={() => handleMainClick('employee')}
                style={{ 
                borderLeft: currentMain === 'employee' && isSubOpen ? '4px solid white' : '4px solid transparent',
                borderRadius: '3px 0 0 3px'
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                <path d="M38.67-160v-100q0-34.67 17.83-63.17T105.33-366q69.34-31.67 129.67-46.17 60.33-14.5 123.67-14.5 63.33 0 123.33 14.5T611.33-366q31 14.33 49.17 42.83T678.67-260v100h-640Zm706.66 0v-102.67q0-56.66-29.5-97.16t-79.16-66.84q63 7.34 118.66 22.5 55.67 15.17 94 35.5 34 19.34 53 46.17 19 26.83 19 59.83V-160h-176ZM249-524.33Q205.33-568 205.33-634T249-743.67q43.67-43.66 109.67-43.66t109.66 43.66Q512-700 512-634t-43.67 109.67q-43.66 43.66-109.66 43.66T249-524.33Zm439.33 0q-43.66 43.66-109.66 43.66-11 0-25.67-1.83-14.67-1.83-25.67-5.5 25-27.33 38.17-64.67Q578.67-590 578.67-634t-13.17-80q-13.17-36-38.17-66 12-3.67 25.67-5.5 13.67-1.83 25.67-1.83 66 0 109.66 43.66Q732-700 732-634t-43.67 109.67Zm-583 297.66H612V-260q0-14.33-8.17-27.33-8.16-13-20.5-18.67-66-30.33-117-42.17-51-11.83-107.66-11.83-56.67 0-108 11.83-51.34 11.84-117.34 42.17-12.33 5.67-20.16 18.67-7.84 13-7.84 27.33v33.33Zm315.17-345.5Q445.33-597 445.33-634t-24.83-61.83q-24.83-24.84-61.83-24.84t-61.84 24.84Q272-671 272-634t24.83 61.83q24.84 24.84 61.84 24.84t61.83-24.84Zm-61.83 345.5Zm0-407.33Z"/>
                </svg>
                <span className="nav-text" style={{fontSize: '10px'}}>従業員</span>
            </button>

            {/* 設定 */}
            <button 
                className={`nav-btn nav-btn-settings ${activeMain === 'settings' ? 'active' : ''}`} 
                onClick={() => handleMainClick('settings')}
                style={{ 
                borderLeft: currentMain === 'settings' && isSubOpen ? '4px solid white' : '4px solid transparent',
                borderRadius: '6px 0 0 6px'
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                <path d="m382-80-18.67-126.67q-17-6.33-34.83-16.66-17.83-10.34-32.17-21.67L178-192.33 79.33-365l106.34-78.67q-1.67-8.33-2-18.16-.34-9.84-.34-18.17 0-8.33.34-18.17.33-9.83 2-18.16L79.33-595 178-767.67 296.33-715q14.34-11.33 32.34-21.67 18-10.33 34.66-16L382-880h196l18.67 126.67q17 6.33 35.16 16.33 18.17 10 31.84 22L782-767.67 880.67-595l-106.34 77.33q1.67 9 2 18.84.34 9.83.34 18.83 0 9-.34 18.5Q776-452 774-443l106.33 78-98.66 172.67-118-52.67q-14.34 11.33-32 22-17.67 10.67-35 16.33L578-80H382Zm55.33-66.67h85l14-110q32.34-8 60.84-24.5T649-321l103.67 44.33 39.66-70.66L701-415q4.33-16 6.67-32.17Q710-463.33 710-480q0-16.67-2-32.83-2-16.17-7-32.17l91.33-67.67-39.66-70.66L649-638.67q-22.67-25-50.83-41.83-28.17-16.83-61.84-22.83l-13.66-110h-85l-14 110q-33 7.33-61.5 23.83T311-639l-103.67-44.33-39.66 70.66L259-545.33Q254.67-529 252.33-513 250-497 250-480q0 16.67 2.33 32.67 2.34 16 6.67 32.33l-91.33 67.67 39.66 70.66L311-321.33q23.33 23.66 51.83 40.16 28.5 16.5 60.84 24.5l13.66 110Zm43.34-200q55.33 0 94.33-39T614-480q0-55.33-39-94.33t-94.33-39q-55.67 0-94.5 39-38.84 39-38.84 94.33t38.84 94.33q38.83 39 94.5 39ZM480-480Z"/>
                </svg>
                <span className="nav-text" style={{fontSize: '10px'}}>設定</span>
            </button>
        </aside>
    );
}