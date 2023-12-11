# electron-category-browser
ブログのカテゴリデータを閲覧・編集するツール (個人ブログ執筆用)
* カテゴリ・タグを検索してIDコピーする
* カテゴリ・タグを追加、削除する

<img width="800" alt="screenshot 2023-12-11 23 37 21" src="https://github.com/masarito617/electron-category-browser/assets/77447256/58c02359-9ff0-4aa5-8ce1-2087f99996ac">


## 使用フレームワーク・ライブラリ
* バックエンド
  * Electron
* フロントエンド
  * Vue.js
* ビルドツール
  * Vite

## 動作環境
* 読み込めるCSVデータ形式
  ```
  id,taxonomy,name,slug,parent
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
  ```
  * 読込処理の箇所<br><a href="./src/api/electron-api.ts#L34C15-L34C15">src/api/electron-api.ts</a><br>
  
* 確認済のOS環境
  * 機種：MacBook Pro M2
  * OS：MacOS 13.3.1

## 使い方

### カテゴリの一覧表示
1. アプリを起動し、読み込むCSVファイルのパスを指定します。<br><img width="600" alt="screenshot 2023-12-11 23 41 12" src="https://github.com/masarito617/electron-category-browser/assets/77447256/2d3f30b6-8c12-49e4-a55d-6815f848d172">
2. 「読込」ボタンを押下するとカテゴリ、タグ情報が表示されます。<br><img width="600" alt="screenshot 2023-12-11 23 41 56" src="https://github.com/masarito617/electron-category-browser/assets/77447256/dcc0f89d-5bad-44b4-95e4-bb662f79ff79">

### カテゴリの選択とIDコピー
1. 選択したカテゴリが下部に表示され、「IDコピー」ボタンを押下するとカンマ区切りのID文字列をコピーできます。<br><img width="600" alt="screenshot 2023-12-11 23 43 17" src="https://github.com/masarito617/electron-category-browser/assets/77447256/83f2a5ad-65a8-4bca-9f0c-6f51681479fe">

### カテゴリの追加・編集
1. カテゴリ名、slugを入力して「追加」ボタンを押下するとカテゴリを追加できます。<br><img width="600" alt="screenshot 2023-12-11 23 46 42" src="https://github.com/masarito617/electron-category-browser/assets/77447256/9e05e3be-4b57-497a-b0a7-c040a2f006d3">
2. カテゴリ横の「×」ボタンを押下するとカテゴリを削除できます。<br><img width="600" alt="screenshot 2023-12-11 23 47 51" src="https://github.com/masarito617/electron-category-browser/assets/77447256/5c71f754-9fca-4d8a-a01b-99ec7549551e">
3. 「保存」ボタンを押下すると編集した内容をCSVファイルに保存できます。<br><img width="600" alt="screenshot 2023-12-11 23 48 38" src="https://github.com/masarito617/electron-category-browser/assets/77447256/497e9724-6fbb-4950-9d3d-5dd3b783c6b8">







