/**
 * Electronメインプロセス側に定義した処理
 * windowオブジェクトに設定しているため、型定義を拡張する必要がある
 */
export interface IElectronAPI {
  loadFile: (filePath: string) => Promise<string>;
  saveFile: (filePath: string, data: string) => Promise<boolean>;
  writeTextToClipboard: (writeText: string) => Promise<void>;
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

// Webブラウザ上での確認用データ
const DUMMY_CATEGORY_DATA = `id,taxonomy,name,slug,parent
1,category,DUMMY1,dummy1,0
2,category,DUMMY2,dummy2,0
3,category,DUMMY3,dummy3,0
4,category,DUMMY4,dummy4,0
5,category,DUMMY5,dummy5,0
11,category,DUMMY11,dummy11,1
12,category,DUMMY12,dummy12,1
13,category,DUMMY13,dummy13,1
31,category,DUMMY31,dummy31,3
101,post_tag,DUMMY_TAG1,dummytag1,0
102,post_tag,DUMMY_TAG2,dummytag2,0
103,post_tag,DUMMY_TAG3,dummytag3,0
104,post_tag,DUMMY_TAG4,dummytag4,0
105,post_tag,DUMMY_TAG5,dummytag5,0
`;

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
  const loadFile = (filePath: string, callback: (result: string, errorMessage: string) => void) => {
    if (!window.electronAPI) {
      const dummy = DUMMY_CATEGORY_DATA;
      callback(dummy, 'current platform is not support electron api.');
      return;
    }
    window.electronAPI.loadFile(filePath).then((data) => callback(data, null));
  };

  /**
   * ファイル保存
   * @param filePath
   * @param data
   * @param callback
   * @returns
   */
  const saveFile = (filePath: string, data: string, callback: (errorMessage: string) => void) => {
    if (!window.electronAPI) {
      const dummy = DUMMY_CATEGORY_DATA;
      callback('current platform is not support electron api.');
      return;
    }
    window.electronAPI.saveFile(filePath, data).then((result) => {
      if (!result) {
        callback('データの保存に失敗しました。');
        return;
      }
    });
    callback(null);
  };

  /**
   * カテゴリーデータファイルの読込
   * @param filePath
   * @param callback
   */
  const loadMstTermsFile = (
    filePath: string,
    callback: (result: mstData.mstTermsRow[], errorMessage: string) => void,
  ) => {
    loadFile(filePath, (readContent: string, errorMessage: string) => {
      if (!readContent || readContent.indexOf(',') <= 0) {
        callback(null, errorMessage);
        return;
      }

      // CSVからデータを取得
      const data: string[][] = [];
      const rows: string[] = readContent.replace(/\r/g, '').split('\n');
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
      callback(result, null);
    });
  };

  /**
   * カテゴリデータファイルの保存
   * @param filePath
   * @param rows
   * @param callback
   */
  const saveMstTermsFile = (
    filePath: string,
    rows: mstData.mstTermsRow[],
    callback: (errorMessage: string) => void,
  ) => {
    let data = 'id,taxonomy,name,slug,parent\r\n';
    for (const row of rows) {
      const values = [row.id, row.taxonomy, row.name, row.slug, row.parent];
      data += values.join(',') + '\r\n';
    }
    saveFile(filePath, data, callback);
  };

  /**
   * クリップボードへの書き込み
   * @param writeText
   * @returns
   */
  const writeTextToClipboard = (writeText: string, callback: (errorMessage: string) => void) => {
    if (!window.electronAPI) {
      callback('current platform is not support electron api.');
      return;
    }
    window.electronAPI.writeTextToClipboard(writeText);
    callback('クリップボードにコピーしました。');
  };

  return {
    loadFile,
    loadMstTermsFile,
    saveFile,
    saveMstTermsFile,
    writeTextToClipboard,
  };
};
