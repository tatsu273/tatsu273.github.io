import React, { useState } from 'react';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * 従業員が有給休暇を申請するためのフォームコンポーネント
 * @param {Object} props
 * @param {Array<Object>} props.employees - 登録されている全従業員のデータ配列
 * @param {Function} props.setEmployees - 従業員データ（有給残日数など）を更新する関数
 * @returns {JSX.Element}
 */
export default function Application({ employees, setEmployees }) {
    
    /** * @type {[{name: string, date: string}, Function]}
     * 有給申請フォームの入力状態（対象者名と申請日）を管理するステート
     */
    const [appForm, setAppForm] = useState({ name: '', date: '' });
    
    const REQUEST_STORAGE_KEY = STORAGE_KEYS.REQUESTS;

    const handleAppSubmit = (e) => {
        e.preventDefault();

        if (!appForm.name || !appForm.date) {
            alert("氏名と申請日を選択してください");
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const OneDaysLater = new Date(today);
        OneDaysLater.setDate(today.getDate() + 1); 

        const selectedDateObj = new Date(appForm.date);
        selectedDateObj.setHours(0, 0, 0, 0);

        if (selectedDateObj < OneDaysLater) {
            alert("有給申請は翌日以降の日付を選択してください。");
            return;
        }

        const dayOfWeek = selectedDateObj.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            alert("土日などの休日には有給申請はできません。");
            return;
        }

        const isConfirmed = window.confirm(
            "有給申請は一度提出すると取り消すことができません。\n本当に申請してもよろしいですか？"
        );
        if (!isConfirmed) {
            return;
        }

        const empIndex = employees.findIndex(emp => emp.name === appForm.name);
        if (empIndex === -1) {
            alert("従業員が見つかりません");
            return;
        }

        let updatedEmployees = [...employees];
        const targetEmp = { ...updatedEmployees[empIndex] };

        if (targetEmp.paidLeaveDays > 0) {
            targetEmp.paidLeaveDays -= 1;
        } else {
            alert("有給残日数がありません。");
            return;
        }

        updatedEmployees[empIndex] = targetEmp;
        setEmployees(updatedEmployees);

        const savedRequests = JSON.parse(localStorage.getItem(REQUEST_STORAGE_KEY) || '[]');
        savedRequests.push({
            name: appForm.name,
            date: appForm.date,
            type: '有給', 
            reason: ''
        });
        localStorage.setItem(REQUEST_STORAGE_KEY, JSON.stringify(savedRequests));

        alert(`${appForm.name}さんの有給申請を登録しました。`);
        setAppForm({ name: '', date: '' });
    };

    return (
        <div className="page-content fade-in">
            <h2 style={{ borderBottom: '2px solid #01787c', paddingBottom: '10px' }}>有給申請</h2>
            <p style={{ fontSize: '14px', color: '#666' }}>有給休暇の申請ができます。</p>
            <p style={{ fontSize: '14px', color: '#666' }}>※申請は取り消すことができません。</p>
            <p style={{ fontSize: '14px', color: '#666' }}>※申請された日の勤務記録は反映されません。</p>

            <form 
              onSubmit={handleAppSubmit}
              style={{
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '24px',
                backgroundColor: '#f9fafb',
                marginTop: '20px'
              }}
            >
              <h3 style={{ marginTop: 0 }}>申請フォーム</h3>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'inline-block', width: '80px', fontWeight: 'bold' }}>氏名：</label>
                <select 
                  value={appForm.name}
                  onChange={(e) => setAppForm({...appForm, name: e.target.value})}
                  required
                  style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                >
                  <option value="">選択してください</option>
                  {employees.map(emp => (
                    <option key={emp.empCode} value={emp.name}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'inline-block', width: '80px', fontWeight: 'bold' }}>申請日：</label>
                <input 
                  type="date"
                  value={appForm.date}
                  onChange={(e) => setAppForm({...appForm, date: e.target.value})}
                  required
                  style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>

              <div style={{ marginTop: '20px' }}>
                  <button 
                    type="submit" 
                    className="filled-btn" 
                    style={{ 
                      backgroundColor: '#01787c', 
                      color: 'white', 
                      padding: '10px 24px', 
                      fontSize: '14px', 
                      fontWeight: 'bold',
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer' 
                    }}
                  >
                    申請する
                  </button>
              </div>
            </form>
        </div>
    );
}