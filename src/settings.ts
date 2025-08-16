export interface EuTheme {
  //横纵布局 horizontal vertical
  layout: 'column' | 'vertical';
  // 是否使用标签页
  showTabsBar: boolean;
  // 是否固定标签页
  fixedTabsBar: boolean;
  // 皮肤 light,dark,syncOS
  darkMode: 'light' | 'dark' | 'syncOS';
  // 是否使用进度条
  showProgressBar: boolean;
  // 是否开启水印
  enabledWatermark: boolean;
}

export interface DefaultSetting {
  // 网站名称
  title: string;
  // 网站版本
  version: string;
  // 是否使用Mock数据
  useMock: boolean;
  // 页面底部的版权信息
  copyright: string;
  // 路由缓存的最大数量
  keepAliveMaxNum: number;
  // 请求根地址
  BASE_API: string;
  // 默认的记住我的时长（单位：天）
  rememberMeDefaultDays: number;
  // 匿名访问白名单
  anonymousAccessWhiteList: string[];
  // 系统帮助文档地址
  systemHelpDocUrl: string;
  // github源码地址
  githubUrl: string;
  // gitee源码地址
  giteeUrl: string;
}

export const defaultTheme: EuTheme = {
  //横纵布局 column vertical
  layout: 'column',
  // 是否使用标签页
  showTabsBar: true,
  // 是否固定标签页
  fixedTabsBar: true,
  // 皮肤 light,dark,syncOS
  darkMode: 'syncOS',
  // 是否使用进度条
  showProgressBar: true,
  // 是否开启水印
  enabledWatermark: true,
}

export const defaultSetting: DefaultSetting = {
  // 网站名称
  title: 'EuBackend',
  // 网站版本
  version: '0.0.1',
  // 是否使用Mock数据
  useMock: true,
  // 页面底部的copyright
  copyright: function () {
    const start = 2023
    const date = new Date()
    const year = date.getFullYear()
    const author = 'Eu'
    return `Copyright © ${start === year ? '' : start + '-'}${year} ${author}. All Rights Reserved.`
  }(),
  // 路由缓存的最大数量
  keepAliveMaxNum: 5,
  // 请求根地址
  BASE_API: import.meta.env.VITE_BASE_API,
  // 默认的记住我的时长（单位：天）
  rememberMeDefaultDays: 180,
  // 匿名访问白名单
  anonymousAccessWhiteList: ['/login', '/404', '/401'],

  // 系统帮助文档地址
  systemHelpDocUrl: 'https://zhaoeryu.github.io',
  // github源码地址
  githubUrl: 'https://github.com/zhaoeryu',
  // gitee源码地址
  giteeUrl: 'https://gitee.com/zhaoeryu',
}
