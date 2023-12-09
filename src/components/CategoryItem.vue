<script lang="ts">
import { defineComponent } from 'vue';
import { mstData } from '../api/electron-api';

export default defineComponent({
  name: 'CategoryItem',
  props: {
    categoryData: null,
    isParent: Boolean,
  },
  setup(props: { categoryData: mstData.mstTermsRow; isParent: boolean }) {
    const categoryData = props.categoryData;
    const isParent = props.isParent;

    return {
      categoryData,
      isParent,
    };
  },
});
</script>

<template>
  <li class="category-item" :class="isParent ? 'category-item-parent' : 'category-item-child'">
    {{ categoryData.name }}
  </li>
</template>

<style scoped>
.category-item {
  text-align: left;
  list-style: none;
  height: 28px;
}
.category-item-parent {
  margin-left: 20px;
}
.category-item-child {
  margin-left: 40px;
}
</style>
