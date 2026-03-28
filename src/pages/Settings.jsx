import React from 'react';
import { PAGE_CONFIGS, STORAGE_KEYS } from '../utils/constants';

/**
 * システムの設定（ショートカットの変更やデータの初期化）を行うコンポーネント
 * @param {Object} props
 * @param {Array<string>} props.shortcuts - 現在設定されているショートカットのID配列
 * @param {Function} props.setShortcuts - ショートカット設定を更新する関数
 * @param {Function} props.setEmployees - 全従業員データステートを更新する（初期化に使用）関数
 * @param {Function} props.setTimeRecords - 全勤務記録データステートを更新する（初期化に使用）関数
 * @param {Function} props.setUserStatuses - 全出退勤状況ステートを更新する（初期化に使用）関数
 * @returns {JSX.Element}
 */
export default function Settings({
  shortcuts,
  setShortcuts,
  setEmployees,
  setTimeRecords,
  setUserStatuses
}) {
  const handleShortcutSave = (e) => {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEYS.SHORTCUTS, JSON.stringify(shortcuts));
    alert("ショートカット設定を更新しました");
  };
  
  /**
   * ローカルストレージおよびすべてのステートを完全に初期化（削除）する関数
   */
  const deleteAllData = () => {
    if(window.confirm("すべてのデータを削除してもよろしいですか？")){
      if(window.confirm("本当にすべてのデータを削除してもよろしいですか？")){
        localStorage.clear(); 
        setEmployees([]);
        setTimeRecords([]);
        setUserStatuses({});
        alert("初期化が完了しました。");
      }
    }
  };
  const generateSampleData = () => {
    if(!window.confirm("現在のデータはすべて消去され、サンプルデータに置き換わります。よろしいですか？")) return;

    // 乱数生成ヘルパー関数
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffle = (array) => [...array].sort(() => 0.5 - Math.random());
    const formatDateTime = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const h = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      return `${y}-${m}-${d} ${h}:${min}`;
    };


    const kanjiNums = [
      "太", "次", "三", "四", "五", "六", "七", "八", "九", "十",
      "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
      "二十一", "二十二", "二十三", "二十四", "二十五", "二十六", "二十七", "二十八", "二十九", "三十"
    ];
    
    const depts = ["営業部", "開発部", "総務部", "人事部", "経理部"];
    

    const generatedAges = Array.from({ length: 30 }, () => getRandomInt(22, 60)).sort((a, b) => b - a);

    const sampleEmployees = kanjiNums.map((k, index) => ({
      empCode: "EMP" + String(index + 1).padStart(3, '0'), // 修正: "EMP"を先頭に追加
      name: `勤怠${k}郎`,
      dept: depts[getRandomInt(0, depts.length - 1)],
      age: generatedAges[index],
      paidLeaveDays: 10, 
      absenceCount: 0,   // 追加: 欠勤回数の初期値
      lateCount: 0       // 追加: 遅刻回数の初期値
    }));

    const sampleTimeRecords = [];
    const sampleRequests = [];
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1); // 1年前の年に設定
    startDate.setHours(0, 0, 0, 0); // 時間を 00:00:00 に揃える
    const endDate = new Date();
    
    const allDays = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      allDays.push(new Date(d));
    }

    const weekdays = allDays.filter(d => d.getDay() !== 0 && d.getDay() !== 6);
    const weekends = allDays.filter(d => d.getDay() === 0 || d.getDay() === 6);

    sampleEmployees.forEach(emp => {
      const absencesCount = getRandomInt(0, 5);
      const paidLeavesCount = getRandomInt(0, 10);
      const holidayWorkCount = getRandomInt(0, 10);

      const shuffledWeekdays = shuffle(weekdays);
      const chosenAbsences = shuffledWeekdays.slice(0, absencesCount).map(d => d.getTime());
      const chosenPaidLeaves = shuffledWeekdays.slice(absencesCount, absencesCount + paidLeavesCount).map(d => d.getTime());

      const chosenHolidayWorks = shuffle(weekends).slice(0, holidayWorkCount).map(d => d.getTime());

      allDays.forEach(day => {
        const time = day.getTime();
        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
        
        const isAbsence = chosenAbsences.includes(time);
        const isPaidLeave = chosenPaidLeaves.includes(time);
        const isHolidayWork = chosenHolidayWorks.includes(time);

        if (isPaidLeave) {
          const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
          sampleRequests.push({ name: emp.name, date: dateStr, type: '有給' });
          emp.paidLeaveDays -= 1; 
          return;
        }
        if (isAbsence) return; 

        if ((!isWeekend && !isAbsence && !isPaidLeave) || isHolidayWork) {

          const start = new Date(day);
          start.setHours(getRandomInt(8, 9), getRandomInt(30, 59), 0);
          
          const end = new Date(day);
          end.setHours(getRandomInt(17, 20), getRandomInt(30, 59), 0);

          const diffMinutes = Math.floor((end - start) / 60000);
          const diffText = `${Math.floor(diffMinutes / 60)}時間${diffMinutes % 60}分`;

          sampleTimeRecords.push({
            name: emp.name,
            startTime: formatDateTime(start),
            endTime: formatDateTime(end),
            diffText: diffText
          });
        }
      });
    });

    sampleTimeRecords.sort((a, b) => a.startTime.localeCompare(b.startTime));

    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(sampleEmployees));
    localStorage.setItem(STORAGE_KEYS.TIME_RECORDS, JSON.stringify(sampleTimeRecords));
    localStorage.setItem(STORAGE_KEYS.STATUS, JSON.stringify({}));
    if(STORAGE_KEYS.REQUESTS) {
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(sampleRequests));
    }

    setEmployees(sampleEmployees);
    setTimeRecords(sampleTimeRecords);
    setUserStatuses({});

    alert("サンプルデータの生成が完了しました");
  };
  return (
    <div id="page-settings" className="page active">
      <h2 style={{ borderBottom: '2px solid #01787c', paddingBottom: '10px' }}>設定画面</h2>
      
      <h3>ショートカットボタンの設定</h3>
      <p style={{ fontSize: '14px', color: '#666' }}>ホーム画面に表示する4つのボタンを好きな画面に変更できます。</p>

      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '12px', backgroundColor: '#f9f9f9' }}>
        <form onSubmit={handleShortcutSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {[0, 1, 2, 3].map((num) => (
              <div key={num}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                  ボタン {num + 1}
                </label>
                <select 
                  value={shortcuts[num]} 
                  onChange={(e) => {
                    const newShortcuts = [...shortcuts];
                    newShortcuts[num] = e.target.value;
                    setShortcuts(newShortcuts);
                  }}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  {Object.entries(PAGE_CONFIGS).map(([id, cfg]) => (
                    <option key={id} value={id}>{cfg.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <button type="submit" className="filled-btn" style={{ backgroundColor: '#01787c', color: 'white', padding: '10px 30px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
              設定を保存して適用
            </button>
          </div>
        </form>
      </div>

      <h3>データの初期化</h3>
      <p style={{ fontSize: '14px', color: '#666' }}>すべてのデータの初期化ができます</p>
      <button className="btn" style={{color: 'red', cursor: 'pointer', padding: '8px 16px'}} onClick={deleteAllData}>
        データの初期化
      </button>
      <h3>サンプルデータ生成</h3>
      <p style={{ fontSize: '14px', color: '#666' }}>30人分の勤務記録（今日から過去1年分）を自動生成します</p>
      <button className="filled-btn" style={{ backgroundColor: '#3498db', color: 'white', padding: '10px 20px', border: 'none' }} onClick={generateSampleData}>
        サンプルデータを一括生成する
      </button>
    </div>
  );
}