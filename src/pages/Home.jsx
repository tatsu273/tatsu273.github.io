import React from 'react';
import { PAGE_CONFIGS } from '../utils/constants';

/**
 * ログイン直後などに表示されるダッシュボード（ホーム）コンポーネント
 * 現在出勤中の従業員リストや、クイックアクセスのためのショートカットを表示する
 * @param {Object} props
 * @param {Function} props.setCurrentMain - メインメニューの状態を更新する関数
 * @param {Function} props.setCurrentSub - サブ画面の状態を更新する関数
 * @param {Array<string>} props.shortcuts - 設定されたショートカットメニューのID配列
 * @param {Object} props.userStatuses - 各従業員の現在の出退勤ステータス
 * @param {Array<Object>} props.timeRecords - 全従業員の勤務記録データ配列
 * @returns {JSX.Element}
 */
export default function Home({
    setCurrentMain,
    setCurrentSub,
    shortcuts,
    userStatuses,
    timeRecords = []
}) {
    /** @type {Array<[string, string]>} "OUT" 以外のステータス（出勤中）の従業員の配列 */
    const workingEmployees = Object.entries(userStatuses).filter(([name, status]) => status !== 'OUT');

    return(
        <div>
          <h2 style={{ borderBottom: '2px solid #01787c', paddingBottom: '10px', marginBottom: '20px' }}>勤怠管理システム</h2>
          
          <h3 style={{ color: '#555', marginBottom: '15px' }}>ショートカット</h3>
          <div className="shortcut-container">
            {shortcuts.map((pageId, index) => {
              const config = PAGE_CONFIGS[pageId];
              if (!config) return null;

              return (
                <button 
                  key={index}
                  className="shortcut-btn" 
                  onClick={() => { 
                    setCurrentMain(config.main);
                    setCurrentSub(pageId);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="72" viewBox="0 -960 960 960" width="72">
                    <path d={config.iconPath} />
                  </svg>
                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>

          <h3 style={{ color: '#555', marginTop: '30px', marginBottom: '15px' }}>現在の出勤状況</h3>
          <table className="table" style={{ width: '100%', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#01787c', color: 'white' }}>
                <th style={{ padding: '12px', border: '1px solid #ccc' }}>氏名</th>
                <th style={{ padding: '12px', border: '1px solid #ccc' }}>出勤状況</th>
              </tr>
            </thead>
            <tbody>
              {workingEmployees.length === 0 ? (
                <tr>
                  <td colSpan="2" style={{ padding: '15px', textAlign: 'center', color: '#777' }}>現在、出勤中の従業員はいません</td>
                </tr>
              ) : (
                workingEmployees.map(([name, status]) => {
                  let displayStatus = "出勤中";

                  const userRecords = timeRecords.filter(record => record.name === name);
                  
                  if (userRecords.length > 0) {
                    const latestRecord = userRecords[userRecords.length - 1];
                    if (latestRecord.startTime && !latestRecord.endTime) {
                      const timePart = latestRecord.startTime.split(' ')[1]; 
                      if (timePart) {
                        displayStatus = `${timePart}`;
                      }
                    }
                  }

                  return (
                    <tr key={name}>
                      <td style={{ padding: '12px', border: '1px solid #ccc', fontWeight: 'bold' }}>{name}</td>
                      <td style={{ padding: '12px', border: '1px solid #ccc' }}>{displayStatus}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
    );
}