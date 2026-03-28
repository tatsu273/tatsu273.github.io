import React, { useState } from 'react';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * 勤務記録を手動で入力・登録するためのフォームコンポーネント
 * @param {Object} props
 * @param {Array<Object>} props.employees - 登録されている全従業員のデータ配列
 * @param {Array<Object>} props.timeRecords - 全従業員の勤務記録データの配列
 * @param {Function} props.setTimeRecords - 勤務記録データステートを更新する関数
 * @returns {JSX.Element}
 */
export default function ManualEntry({ employees, timeRecords, setTimeRecords }) {
  /** @type {[{name: string, startTime: string, endTime: string}, Function]} 手動入力フォームの状態 */
  const [calcForm, setCalcForm] = useState({ name: '', startTime: '', endTime: '' });

  const handleRegisterRecord = (e) => {
    e.preventDefault();
    const { name, startTime, endTime } = calcForm;

    if (!name || !startTime || !endTime) {
      alert("名前と両方の日時を入力してください");
      return;
    }

    const date1 = new Date(startTime);
    const date2 = new Date(endTime);
    date1.setSeconds(0, 0);
    date2.setSeconds(0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    if (date1 > todayEnd || date2 > todayEnd) {
      alert("明日以降の記録は登録できません。当日分までの日時を入力してください。");
      return;
    }
    const diffMs = date2 - date1;
    if (diffMs <= 0) {
      alert("開始時刻は終了時刻より前の日時を入力してください");
      return;
    }

    const formatDateTime = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const h = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      return `${y}-${m}-${d} ${h}:${min}`;
    };

    const displayVal1 = formatDateTime(date1);
    const displayVal2 = formatDateTime(date2);

    const startDateStr = displayVal1.split(' ')[0];
    const savedRequests = JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
    const isPaidLeaveDay = savedRequests.some(
      req => req.name === name && req.date === startDateStr && req.type === '有給'
    );

    if (isPaidLeaveDay) {
      const proceed = window.confirm(`${name}さんはこの日（${startDateStr}）に有給申請がされています。\n勤務記録を登録してもよろしいですか？`);
      if (!proceed) {
        return;
      }
    }

    const diffMinutes = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMinutes / 60);
    const diffM = diffMinutes % 60;
    const diffText = `${diffH}時間${diffM}分`;

    const newRecord = {
      name,
      startTime: displayVal1,
      endTime: displayVal2,
      diffText
    };

    let updatedRecords = [...timeRecords, newRecord];
    if (updatedRecords.length > 10000) {
        updatedRecords = updatedRecords.slice(-10000);
    }

    setTimeRecords(updatedRecords);
    
    localStorage.setItem(STORAGE_KEYS.TIME_RECORDS, JSON.stringify(updatedRecords));

    alert(`${name}さんの記録を登録しました。`);
    setCalcForm({ name: '', startTime: '', endTime: '' });
  };

  return (
    <div>
      <h2 style={{ borderBottom: '2px solid #01787c', paddingBottom: '10px' }}>勤務記録手打</h2>
      <p style={{ fontSize: '14px', color: '#666' }}>勤務記録を手打ちで入力できます</p>

      <form onSubmit={handleRegisterRecord} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'left' }}>
        <h3 style={{ marginTop: 0 }}>入力フォーム</h3>

        <div className="form-group" style={{ marginBottom: '25px', display: 'flex', alignItems: 'center' }}>
          <label style={{ width: '120px', fontWeight: 'bold' }}>従業員名:</label>
          <select 
            value={calcForm.name} 
            onChange={(e) => setCalcForm({...calcForm, name: e.target.value})}
            style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="">選択してください</option>
            {employees.map((emp) => (
              <option key={emp.empCode} value={emp.name}>{emp.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: '25px', display: 'flex', alignItems: 'center' }}>
          <label style={{ width: '120px', fontWeight: 'bold' }}>開始日時:</label>
          <input 
            type="datetime-local" 
            value={calcForm.startTime} 
            onChange={(e) => setCalcForm({...calcForm, startTime: e.target.value})}
            style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '25px', display: 'flex', alignItems: 'center' }}>
          <label style={{ width: '120px', fontWeight: 'bold' }}>終了日時:</label>
          <input 
            type="datetime-local" 
            value={calcForm.endTime} 
            onChange={(e) => setCalcForm({...calcForm, endTime: e.target.value})}
            style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            type="submit" 
            className="filled-btn" 
            style={{ backgroundColor: '#01787c', color: 'white', padding: '10px 60px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            登録
          </button>
        </div>
      </form>
    </div>
  );
}