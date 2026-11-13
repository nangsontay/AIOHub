import {
  codegenNativeComponent,
  type HostComponent,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  sourceUrl: string;
}

export default codegenNativeComponent<NativeProps>('AIOBrowser', {
  excludedPlatforms: ['iOS'],
}) as HostComponent<NativeProps>;
