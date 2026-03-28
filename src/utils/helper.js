import { STORAGE_KEYS } from './constants';

/**
 * 特定の従業員の指定した年月の勤怠データを生成する関数
 * @param {string} employeeName - 従業員名
 * @param {number} targetYear - 対象年 (例: 2023)
 * @param {number} targetMonth - 対象月 (例: 10)
 * @returns {Array} 1ヶ月分の勤怠データ配列
 */
export const generateTableData = (employeeName, targetYear, targetMonth) => {
  const savedRecords = JSON.parse(localStorage.getItem(STORAGE_KEYS.TIME_RECORDS) || '[]');
  const employeeRecords = savedRecords.filter(record => record.name === employeeName);

  const savedRequests = JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
  const employeeRequests = savedRequests.filter(req => req.name === employeeName);
  
  const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
  const tableData = [];
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(targetYear, targetMonth - 1, i);
      const dayOfWeekIdx = dateObj.getDay();
      const isWeekend = dayOfWeekIdx === 0 || dayOfWeekIdx === 6; 
      
      const yyyy = targetYear;
      const mm = String(targetMonth).padStart(2, '0');
      const dd = String(i).padStart(2, '0');
      const dateString = `${yyyy}-${mm}-${dd}`;

      const overlappingRecords = employeeRecords.filter(record => {
          if (!record.startTime) return false;
          const sDate = record.startTime.split(' ')[0];
          const eDate = record.endTime ? record.endTime.split(' ')[0] : todayStr;
          return dateString >= sDate && dateString <= eDate;
      });

      const todayRequest = employeeRequests.find(req => req.date === dateString);
  
      let status = '休日';
      let startTime = null;
      let endTime = null;
      let rawRecords = [];

      if (todayRequest && (todayRequest.type === '有給' || todayRequest.type === '欠勤')) {
          status = todayRequest.type;
      } else if (overlappingRecords.length > 0) {
          status = (todayRequest && todayRequest.type === '遅刻') ? '遅刻' : '出勤';
          
          rawRecords = overlappingRecords.sort((a, b) => a.startTime.localeCompare(b.startTime));
          
          const exactDayRecord = overlappingRecords.find(r => r.startTime.startsWith(dateString));
          if (exactDayRecord) {
              startTime = exactDayRecord.startTime.split(' ')[1]; 
              endTime = exactDayRecord.endTime ? exactDayRecord.endTime.split(' ')[1] : null;
          }
      } else if (!isWeekend) {
          const todayMidnight = new Date();
          todayMidnight.setHours(0, 0, 0, 0);
          
          if (dateObj < todayMidnight) {
              status = '欠勤'; 
          } else {
              status = '-'; 
          }
      }

      tableData.push({
          date: dateString,
          targetDateStr: dateString,
          dayOfWeek: days[dayOfWeekIdx],
          status,
          startTime,
          endTime,
          rawRecords,
          isWeekend
      });
  }

  return tableData;
};