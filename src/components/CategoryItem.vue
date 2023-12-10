<script lang="ts">
import { defineComponent } from 'vue';
import { mstData } from '../api/electron-api';

export default defineComponent({
  name: 'CategoryItem',
  props: {
    categoryData: null,
    isParent: Boolean,
    isSelected: Boolean,
  },
  emits: ['onChangeSelectId', 'onRemoveCategoryItem'],
  setup(props: { categoryData: mstData.mstTermsRow; isParent: boolean; isSelected: boolean }, { emit }) {
    const categoryData = props.categoryData;
    const isParent = props.isParent;
    const isSelected = props.isSelected;

    /**
     * カテゴリの選択状態を変更する
     * @param categoryId
     * @param isSelected
     */
    function onChangeSelectStateCategory(e: any) {
      const categoryId = categoryData.id;
      const isSelected = e.target.checked;
      emit('onChangeSelectId', categoryId, isSelected);
    }

    function onRemoveCategoryItem(e: any) {
      const categoryId = categoryData.id;
      emit('onRemoveCategoryItem', categoryId);
    }

    return {
      categoryData,
      isParent,
      isSelected,
      onChangeSelectStateCategory,
      onRemoveCategoryItem,
    };
  },
});
</script>

<template>
  <li class="category-item-root">
    <input
      class="category-item-checkbox"
      type="checkbox"
      v-on:change="onChangeSelectStateCategory"
      :checked="isSelected"
    />
    <span class="category-item" :class="isParent ? 'category-item-parent' : 'category-item-child'">
      {{ categoryData.name }}
    </span>
    <button class="category-delete-btn" v-on:click="onRemoveCategoryItem">×</button>
  </li>
</template>

<style scoped>
.category-item-root {
  display: flex;
  justify-content: space-between;
  vertical-align: middle;
  list-style: none;
  height: 32px;
  margin-left: 20px;
}
.category-item-checkbox {
  height: 20px;
  width: 20px;
}
.category-item {
  text-align: left;
  flex: 1;
}
.category-item-parent {
  margin-left: 12px;
}
.category-item-child {
  margin-left: 40px;
}
.category-delete-btn {
  width: 60px;
  height: 20px;
  line-height: 22px;
  font-size: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  background: none;
  border: none;
}
</style>
