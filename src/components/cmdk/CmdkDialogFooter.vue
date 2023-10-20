<script setup lang="ts">
import CmdkIconEnter from "@/components/cmdk/CmdkIconEnter.vue";
import CmdkIconDown from "@/components/cmdk/CmdkIconDown.vue";
import CmdkIconEsc from "@/components/cmdk/CmdkIconEsc.vue";
import CmdkIconUp from "@/components/cmdk/CmdkIconUp.vue";
</script>

<template>
  <div class="command-palette-logo">
    <span class="command-palette-Label">Search by EuBackend</span>
  </div>
  <ul class="command-palette-commands">
    <li>
      <kbd class="command-palette-commands-key">
        <cmdk-icon-enter />
      </kbd>
      <span class="command-palette-Label">选择</span>
    </li>
    <li>
      <kbd class="command-palette-commands-key">
        <cmdk-icon-down />
      </kbd>
      <kbd class="command-palette-commands-key">
        <cmdk-icon-up />
      </kbd>
      <span class="command-palette-Label">切换</span>
    </li>
    <li>
      <kbd class="command-palette-commands-key">
        <cmdk-icon-esc />
      </kbd>
      <span class="command-palette-Label">关闭</span>
    </li>
  </ul>
</template>
