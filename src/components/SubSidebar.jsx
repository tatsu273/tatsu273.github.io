import { menuData } from '../utils/constants';

/**
 * サイドバーの項目をクリックしたときに表示されるサブメニュー (サブサイドバー) コンポーネント
 * @param {Object} props
 * @param {boolean} props.isSubOpen - サブメニュー（アコーディオン）が開いているかどうかのフラグ
 * @param {Function} props.setIsSubOpen - サブメニューの開閉を切り替えるための状態更新関数
 * @param {Function} props.setCurrentSub - サブ画面を切り替えるための状態更新関数
 * @param {string} props.currentMain - 現在開かれているメインメニューのID (例: 'home', 'record')
 * @returns {JSX.Element}
 */

export default function SubSidebar({ 
    isSubOpen,
    setIsSubOpen,
    setCurrentSub,
    currentMain
}){
    return (
        <nav className={`sub-sidebar ${isSubOpen ? 'open' : ''}`}>
            
            <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px',
            paddingBottom: '0px',
            borderBottom: '1px solid #ccc',

            opacity: isSubOpen ? 1 : 0,
            transition: 'opacity 0.2s'
            }}>
            <h3 style={{ padding: '0px 6px', fontSize: '18px', color: 'white', marginTop: 10 }}>
                勤怠管理システム
            </h3>
            <button 
                className="sub-nav-btn"
                onClick={() => setIsSubOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'white' }}
            >
            </button>
            </div>
            
            <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px',
            
            opacity: isSubOpen ? 1 : 0,
            transition: 'opacity 0.2s'
            }}>
            {!['home', 'record', 'settings'].includes(currentMain) && (
                menuData[currentMain].subs.map((subItem) => (
                <button
                    className="sub-nav-btn"
                    key={subItem.id}
                    onClick={() => {
                    setCurrentSub(subItem.id);
                    setIsSubOpen(false);
                    }}
                >
                    {subItem.label}
                </button>
                ))
            )}
            </div>
        </nav>

    );
}