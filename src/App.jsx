import { useState } from 'react';
import './index.css';

import Sidebar from './components/Sidebar';
import SubSidebar from './components/SubSidebar';

import { menuData, STORAGE_KEYS } from './utils/constants';

import { useLocalStorage } from './hooks/useLocalStorage';

import Home from './pages/Home';
import Record from './pages/Record';
import Stamp from './pages/Stamp';
import ManualEntry from './pages/ManualEntry';
import EntryLog from './pages/EntryLog';
import Employee from './pages/Employee';
import Application from './pages/Application';
import Settings from './pages/Settings';
import EmployeeDetail from './pages/EmployeeDetail';

/**
 * アプリのルートコンポーネント。全体の状態管理とルーティングを行う。
 */
function App() {
  // ===== State (UI & Routing) =====
  /** @type {[string, Function]} 選択中のメインメニューID */
  const [currentMain, setCurrentMain] = useState('home');
  /** @type {[string, Function]} 表示中のサブ画面ID */
  const [currentSub, setCurrentSub] = useState('page-home');
  /** @type {[boolean, Function]} サブメニューの開閉状態 */
  const [isSubOpen, setIsSubOpen] = useState(false);

  // ===== State (Data) =====
  /** @type {[Array, Function]} 全従業員データ */
  const [employees, setEmployees] = useLocalStorage(STORAGE_KEYS.EMPLOYEES, []);
  /** @type {[Array, Function]} 全打刻データ */
  const [timeRecords, setTimeRecords] = useLocalStorage(STORAGE_KEYS.TIME_RECORDS, []);
  /** @type {[Object, Function]} 各従業員の出退勤状況 */
  const [userStatuses, setUserStatuses] = useLocalStorage(STORAGE_KEYS.STATUS, {});
  // const [requests, setRequests] = useLocalStorage(STORAGE_KEYS.REQUESTS, []);
  /** @type {[Array, Function]} ホーム画面のショートカット設定 */
  const [shortcuts, setShortcuts] = useLocalStorage(
    STORAGE_KEYS.SHORTCUTS, 
    ["page-record", "page-manual-entry", "page-employee", "page-settings"]
  );

  // ===== State (Selection & Forms) =====
  /** @type {[Object|null, Function]} 詳細表示する従業員データ */
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // ===== Handlers (System & UI) =====
  /**
   * メインメニュークリック時の画面遷移・開閉処理
   * @param {string} mainKey - メニューID
   */
  const handleMainClick = (mainKey) => {
    const noSubMenus = ['home', 'record', 'settings'];

    if (noSubMenus.includes(mainKey)) {
      setCurrentMain(mainKey);
      setCurrentSub(menuData[mainKey].subs[0].id);
      setIsSubOpen(false);
    } else {
      if (currentMain === mainKey) {
        setIsSubOpen(!isSubOpen);
      } else {
        setCurrentMain(mainKey);
        setIsSubOpen(true);
      }
    }
  };

  // ===== Computed =====
  /** @type {string} 現在のサブ画面が属するメインメニューのID */
  const activeMain = Object.keys(menuData).find(key => 
    menuData[key].subs.some(sub => sub.id === currentSub)
  ) || '';

  // ===== Render =====
  return (
    <div className="app-container" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      
      {/* Sidebar Components */}
      <Sidebar 
        currentMain={currentMain} 
        activeMain={activeMain} 
        isSubOpen={isSubOpen} 
        handleMainClick={handleMainClick} 
      />

      <SubSidebar
        isSubOpen={isSubOpen}
        setIsSubOpen={setIsSubOpen}
        setCurrentSub={setCurrentSub}
        currentMain={currentMain}
      />

      <main 
        className="main-content" 
        style={{ flex: 1, padding: '20px', overflowY: 'auto' }}
        onClick={() => setIsSubOpen(false)}
      >

        {/* Page Components */}
        {currentSub === 'page-home' && (
          <Home
            setCurrentMain={setCurrentMain}
            setCurrentSub={setCurrentSub}
            shortcuts={shortcuts}
            userStatuses={userStatuses}
            timeRecords={timeRecords}
          />
        )}

        {currentSub === 'page-stamp' && (
          <Stamp 
            employees={employees} 
            timeRecords={timeRecords} 
            setTimeRecords={setTimeRecords} 
            userStatuses={userStatuses} 
            setUserStatuses={setUserStatuses}
          />
        )}

        {currentSub === 'page-manual-entry' && (
          <ManualEntry 
            employees={employees}
            timeRecords={timeRecords}
            setTimeRecords={setTimeRecords}
          />
        )}

        {currentSub === 'page-log' && (
          <EntryLog
            timeRecords={timeRecords} 
            setTimeRecords={setTimeRecords}
          />
        )}
        
        {currentSub === 'page-record' && (
          <Record
            employees={employees}
            setSelectedEmployee={setSelectedEmployee}
            setCurrentSub={setCurrentSub}
          />
        )}

        {currentSub === 'page-employee' && (
          <Employee
            employees={employees}
            setEmployees={setEmployees}
            userStatuses={userStatuses}
            setUserStatuses={setUserStatuses}
            timeRecords={timeRecords}
            setTimeRecords={setTimeRecords}
          />
        )}

        {currentSub === 'page-application' && (
          <Application
            employees={employees}
            setEmployees={setEmployees}
          />
        )}

        {currentSub === 'page-settings' && (
          <Settings 
            shortcuts={shortcuts} 
            setShortcuts={setShortcuts} 
            setEmployees={setEmployees} 
            setTimeRecords={setTimeRecords} 
            setUserStatuses={setUserStatuses} />
        )}

        {/* Employee Detail Page */}
        {currentSub === 'page-employee-detail' && (
          <EmployeeDetail 
            selectedEmployee={selectedEmployee}
            setCurrentSub={setCurrentSub}
            timeRecords={timeRecords}
          />
        )}

      </main>
    </div>
  );
}

export default App;