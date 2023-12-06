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
 * マスタデータ型定義
 */
export namespace mstData {
    // カテゴリーデータ
    export type mstTermsRow = {
      id: string;
      taxonomy: string; // category or post_tag
      name: string;
      slug: string;
      parent: string;
    };
}

/**
 * Electron API
 * Composition Function
 * @returns
 */
export const useElectronApi = () => {
  /**
   * ファイル読込
   * @param filePath 
   * @param callback 
   * @returns 
   */
  const loadFile = (filePath: string, callback: (result: string) => void) => {
    if (!window.electronAPI) {
      callback(null);
      return;
    }
    window.electronAPI.loadFile(filePath).then(callback);
  };

  /**
   * カテゴリーデータファイルの読込
   * @param filePath 
   * @param callback 
   */
  const loadMstTermsFile = (filePath: string, callback: (result: mstData.mstTermsRow[]) => void) => {
    loadFile(filePath, (readConrtent) => {
      if (!readConrtent || readConrtent.indexOf(',') <= 0) {
        callback(null)
        return
      }

      // CSVからデータを取得
      const data: string[][] = [];
      const rows: string[] = readConrtent.split('\n');
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].indexOf(',') < 0) {
          continue;
        }
        const values = rows[i].split(',');
        data.push(values);
      }
      
      // データをマスタデータの形式に変換
      const result: mstData.mstTermsRow[] = [];
      for (let i = 0; i < data.length; i++) {
        let index = 0;
        const columns = data[i];
        const row: mstData.mstTermsRow = {
          id: columns[index++],
          taxonomy: columns[index++],
          name: columns[index++],
          slug: columns[index++],
          parent: columns[index++],
        };
        result.push(row);
      }
      callback(result)
    })
  }

  return {
    loadFile,
    loadMstTermsFile,
  };
};
