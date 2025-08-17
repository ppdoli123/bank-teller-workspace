declare module 'react-native-signature-capture' {
  import { Component } from 'react';
  import { ViewStyle } from 'react-native';

  interface SignatureCaptureProps {
    style?: ViewStyle;
    ref?: (ref: SignatureCapture) => void;
    onSaveEvent?: (result: { encoded: string; pathName: string }) => void;
    showNativeButtons?: boolean;
    showTitleLabel?: boolean;
    backgroundColor?: string;
    strokeColor?: string;
    minStrokeWidth?: number;
    maxStrokeWidth?: number;
    viewMode?: 'portrait' | 'landscape';
  }

  export default class SignatureCapture extends Component<SignatureCaptureProps> {
    saveImage(): void;
    resetImage(): void;
  }
}
