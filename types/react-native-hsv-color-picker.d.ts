declare module 'react-native-hsv-color-picker' {
  import { Component } from 'react';
    import { ViewStyle } from 'react-native';

  interface HsvColorPickerProps {
    onColorChange: (color: { h: number; s: number; v: number }) => void;
    color: { h: number; s: number; v: number };
    style?: ViewStyle;
  }

  export class HsvColorPicker extends Component<HsvColorPickerProps> {}
}
