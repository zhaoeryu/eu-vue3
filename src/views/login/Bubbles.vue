<template>
  <div class="bubbles-wrapper">
    <ul class="bubbles">
      <li
        v-for="item in 10"
        :key="item"
        :style="{
          '--bubble-size': `${Math.floor(Math.random() * 111) + 20}px`,
          '--bubble-delay': `${parseFloat((Math.random() * 5).toFixed(1))}s`,
          '--bubble-left': `${5 + (10 * (item - 1)) + (Math.floor(Math.random() * 6))}%`
        }"
      ></li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
// 往上升的泡泡
.bubbles-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  // 泡泡的大小
  --bubble-size: 20px;
  // 泡泡的上升延迟
  --bubble-delay: 0s;
  // 泡泡的X轴位置
  --bubble-left: 5%;
  z-index: 0;
}
.bubbles > li {
  position: absolute;
  list-style: none;
  display: block;
  width: var(--bubble-size);
  height: var(--bubble-size);
  background-color: #FFF;
  bottom: -160px;
  animation: bubblesUp 5s linear infinite;
  animation-delay: var(--bubble-delay);
  left: var(--bubble-left);
}

@keyframes bubblesUp {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.3;
    border-radius: 0;
  }
  100% {
    transform: translateY(-1000px) rotate(2turn);
    opacity: 0;
    border-radius: 50%;
  }
}
</style>
