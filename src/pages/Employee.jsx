import React, { useState, useRef } from 'react';
import { STORAGE_KEYS } from '../utils/constants';

const DEPARTMENTS = ["営業部", "開発部", "総務部", "人事部", "経理部"];

/**
 * 登録されている従業員リストから、次に割り当てるべき一意の社員ID（EMP001など）を生成する関数
 * @param {Array<Object>} employees - 現在の全従業員データ配列
 * @returns {string} 新しい社員IDの文字列 (例: "EMP005")
 */
const generateNextEmpCode = (employees) => {
    const existingNumbers = employees
        .map(emp => parseInt(emp.empCode.replace('EMP', ''), 10))
        .filter(num => !isNaN(num));
    
    let nextNumber = 1;
    while (existingNumbers.includes(nextNumber)) {
        nextNumber++;
    }
    return "EMP" + String(nextNumber).padStart(3, '0');
};

const EmployeeRegisterModal = ({ regModalRef, regForm, setRegForm, onRegister }) => (
    <dialog ref={regModalRef} className="dialog">
        <div className="modal-content">
            <h3>新規社員の登録</h3>
            <div className="form-group">
                <label>名前:</label>
                <input type="text" value={regForm.name} onChange={(e) => setRegForm({...regForm, name: e.target.value})} />
            </div>
            <div className="form-group">
                <label>年齢:</label>
                <input type="number" value={regForm.age} onChange={(e) => setRegForm({...regForm, age: e.target.value})} />
            </div>
            <div className="form-group">
                <label>部署:</label>
                <select value={regForm.dept} onChange={(e) => setRegForm({...regForm, dept: e.target.value})}>
                    <option value="">選択してください</option>
                    {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
            </div>
            <div className="modal-actions">
                <button onClick={onRegister} className="btn" style={{ backgroundColor: '#01787c', color: 'white', marginRight: "10px"}}>登録</button>
                <button onClick={() => regModalRef.current.close()}>キャンセル</button>
            </div>
        </div>
    </dialog>
);

/**
 * 社員詳細情報の表示、および編集を行うためのモーダルコンポーネント
 * @param {Object} props
 * @param {Object} props.detailData - モーダルに表示・編集中の一時的な社員データ
 * @param {Function} props.setDetailData - 編集中の社員データを更新する関数
 * @param {boolean} props.isEditMode - 現在が「閲覧モード」か「編集モード」かを示すフラグ
 * @param {Function} props.setIsEditMode - 編集モードを切り替える関数
 * @param {Function} props.onUpdate - 保存ボタンが押された時のデータ更新処理関数
 * @param {Object} props.originalEmployee - 編集キャンセル時に元に戻すための元の社員データ
 */
const EmployeeDetailModal = ({ detailModalRef, detailData, setDetailData, isEditMode, setIsEditMode, onUpdate, originalEmployee }) => {
    if (!detailData) return <dialog ref={detailModalRef} className="dialog"><div style={{ padding: '20px', backgroundColor: 'white' }}><p>読み込み中...</p></div></dialog>;

    return (
        <dialog ref={detailModalRef} className="dialog">
            <div className="modal-content">
                <h3 style={{ marginTop: 0 }}>社員詳細情報</h3>
                <div className="form-group"><label>社員ID:</label> <input type="text" value={detailData.empCode} disabled /></div>
                <div className="form-group"><label>名前:</label> <input type="text" value={detailData.name} disabled={!isEditMode} onChange={(e) => setDetailData({...detailData, name: e.target.value})} /></div>
                <div className="form-group"><label>年齢:</label> <input type="number" value={detailData.age} disabled={!isEditMode} onChange={(e) => setDetailData({...detailData, age: e.target.value})} /></div>
                <div className="form-group">
                    <label>部署:</label> 
                    {isEditMode ? (
                        <select value={detailData.dept} onChange={(e) => setDetailData({...detailData, dept: e.target.value})}>
                            <option value="">選択してください</option>
                            {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                        </select>
                    ) : (<input type="text" value={detailData.dept} disabled />)}
                </div>
                <div className="form-group"><label>有給残日数:</label> <input type="number" value={detailData.paidLeaveDays} disabled /></div>
                <div className="form-group"><label>欠勤回数:</label> <input type="number" value={detailData.absenceCount || 0} disabled /></div>
                <div className="form-group"><label>遅刻回数:</label> <input type="number" value={detailData.lateCount || 0} disabled /></div>
                
                <div className="modal-actions" style={{ marginTop: '20px' }}>
                    {isEditMode ? (
                        <>
                            <button className="filled-btn" onClick={onUpdate} style={{ backgroundColor: '#01787c', color: 'white', marginRight: '10px' }}>保存する</button>
                            <button className="btn" onClick={() => { setIsEditMode(false); setDetailData({ ...originalEmployee, index: detailData.index }); }}>キャンセル</button>
                        </>
                    ) : (
                        <>
                            <button className="filled-btn" onClick={() => setIsEditMode(true)} style={{ backgroundColor: '#3498db', color: 'white', marginRight: '10px' }}>編集する</button>
                            <button className="btn" onClick={() => detailModalRef.current.close()}>閉じる</button>
                        </>
                    )}
                </div>
            </div>
        </dialog>
    );
};


export default function Employee({ 
    employees, 
    setEmployees, 
    userStatuses, 
    setUserStatuses,
    timeRecords,
    setTimeRecords
}) {
    const regModalRef = useRef(null);
    const detailModalRef = useRef(null);
    
    const [regForm, setRegForm] = useState({ name: '', age: '', dept: '' });
    const [detailData, setDetailData] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    /**
     * 新規従業員を登録し、localStorageへ保存する処理
     */
    const handleRegisterEmployee = () => {
        if (employees.length >= 999) {
            alert("登録できる従業員数は最大999人までです。");
            return;
        }
        if (!regForm.name || !regForm.age || !regForm.dept) { alert("すべての項目を入力してください"); return; }

        const newCode = generateNextEmpCode(employees);
        const newEmployee = { empCode: newCode, name: regForm.name, age: regForm.age, dept: regForm.dept, paidLeaveDays: 10, absenceCount: 0, lateCount: 0 };
        const updatedEmployees = [...employees, newEmployee];
        
        setEmployees(updatedEmployees);
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(updatedEmployees));
        setRegForm({ name: '', age: '', dept: '' });
        alert("登録が完了しました")
        regModalRef.current.close();
    };

    /**
     * 従業員情報を削除する処理（関連するステータスや勤務記録も同時に削除する）
     * @param {number} index - 全従業員配列における対象従業員のインデックス
     */
    const handleDeleteEmployee = (index) => {
        const targetName = employees[index].name;
        if (window.confirm(`${targetName}さんの情報を削除してもよろしいですか？\n※関連する勤務記録もすべて削除されます。`)) {

            const updatedEmployees = employees.filter((_, i) => i !== index);
            setEmployees(updatedEmployees);
            localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(updatedEmployees));
        
            const newStatuses = { ...userStatuses };
            if(newStatuses[targetName]){
                delete newStatuses[targetName];
                setUserStatuses(newStatuses);
                localStorage.setItem(STORAGE_KEYS.STATUS, JSON.stringify(newStatuses));
            }

            if (timeRecords && setTimeRecords) {
                const updatedTimeRecords = timeRecords.filter(record => record.name !== targetName);
                setTimeRecords(updatedTimeRecords);
                localStorage.setItem(STORAGE_KEYS.TIME_RECORDS, JSON.stringify(updatedTimeRecords));
            }
        }
    };

    /**
     * 編集モードで入力された従業員情報を保存する処理
     */
    const handleUpdateEmployee = () => {
        if (!detailData.name || !detailData.age || !detailData.dept) { alert("すべての項目を入力してください"); return; }
        const updatedEmployees = [...employees];
        updatedEmployees[detailData.index] = { ...updatedEmployees[detailData.index], name: detailData.name, age: detailData.age, dept: detailData.dept };
        
        setEmployees(updatedEmployees);
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(updatedEmployees));
        alert(`${detailData.name}さんの情報を更新しました！`);
        setIsEditMode(false);
    };

    /**
     * 特定の従業員の詳細モーダルを開く処理
     * @param {Object} emp - 開く対象の従業員オブジェクト
     * @param {number} index - 全従業員配列におけるインデックス
     */
    const openDetailModal = (emp, index) => {
        setDetailData({ ...emp, index });
        setIsEditMode(false);
        setTimeout(() => { if (detailModalRef.current) detailModalRef.current.showModal(); }, 10);
    };

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEmployees = employees.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(employees.length / itemsPerPage);

    return (
        <div>
            <h2 style={{ borderBottom: '2px solid #01787c', paddingBottom: '10px' }}>従業員管理</h2>
            <h3 style={{ marginBottom: '15px',fontSize: '1.2em' }}>
              新規社員の登録
            </h3>
            <p style={{ fontSize: '14px', color: '#666' }}>新規社員の登録が行えます。</p>

            <button className="btn-3" onClick={() => regModalRef.current.showModal()} style={{ backgroundColor: '#01787c', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' }}>新規社員の登録</button>
            <h3>登録社員一覧</h3>
            <table className="table">
                <thead><tr><th>社員ID</th><th>名前</th><th>年齢</th><th>部署</th><th>操作</th></tr></thead>
                <tbody>
                    {(!employees || employees.length === 0) ? (
                        <tr><td colSpan="5" style={{ textAlign: 'center' }}>登録されている社員はいません</td></tr>
                    ) : (
                        currentEmployees.map((emp, index) => {
                            const globalIndex = indexOfFirstItem + index;
                            return (
                                <tr key={emp.empCode}>
                                    <td>{emp.empCode}</td><td>{emp.name}</td><td>{emp.age}</td><td>{emp.dept}</td>
                                    <td>
                                        <button className="btn" onClick={() => openDetailModal(emp, globalIndex)} style={{marginRight: '8px', color: '#01787c'}}>詳細</button>
                                        <button className="btn" onClick={() => handleDeleteEmployee(globalIndex)} style={{color: 'red'}}>削除</button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>

            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '15px' }}>
                    <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} style={{ padding: '8px 16px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', backgroundColor: currentPage === 1 ? '#f1f1f1' : '#01787c', color: currentPage === 1 ? '#aaa' : 'white', border: 'none', borderRadius: '4px' }}>前へ</button>
                    <span style={{ fontWeight: 'bold', color: '#333' }}>{currentPage} / {totalPages} ページ</span>
                    <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} style={{ padding: '8px 16px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', backgroundColor: currentPage === totalPages ? '#f1f1f1' : '#01787c', color: currentPage === totalPages ? '#aaa' : 'white', border: 'none', borderRadius: '4px' }}>次へ</button>
                </div>
            )}

            <EmployeeRegisterModal 
                regModalRef={regModalRef} 
                regForm={regForm} 
                setRegForm={setRegForm} 
                onRegister={handleRegisterEmployee} 
            />

            <EmployeeDetailModal 
                detailModalRef={detailModalRef} 
                detailData={detailData} 
                setDetailData={setDetailData} 
                isEditMode={isEditMode} 
                setIsEditMode={setIsEditMode} 
                onUpdate={handleUpdateEmployee} 
                originalEmployee={detailData ? employees[detailData.index] : null}
            />
        </div>
    );
}