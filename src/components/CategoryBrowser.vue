<script lang="ts">
import { Ref, defineComponent, reactive, ref } from 'vue';
import { mstData, useElectronApi } from '../api/electron-api';
import CategoryItem from './CategoryItem.vue';

type CategoryData = {
  rows: mstData.mstTermsRow[];
};

export default defineComponent({
  name: 'CategoryBrowser',
  components: {
    CategoryItem,
  },
  setup() {
    const electronApi = useElectronApi();

    /**
     * 入力CSVパス
     */
    const inputCsvPath: Ref<string> = ref(
      '/Users/plasma/workspace/GitProjects/wp-next-elekibear/data/db/mst_terms.csv',
    );

    /**
     * カテゴリデータ
     * これをデータとして表示する
     *  parent=0を表示
     *  連なる子データをインデントを付けつつ表示
     */
    const categoryData: CategoryData = reactive({
      rows: [],
    });

    /**
     * カテゴリデータ強制更新用のキー
     * https://tomatoaiu.hatenablog.com/entry/2019/09/28/133319
     */
    const updateCategoryItemKey = ref(0);

    /**
     * 選択中のカテゴリID
     */
    const selectCategoryIdArray: Ref<string[]> = ref([]);

    /**
     * メッセージ
     */
    const message = ref('');

    /**
     * 読込ボタン押下
     */
    function OnPushLoadButton() {
      message.value = '';
      electronApi.loadMstTermsFile(inputCsvPath.value, (data: mstData.mstTermsRow[], errorMessage: string) => {
        if (errorMessage) {
          message.value = errorMessage;
          return;
        }
        if (!data) {
          message.value = 'データの読込に失敗しました。';
          return;
        }
        console.log(data);
        categoryData.rows = data;
        OnResetSelectStateCategoryIds();
      });
    }

    /**
     * 親カテゴリのデータを取得する
     * @param rows
     */
    function GetParentCategories(rows: mstData.mstTermsRow[]) {
      return rows.filter((row) => row.parent === '0' && row.taxonomy == 'category');
    }

    /**
     * 子カテゴリのデータを取得する
     * @param rows
     * @param parentCategoryId
     */
    function GetChildCategories(rows: mstData.mstTermsRow[], parentCategoryId: string) {
      return rows.filter((row) => row.parent === parentCategoryId);
    }

    /**
     * カテゴリの選択状態を変更する
     * @param isSelected
     */
    function OnChangeSelectStateCategory(categoryId: string, isSelected: boolean) {
      // 選択状態に応じて配列に追加or削除
      const index = selectCategoryIdArray.value.indexOf(categoryId);
      if (isSelected && index < 0) {
        selectCategoryIdArray.value.push(categoryId);
      } else if (!isSelected && index >= 0) {
        selectCategoryIdArray.value.splice(index, 1);
      }
    }

    /**
     * カテゴリ選択状態のクリップボードコピー
     */
    function OnCopySelectStateCategoryIds() {
      message.value = null;
      electronApi.writeTextToClipboard(selectCategoryIdArray.value.join(', '), (errorMessage) => {
        if (errorMessage) {
          message.value = errorMessage;
        }
      });
    }

    /**
     * カテゴリ選択状態のリセット
     */
    function OnResetSelectStateCategoryIds() {
      // 選択情報クリア(関数呼び出しじゃないと反映されない)
      selectCategoryIdArray.value.splice(0);
      // keyを更新してカテゴリ一覧を無理やり更新する
      updateCategoryItemKey.value = updateCategoryItemKey.value ? 0 : 1;
    }

    return {
      inputCsvPath,
      categoryData,
      updateCategoryItemKey,
      selectCategoryIdArray,
      message,
      OnPushLoadButton,
      GetParentCategories,
      GetChildCategories,
      OnChangeSelectStateCategory,
      OnCopySelectStateCategoryIds,
      OnResetSelectStateCategoryIds,
    };
  },
});
</script>
0
<template>
  <div class="container">
    <div class="container-item load-path-area">
      <input class="load-input-path" v-model="inputCsvPath" />
      <button class="load-button" v-on:click="OnPushLoadButton">読込</button>
    </div>
    <div class="container-item category-list-area">
      <div class="category-list-wrapper">
        <div :key="updateCategoryItemKey" v-for="parentData in GetParentCategories(categoryData.rows)">
          <CategoryItem
            :categoryData="parentData"
            :isParent="true"
            :isSelected="selectCategoryIdArray.includes(parentData.id)"
            @onChangeSelectId="OnChangeSelectStateCategory"
          />
          <div :key="updateCategoryItemKey" v-for="childData in GetChildCategories(categoryData.rows, parentData.id)">
            <CategoryItem
              :categoryData="childData"
              :isParent="false"
              :isSelected="selectCategoryIdArray.includes(childData.id)"
              @onChangeSelectId="OnChangeSelectStateCategory"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="container-item category-select-id-area">
    <span class="category-select-id-label">選択ID：</span>
    <span class="category-select-id-value">{{ selectCategoryIdArray.join(', ') }}</span>
    <button class="category-select-id-button" v-on:click="OnCopySelectStateCategoryIds">コピー</button>
    <button class="category-select-id-button" v-on:click="OnResetSelectStateCategoryIds">リセット</button>
  </div>
  <div class="container-item message-area">{{ message }}</div>
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
  flex: 1;
  height: 100%;
}
.load-button {
  width: 80px;
  height: 120%;
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 12px;
  box-shadow: 2px 2px 6px #555555;
}

/** カテゴリリスト */
.category-list-area {
  position: relative;
  width: 100%;
  height: 400px;
  background-color: #222222;
  border-radius: 20px;
  border: solid 2px;
  display: flex;
  justify-content: center;
  vertical-align: middle;
}
.category-list-wrapper {
  position: relative;
  width: 96%;
  height: 80%;
  display: table-cell;
  overflow-y: auto;
  margin: auto;
}

/** カテゴリ選択ID */
.category-select-id-area {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 32px;
}
.category-select-id-label {
  width: 80px;
}
.category-select-id-value {
  flex: 1;
  height: 120%;
  text-align: left;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 0px 12px;
  background-color: #222222;
  border: 1px solid;
  border-color: #666666;
  border-radius: 4px;
}
.category-select-id-button {
  width: 80px;
  height: 120%;
  margin-left: 12px;
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 2px 2px 6px #555555;
}

/** メッセージ */
.message-area {
  height: 20px;
}
</style>
