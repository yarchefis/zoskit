import { createWidget, widget, prop, event, align, text_style } from "@zos/ui";
import { setStatusBarVisible } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { getTextLayout } from "@zos/ui";

setStatusBarVisible(false);

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();
import theme from "../UiCompositor";

export function createSlider({
  minValue = 0,
  maxValue = 100,
  value = 0,
  onChange = () => {},
  color = theme.TEXT_COLOR,
  slidebackgroundColor = theme.BUTTON_NORMAL,
  visible = false,
  doneButtonText = "done",
  doneButtonColor = theme.BUTTON_NORMAL,
  doneButtonPressColor = theme.BUTTON_PRESSED,
  doneButtonVisible = true,
  onDone = null, // колбек при нажатии на кнопку Done
} = {}) {
  const widgets = [];
  const sliderWidth = 96;
  const sliderHeightMax = DEVICE_HEIGHT - 100;
  const sliderX = (DEVICE_WIDTH - sliderWidth) / 2;
  const sliderY = (DEVICE_HEIGHT - sliderHeightMax) / 2;

  // Внутренние колбэки для обновления
  let onChangeCallback = onChange;
  let onDoneCallback = onDone;

  // Фон экрана
  const bg = createWidget(widget.FILL_RECT, {
    x: 0,
    y: 0,
    w: DEVICE_WIDTH,
    h: DEVICE_HEIGHT,
    radius: 0,
    color: 0x000000,
  });
  widgets.push(bg);

  // Фон слайдера
  const slider_bg = createWidget(widget.FILL_RECT, {
    x: sliderX,
    y: sliderY,
    w: sliderWidth,
    h: sliderHeightMax,
    radius: 48,
    color: slidebackgroundColor,
  });
  widgets.push(slider_bg);

  const clamp = (num, min, max) => (num < min ? min : num > max ? max : num);
  value = clamp(value, minValue, maxValue);

  const valueRatio = (value - minValue) / (maxValue - minValue);
  const initHeight = sliderHeightMax * valueRatio;
  const initY = sliderY + sliderHeightMax - initHeight;

  const slider = createWidget(widget.FILL_RECT, {
    x: sliderX,
    y: initY,
    w: sliderWidth,
    h: initHeight,
    radius: 48,
    color,
  });
  widgets.push(slider);

  const textWidth = 100;
  const textHeight = 50;
  const textX = sliderX - textWidth - 20;
  const textY = sliderY + sliderHeightMax / 2 - textHeight / 2;

  const valueText = createWidget(widget.TEXT, {
    x: textX,
    y: textY,
    w: textWidth,
    h: textHeight,
    color: theme.TEXT_COLOR,
    text_size: theme.FONT_SIZE * 1.5,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.NONE,
    text: `${Math.round(value)}`,
  });
  widgets.push(valueText);

  const touchArea = createWidget(widget.FILL_RECT, {
    x: sliderX,
    y: sliderY,
    w: sliderWidth,
    h: sliderHeightMax,
    alpha: 0,
    color: 0x000000,
  });
  widgets.push(touchArea);

  let currentValue = value;

  touchArea.addEventListener(event.MOVE, (info) => {
    let relativeY = info.y - sliderY;
    if (relativeY < 0) relativeY = 0;
    if (relativeY > sliderHeightMax) relativeY = sliderHeightMax;

    const newValue =
      maxValue - (relativeY / sliderHeightMax) * (maxValue - minValue);
    const newHeight = sliderHeightMax - relativeY;
    const newY = sliderY + relativeY;

    slider.setProperty(prop.MORE, {
      x: sliderX,
      y: newY,
      w: sliderWidth,
      h: newHeight,
    });

    const roundedValue = Math.round(newValue);
    valueText.setProperty(prop.MORE, { text: `${roundedValue}` });

    currentValue = roundedValue;

    if (typeof onChangeCallback === "function") onChangeCallback(roundedValue);
  });

  touchArea.addEventListener(event.CLICK_DOWN, (info) => {
    touchArea.dispatchEvent(event.MOVE, info);
  });

  let doneButton = null;
  if (doneButtonVisible && doneButtonText) {
    const verticalText = doneButtonText.split("").join("\n");

    const { width: textW, height: textH } = getTextLayout(verticalText, {
      text_size: theme.FONT_SIZE,
      text_width: 100, // кнопка не шире, так что можно ограничить
    });

    // Добавим паддинги
    const btnPadding = 50;
    const btnWidth = textW + btnPadding;
    const btnHeight = textH + btnPadding;

    const btnX = sliderX + sliderWidth + 40;
    const btnY = sliderY + sliderHeightMax / 2 - btnHeight / 2;

    const doneBtn = createWidget(widget.BUTTON, {
      x: btnX,
      y: btnY,
      w: btnWidth,
      h: btnHeight,
      radius: 12,
      text: verticalText,
      text_size: theme.FONT_SIZE,
      color: theme.TEXT_COLOR,
      normal_color: doneButtonColor,
      press_color: 0xffffff,
      click_func: () => {
        if (typeof onDoneCallback === "function") onDoneCallback(currentValue);
        widgets.forEach((w) => w.setProperty(prop.VISIBLE, false));
      },
    });
    widgets.push(doneBtn);
  }

  widgets.forEach((w) => w.setProperty(prop.VISIBLE, visible));

  return {
    widgets,

    set visible(value) {
      widgets.forEach((w) => w.setProperty(prop.VISIBLE, value));
    },
    get visible() {
      return widgets.length ? widgets[0].getProperty(prop.VISIBLE) : false;
    },

    set onChange(fn) {
      if (typeof fn === "function") onChangeCallback = fn;
    },
    set onDone(fn) {
      if (typeof fn === "function") onDoneCallback = fn;
    },
  };
}
