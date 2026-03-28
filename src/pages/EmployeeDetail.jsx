import React, { useState } from 'react';
import AttendanceTable from '../components/AttendanceTable';
import { generateTableData } from '../utils/helper'; 

/**
 * 選択された従業員の詳細な勤怠情報（月別カレンダー、残有給日数、欠勤回数など）を表示するコンポーネント
 * @param {Object} props
 * @param {Object} props.selectedEmployee - 選択中の従業員データオブジェクト
 * @param {Function} props.setCurrentSub - サブ画面を切り替えるための状態更新関数
 * @param {Array<Object>} props.timeRecords - 全従業員の勤務情報データの配列
 * @returns {JSX.Element|null}
 */
export default function EmployeeDetail({ 
    selectedEmployee, 
    setCurrentSub,
    timeRecords = [] 
}) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    const [displayYear, setDisplayYear] = useState(currentYear);
    const [displayMonth, setDisplayMonth] = useState(currentMonth);

    if (!selectedEmployee) return null;

    let tableRecords = generateTableData(selectedEmployee.name, displayYear, displayMonth);

    const now = new Date();
    const currentY = now.getFullYear();
    const currentM = String(now.getMonth() + 1).padStart(2, '0');
    const currentD = String(now.getDate()).padStart(2, '0');
    const todayStr = `${currentY}-${currentM}-${currentD}`;

    if (timeRecords.length > 0) {
        tableRecords = tableRecords.map(record => {
            const dateParts = record.date.split('/');
            if (dateParts.length === 2) {
                const m = String(dateParts[0]).padStart(2, '0');
                const d = String(dateParts[1]).padStart(2, '0');
                const targetDateStr = `${displayYear}-${m}-${d}`;

                const overlappingRecords = timeRecords.filter(tr => {
                    if (tr.name !== selectedEmployee.name || !tr.startTime) return false;
                    const sDate = tr.startTime.split(' ')[0];
                    const eDate = tr.endTime ? tr.endTime.split(' ')[0] : todayStr;
                    return targetDateStr >= sDate && targetDateStr <= eDate;
                });

                if (overlappingRecords.length > 0) {
                    overlappingRecords.sort((a, b) => a.startTime.localeCompare(b.startTime));

                    return {
                        ...record,
                        status: '出勤',
                        targetDateStr: targetDateStr,
                        rawRecords: overlappingRecords
                    };
                }
            }
            return record;
        });
    }

    let totalWorkedMinutes = 0;
    
    if (timeRecords.length > 0) {
        const monthStart = new Date(displayYear, displayMonth - 1, 1, 0, 0, 0, 0);
        const monthEnd = new Date(displayYear, displayMonth, 0, 23, 59, 59, 999);
        
        /**
         * 文字列を安全にDateオブジェクトに変換する関数
         * @param {string} dateStr - 変換対象の文字列
         * @returns {Date}
         */
        const parseDateSafe = (dateStr) => {
            if (!dateStr) return new Date();
            const parts = dateStr.trim().split(' ');
            if (parts.length === 2) {
                return new Date(`${parts[0]}T${parts[1]}:00`);
            }
            return new Date(dateStr);
        };

        const targetRecords = timeRecords.filter(tr => tr.name === selectedEmployee.name && tr.startTime);
        const timeSegments = [];

        targetRecords.forEach(tr => {
            const trStartObj = parseDateSafe(tr.startTime);
            const trEndObj = tr.endTime ? parseDateSafe(tr.endTime) : new Date();
            
            if (trStartObj <= monthEnd && trEndObj >= monthStart) {
                const segStart = trStartObj < monthStart ? monthStart.getTime() : trStartObj.getTime();
                const segEnd = trEndObj > monthEnd ? monthEnd.getTime() : trEndObj.getTime();
                if (segStart < segEnd) {
                    timeSegments.push({ start: segStart, end: segEnd });
                }
            }
        });
        
        if (timeSegments.length > 0) {
            timeSegments.sort((a, b) => a.start - b.start);
            
            const mergedSegments = [timeSegments[0]];
            for (let i = 1; i < timeSegments.length; i++) {
                const current = timeSegments[i];
                const lastMerged = mergedSegments[mergedSegments.length - 1];
                
                if (current.start <= lastMerged.end) {
                    lastMerged.end = Math.max(lastMerged.end, current.end);
                } else {
                    mergedSegments.push(current);
                }
            }
            
            let totalMs = 0;
            mergedSegments.forEach(seg => {
                totalMs += (seg.end - seg.start);
            });
            
            totalWorkedMinutes = Math.floor(totalMs / 60000);
        }
    }
    

    const displayTotalHours = Math.floor(totalWorkedMinutes / 60);
    const displayTotalMinutes = totalWorkedMinutes % 60;

    const monthlyAbsenceCount = tableRecords.filter(record => record.status === '欠勤').length;

    const minYear = currentMonth === 12 ? currentYear : currentYear - 1;
    const minMonth = currentMonth === 12 ? 1 : currentMonth + 1;

    const maxYear = currentYear + 1;
    const maxMonth = currentMonth;

    const canGoPrev = displayYear > minYear || (displayYear === minYear && displayMonth > minMonth);
    const canGoNext = displayYear < maxYear || (displayYear === maxYear && displayMonth < maxMonth);
    
    /**
     * カレンダーを前の月に切り替える関数
     */
    const handlePrevMonth = () => {
        if (canGoPrev) {
            if (displayMonth === 1) {
                setDisplayMonth(12);
                setDisplayYear(displayYear - 1);
            } else {
                setDisplayMonth(displayMonth - 1);
            }
        }
    };
    /**
     * カレンダーを次の月に切り替える関数
     */
    const handleNextMonth = () => {
        if (canGoNext) {
            if (displayMonth === 12) {
                setDisplayMonth(1);
                setDisplayYear(displayYear + 1);
            } else {
                setDisplayMonth(displayMonth + 1);
            }
        }
    };

    return (
        <div className="page-content fade-in">
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid #01787c', paddingBottom: '10px', marginBottom: '25px' }}>
                    <h2 style={{ margin: 0 }}>
                        {selectedEmployee.name} さんの勤務情報
                    </h2>
                    <button 
                        className="btn" 
                        onClick={() => setCurrentSub('page-record')}
                        style={{ 
                            color: '#01787c', padding: '8px 20px', fontSize: '14px',
                            borderRadius: '4px', border: '2px solid #01787c', cursor: 'pointer', fontWeight: 'bold',
                            display: 'inline-flex', alignItems: 'center', gap: '5px'
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18" fill="currentColor">
                            <path d="M400-240 160-480l240-240 56 58-142 142h486v80H314l142 142-56 58Z"/>
                        </svg>
                        一覧に戻る
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                    <div style={{ flex: 1, padding: '15px 20px', backgroundColor: '#eaf4fc', borderRadius: '8px', borderLeft: '6px solid #3498db', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '13px', color: '#555', marginBottom: '5px', fontWeight: 'bold' }}>残有給日数</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#333' }}>
                            {selectedEmployee.paidLeaveDays}<span style={{fontSize: '16px', fontWeight: 'normal', color: '#666', marginLeft: '4px'}}>日</span>
                        </div>
                    </div>

                    <div style={{ flex: 1, padding: '15px 20px', backgroundColor: '#f0fcf4', borderRadius: '8px', borderLeft: '6px solid #2ecc71', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '13px', color: '#555', marginBottom: '5px', fontWeight: 'bold' }}>総勤務時間（当月）</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#333' }}>
                            {displayTotalHours}<span style={{fontSize: '16px', fontWeight: 'normal', color: '#666', marginLeft: '4px', marginRight: '8px'}}>時間</span>
                            {displayTotalMinutes}<span style={{fontSize: '16px', fontWeight: 'normal', color: '#666', marginLeft: '4px'}}>分</span>
                        </div>
                    </div>
                    
                    <div style={{ flex: 1, padding: '15px 20px', backgroundColor: '#fcebea', borderRadius: '8px', borderLeft: '6px solid #e74c3c', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '13px', color: '#555', marginBottom: '5px', fontWeight: 'bold' }}>欠勤回数（当月）</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#333' }}>
                            {monthlyAbsenceCount}<span style={{fontSize: '16px', fontWeight: 'normal', color: '#666', marginLeft: '4px'}}>回</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0 }}>出勤情報</h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <button 
                            onClick={handlePrevMonth}
                            disabled={!canGoPrev}
                            style={{
                                padding: '8px 16px', borderRadius: '4px', border: 'none',
                                backgroundColor: canGoPrev ? '#01787c' : '#e0e0e0',
                                color: canGoPrev ? 'white' : '#999',
                                cursor: canGoPrev ? 'pointer' : 'not-allowed',
                                fontWeight: 'bold'
                            }}
                        >
                            ◀ 前の月
                        </button>
                        
                        <span style={{ fontSize: '18px', fontWeight: 'bold', width: '120px', textAlign: 'center', color: '#333' }}>
                            {displayYear}年{displayMonth}月
                        </span>
                        
                        <button 
                            onClick={handleNextMonth}
                            disabled={!canGoNext}
                            style={{
                                padding: '8px 16px', borderRadius: '4px', border: 'none',
                                backgroundColor: canGoNext ? '#01787c' : '#e0e0e0',
                                color: canGoNext ? 'white' : '#999',
                                cursor: canGoNext ? 'pointer' : 'not-allowed',
                                fontWeight: 'bold'
                            }}
                        >
                            次の月 ▶
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: '10px' }}>
                    <AttendanceTable records={tableRecords} />
                </div>
            </div>
        </div>
    );
}