/**
 * Electronメインプロセス側に定義した処理
 * windowオブジェクトに設定しているため、型定義を拡張する必要がある
 */
export interface IElectronAPI {
  loadFile: (filePath: string) => Promise<string>;
}
declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}

/**
 * Electron API
 * Composition Function
 * @returns
 */
export const useElectronApi = () => {
  const loadFile = (filePath: string, callback: (result: string) => void) => {
    if (!window.electronAPI) {
      callback('current platform is not support electron api.');
      return;
    }
    window.electronAPI.loadFile(filePath).then(callback);
  };

  return {
    loadFile,
  };
};
