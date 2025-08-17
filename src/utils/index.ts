import _ from 'lodash';

/**
 * @description: 判断是否是外部链接
 * @param {string} path 路径
 * @returns {boolean}
 */
export function isExternal(path: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(path);
}

/**
 * 路径去除多余的'/'，如果是外部链接则不处理
 * @param {string} path 路径
 * @returns {string} 处理后的路径
 */
export function pathTrim(path: string): string {
  if (isExternal(path)) {
    return path;
  }
  return _.trimEnd(_.replace(path, /\/+/g, '/'), '/');
}

/**
 * 移除字符串开头的/
 * @param {String} str 待处理的字符串
 * @param {Boolean} isOnlyKeep 如果只是/是否保留，默认为false
 * @returns {String}
 */
export function removeLeadingSlash(str: string, isOnlyKeep = false): string {
  if (!str) {
    return str;
  }
  if (isOnlyKeep) {
    return _.startsWith(str, '/') ? str.slice(1) : str;
  }
  return _.trimStart(str, '/');
}

/**
 * 字符串添加开头的/，如果是/开头则不处理
 * @param {String} str 待处理的字符串
 * @returns {String}
 */
export function addLeadingSlash(str: string): string {
  if (!str) {
    return str;
  }
  return _.startsWith(str, '/') ? str : '/' + str;
}

export function removeEndSlash(str: string): string {
  if (!str) {
    return str;
  }
  return _.endsWith(str, '/') ? str.slice(0, -1) : str;
}

/**
 * 解析url参数
 * @param {string} url httpUrl
 * @returns {{}} 解析后的参数对象
 */
export function getQueryParams(url: string): Record<string, string> {
  const keyValueArr = url.split('?')[1].split('&');
  const paramObj: Record<string, string> = {};
  keyValueArr.forEach((item) => {
    const keyValue = item.split('=');
    paramObj[keyValue[0]] = keyValue[1];
  });
  return paramObj;
}

/**
 * 根据当前时间返回问候语
 * @returns {string}
 */
export function timeGreeting(): string {
  const time = new Date();
  const hour = time.getHours();
  return hour < 9 ? '早上好' : hour <= 11 ? '上午好' : hour <= 13 ? '中午好' : hour < 20 ? '下午好' : '晚上好';
}

export interface TreeConfig {
  configIdKey?: string;
  configParentIdKey?: string;
  configChildrenKey?: string;
}

export interface TreeNode {
  [key: string]: any;
  children?: TreeNode[];
}

/**
 * 处理树形结构数据
 * @param {Array} data 数据源
 * @param {string} configIdKey id字段名
 * @param {string} configParentIdKey 父id字段名
 * @param {string} configChildrenKey 子节点字段名
 * @returns {Array} 处理后的数据
 */
export function handleTreeData(data: any[], { configChildrenKey, configIdKey, configParentIdKey }: TreeConfig = {}): TreeNode[] {
  const config = {
    id: configIdKey || 'id',
    parentId: configParentIdKey || 'parentId',
    children: configChildrenKey || 'children',
  };

  const childrenListMap: Record<string, TreeNode[]> = {};
  const tree: TreeNode[] = [];

  // 生成节点列表
  for (const item of data) {
    const parentId = item[config.parentId];
    if (parentId) {
      if (!childrenListMap[parentId]) {
        childrenListMap[parentId] = [];
      }
      childrenListMap[parentId].push(item);
    } else {
      tree.push(item);
    }
  }

  const makeTree = (parent: TreeNode) => {
    const children = childrenListMap[parent[config.id]];
    if (children) {
      parent[config.children] = children;
      for (const child of children) {
        makeTree(child);
      }
    }
  };

  for (const item of tree) {
    makeTree(item);
  }

  return tree;
}

/**
 * 扁平化树形数据
 * @param {Array} data 树形数据
 * @param {Object} options 配置
 * @returns {Array} 扁平化后的数据
 */
export function flattenTreeData(
  data: TreeNode[],
  options: {
    childrenKey?: string;
  } = {} as {
    childrenKey?: string;
  },
): TreeNode[] {
  const { childrenKey = 'children' } = options;
  return (data || []).reduce((res, item) => {
    const { [childrenKey]: children, ...i } = item;
    return res.concat([i], flattenTreeData(children));
  }, [] as TreeNode[]);
}

/**
 * 获取所有子节点的指定字段
 * @param {Object} node 节点
 * @param {Object} options 配置
 * @returns {Array} 字段值数组
 */
export function getChildrenFields(
  node: TreeNode,
  options: {
    fieldKey: string;
    childrenKey?: string;
  } = {} as {
    fieldKey: string;
    childrenKey?: string;
  },
): any[] {
  const { fieldKey, childrenKey = 'children' } = options;
  const result = [];
  if (node[childrenKey] && node[childrenKey].length) {
    node[childrenKey].forEach((item: TreeNode) => {
      result.push(item[fieldKey]);
      if (item[childrenKey] && item[childrenKey].length) {
        result.push(...getChildrenFields(item, { fieldKey, childrenKey }));
      }
    });
  } else {
    result.push(node[fieldKey]);
  }
  return result;
}

/**
 * 获取第一个子节点的指定字段
 * @param {Object} node 节点
 * @param {Object} options 配置
 * @returns {*} 字段值
 */
export function getFirstChildrenFields(
  node: TreeNode,
  options: {
    fieldKey: string;
    childrenKey?: string;
    condition?: (node: TreeNode) => boolean;
  } = {} as {
    fieldKey: string;
    childrenKey?: string;
    condition?: (node: TreeNode) => boolean;
  },
): any {
  const { fieldKey, childrenKey = 'children', condition = () => true } = options;
  const childrenProps = [];
  childrenProps.push(node[fieldKey]);
  const extraCondition = condition(node);
  if (node[childrenKey] && node[childrenKey].length && extraCondition) {
    childrenProps.push(
      ...getFirstChildrenFields(node[childrenKey][0], {
        fieldKey,
        childrenKey,
        condition,
      }),
    );
  }
  return childrenProps;
}

// type TreeNodeConfig = {
//   fieldKey: string
//   idKey?: string
//   childrenKey?: string
// }

/**
 * 根据叶子节点ID获取父节点路径
 * @param {Array} tree 树形数据
 * @param {string|number} leafId 叶子节点ID
 * @param {Object} options 配置
 * @returns {Array} 父节点路径
 */
export function getParentFieldsByLeafId(
  tree: TreeNode[],
  leafId: string | number | null,
  options: {
    fieldKey: string;
    idKey?: string;
    childrenKey?: string;
  } = {} as {
    fieldKey: string;
    idKey?: string;
    childrenKey?: string;
  },
): (string | number | undefined)[] {
  const { fieldKey, idKey = 'id', childrenKey = 'children' } = options;
  const findParentNodes = (node: TreeNode, result: (string | number | undefined)[]) => {
    if (node[idKey] === leafId) {
      // 指定的叶子节点也进行到结果中
      result.push(node[fieldKey]);
      return true;
    }
    if (node[childrenKey] && node[childrenKey].length > 0) {
      for (const child of node[childrenKey]) {
        if (findParentNodes(child, result)) {
          result.push(node[fieldKey]);
          return true;
        }
      }
    }
  };

  const result: (string | number | undefined)[] = [];
  for (const node of tree) {
    findParentNodes(node, result);
  }
  return result.reverse();
}

/**
 * 下载blob文件
 * @param blobData blob数据
 * @param filename 文件名
 */
export function downloadBlobFile(blobData: Blob, filename: string) {
  const blobUrl = window.URL.createObjectURL(blobData);
  const linkDom = document.createElement('a');
  linkDom.style.display = 'none';
  linkDom.href = blobUrl;
  linkDom.setAttribute('download', filename);
  if (typeof linkDom.download === 'undefined') {
    linkDom.setAttribute('target', '_blank');
  }
  document.body.appendChild(linkDom);
  linkDom.click();
  document.body.removeChild(linkDom);
  window.URL.revokeObjectURL(blobUrl);
}

/**
 * 下载文件
 * @param {string} url 文件URL
 * @param {string} fileName 文件名
 */
export function downloadFile(url: string, fileName: string): void {
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = url;
  link.target = '_blank';
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 将base64转换为文件
 * @param {string} base64Str base64字符串
 * @param {string} fileName 文件名
 * @returns {File} 文件对象
 */
export function dataURLtoFile(base64Str: string, fileName: string): File {
  const arr = base64Str.split(','),
    // base64解析出来的图片类型
    mime = arr[0].match(/:(.*?);/)?.[1],
    // 对base64串进行操作，去掉url头，并转换为byte   atob为window内置方法
    bstr = atob(arr[1]);
  let len = bstr.length;
  // 将ASCII码小于0的转换为大于0
  const ab = new ArrayBuffer(len),
    u8arr = new Uint8Array(ab);
  while (len--) {
    u8arr[len] = bstr.charCodeAt(len);
  }
  // 创建新的 File 对象实例[utf-8内容，文件名称或者路径，[可选参数，type：文件中的内容mime类型]]
  return new File([u8arr], fileName, {
    type: mime,
  });
}

/**
 * 驼峰命名转下划线命名
 * @param {string} str 驼峰字符串
 * @returns {string} 下划线字符串
 */
export function camelCaseToUnderline(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

/**
 * 加载静态图片
 * @param path @/assets/images/xx.png
 */
export function requireImage(path: string): string {
  return new URL(path, import.meta.url).href;
}

/**
 * 延时
 * @param ms 毫秒
 */
export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
