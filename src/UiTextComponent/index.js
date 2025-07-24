import {
  createWidget,
  widget,
  align,
  text_style,
  getTextLayout,
  prop,
  event,
} from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import theme from "../UiCompositor";

export function TextComponent({
  text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  color = theme.TEXT_COLOR ?? 0xffffff,
  text_size = theme.BASE_FONT_SIZE ?? 24,
  align_h = align.LEFT,
  align_v = align.CENTER_V,
  x = 0,
  y = undefined,
  marginH = 0, // горизонтальный margin
}) {
  const { width: screenWidth } = getDeviceInfo();

  const availableWidth = screenWidth - marginH * 2;

  const layout = getTextLayout(text, {
    text_size,
    text_width: availableWidth,
  }) || { width: availableWidth, height: text_size };

  const finalY = y ?? 0;
  const finalX = x + marginH;

  const textWidget = createWidget(widget.TEXT, {
    x: finalX,
    y: finalY,
    w: availableWidth,
    h: layout.height,
    color,
    text_size,
    align_h,
    align_v,
    text_style: text_style.WRAP,
    text,
  });

  return {
    widget: textWidget,
    get safeY() {
      return finalY + layout.height;
    },
  };
}
