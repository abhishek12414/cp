import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SymbolWeight } from "expo-symbols";
import type { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type MCProps = ComponentProps<typeof MaterialCommunityIcons>;

type IconProps = {
  name: MCProps["name"];
  size?: number;
  color?: MCProps["color"] | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
};

const Icon: React.FC<IconProps> = ({ name, size = 24, color, style }) => {
  return (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={color as MCProps["color"]}
      style={style}
    />
  );
};

export default Icon;
