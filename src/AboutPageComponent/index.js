import { createWidget, widget, align, text_style } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { ListItem } from "../UiListView";
import { Header } from "./header";
import theme from "../UiCompositor";
const { width: DEVICE_WIDTH } = getDeviceInfo();

export function AboutPage({
  appName = "enter your app name",
  version = "1.2.3",

  buttonText = null,
  onButtonClick = null,

  extraLibraries = [],
}) {
  const marginX = 20;

  // Шапка — иконка + имя + версия
  let currentY = Header({ appName, version, baseY: 70 });

  currentY += 25; // отступ после шапки

  // Кнопка (если есть)
  if (buttonText && typeof onButtonClick === "function") {
    createWidget(widget.BUTTON, {
      x: (DEVICE_WIDTH - (DEVICE_WIDTH - 150)) / 2,
      y: currentY,
      w: DEVICE_WIDTH - 150,
      h: 60,
      text: buttonText,
      text_size: theme.FONT_SIZE - 4,
      color: theme.TEXT_COLOR,
      radius: 25,
      normal_color: theme.BUTTON_NORMAL,
      press_color: theme.BUTTON_PRESSED,
      click_func: onButtonClick,
    });
    currentY += 75; // чуть меньше отступ после кнопки
  }

  const yBefore = currentY;

  // Список библиотек
  const descriptionLines = ["zoskit: pre-alpha 0.0.1", ...extraLibraries];

  const list = ListItem({
    y: currentY,
    endPadding: 30,
    children: [
      {
        title: "Third-party libraries",
        description: descriptionLines.join("\n"),
      },
    ],
  });

  currentY += list.getHeight() - yBefore - 10;

  return {
    safeY: currentY,
  };
}
