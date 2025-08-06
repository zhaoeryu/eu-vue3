<script>
export default {
  name: 'First',
  dicts: ['zhaoey'],
  data() {
    return {
      dicta: null,
      dictValue: null,
    }
  },
  mounted() {
    this.dictValue = 1234
  }
}
</script>

<template>
  <div class="page-container">
    <div class="index__title">first</div>
    <dict-select v-model="dicta" dict-key="zhaoey" />
    <dict-tag :value="dictValue" dict-key="zhaoey" />
    <dict-text :value="dictValue" dict-key="zhaoey" />
    <ul>
      <li v-for="(item, index) in dict['zhaoeyDict'].values" :key="index">{{ item.label }} - {{ item.value }}</li>
    </ul>
  </div>
</template>

<style scoped lang="scss">

</style>
