import { ConfigProvider } from 'antd';
import { prefixCls } from 'constants/misc';
import type { ReactNode } from 'react';
ConfigProvider.config({
  prefixCls,
  theme: {
    primaryColor: '#266cd3',
  },
});
export default function ProviderBasic({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider autoInsertSpaceInButton={false} prefixCls={prefixCls}>
      {children}
    </ConfigProvider>
  );
}
