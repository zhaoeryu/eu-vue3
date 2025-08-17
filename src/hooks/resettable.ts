import { reactive, type Ref, ref } from 'vue';

function defaultClone(value: any) {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  return JSON.parse(JSON.stringify(value));
}
export function useResettableRef<T>(value: T, clone = defaultClone) {
  const state = ref(clone(value)) as Ref<T>;
  const reset = () => {
    state.value = clone(value);
  };
  return { state, reset };
}

export function useResettableReactive<T extends object>(value: T, clone = defaultClone) {
  const state = reactive(clone(value)) as T;
  const reset = (itemKey?: keyof T) => {
    if (itemKey) {
      if (Object.prototype.hasOwnProperty.call(value, itemKey)) {
        delete state[itemKey];
        state[itemKey] = clone(value[itemKey]);
      }
    } else {
      Object.keys(state).forEach((key) => delete state[key as keyof T]);
      Object.assign(state, clone(value));
    }
  };
  return [state, reset] as const;
}
