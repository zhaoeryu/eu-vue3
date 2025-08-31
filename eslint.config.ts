import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import { globalIgnores } from 'eslint/config'
import importPlugin from 'eslint-plugin-import';
import pluginVue from 'eslint-plugin-vue'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/public/**']),

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  vueTsConfigs.recommendedTypeChecked,
  vueTsConfigs.stylisticTypeChecked,
  importPlugin.flatConfigs.recommended,
  skipFormatting,
  {
    files: ['**/*.{ts,vue}'],
    rules: {
      // 禁用 组件名称使用多单词
      'vue/multi-word-component-names': 'off',
      // 允许 any类型
      '@typescript-eslint/no-explicit-any': 'off',
      // 没使用的变量可以使用下划线开头
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      // 不强制处理Promise的catch
      "@typescript-eslint/no-floating-promises": "off",
      // 不强制使用await
      "@typescript-eslint/require-await": "off",
      // 强制使用一致的类型导入语法
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          "prefer": "type-imports",
          "disallowTypeAnnotations": false,
          "fixStyle": "separate-type-imports"
        }
      ],
      // 禁用 import { type A } from 'XXX'; 建议 import type { A } from 'XXX';
      "import/consistent-type-specifier-style": [
        "error",
        "prefer-top-level"
      ],
      // 导入依赖的顺序配置
      "import/order": [
        "error",
        {
          // 按这个分组顺序进行排序
          "groups": [
            "builtin",
            "external",
            "internal",
            "sibling",
            "parent",
            "index",
            "unknown",
          ],
          // 通过路径自定义分组
          "pathGroups": [
            {
              "pattern": "@/**",
              "group": "external",
              "position": "after"
            }
          ],
          "pathGroupsExcludedImportTypes": [],
          // 每个分组之间换行
          "newlines-between": "always",
          "alphabetize": {
            "order": "asc",
            // 是否忽略大小写
            "caseInsensitive": true
          },
          // 如果为 true，未命名的导入，给出警告，但是不做 fix。false 的话，不做警告。建议 false，手动把样式放在最后。
          "warnOnUnassignedImports": false
        }
      ],
      // 导入解析
      'import/no-unresolved': [
        'error',
        {
          // 忽略vite虚拟路径
          ignore: ['virtual:'],
        },
      ],
    },
    settings: {
      "import/resolver": {
        "typescript": {
          "alwaysTryTypes": true,
          "project": [
            "tsconfig.json",
            "tsconfig.app.json",
          ]
        },
      },
    }
  }
)
