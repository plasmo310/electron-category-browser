<script setup lang="ts">
import { reactive, ref } from 'vue';
import { mstData, useElectronApi } from '../api/electron-api';

const electronApi = useElectronApi();

// 入力CSVパス
const inputCsvPath = ref('/Users/plasma/workspace/GitProjects/wp-next-elekibear/data/db/mst_terms.csv');

type CategoryData = {
  rows: mstData.mstTermsRow[]
}

/**
 * カテゴリデータ
 * これをデータとして表示する
 *  parent=0を表示
 *  連なる子データをインデントを付けつつ表示
 */
const categoryData: CategoryData  = reactive({
  rows: [],
})

/**
 * 読込ボタン押下
 */
function OnPushLoadButton() {
  // TODO Electron APIを介して読み込む
  electronApi.loadMstTermsFile(inputCsvPath.value, (data: mstData.mstTermsRow[]) => {
    console.log(data)
    categoryData.rows = data;
  });
};

/**
 * 親カテゴリのデータを取得する
 * @param rows 
 */
function GetParentCategories(rows: mstData.mstTermsRow[]) {
  return rows.filter(row => row.parent === '0' && row.taxonomy == 'category');
}

/**
 * 子カテゴリのデータを取得する
 * @param rows 
 * @param parentCategoryId 
 */
function GetChildCategories(rows: mstData.mstTermsRow[], parentCategoryId: string) {
  return rows.filter(row => row.parent === parentCategoryId)
}
</script>

<template>
  <div class="container">
    <div class="container-item load-path-area ">
      <input class="load-input-path" v-model="inputCsvPath" />
      <button class="load-button" v-on:click="OnPushLoadButton">読込</button>
    </div>
    <ul class="container-item">
      <li v-for="parentData in GetParentCategories(categoryData.rows)">{{ parentData.name }}
        <ul>
          <li v-for="childData in GetChildCategories(categoryData.rows, parentData.id)">{{ childData.name }}</li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.container {
  text-align: center;
  display: flex;
  flex-flow: column;
  min-width: 600px;
}
.container-item {
  margin-bottom: 24px;
}

/** 読込パスエリア */
.load-path-area {
  widows: 100%;
  height: 32px;
  display: flex;
  align-items: center;
}
.load-input-path {
  width: 80%;
  height: 100%;
}
.load-button {
  width: 20%;
  height: 120%;
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 12px;
  box-shadow: 2px 2px 6px #555555;
}
</style>
