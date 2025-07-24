import { createWidget, widget, prop } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import theme from "../UiCompositor";
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

export function ActionBar({
  children = [],
  y = null,
  backgroundColor = theme.BUTTON_NORMAL,
}) {
  const widgets = [];
  const buttonSize = 48;
  const backgroundSize = 92;

  const count = children.length;

  const GAP_MIN = 24;
  const GAP_MAX = 52;

  let gap;
  if (count === 1) {
    gap = 0;
  } else {
    const availableSpace = DEVICE_WIDTH - count * backgroundSize;
    const idealGap = availableSpace / (count - 1);
    gap = Math.min(Math.max(idealGap, GAP_MIN), GAP_MAX);
  }

  const totalWidth = count * backgroundSize + (count - 1) * gap;
  const startX = Math.floor((DEVICE_WIDTH - totalWidth) / 2);

  const posY =
    y === null || y === undefined
      ? Math.floor((DEVICE_HEIGHT - backgroundSize) / 2)
      : y;

  children.forEach((child, index) => {
    const x = startX + index * (backgroundSize + gap);

    const bg = createWidget(widget.FILL_RECT, {
      x,
      y: posY,
      w: backgroundSize,
      h: backgroundSize,
      radius: backgroundSize / 2,
      color: backgroundColor,
    });
    widgets.push(bg);

    const button = createWidget(widget.BUTTON, {
      x: x + Math.floor((backgroundSize - buttonSize) / 2),
      y: posY + Math.floor((backgroundSize - buttonSize) / 2),
      w: buttonSize,
      h: buttonSize,
      normal_src: `icon/48/${child.icon}.png`,
      press_src: `icon/48/${child.icon}.png`,
      click_func: child.onClick,
    });
    widgets.push(button);
  });

  return {
    destroy() {
      widgets.forEach((w) => w.setProperty(prop.VISIBLE, false));
    },
  };
}
