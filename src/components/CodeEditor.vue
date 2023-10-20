<script setup lang="ts">
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'

// 替换主题这里需修改名称
import 'codemirror/theme/darcula.css'
import 'codemirror/mode/clike/clike'
import 'codemirror/mode/vue/vue'
import 'codemirror/mode/xml/xml'
import 'codemirror/mode/sql/sql'
import 'codemirror/mode/javascript/javascript'
import {onMounted, ref, watch} from "vue";

const props = defineProps({
  value: {
    type: String,
    required: true
  },
  height: {
    type: String,
    required: true
  },
  mode: {
    type: String,
    required: true
  }
})

const editor = ref(null)

const refTextarea = ref(null)

watch(() => props.value, (value) => {
  const editorValue = editor.value.getValue()
  if (value !== editorValue) {
    editor.value.setValue(value)
  }
})

watch(() => props.mode, (value) => {
  if (!value) {
    return
  }
  if (editor.value) {
    editor.value.setOption('mode', value)
  }
}, { immediate: true })

watch(() => props.height, (value) => {
  editor.value.setSize('auto', value)
})

onMounted(() => {
  editor.value = CodeMirror.fromTextArea(refTextarea.value, {
    mode: props.mode,
    lineNumbers: true,
    lint: true,
    lineWrapping: true,
    tabSize: 2,
    cursorHeight: 1,
    theme: 'darcula',
    readOnly: true
  })

  editor.value.setSize('auto', props.height)
  editor.value.setValue(props.value)
})

</script>

<template>
  <div class="editor-wrapper">
    <textarea ref="refTextarea" />
  </div>
</template>

<style scoped lang="scss">
.editor-wrapper {
  font-size: 13px;
}
</style>
