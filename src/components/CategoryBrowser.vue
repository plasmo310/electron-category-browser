<script lang="ts">
import { Ref, computed, defineComponent, reactive, ref } from 'vue';
import { mstData, useElectronApi } from '../api/electron-api';
import CategoryItem from './CategoryItem.vue';

type CategoryData = {
  rows: mstData.mstTermsRow[];
};

namespace CategoryType {
  export const CATEGORY = 'category';
  export const TAG = 'post_tag';
}

const CATEGORY_PARENT_ID = '0';

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
    function filteredCategoryData(parentId: string = CATEGORY_PARENT_ID) {
      // カテゴリデータをフィルタして返却する
      let filterData = categoryData.rows.filter(
        (data) => data.taxonomy === selectCategoryTabType.value && data.parent === parentId,
      );
      // 検索ワードでのフィルタ
      const searchWord = searchCategoryWord.value?.toLocaleLowerCase();
      if (searchWord) {
        if (parentId == CATEGORY_PARENT_ID) {
          // 親カテゴリの場合、自身か子カテゴリのいずれかがヒットした場合に表示する
          filterData = filterData.filter((parent) => {
            let childHitData = categoryData.rows.filter(
              (child) =>
                child.taxonomy === selectCategoryTabType.value &&
                child.parent === parent.id &&
                child.name.toLocaleLowerCase().includes(searchWord),
            );
            return parent.name.toLocaleLowerCase().includes(searchWord) || childHitData.length > 0;
          });
        } else {
          // 子カテゴリの場合、そのままフィルタする
          filterData = filterData.filter((data) => data.name.toLocaleLowerCase().includes(searchWord));
        }
      }
      return filterData;
    }

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
     * 選択中のカテゴリ種別 (カテゴリorタグ)
     */
    const selectCategoryTabType: Ref<string> = ref(CategoryType.CATEGORY);

    /**
     * 検索ワード
     */
    const searchCategoryWord: Ref<string> = ref('');

    /**
     * メッセージ
     */
    const message = ref('');

    /**
     * 読込ボタン押下
     */
    function OnPushLoadButton() {
      // 現在のデータをクリア
      categoryData.rows.splice(0);
      OnResetSelectStateCategoryInfo();
      // CSVファイルからデータ読込
      electronApi.loadMstTermsFile(inputCsvPath.value, (data: mstData.mstTermsRow[], errorMessage: string) => {
        if (errorMessage) {
          message.value = errorMessage;
          return;
        }
        if (!data || data.length <= 0) {
          message.value = 'データの読込に失敗しました。';
          return;
        }
        console.log(data);
        categoryData.rows = data;
      });
    }

    /**
     * カテゴリタブの変更
     * @param type
     */
    function OnChangeCategoryTypeTab(type: string) {
      if (selectCategoryTabType.value === type) {
        return;
      }
      if (type !== CategoryType.CATEGORY && type !== CategoryType.TAG) {
        console.log(`not exist category type => ${type}`);
        return;
      }
      // カテゴリの種類を変更してデータを再読込
      selectCategoryTabType.value = type;
      OnResetSelectStateCategoryInfo();
    }

    /**
     * 検索ワードの変更
     */
    function OnChangeSearchCategoryWord(e: any) {
      // keyを更新してカテゴリ一覧を無理やり更新する
      searchCategoryWord.value = e.target.value;
      updateCategoryItemKey.value = updateCategoryItemKey.value ? 0 : 1;
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
    function OnResetSelectStateCategoryInfo() {
      message.value = null;
      // 選択情報クリア(関数呼び出しじゃないと反映されない)
      selectCategoryIdArray.value.splice(0);
      // keyを更新してカテゴリ一覧を無理やり更新する
      updateCategoryItemKey.value = updateCategoryItemKey.value ? 0 : 1;
    }

    return {
      inputCsvPath,
      categoryData,
      filteredCategoryData,
      updateCategoryItemKey,
      selectCategoryIdArray,
      selectCategoryTabType,
      searchCategoryWord,
      message,
      CategoryType,
      OnPushLoadButton,
      OnChangeCategoryTypeTab,
      OnChangeSearchCategoryWord,
      OnChangeSelectStateCategory,
      OnCopySelectStateCategoryIds,
      OnResetSelectStateCategoryInfo,
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
      <div class="category-list-tab">
        <div class="category-list-tab-btn">
          <input type="checkbox" name="category-tab" v-bind:checked="selectCategoryTabType === CategoryType.CATEGORY" />
          <div class="category-list-tab-btn-l" v-on:click="(e) => OnChangeCategoryTypeTab(CategoryType.CATEGORY)">
            カテゴリ
          </div>
        </div>
        <div class="category-list-tab-btn">
          <input type="checkbox" name="category-tab" v-bind:checked="selectCategoryTabType === CategoryType.TAG" />
          <div class="category-list-tab-btn-r" v-on:click="(e) => OnChangeCategoryTypeTab(CategoryType.TAG)">タグ</div>
        </div>
      </div>
      <div class="category-list-search-area">
        <input
          type="text"
          class="category-list-search-value"
          placeholder="検索"
          v-on:input="OnChangeSearchCategoryWord"
          v-show="categoryData.rows.length > 0"
        />
      </div>
      <div class="category-list-wrapper">
        <div :key="updateCategoryItemKey" v-for="parentData in filteredCategoryData()">
          <CategoryItem
            :categoryData="parentData"
            :isParent="true"
            :isSelected="selectCategoryIdArray.includes(parentData.id)"
            @onChangeSelectId="OnChangeSelectStateCategory"
          />
          <div :key="updateCategoryItemKey" v-for="childData in filteredCategoryData(parentData.id)">
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
    <button class="category-select-id-button" v-on:click="OnResetSelectStateCategoryInfo">リセット</button>
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
  flex-flow: column;
}
.category-list-wrapper {
  position: relative;
  width: 96%;
  height: 100%;
  display: table-cell;
  overflow-y: auto;
  margin: auto;
  margin-bottom: 12px;
}

/** カテゴリリスト タブ */
.category-list-tab {
  display: flex;
  justify-content: space-between;
  height: 48px;
  width: 100%;
  margin-bottom: 8px;
}
.category-list-tab-btn {
  position: relative;
  flex: 1;
}
.category-list-tab-btn input {
  display: none;
}
.category-list-tab-btn div {
  background-color: #333333;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.category-list-tab-btn input:checked + div {
  background-color: #111111;
}
.category-list-tab-btn-l {
  border-radius: 20px 0px 0px 0px;
}
.category-list-tab-btn-r {
  border-radius: 0px 20px 0px 0px;
}

/** カテゴリリスト フィルタ */
.category-list-search-area {
  position: relative;
  height: 24px;
  width: 96%;
  margin: auto;
  margin-bottom: 12px;
  text-align: left;
}
.category-list-search-value {
  height: 80%;
  width: 320px;
  margin-left: 20px;
  background-color: #333333;
  border: 1px solid;
  border-color: #666666;
  border-radius: 2px;
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
