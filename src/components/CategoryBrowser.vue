<script setup lang="ts">
import { defineComponent, onMounted, reactive, Ref, ref } from 'vue';
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
const categoryData: CategoryData  = reactive({})

const OnPushLoadButton = () => {
  // TODO Electron APIを介して読み込む
  electronApi.loadMstTermsFile(inputCsvPath.value, (data: mstData.mstTermsRow[]) => {
    categoryData.rows = data;
  });
};
</script>

<template>
  <div>
    <div>
      <input v-model="inputCsvPath" />
      <button v-on:click="OnPushLoadButton">読込</button>
    </div>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
