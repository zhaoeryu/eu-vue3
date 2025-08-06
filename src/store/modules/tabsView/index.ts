import { defineStore } from 'pinia';
import {addLeadingSlash} from "@/utils";
import {type RouteNode} from "@/types/route";

const useTabsViewStore = defineStore('tabsView', {
  state: (): {
    visitedViews: RouteNode[];  // 明确指定为 VisitedView 类型的数组
  } => ({
    visitedViews: []
  }),
  getters: {

  },
  actions: {
    addVisitedView(route: RouteNode) {
      const view = {
        path: addLeadingSlash(route.path),
        name: route.name,
        meta: { ...route.meta }
      } as RouteNode
      if (this.visitedViews.some(v => v.path === view.path)) {
        return
      }
      this.visitedViews.push(view)
    },
    delVisitedView(view: RouteNode) {
      return new Promise(resolve => {
        const index = this.visitedViews.findIndex(item => item.path === view.path)
        this.visitedViews.splice(index, 1)
        resolve([...this.visitedViews])
      })
    },
    delOthersVisitedViews(view: RouteNode) {
      return new Promise(resolve => {
        this.visitedViews = this.visitedViews.filter(item => {
          return item.meta.affix || item.path === view.path
        })
        resolve([...this.visitedViews])
      })
    },
    delAllVisitedViews() {
      return new Promise(resolve => {
        this.visitedViews = this.visitedViews.filter(item => item.meta.affix)
        resolve([...this.visitedViews])
      })
    },
    delLeftVisitedViews(view: RouteNode) {
      return new Promise(resolve => {
        const index = this.visitedViews.findIndex(item => item.path === view.path)
        if (index > 0) {
          this.visitedViews = this.visitedViews.filter((item, i) => {
            return item.meta.affix || i >= index
          })
        } else {
          this.visitedViews = this.visitedViews.filter(item => item.meta.affix)
        }
        resolve([...this.visitedViews])
      })
    },
    delRightVisitedViews(view: RouteNode) {
      return new Promise(resolve => {
        const index = this.visitedViews.findIndex(item => item.path === view.path)
        if (index < this.visitedViews.length - 1) {
          this.visitedViews = this.visitedViews.filter((item, i) => {
            return item.meta.affix || i <= index
          })
        } else if (index === this.visitedViews.length - 1) {
          // 如果只剩当前标签页，则不进行处理
        } else {
          this.visitedViews = this.visitedViews.filter(item => item.meta.affix)
        }
        resolve([...this.visitedViews])
      })
    }
  }
})

export default useTabsViewStore
