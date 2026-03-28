import React, { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * 従業員が出勤・退勤の打刻（スタンプ）を行うためのコンポーネント
 * @param {Object} props
 * @param {Array<Object>} props.employees - 登録されている全従業員のデータ配列
 * @param {Array<Object>} props.timeRecords - 全従業員の勤務記録データの配列
 * @param {Function} props.setTimeRecords - 勤務記録データステートを更新する関数
 * @param {Object} props.userStatuses - 各従業員の現在の出退勤状況（出勤中か退勤済みか）
 * @param {Function} props.setUserStatuses - 出退勤状況ステートを更新する関数
 * @returns {JSX.Element}
 */
export default function Stamp({ employees, timeRecords, setTimeRecords, userStatuses, setUserStatuses }) {
  /** @type {[Date, Function]} 現在の時刻をリアルタイムで保持するステート */
  const [now, setNow] = useState(new Date());
  /** @type {[string, Function]} 打刻対象として選択された従業員名 */
  const [selectedStampUser, setSelectedStampUser] = useState("");

  // 1秒ごとに現在時刻を更新するタイマー
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /**
   * 打刻ボタン（出勤・退勤）が押された時の処理
   * 該当者のステータスに応じた記録を生成し、ローカルストレージへ保存する
   */
  const handleStampAction = () => {
    if (!selectedStampUser) return;
    /**
     * Dateオブジェクトを指定の文字列フォーマットに変換する内部関数
     * @param {Date} date
     * @returns {string} フォーマット済みの文字列 (例: "2024-03-27 09:00")
     */
    const formatDateTime = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const h = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      return `${y}-${m}-${d} ${h}:${min}`;
    };

    const currentStatus = userStatuses[selectedStampUser] || 'OUT';
    const isOut = currentStatus === 'OUT';
    const displayTime = formatDateTime(now);

    if (isOut) {
      const newStatuses = { ...userStatuses, [selectedStampUser]: displayTime };
      setUserStatuses(newStatuses);
      localStorage.setItem(STORAGE_KEYS.STATUS, JSON.stringify(newStatuses));

      const newRecord = { name: selectedStampUser, startTime: displayTime, endTime: "", diffText: "" };
      let updatedRecords = [...timeRecords, newRecord];
      if (updatedRecords.length > 10000) {
          updatedRecords = updatedRecords.slice(-10000);
      }
      setTimeRecords(updatedRecords);
      localStorage.setItem(STORAGE_KEYS.TIME_RECORDS, JSON.stringify(updatedRecords));

      alert(`${selectedStampUser}: 出勤`);
    } else {
      const newStatuses = { ...userStatuses, [selectedStampUser]: 'OUT' };
      setUserStatuses(newStatuses);
      localStorage.setItem(STORAGE_KEYS.STATUS, JSON.stringify(newStatuses));

      const targetIndex = [...timeRecords].reverse().findIndex(r => r.name === selectedStampUser && r.endTime === "");

      if (targetIndex !== -1) {
        const updatedRecords = [...timeRecords];
        const actualIndex = timeRecords.length - 1 - targetIndex;
        const record = updatedRecords[actualIndex];

        record.endTime = displayTime;
        const start = new Date(record.startTime.replace(/-/g, '/'));
        const end = new Date(record.endTime.replace(/-/g, '/'));
        const diffMs = end - start; 
        
        const diffMins = Math.floor(diffMs / 60000);
        const diffH = Math.floor(diffMins / 60);     
        const diffM = diffMins % 60;                 
        
        record.diffText = `${diffH}時間${diffM}分`;

        setTimeRecords(updatedRecords);
        localStorage.setItem(STORAGE_KEYS.TIME_RECORDS, JSON.stringify(updatedRecords));

        alert(`${selectedStampUser}: 退勤`);
      } else {
        alert("出勤記録が見つかりません。");
      }
    }
    setSelectedStampUser("");
  };

  const status = selectedStampUser ? (userStatuses[selectedStampUser] || 'OUT') : null;
  const isOut = status === 'OUT';
  const btnColor = !selectedStampUser ? '#bdc3c7' : (isOut ? '#3498db' : '#e74c3c');
  const btnText = !selectedStampUser ? '出勤' : (isOut ? '出勤' : '退勤');
  const btnBoxShadow = selectedStampUser ? `0 6px ${isOut ? '#2980b9' : '#c0392b'}` : 'none';

  return (
    <div>
      <h2 style={{ borderBottom: '2px solid #01787c', paddingBottom: '10px' }}>打刻</h2>
      
      <div className="clock-container">
        <div className="current-date">
          {now.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
        </div>
        <div className="current-time">
          {now.toLocaleTimeString('ja-JP', { hour12: false })}
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>社員名:</p>
        <select 
          value={selectedStampUser}
          onChange={(e) => setSelectedStampUser(e.target.value)}
          style={{ fontSize: '18px', padding: '10px', minWidth: '250px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '20px' }}
        >
          <option value="">選択してください</option>
          {employees.map((emp) => (
            <option key={emp.empCode} value={emp.name}>{emp.name}</option>
          ))}
        </select>
        
        <br />

        <button 
          onClick={handleStampAction}
          disabled={!selectedStampUser}
          className="btn"
          style={{
            fontSize: '24px', padding: '15px 50px', borderRadius: '50px', 
            backgroundColor: btnColor, color: 'white', border: 'none', 
            fontWeight: 'bold', cursor: selectedStampUser ? 'pointer' : 'not-allowed', 
            transition: '0.3s',
            boxShadow: btnBoxShadow,
            transform: 'none'
          }}
        >
          {btnText}
        </button>
      </div>
    </div>
  );
}