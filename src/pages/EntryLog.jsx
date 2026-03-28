import React, { useState } from 'react';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * すべての従業員の勤務記録（打刻履歴）を一覧表示し、個別の削除を行うコンポーネント
 * @param {Object} props
 * @param {Array<Object>} props.timeRecords - 全従業員の打刻データ配列
 * @param {Function} props.setTimeRecords - 打刻データステートを更新する関数
 * @returns {JSX.Element}
 */
export default function EntryLog({ timeRecords, setTimeRecords }) {
    /** @type {[number, Function]} 現在表示しているページ番号 */
    const [logCurrentPage, setLogCurrentPage] = useState(1);
    /** @type {[boolean, Function]} 履歴を新しい順（降順）で表示するかどうかのフラグ */
    const [isLogReverseOrder, setIsLogReverseOrder] = useState(true);
    /** @type {number} 1ページあたりに表示する記録の最大件数 */
    const LOGS_PER_PAGE = 10;

    /**
     * 指定された打刻記録を削除し、ローカルストレージを更新する関数
     * @param {number} index - 全打刻データ配列における対象データの元のインデックス
     * @param {string} name - 削除対象の従業員名（確認ダイアログ用）
     */
    const handleDeleteRecord = (index, name) => {
      if (window.confirm(`${name}さんのこの記録を削除してもよろしいですか？`)) {
        const updatedRecords = timeRecords.filter((_, i) => i !== index);
        setTimeRecords(updatedRecords);
        localStorage.setItem(STORAGE_KEYS.TIME_RECORDS, JSON.stringify(updatedRecords));
        
        const totalPages = Math.ceil(updatedRecords.length / LOGS_PER_PAGE);
        if (logCurrentPage > totalPages && totalPages > 0) {
          setLogCurrentPage(totalPages);
        }
      }
    };

    const displayRecords = isLogReverseOrder ? [...timeRecords].reverse() : [...timeRecords];
    const totalPages = Math.ceil(displayRecords.length / LOGS_PER_PAGE);
    const startIndex = (logCurrentPage - 1) * LOGS_PER_PAGE;
    const paginatedRecords = displayRecords.slice(startIndex, startIndex + LOGS_PER_PAGE);

    return (
        <div>
          <h2 style={{ borderBottom: '2px solid #01787c', paddingBottom: '10px' }}>勤務記録履歴</h2>
          
          <div style={{ textAlign: 'right', marginBottom: '15px' }}>
            <button 
              className="btn-sort" 
              onClick={() => {
                setIsLogReverseOrder(!isLogReverseOrder);
                setLogCurrentPage(1); 
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', cursor: 'pointer', backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <span>{isLogReverseOrder ? '新しい順' : '古い順'}</span>
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor" style={{ transform: isLogReverseOrder ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}>
                <path d="M479.33-240 238.67-480.67 285.33-528l161.34 159.33V-758h66.66v390.67l160-160L720-480.67 479.33-240Z"/>
              </svg>
            </button>
          </div>

          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: 'white' }}>
            <thead>
              <tr style={{ backgroundColor: '#01787c', color: 'white' }}>
                <th style={{ padding: '10px', border: '1px solid #ccc' }}>名前</th>
                <th style={{ padding: '10px', border: '1px solid #ccc' }}>開始時刻</th>
                <th style={{ padding: '10px', border: '1px solid #ccc' }}>終了時刻</th>
                <th style={{ padding: '10px', border: '1px solid #ccc' }}>勤務時間</th>
                <th style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'center' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>記録がありません</td></tr>
              ) : (
                paginatedRecords.map((record, displayIndex) => {
                  const actualIndexInDisplay = startIndex + displayIndex;
                  const originalIndex = isLogReverseOrder ? (timeRecords.length - 1 - actualIndexInDisplay) : actualIndexInDisplay;

                  return (
                    <tr key={originalIndex} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px', border: '1px solid #ccc' }}>{record.name}</td>
                      <td style={{ padding: '10px', border: '1px solid #ccc' }}>{record.startTime}</td>
                      
                      <td style={{ padding: '10px', border: '1px solid #ccc' }}>
                        {record.endTime ? (
                          record.endTime
                        ) : (
                          <span style={{ color: '#01787c', fontWeight: 'bold' }}>出勤中</span>
                        )}
                      </td>
                      
                      <td style={{ padding: '10px', border: '1px solid #ccc' }}>
                        {record.diffText ? record.diffText : '-'}
                      </td>
                      
                      <td style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'center' }}>
                        <button className="btn" style={{color: 'red'}} onClick={() => handleDeleteRecord(originalIndex, record.name)}>削除</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* ページネーションの表示条件 */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '15px' }}>
              <button 
                onClick={() => setLogCurrentPage(logCurrentPage - 1)} disabled={logCurrentPage === 1}
                style={{ padding: '8px 16px', cursor: logCurrentPage === 1 ? 'not-allowed' : 'pointer', backgroundColor: logCurrentPage === 1 ? '#f1f1f1' : '#01787c', color: logCurrentPage === 1 ? '#aaa' : 'white', border: 'none', borderRadius: '4px' }}
              >前へ</button>
              <span style={{ fontWeight: 'bold', color: '#333' }}>{logCurrentPage} / {totalPages} ページ</span>
              <button 
                onClick={() => setLogCurrentPage(logCurrentPage + 1)} disabled={logCurrentPage === totalPages}
                style={{ padding: '8px 16px', cursor: logCurrentPage === totalPages ? 'not-allowed' : 'pointer', backgroundColor: logCurrentPage === totalPages ? '#f1f1f1' : '#01787c', color: logCurrentPage === totalPages ? '#aaa' : 'white', border: 'none', borderRadius: '4px' }}
              >次へ</button>
            </div>
          )}
        </div>
    );
}