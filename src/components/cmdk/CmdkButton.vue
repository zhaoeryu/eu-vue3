<script setup lang="ts">
const emit = defineEmits(['search']);
</script>

<template>
  <button
    type="button"
    class="eu-cmdk-btn"
    @click="emit('search')"
  >
    <span class="eu-cmdk-text">
      <svg-icon icon-class="search" />
      <span class="eu-cmdk-placeholder">搜索</span>
    </span>
    <span class="eu-cmdk-keys">
      <kbd>
        <svg-icon icon-class="cmd" />
      </kbd>
      <kbd>K</kbd>
    </span>
  </button>
</template>

<style scoped lang="scss">
html.dark .eu-cmdk-btn {
  --eu-cmdk-bg: #161618;
}

.eu-cmdk-btn {
  --eu-cmdk-bg: #f6f6f7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  white-space: nowrap;
  font-size: 13px;
  box-sizing: border-box;
  border: 1px solid transparent;
  border-radius: 4px;
  background: var(--eu-cmdk-bg);
  color: var(--eu-color-text-tertiary);
  padding: 4px 8px;
  cursor: pointer;
  user-select: none;

  &:hover {
    border-color: var(--eu-color-primary);
    color: var(--eu-color-text-secondary);
  }

  .eu-cmdk-text {
    .svg-icon {
      margin-right: 8px;
    }

    .eu-cmdk-placeholder {
      padding-right: 16px;
    }
  }

  .eu-cmdk-keys {
    border: 1px solid var(--eu-color-border-primary);
    padding: 2px 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    color: var(--eu-color-text-tertiary);
    font-weight: 500;

    kbd {
      height: 1em;
      line-height: 1em;
    }

    //kbd:first-child {
    //  padding-right: 2px;
    //}
    kbd:last-child {
      line-height: 0.99em;
    }
  }
}
</style>
