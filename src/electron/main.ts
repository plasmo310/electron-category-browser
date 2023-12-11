import { app, BrowserWindow, clipboard, ipcMain, screen } from 'electron';
import * as path from 'path';

// 保存データ
const Store = require('electron-store');
const store = new Store();

const StoreDataKey = {
  WindowPosition: 'WindowPosition',
  WindowSize: 'WindowSize',
};

const DefaultWindowSize = {
  width: 960,
  height: 800,
};

function createWindow() {
  const windowSize = store.get(StoreDataKey.WindowSize) || [DefaultWindowSize.width, DefaultWindowSize.height];
  const windowPosition = store.get(StoreDataKey.WindowPosition) || getCenterPosition();

  const mainWindow = new BrowserWindow({
    width: windowSize[0],
    height: windowSize[1],
    x: windowPosition[0],
    y: windowPosition[1],
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../index.html'));

  mainWindow.on('close', () => {
    // ウィンドウ情報を保存
    store.set(StoreDataKey.WindowPosition, mainWindow.getPosition());
    store.set(StoreDataKey.WindowSize, mainWindow.getSize());
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * ウィンドウの中央の座標を返却
 *
 * @return {array}
 */
function getCenterPosition() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const x = Math.floor((width - DefaultWindowSize.width) / 2);
  const y = Math.floor((height - DefaultWindowSize.height) / 2);
  return [x, y];
}

// ----- レンダラープロセスから呼び出される処理 -----

/** ファイル保存関連 */
const fs = require('fs');

/**
 * ファイル保存処理
 */
ipcMain.handle('loadFile', async (event, filePath) => {
  try {
    fs.statSync(filePath);
  } catch (e) {
    console.log(`not exist file path => ${filePath}`);
    return null;
  }

  let data = null;
  try {
    data = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    console.log(`faild load file => ${filePath}`);
    return null;
  }
  return data;
});

ipcMain.handle('saveFile', async (event, filePath, data) => {
  try {
    fs.statSync(filePath);
  } catch (e) {
    console.log(`not exist file path => ${filePath}`);
    return false;
  }

  try {
    fs.writeFileSync(filePath, data);
  } catch (e) {
    console.log(`ファイルの書き込みに失敗しました => ${filePath}`);
    return false;
  }
  return true;
});

/** クリップボード関連 */

/**
 * クリップボードへ任意の文字列をコピー
 */
ipcMain.handle('writeTextToClipboard', async (event, weiteText: string) => {
  clipboard.writeText(weiteText);
});

/** データ保存関連 */
ipcMain.handle('saveStoreData', async (event, key: string, value: any) => {
  store.set(key, value);
});

ipcMain.handle('loadStoreData', async (event, key: string) => {
  return store.get(key);
});

ipcMain.handle('clearStoreData', async (event) => {
  store.clear();
});
