import React, { useState } from 'react';

/**
 * 詳細な勤務記録を確認したい従業員を選択するためのリスト表示コンポーネント
 * @param {Object} props
 * @param {Array<Object>} props.employees - 全従業員のデータ配列
 * @param {Function} props.setSelectedEmployee - 選択された従業員データを保持する関数
 * @param {Function} props.setCurrentSub - サブ画面を切り替える関数（詳細画面への遷移に使用）
 * @returns {JSX.Element}
 */
export default function Record({
    employees,
    setSelectedEmployee,
    setCurrentSub
}){
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEmployees = employees.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(employees.length / itemsPerPage);

    return(
        <div>
          <h2 style={{ borderBottom: '2px solid #01787c', paddingBottom: '10px' }}>勤務記録一覧</h2>
          <div>
            <h3 style={{ marginBottom: '15px',fontSize: '1.2em' }}>
              従業員リスト
            </h3>
            <p style={{ fontSize: '14px', color: '#666' }}>クリックすることで従業員の勤務記録を確認できます。</p>

            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <thead>
                  <tr>
                    <th style={{ background: '#01787c', color: 'white', padding: '12px', border: '1px solid #ccc' }}>社員ID</th>
                    <th style={{ background: '#01787c', color: 'white', padding: '12px', border: '1px solid #ccc' }}>名前</th>
                    <th style={{ background: '#01787c', color: 'white', padding: '12px', border: '1px solid #ccc' }}>部署</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                        従業員が登録されていません。
                      </td>
                    </tr>
                  ) : (
                    currentEmployees.map((emp) => (
                      <tr 
                        key={emp.empCode} 
                        className="table-row" 
                        onClick={() => {
                          setSelectedEmployee(emp); 
                          setCurrentSub('page-employee-detail'); 
                        }}
                        style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }}
                      >
                        <td style={{ padding: '10px', border: '1px solid #ccc' }}>{emp.empCode}</td>
                        <td style={{ padding: '10px', border: '1px solid #ccc', fontWeight: 'bold' }}>{emp.name}</td>
                        <td style={{ padding: '10px', border: '1px solid #ccc' }}>{emp.dept}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '15px' }}>
                    <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} style={{ padding: '8px 16px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', backgroundColor: currentPage === 1 ? '#f1f1f1' : '#01787c', color: currentPage === 1 ? '#aaa' : 'white', border: 'none', borderRadius: '4px' }}>前へ</button>
                    <span style={{ fontWeight: 'bold', color: '#333' }}>{currentPage} / {totalPages} ページ</span>
                    <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} style={{ padding: '8px 16px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', backgroundColor: currentPage === totalPages ? '#f1f1f1' : '#01787c', color: currentPage === totalPages ? '#aaa' : 'white', border: 'none', borderRadius: '4px' }}>次へ</button>
                </div>
            )}
          </div>
        </div>
    );
}