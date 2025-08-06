const icons = import.meta.glob('@/assets/icons/svg/*.svg')

const regex = /\/([^/.]+)(?:\.[^.]+)?$/; // 正则表达式匹配最后一个斜杠后的内容
const iconNames = Object.keys(icons)
    .map(item => item.match(regex)?.[1] || '')
    .filter(item => item)
export default iconNames
