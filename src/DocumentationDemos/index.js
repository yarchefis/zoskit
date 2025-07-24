import { getDeviceInfo } from "@zos/device";
import { createWidget, widget } from "@zos/ui";

const { width: DEVICE_WIDTH } = getDeviceInfo();

export function spawnPlaceholders({
  count = 5,
  y = 0,
  marginX = 20,
  gap = 16,
  height = 100,
  radius = 20,
  color = 0x999999, // серый
}) {
  const boxWidth = DEVICE_WIDTH - marginX * 2;

  for (let i = 0; i < count; i++) {
    const currentY = y + i * (height + gap);

    createWidget(widget.FILL_RECT, {
      x: marginX,
      y: currentY,
      w: boxWidth,
      h: height,
      radius: radius,
      color: color,
    });
  }

  return {
    safeY: y + count * (height + gap),
  };
}
