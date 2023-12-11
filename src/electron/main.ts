import { app, BrowserWindow, clipboard, ipcMain } from 'electron';
import * as path from 'path';

function createWindow() {
  const mainWindow = new BrowserWindow({
    height: 800,
    width: 960,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../index.html'));

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
