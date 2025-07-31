import { Md5 } from 'ts-md5'

export default (api, fetchApi) => {
  const state = () => ({
    // 数据缓存
    optionsCache: {},
    // 请求锁对象
    requestLocks: {},
    // 对象缓存
    objectsCache: {},
    // 对象请求锁对象
    objectRequestLocks: {}
  })

  const mutations = {
    SET_OPTIONS(state, { key, data }) {
      state.optionsCache[key] = data
    },
    SET_LOCK(state, key) {
      state.requestLocks[key] = true
    },
    CLEAR_LOCK(state, key) {
      delete state.requestLocks[key]
    },
    SET_OBJECT(state, { key, data }) {
      state.objectsCache[key] = data
    },
    SET_OBJECT_LOCK(state, key) {
      state.objectRequestLocks[key] = true
    },
    CLEAR_OBJECT_LOCK(state, key) {
      delete state.objectRequestLocks[key]
    }
  }

  const actions = {
    async fetchOptions({ commit, state, dispatch }, params) {
      const key = Md5.hashStr(JSON.stringify(params))
      // 存在缓存直接返回
      if (state.optionsCache[key]) {
        return state.optionsCache[key]
      }

      // 存在请求锁时等待
      if (state.requestLocks[key]) {
        return new Promise((resolve) => {
          const checkLock = setInterval(() => {
            if (!state.requestLocks[key]) {
              clearInterval(checkLock)
              resolve(dispatch('fetchOptions', params))
            }
          }, 100)
        })
      }

      // 设置请求锁
      commit('SET_LOCK', key)

      try {
        const response = await api(params)
        commit('SET_OPTIONS', { key, data: response })
        return response
      } catch (error) {
        console.error('获取选项失败:', error)
        // 继续抛出错误供组件处理
        throw error
      } finally {
        // 无论成功失败都释放锁
        commit('CLEAR_LOCK', key)
      }
    },
    async fetchObject({ commit, state, dispatch }, key) {
      // 存在缓存直接返回
      if (state.objectsCache[key]) {
        return state.objectsCache[key]
      }

      // 存在请求锁时等待
      if (state.objectRequestLocks[key]) {
        return new Promise((resolve) => {
          const checkLock = setInterval(() => {
            if (!state.objectRequestLocks[key]) {
              clearInterval(checkLock)
              resolve(dispatch('fetchObject', key))
            }
          }, 100)
        })
      }

      // 设置请求锁
      commit('SET_OBJECT_LOCK', key)

      try {
        const response = await fetchApi(key)
        commit('SET_OBJECT', { key, data: response })
        return response
      } catch (error) {
        console.error('获取选项失败:', error)
        // 继续抛出错误供组件处理
        throw error
      } finally {
        // 无论成功失败都释放锁
        commit('CLEAR_OBJECT_LOCK', key)
      }
    }
  }

  return {
    state,
    mutations,
    actions
  }
}
