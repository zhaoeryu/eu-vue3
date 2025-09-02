import { setCurrent, getCurrent } from 'dom-zindex';
import { useZIndex } from 'element-plus';
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';

export function useSameIndex() {
  const { currentZIndex, nextZIndex } = useZIndex();
  const vxeCurrentZIndex = ref(getCurrent());
  const observer = new MutationObserver(() => {
    const newZIndex = getCurrent();
    if (newZIndex > vxeCurrentZIndex.value) {
      vxeCurrentZIndex.value = newZIndex;
    }
    if (currentZIndex.value < newZIndex) {
      const diff = newZIndex - currentZIndex.value;
      for (let i = 0; i < diff; i++) {
        nextZIndex();
      }
    }
  });

  const startObserving = () => {
    const targetElement = document.querySelector('#z-index-manage');
    if (targetElement) {
      observer.observe(targetElement, {
        attributes: true,
        attributeFilter: ['data-m'],
      });
    }
  };

  const stopObserving = () => {
    observer.disconnect();
  };

  watch(
    currentZIndex,
    z =>
      nextTick(() => {
        if (z > vxeCurrentZIndex.value) {
          setCurrent(z);
          vxeCurrentZIndex.value = z;
        }
      }),
    { immediate: true }
  );

  onMounted(() => {
    startObserving();
  });

  onUnmounted(() => {
    stopObserving();
  });

  return {
    currentZIndex,
    nextZIndex,
    vxeCurrentZIndex,
    startObserving,
    stopObserving,
  };
}
