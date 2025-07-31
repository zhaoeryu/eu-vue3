import _ from 'lodash'
/**
 * @description: 判断是否是外部链接
 * @param {string} path 路径
 * @returns {boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * 路径去除多余的'/'，如果是外部链接则不处理
 * @param {string} path 路径
 * @returns {string} 处理后的路径
 */
export function pathTrim(path) {
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
export function removeLeadingSlash(str, isOnlyKeep = false) {
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
export function addLeadingSlash(str) {
  if (!str) {
    return str;
  }
  return _.startsWith(str, '/') ? str : '/' + str;
}
export function removeEndSlash(str) {
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
export function getQueryParams(url) {
  const keyValueArr = url.split('?')[1].split('&')
  const paramObj = {}
  keyValueArr.forEach(item => {
    const keyValue = item.split('=')
    paramObj[keyValue[0]] = keyValue[1]
  })
  return paramObj
}

/**
 * 根据当前时间返回问候语
 * @returns {string}
 */
export function timeGreeting () {
  const time = new Date()
  const hour = time.getHours()
  return hour < 9 ? '早上好' : hour <= 11 ? '上午好' : hour <= 13 ? '中午好' : hour < 20 ? '下午好' : '晚上好'
}

/**
 * 处理树形结构数据
 * @param {Array} data 数据源
 * @param {string} configIdKey id字段名
 * @param {string} configParentIdKey 父id字段名
 * @param {string} configChildrenKey 子节点字段名
 * @returns {Array} 处理后的数据
 */
export function handleTreeData(data, { configChildrenKey, configIdKey, configParentIdKey } = {} ) {
  const config = {
    id: configIdKey || 'id',
    parentId: configParentIdKey || 'parentId',
    children: configChildrenKey || 'children'
  }

  const childrenListMap = {}
  const tree = []

  // 生成节点列表
  for (const item of data) {
    const parentId = item[config.parentId]
    if (!childrenListMap[parentId]) {
      childrenListMap[parentId] = []
    }
    childrenListMap[parentId].push(item)
  }

  // 生成根节点
  for (const item of data) {
    if (!item[config.parentId]) {
      tree.push(item)
    } else {
      // 如果根节点有parentId，但是对应的parentId的节点不存在，则将该节点放入根节点
      const parentExists = data.some((parentItem) => parentItem[config.id] === item[config.parentId])
      if (!parentExists) {
        tree.push(item)
      }
    }
  }

  // 递归生成树
  const makeTree = (parent) => {
    const menuId = parent[config.id]
    if (childrenListMap[menuId]) {
      parent[config.children] = childrenListMap[menuId]
      for (const item of parent[config.children]) {
        makeTree(item)
      }
    }
  }

  for (const item of tree) {
    makeTree(item)
  }
  return tree
}

/**
 * 扁平化树形结构数据
 * @param {Array} data 树形结构数据
 * @param {string} childrenKey 子节点字段名
 * @returns {Array} 处理后的数据
 */
export function flattenTreeData(data, {
  childrenKey = 'children'
} = {}) {
  return (data || []).reduce((res, item) => {
    const { [childrenKey]: children, ...i } = item
    return res.concat([i], this.flattenTreeData(children))
  }, [])
}

/**
 * 递归获取子节点的field
 * @param {Object} node 当前节点
 * @param {String} fieldKey 需要获取的属性
 * @param {String} childrenKey 子节点的属性名
 * @returns {*[]}
 */
export function getChildrenFields(node, { fieldKey, childrenKey = 'children' } = {}) {
  const result = []
  if (node[childrenKey] && node[childrenKey].length) {
    node[childrenKey].forEach(item => {
      result.push(item[fieldKey])
      if (item[childrenKey] && item[childrenKey].length) {
        result.push(...getChildrenFields(item, { fieldKey, childrenKey }))
      }
    })
  } else {
    result.push(node[fieldKey])
  }
  return result
}

/**
 * 递归获取每层第一个子节点的field
 * @param {Object} node 当前节点
 * @param {String} fieldKey 需要获取的属性
 * @param {String} childrenKey 子节点的属性名
 * @param {Function} condition 自定义条件
 * @returns {*[]}
 */
export function getFirstChildrenFields(node, { fieldKey, childrenKey = 'children', condition = () => true } = {}) {
  const childrenProps = []
  childrenProps.push(node[fieldKey])
  const extraCondition = condition(node)
  if (node[childrenKey] && node[childrenKey].length && extraCondition) {
    childrenProps.push(...getFirstChildrenFields(node[childrenKey][0], { fieldKey, childrenKey, condition }))
  }
  return childrenProps
}

/**
 * 根据指定的叶子节点ID从树形数据中获取所有父节点的属性
 * @param {Array} tree 树形结构数据
 * @param {String} leafId 叶子节点ID
 * @param {String} fieldKey 需要获取的属性
 * @param {String} idKey id字段名
 * @param {String} childrenKey 子节点的属性名
 * @returns {*[]} 父节点的属性数组
 */
export function getParentFieldsByLeafId(tree, leafId, {
  fieldKey,
  idKey = 'id',
  childrenKey = 'children'
} = {}) {
  const findParentNodes = (node, result) => {
    if (node[idKey] === leafId) {
      // 指定的叶子节点也进行到结果中
      result.push(node[fieldKey])
      return true
    }
    if (node[childrenKey] && node[childrenKey].length > 0) {
      for (const child of node[childrenKey]) {
        if (findParentNodes(child, result)) {
          result.push(node[fieldKey])
          return true
        }
      }
    }
  }

  const result = []
  for (const node of tree) {
    findParentNodes(node, result)
  }
  return result.reverse()
}

/**
 * 验证是否为blob格式
 * @param {Object} data 返回内容
 * @returns {boolean}
 */
export function blobValidate(data) {
  return data.type !== 'application/json'
}

/**
 * 下载文件
 * 创建a标签，设置href，模拟点击a标签
 * @param {string} url 下载地址
 * @param {string} fileName 文件名
 */
export function downloadFile(url, fileName) {
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  link.target= '_blank'
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 把base64 转换成文件对象
 * @param {String} base64Str base64字符串
 * @param {String} fileName 文件名
 * @returns {File} 文件对象
 */
export function dataURLtoFile(base64Str, fileName) {
  const arr = base64Str.split(','),
    // base64解析出来的图片类型
    mime = arr[0].match(/:(.*?);/)[1],
    // 对base64串进行操作，去掉url头，并转换为byte   atob为window内置方法
    bstr = atob(arr[1]);
  let len = bstr.length;
    // 将ASCII码小于0的转换为大于0
  const ab = new ArrayBuffer(len),
    u8arr = new Uint8Array(ab);
  while (len--) {
    u8arr[len] = bstr.charCodeAt(len)
  }
  // 创建新的 File 对象实例[utf-8内容，文件名称或者路径，[可选参数，type：文件中的内容mime类型]]
  return new File([u8arr], fileName, {
    type: mime
  })
}

/**
 * 小驼峰转下划线
 * @param {String} str 待处理的字符串
 * @returns {String}
 */
export function camelCaseToUnderline(str): string {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase()
}

/**
 * 加载静态图片
 * @param path @/assets/images/xx.png
 */
export function requireImage(path) {
  return new URL(path, import.meta.url).href;
}
