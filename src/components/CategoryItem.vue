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
  emits: ['onChangeSelectId'],
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

    return {
      categoryData,
      isParent,
      isSelected,
      onChangeSelectStateCategory,
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
  </li>
</template>

<style scoped>
.category-item-root {
  display: flex;
  justify-content: left;
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
}
.category-item-parent {
  margin-left: 12px;
}
.category-item-child {
  margin-left: 40px;
}
</style>
