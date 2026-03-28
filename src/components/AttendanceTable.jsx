/**
 * 時間文字列（HH:mm）を、24時間を100%とした場合のパーセンテージに変換する関数
 * タイムラインのバーの横幅や開始位置の計算に使用される
 * @param {string} timeStr - 時間文字列（例: "09:30"）
 * @returns {number} 0から100の間のパーセント数値（例: "12:00" なら 50）
 */
const timeToPercent = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return ((h + (m || 0) / 60) / 24) * 100;
};

/**
 * カレンダーの日付・曜日のテキスト色を判定する関数
 * @param {Object} record - 1日分の勤怠データオブジェクト
 * @returns {string} カラーコード（土日祝はグレー、平日は濃いグレー/黒）
 */
const getDateColor = (record) => {
  if (record.dayOfWeek === '土' || record.dayOfWeek === '日' || record.isHoliday) return '#7f8c8d'; 
  return '#333';
};

/**
 * 勤怠ステータスに応じてテーブル行の背景色スタイルを生成する関数
 * @param {Object} record - 1日分の勤怠データオブジェクト
 * @returns {Object} Reactのstyleオブジェクト（例: { backgroundColor: '#eaf4fc' }）
 */
const getRowStyle = (record) => {
  if (record.status === '有給') return { backgroundColor: '#eaf4fc' };
  if (record.status === '欠勤') return { backgroundColor: '#fcebea' };
  if (record.dayOfWeek === '土' || record.dayOfWeek === '日' || record.isHoliday) return { backgroundColor: '#f8f9fa' };
  return { backgroundColor: '#ffffff' };
};

/**
 * ステータスを表示するバッジのCSSデザインを生成する関数
 * @param {string} status - 勤怠ステータス（例: "有給", "出勤"）
 * @returns {Object} Reactのstyleオブジェクト（背景色、文字色、ボーダー）
 */
const getBadgeStyle = (status) => {
  switch (status) {
    case '有給': return { backgroundColor: '#eaf4fc', color: '#2980b9', border: '1px solid #3498db' }; 
    case '欠勤': return { backgroundColor: '#fcebea', color: '#c0392b', border: '1px solid #e74c3c' }; 
    case '出勤': return { backgroundColor: '#e8f8f5', color: '#16a085', border: '1px solid #1abc9c' }; 
    case '休日': return { backgroundColor: '#f2f4f4', color: '#7f8c8d', border: '1px solid #bdc3c7' }; 
    default: return { backgroundColor: 'transparent', color: '#aaa', border: '1px solid #eee' }; 
  }
};

/**
 * 従業員の1ヶ月分の勤務状況をカレンダー形式で表示するテーブルコンポーネント
 * @param {Object} props
 * @param {Array} props.records - 1ヶ月分の日別勤怠データ配列（helper.jsで生成されたもの）
 */
export default function AttendanceTable({ records = [] }) {
  
  /**
   * 1日分の勤務時間をタイムライン（横棒グラフ）として描画する関数
   * 日またぎ（rawRecords）がある場合は、当日の0:00〜24:00の範囲に合わせてバーを切り出す
   * @param {Object} record - 1日分の勤怠データオブジェクト
   * @returns {JSX.Element} タイムラインバーのReact要素
   */
  const renderTimeBar = (record) => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

    return (
        <div style={{ position: 'relative', width: '100%', height: '24px' }}>
            <div style={{ position: 'absolute', top: 0, width: '100%', height: '100%', backgroundColor: '#f0f0f0', borderRadius: '4px' }} />

            {record.rawRecords && record.rawRecords.length > 0 ? (
                record.rawRecords.map((tr, index) => {
                    const sTimeFull = tr.startTime;
                    const eTimeFull = tr.endTime || "";
                    
                    const sDate = sTimeFull.split(' ')[0];
                    const eDate = eTimeFull ? eTimeFull.split(' ')[0] : todayStr;

                    const sTime = sTimeFull.split(' ')[1];
                    const eTime = eTimeFull ? eTimeFull.split(' ')[1] : `${now.getHours()}:${now.getMinutes()}`;

                    let barStart = "";
                    let barEnd = "";

                    if (sDate === eDate) {
                        barStart = sTime;
                        barEnd = eTime;
                    } else {
                        if (record.targetDateStr === sDate) {
                            barStart = sTime;
                            barEnd = "24:00";
                        } else if (record.targetDateStr > sDate && record.targetDateStr < eDate) {
                            barStart = "00:00";
                            barEnd = "24:00";
                        } else if (record.targetDateStr === eDate) {
                            barStart = "00:00";
                            barEnd = eTime;
                        }
                    }

                    if (barStart && barEnd) {
                        const startPercent = timeToPercent(barStart);
                        let endPercent = timeToPercent(barEnd);
                        let widthPercent = endPercent - startPercent;
                        if (widthPercent < 0) widthPercent = 100 - startPercent;
                        if (widthPercent <= 0) widthPercent = 1;

                        return (
                            <div key={index} style={{
                                position: 'absolute',
                                top: 0,
                                left: `${startPercent}%`,
                                width: `${widthPercent}%`,
                                height: '100%',
                                backgroundColor: '#01787c',
                                borderRadius: '2px',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                            }} />
                        );
                    }
                    return null;
                })
            ) : (
                record.startTime && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: `${timeToPercent(record.startTime)}%`,
                        width: `${Math.max(1, timeToPercent(record.endTime || `${now.getHours()}:${now.getMinutes()}`) - timeToPercent(record.startTime))}%`,
                        height: '100%',
                        backgroundColor: '#01787c',
                        borderRadius: '2px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }} />
                )
            )}

            {/* 目盛りの点線 */}
            {[0, 6, 12, 18, 24].map(h => {
                const isEnd = h === 24;
                return (
                    <div key={h} style={{
                        position: 'absolute', top: 0,
                        left: isEnd ? 'auto' : `${(h / 24) * 100}%`, right: isEnd ? '0' : 'auto',
                        height: '100%',
                        borderLeft: isEnd ? 'none' : '1px dashed rgba(0,0,0,0.2)',
                        borderRight: isEnd ? '1px dashed rgba(0,0,0,0.2)' : 'none',
                        zIndex: 3
                    }} />
                );
            })}
        </div>
    );
  };

  /**
   * 勤務時間（開始・終了）をテキスト形式で整形して返す関数
   * 日またぎ勤務の場合は「00:00 - 05:00」のように当日の範囲に収めた文字列を生成する
   * @param {Object} record - 1日分の勤怠データオブジェクト
   * @returns {string|JSX.Element} 整形された時間文字列（例: "09:00 - 18:00"）
   */
  const formatTimeText = (record) => {
    if (record.rawRecords && record.rawRecords.length > 0) {
        const targetDateStr = record.targetDateStr;
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

        const texts = record.rawRecords.map(tr => {
            const sTimeFull = tr.startTime;
            const eTimeFull = tr.endTime || "";
            
            const sDate = sTimeFull.split(' ')[0];
            const eDate = eTimeFull ? eTimeFull.split(' ')[0] : todayStr;

            const sTime = sTimeFull.split(' ')[1];
            const eTime = eTimeFull ? eTimeFull.split(' ')[1] : "(勤務中)";

            if (sDate === eDate) {
                return `${sTime} - ${eTime}`;
            } else {
                if (targetDateStr === sDate) {
                    return `${sTime} - 24:00`;
                } else if (targetDateStr > sDate && targetDateStr < eDate) {
                    return `00:00 - 24:00`;
                } else if (targetDateStr === eDate) {
                    return `00:00 - ${eTime}`;
                }
            }
            return "";
        });
        return texts.filter(t => t).join(' / ');
    }
    
    if (record.startTime) {
        return `${record.startTime} - ${record.endTime || '(勤務中)'}`;
    }
    
    return <span style={{ color: '#ccc' }}>-</span>;
  };

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', fontSize: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
      <thead>
        <tr style={{ backgroundColor: '#01787c', color: 'white' }}>
          <th style={{ padding: '12px 10px', textAlign: 'left', width: '120px' }}>日付</th>
          <th style={{ padding: '12px 10px', textAlign: 'center', width: '80px' }}>状況</th>
          <th style={{ padding: '12px 10px', textAlign: 'center', width: '160px' }}>勤務時間</th>
          <th style={{ padding: '12px 10px', textAlign: 'left' }}>
            <div style={{ marginBottom: '8px' }}>出勤時間</div>
            <div style={{ position: 'relative', width: '100%', height: '14px' }}>
              {[0, 6, 12, 18, 24].map(h => {
                const isEnd = h === 24;
                return (
                  <span key={h} style={{
                    position: 'absolute', bottom: 0,
                    left: isEnd ? 'auto' : `${(h / 24) * 100}%`, right: isEnd ? '0' : 'auto',
                    transform: (h !== 0 && !isEnd) ? 'translateX(-50%)' : 'none',
                    fontSize: '11px', color: 'rgba(255, 255, 255, 0.9)',
                    whiteSpace: 'nowrap', fontWeight: 'normal'
                  }}>
                    {h}時
                  </span>
                );
              })}
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {records.length === 0 ? (
          <tr>
            <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#777' }}>
              データがありません
            </td>
          </tr>
        ) : (
          records.map((record, index) => (
            <tr key={index} style={{ ...getRowStyle(record), borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px 10px', fontWeight: 'bold', color: getDateColor(record) }}>
                {record.date} <span style={{ fontSize: '12px' }}>({record.dayOfWeek})</span>
              </td>
              <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', ...getBadgeStyle(record.status) }}>
                  {record.status}
                </span>
              </td>
              <td style={{ padding: '12px 10px', textAlign: 'center', fontFamily: '"Courier New", Consolas, monospace', fontSize: '14px', color: '#444' }}>
                {formatTimeText(record)}
              </td>
              <td style={{ padding: '12px 10px' }}>
                {renderTimeBar(record)}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}