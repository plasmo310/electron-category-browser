<script lang="ts">
import { Ref, defineComponent, onMounted, reactive, ref } from 'vue';
import { mstData, useElectronApi } from '../api/electron-api';
import CategoryItem from './CategoryItem.vue';

type CategoryData = {
  rows: mstData.mstTermsRow[];
};

// カテゴリ種別
namespace CategoryType {
  export const CATEGORY = 'category';
  export const TAG = 'post_tag';
}

// 親カテゴリのparentId
const CATEGORY_PARENT_ID = '0';

export default defineComponent({
  name: 'CategoryBrowser',
  components: {
    CategoryItem,
  },
  setup() {
    const electronApi = useElectronApi();

    onMounted(() => {
      loadAllStoreData();
    });

    /**
     * 保存データキー
     */
    const StoreDataKey = {
      InputCsvPath: 'InputCsvPath',
    };

    /**
     * 保存データロード処理
     */
    const loadAllStoreData = () => {
      // 保存されているデータがあれば設定する
      electronApi.loadStoreData(StoreDataKey.InputCsvPath, (storeData) => {
        if (storeData != undefined) {
          inputCsvPath.value = storeData;
        }
      });
    };

    /**
     * 入力CSVパス
     */
    const inputCsvPath: Ref<string> = ref('/data/dummy_data.csv');
    const onChangeInputCsvPath = (e: any) => {
      let inputValue = e.target.value;
      electronApi.saveStoreData(StoreDataKey.InputCsvPath, inputValue);
    };

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
    function getCategoryDataFromId(id: string) {
      return categoryData.rows.find((data) => data.id === id);
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
     * 追加カテゴリ 入力情報
     */
    const addCategoryName: Ref<string> = ref('');
    const addCetegorySlug: Ref<string> = ref('');
    const addCategoryParent: Ref<string> = ref(CATEGORY_PARENT_ID);

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
      OnResetAddCategoryInfo();
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
     * 保存ボタン押下
     */
    function OnPushSaveButton() {
      if (!inputCsvPath.value || !categoryData?.rows || categoryData.rows.length <= 0) {
        message.value = 'カテゴリ情報が読み込まれていません。';
        return;
      }
      electronApi.saveMstTermsFile(inputCsvPath.value, categoryData.rows, (errorMessage) => {
        if (errorMessage) {
          message.value = errorMessage;
          return;
        }
        message.value = 'カテゴリ情報を保存しました。';
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
      OnResetAddCategoryInfo();
    }

    /**
     * 検索ワードの変更
     */
    function OnChangeSearchCategoryWord(e: any) {
      // keyを更新してカテゴリ一覧を無理やり更新する
      searchCategoryWord.value = e.target.value;
      RefreshForceCategoryItem();
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
     * 選択中のカテゴリIDをクリップボードにコピーする
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
      searchCategoryWord.value = null;
      // 選択情報クリア(関数呼び出しじゃないと反映されない)
      selectCategoryIdArray.value.splice(0);
      RefreshForceCategoryItem();
    }

    /**
     * カテゴリ追加
     */
    function OnAddCategoryItem() {
      if (!categoryData?.rows || categoryData.rows.length <= 0) {
        message.value = 'データが読み込まれていません。';
        return;
      }
      const categoryName: string = addCategoryName.value;
      const categorySlug: string = addCetegorySlug.value;
      const categoryParent: string = addCategoryParent.value;
      if (!categoryName || !addCetegorySlug || categoryParent == null || categoryParent.length <= 0) {
        message.value = '必要な情報が入力されていません。';
        return;
      }

      // 新しいIDの取得
      let maxId = -1;
      for (const data of categoryData.rows) {
        maxId = Math.max(maxId, Number(data.id));

        if (data.name === categoryName || data.slug === categorySlug) {
          message.value = '入力されたカテゴリは既に存在しています。';
          return;
        }
      }
      const newId = maxId + 1;

      // カテゴリをデータに追加
      categoryData.rows.push({
        id: String(newId),
        name: categoryName,
        taxonomy: selectCategoryTabType.value,
        slug: categorySlug,
        parent: categoryParent,
      });
      message.value = `カテゴリを追加しました。{ id: ${newId} }`;
      console.log(`add => ${newId} ${categoryName} ${categorySlug} ${categoryParent}`);

      RefreshForceCategoryItem();
    }

    /**
     * カテゴリ追加情報のリセット
     */
    function OnResetAddCategoryInfo() {
      addCategoryName.value = null;
      addCetegorySlug.value = null;
      addCategoryParent.value = CATEGORY_PARENT_ID;
    }

    /**
     * カテゴリ削除
     * @param id
     */
    function OnRemoveCategoryItem(id: string) {
      const removeCategory = categoryData.rows.find((data) => data.id === id);
      if (!removeCategory) {
        message.value = `削除するカテゴリが見つかりません id: ${id}`;
        return;
      }

      // 親要素の場合、子カテゴリも削除対象に含める
      let removeCategoryIds = [removeCategory.id];
      if (removeCategory.parent == CATEGORY_PARENT_ID) {
        const childData = categoryData.rows.filter((data) => data.parent == removeCategory.id);
        removeCategoryIds = removeCategoryIds.concat(childData.map((data) => data.id));
      }

      // 削除して表示を更新
      categoryData.rows = categoryData.rows.filter((data) => !removeCategoryIds.includes(data.id));
      for (const removeCategoryId of removeCategoryIds) {
        const index = selectCategoryIdArray.value.indexOf(removeCategoryId);
        if (index >= 0) {
          selectCategoryIdArray.value.splice(index, 1);
        }
      }
      console.log('remove => ' + removeCategoryIds);

      RefreshForceCategoryItem();
    }

    /**
     * カテゴリアイテムの表示更新
     */
    function RefreshForceCategoryItem() {
      // keyを更新してカテゴリ一覧を無理やり更新する
      updateCategoryItemKey.value = updateCategoryItemKey.value ? 0 : 1;
    }

    return {
      inputCsvPath,
      categoryData,
      filteredCategoryData,
      getCategoryDataFromId,
      updateCategoryItemKey,
      selectCategoryIdArray,
      selectCategoryTabType,
      searchCategoryWord,
      addCategoryName,
      addCetegorySlug,
      addCategoryParent,
      message,
      CategoryType,
      onChangeInputCsvPath,
      OnPushLoadButton,
      OnPushSaveButton,
      OnChangeCategoryTypeTab,
      OnChangeSearchCategoryWord,
      OnChangeSelectStateCategory,
      OnCopySelectStateCategoryIds,
      OnResetSelectStateCategoryInfo,
      OnAddCategoryItem,
      OnRemoveCategoryItem,
    };
  },
});
</script>
0
<template>
  <div class="container">
    <div class="container-item load-path-area">
      <input class="load-input-path" v-model="inputCsvPath" v-on:input="onChangeInputCsvPath" />
      <button class="load-input-button" v-on:click="OnPushLoadButton">読込</button>
      <button class="load-input-button" v-on:click="OnPushSaveButton">保存</button>
    </div>
    <div class="container-item add-category-area">
      <input class="add-category-value-name" type="text" placeholder="名前" v-model="addCategoryName" />
      <input class="add-category-value-slug" type="text" placeholder="スラッグ" v-model="addCetegorySlug" />
      <select
        class="add-category-value-parent"
        v-model="addCategoryParent"
        placeholder="親カテゴリ"
        :disabled="selectCategoryTabType === CategoryType.TAG"
      >
        <option v-bind:value="'0'" v-bind:key="'0'">親カテゴリ無し</option>
        <option v-for="parentData in filteredCategoryData()" v-bind:value="parentData.id" v-bind:key="parentData.id">
          {{ `${parentData.name}` }}
        </option>
      </select>
      <button class="add-category-btn" v-on:click="OnAddCategoryItem">追加</button>
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
          s
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
            @onRemoveCategoryItem="OnRemoveCategoryItem"
          />
          <div :key="updateCategoryItemKey" v-for="childData in filteredCategoryData(parentData.id)">
            <CategoryItem
              :categoryData="childData"
              :isParent="false"
              :isSelected="selectCategoryIdArray.includes(childData.id)"
              @onChangeSelectId="OnChangeSelectStateCategory"
              @onRemoveCategoryItem="OnRemoveCategoryItem"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="container-item category-select-id-area">
    <span class="category-select-id-label">選択：</span>
    <span class="category-select-id-value">{{
      selectCategoryIdArray.map((id) => getCategoryDataFromId(id).name).join(', ')
    }}</span>
    <button class="category-select-id-button" v-on:click="OnCopySelectStateCategoryIds">IDコピー</button>
    <button class="category-select-id-button" v-on:click="OnResetSelectStateCategoryInfo">リセット</button>
  </div>
  <div class="container-item message-area">{{ message }}</div>
</template>

<style scoped>
.container {
  text-align: center;
  display: flex;
  flex-flow: column;
  width: 600px;
}
.container-item {
  margin-bottom: 24px;
  width: 600px;
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
.load-input-button {
  width: 60px;
  height: 120%;
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 8px;
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
  width: 60px;
}
.category-select-id-value {
  flex: 1;
  height: 120%;
  overflow: auto;
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

/** カテゴリ追加 */
.add-category-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 32px;
}
.add-category-value-name {
  flex: 1;
  height: 100%;
}
.add-category-value-slug {
  flex: 1;
  height: 100%;
  margin-left: 8px;
}
.add-category-value-parent {
  width: 160px;
  height: 112%;
  margin-left: 8px;
}
.add-category-btn {
  width: 60px;
  height: 120%;
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 8px;
  box-shadow: 2px 2px 6px #555555;
}

/** メッセージ */
.message-area {
  height: 20px;
}
</style>
