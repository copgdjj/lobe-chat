import dynamic from 'next/dynamic';
import React, { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head'; // 引入 next/head

import FullscreenLoading from '@/components/Loading/FullscreenLoading';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { DatabaseLoadingState } from '@/types/clientDB';

import { CLIENT_LOADING_STAGES } from '../stage';

const InitError = dynamic(() => import('./Error'), { ssr: false });

interface InitProps {
  setActiveStage: (value: string) => void;
}

const Init = memo<InitProps>(({ setActiveStage }) => {
  const useInitClientDB = useGlobalStore((s) => s.useInitClientDB);

  useInitClientDB({ onStateChange: setActiveStage });

  return null;
});

interface ContentProps {
  loadingStage: string;
  setActiveStage: (value: string) => void;
}

const Content = memo<ContentProps>(({ loadingStage, setActiveStage }) => {
  const { t } = useTranslation('common');
  const isPgliteNotInited = useGlobalStore(systemStatusSelectors.isPgliteNotInited);
  const isError = useGlobalStore((s) => s.initClientDBStage === DatabaseLoadingState.Error);

  // 通过 useEffect 来加载 Google Ads JS 脚本
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2499446786219948";
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <>
      {/* 在 head 中添加 Google Ads 脚本 */}
      <Head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2499446786219948" crossorigin="anonymous"></script>
      </Head>

      {isPgliteNotInited && <Init setActiveStage={setActiveStage} />}
      <FullscreenLoading
        activeStage={CLIENT_LOADING_STAGES.indexOf(loadingStage)}
        contentRender={isError && <InitError />}
        stages={CLIENT_LOADING_STAGES.map((key) => t(`appLoading.${key}` as any))}
      />
    </>
  );
});

export default Content;
