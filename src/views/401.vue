<template>
  <div class="not-found-page">
    <div style="display: flex;justify-content: space-between;align-items: center;margin-bottom: 200px;">
      <img src="@/assets/images/unauthorized.png" alt="" width="200">
      <div class="not-found">
        <div class="not-found__404">抱歉，您没有权限访问该页面</div>
        <div class="not-found__desc">
          <p>解决办法：</p>
          <p>您可以向上级领导申请开通该权限</p>
        </div>
        <el-button type="primary" @click="$router.back()">回到上一个页面</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

</script>

<style lang='scss' scoped>
html.dark {
  img {
    filter: invert(0.5);
  }
}
.not-found-page {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.not-found {
  //margin-bottom: 200px;
  margin-left: 100px;
}
.not-found__404 {
  font-size: 20px;
}
.not-found__desc {
  margin: 30px 0;
  color: #606266;
  font-size: 14px;
  p {
    line-height: 2.5em;
  }
}
.el-button {
  width: 150px;
  letter-spacing: 0.1em;
}
</style>
