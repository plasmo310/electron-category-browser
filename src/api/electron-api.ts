/**
 * Electronメインプロセス側に定義した処理
 * windowオブジェクトに設定しているため、型定義を拡張する必要がある
 */
export interface IElectronAPI {
  loadFile: (filePath: string) => Promise<string>;
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
      // Webでの確認用データ
      const dummy = `id,taxonomy,name,slug,parent
3,category,音楽,music,0
5,category,その他,other,0
6,category,都会のエレキベア,elekibear,0
37,category,ラーメン日記,ramen,0
39,category,四コマ漫画,comic,0
40,category,好きな曲カタルコーナー,favorite,3
53,category,IT関連,it,0
64,category,WordPress関連,wordpress,53
65,category,Python,python,53
66,category,JavaScript,java-script,53
`;
      callback(dummy, 'current platform is not support electron api.');
      return;
    }
    window.electronAPI.loadFile(filePath).then((data) => callback(data, null));
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
    writeTextToClipboard,
  };
};
