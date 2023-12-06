<script setup lang="ts">
import { defineComponent, onMounted, reactive, Ref, ref } from 'vue';

const inputCsvPath = ref('/Users/plasma/workspace/GitProjects/wp-next-elekibear/data/db/mst_terms.csv');

const OnPushLoadButton = () => {
  // TODO Electron APIを介して読み込む
  console.log('load => ' + inputCsvPath.value);
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
