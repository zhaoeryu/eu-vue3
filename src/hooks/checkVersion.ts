import { checkVersion, unCheckVersion } from 'version-rocket'
import { onBeforeMount, onBeforeUnmount } from 'vue'

import { defaultSetting } from '@/settings';

import { version } from '../../package.json'

export function useCheckVersion() {
  console.log(`%c ${defaultSetting.title} %c V${version} %c 让开发更高效，尽在EuBackend`
    , 'padding: 2px 1px; border-radius: 3px 0 0 3px; color: #fff; background: #606060; font-weight: bold;'
    , 'padding: 2px 1px; border-radius: 0 3px 3px 0; color: #fff; background: #155bd4; font-weight: bold;'
    , 'font-size: 18px;'
  );
  onBeforeMount(() => {
    checkVersion({
      localPackageVersion: version,
      originVersionFileUrl: `${location.origin}/version.json`,
      enable: import.meta.env.PROD
    },
      {
        title: '更新',
        description: '检测到新版本',
        primaryColor: '#758bfd',
        rocketColor: '#ff8600',
        buttonText: '立即更新',
      })
  })

  onBeforeUnmount(() => {
    unCheckVersion({ closeDialog: false })
  })
  return {
    version
  }
}
