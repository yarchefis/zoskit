import {
  createWidget,
  widget,
  align,
  text_style,
  getTextLayout,
} from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import theme from "../UiCompositor";
const { width: DEVICE_WIDTH } = getDeviceInfo();

export function Header({ appName, version, baseY = 70 }) {
  const marginX = 20;
  const ICON_SIZE = 80;
  const TEXT_LINE_HEIGHT = 40;
  const TEXT_SPACING = 5;
  const maxTextWidth = 220;

  // Вычисляем ширину названия приложения с ограничением
  const appNameLayout = getTextLayout(appName, {
    text_size: theme.FONT_SIZE,
    text_width: maxTextWidth,
  });

  const appNameWidth = Math.min(appNameLayout.width, maxTextWidth);
  const versionWidth = appNameWidth;
  const textBlockWidth = appNameWidth;
  const totalWidth = ICON_SIZE + marginX + textBlockWidth;
  const startX = (DEVICE_WIDTH - totalWidth) / 2;

  // Вертикальное центрирование текста относительно иконки
  const textBlockHeight = TEXT_LINE_HEIGHT * 2 + TEXT_SPACING;
  const centerY = baseY + ICON_SIZE / 2;
  const textStartY = centerY - textBlockHeight / 2;

  // Иконка
  createWidget(widget.IMG, {
    x: startX,
    y: baseY,
    w: ICON_SIZE,
    h: ICON_SIZE,
    src: `icon/${ICON_SIZE}/icon.png`,
  });

  // Название приложения
  createWidget(widget.TEXT, {
    x: startX + ICON_SIZE + marginX,
    y: textStartY,
    w: appNameWidth,
    h: TEXT_LINE_HEIGHT,
    color: theme.TEXT_COLOR,
    text_size: theme.FONT_SIZE,
    align_h: align.LEFT,
    align_v: align.TOP,
    text_style: text_style.NONE,
    text: appName,
  });

  // Версия
  createWidget(widget.TEXT, {
    x: startX + ICON_SIZE + marginX,
    y: textStartY + TEXT_LINE_HEIGHT + TEXT_SPACING,
    w: versionWidth,
    h: TEXT_LINE_HEIGHT,
    color: theme.TEXT_COLOR_2,
    text_size: theme.FONT_SIZE - 4,
    align_h: align.LEFT,
    align_v: align.TOP,
    text_style: text_style.NONE,
    text: "v " + version,
  });

  // Возвращаем нижнюю границу шапки, чтобы использовать дальше
  return baseY + ICON_SIZE;
}
