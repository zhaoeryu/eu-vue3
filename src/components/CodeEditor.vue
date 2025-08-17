<script setup lang="ts">
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { sql } from '@codemirror/lang-sql';
import { xml } from '@codemirror/lang-xml';
import { oneDark } from '@codemirror/theme-one-dark';
import { onMounted, ref, watch, onUnmounted } from 'vue';

const props = defineProps({
  value: {
    type: String,
    required: true,
  },
  height: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['update:value']);

const editorRef = ref<HTMLElement>();
let editor: EditorView | null = null;

// 根据模式获取语言支持
function getLanguageSupport(mode: string) {
  switch (mode) {
    case 'javascript':
    case 'js':
      return javascript();
    case 'ts':
      return javascript({ typescript: true });
    case 'sql':
      return sql();
    case 'xml':
    case 'html':
      return xml();
    default:
      return javascript();
  }
}

// 创建编辑器
function createEditor() {
  if (!editorRef.value) return;

  const state = EditorState.create({
    doc: props.value,
    extensions: [
      basicSetup,
      getLanguageSupport(props.mode),
      oneDark,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          emit('update:value', update.state.doc.toString());
        }
      }),
    ],
  });

  editor = new EditorView({
    state,
    parent: editorRef.value,
  });

  // 设置高度
  if (editorRef.value) {
    editorRef.value.style.height = props.height;
  }
}

// 监听值变化
watch(
  () => props.value,
  (newValue) => {
    if (editor && newValue !== editor.state.doc.toString()) {
      editor.dispatch({
        changes: {
          from: 0,
          to: editor.state.doc.length,
          insert: newValue,
        },
      });
    }
  },
);

// 监听模式变化
watch(
  () => props.mode,
  () => {
    if (editor) {
      const newState = EditorState.create({
        doc: editor.state.doc.toString(),
        extensions: [basicSetup, getLanguageSupport(props.mode), oneDark],
      });
      editor.setState(newState);
    }
  },
);

// 监听高度变化
watch(
  () => props.height,
  (newHeight) => {
    if (editorRef.value) {
      editorRef.value.style.height = newHeight;
    }
  },
);

onMounted(() => {
  createEditor();
});

onUnmounted(() => {
  if (editor) {
    editor.destroy();
  }
});
</script>

<template>
  <div class="editor-wrapper">
    <div ref="editorRef" class="codemirror-editor" />
  </div>
</template>

<style scoped lang="scss">
.editor-wrapper {
  font-size: 13px;

  .codemirror-editor {
    height: 100%;
    min-height: 200px;
  }
}

:deep(.cm-editor) {
  height: 100%;
}

:deep(.cm-scroller) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>
