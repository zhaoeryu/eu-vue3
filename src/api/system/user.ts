import request from '@/utils/request'

export function page(params) {
  return request({
    url: '/api/system/user/page',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: '/api/system/user',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/api/system/user',
    method: 'put',
    data
  })
}
export function updateStatus(data) {
  return request({
    url: '/api/system/user/updateStatus',
    method: 'put',
    data
  })
}

export function updateProfile(data) {
  return request({
    url: '/api/system/user/profile',
    method: 'put',
    data
  })
}

export function updatePassword(oldPassword, newPassword) {
  return request({
    url: '/api/system/user/update-pwd',
    method: 'put',
    data: {
      oldPassword,
      newPassword
    }
  })
}

export function resetPwd(id, password) {
  return request({
    url: '/api/system/user/reset-pwd',
    method: 'put',
    data: {
      id,
      password
    }
  })
}

export function uploadAvatar(data) {
  return request({
    url: '/api/system/user/upload-avatar',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data
  })
}

export function batchDel(ids) {
  return request({
    url: '/api/system/user/batch',
    method: 'delete',
    data: ids
  })
}

export function getUserInfo(id) {
  return request({
    url: '/api/system/user/info',
    method: 'get',
    params: {
      id
    }
  })
}

export function assignRole(data) {
  return request({
    url: '/api/system/user/assignRole',
    method: 'post',
    data
  })
}
export function roleUserList(params) {
  return request({
    url: '/api/system/user/roleUserList',
    method: 'get',
    params
  })
}
export function cancelAuth(data) {
  return request({
    url: '/api/system/user/cancelAuth',
    method: 'delete',
    data
  })
}
export function batchAssignRole(data) {
  return request({
    url: '/api/system/user/batchAssignRole',
    method: 'post',
    data
  })
}

export function onlineList(params) {
  return request({
    url: '/api/auth/online',
    method: 'get',
    params
  })
}
export function onlineKickout(userId) {
  return request({
    url: '/api/auth/online/kickout',
    method: 'post',
    params: {
      userId
    }
  })
}
export function onlineLogout(userId) {
  return request({
    url: '/api/auth/online/logout',
    method: 'post',
    params: {
      userId
    }
  })
}
