import { useState } from 'react';

/**
 * ReactのStateとブラウザのlocalStorageを同期させるカスタムフック
 * @param {string} key - localStorageにデータを保存・取得する際のキー名
 * @param {any} initialValue - localStorageにデータが存在しない場合に使用される初期値
 * @returns {[any, Function]} - 現在のStateの値と、それを更新する関数（useStateと同じ形式）の配列
 */
export function useLocalStorage(key, initialValue) {
  
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`データの読み込みに失敗しました (キー: ${key}):`, error);
      return initialValue;
    }
  });

  /**
   * Stateの値を更新し、同時にlocalStorageへ保存する関数
   * @param {any|Function} value - 新しい値、または現在の値を受け取って新しい値を返す関数
   */
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`データの保存に失敗しました (キー: ${key}):`, error);
    }
  };

  return [storedValue, setValue];
}