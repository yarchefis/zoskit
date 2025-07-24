import { createWidget, widget, align, prop, text_style, event } from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import theme from "../UiCompositor";

const { width, height } = getDeviceInfo();

export class DigitInput {
  #widgets = [];
  #textWidget = null;
  #inputText = "";
  #onConfirm = null;

  constructor({ onConfirm = () => {} }) {
    this.#onConfirm = onConfirm;
    this.#create();
    this.visible = false;
  }

  #create() {
    const BASE_WIDTH = 416;
    const BASE_HEIGHT = 416;

    const scaleW = width / BASE_WIDTH;
    const scaleH = height / BASE_HEIGHT;

    const MIN_BTN_WIDTH = 60;
    const MIN_BTN_HEIGHT = 52;
    const MIN_FIELD_WIDTH = 240;
    const MIN_FIELD_HEIGHT = 40;

    // Максимальные размеры кнопок и отступы для маленьких экранов
    const MAX_BTN_WIDTH = width <= 416 ? 64 : 74;
    const MAX_BTN_HEIGHT = height <= 416 ? 56 : 64;

    const BUTTON_WIDTH = Math.max(
      Math.min(Math.round(74 * scaleW), MAX_BTN_WIDTH),
      MIN_BTN_WIDTH,
    );
    const BUTTON_HEIGHT = Math.max(
      Math.min(Math.round(64 * scaleH), MAX_BTN_HEIGHT),
      MIN_BTN_HEIGHT,
    );

    const MAX_H_GAP = width <= 416 ? 20 : 30;
    const BUTTON_H_GAP = Math.max(
      Math.min(Math.round(30 * scaleW), MAX_H_GAP),
      20,
    );

    const BUTTON_V_GAP = Math.max(Math.min(Math.round(40 * scaleH), 40), 25);

    const FIELD_WIDTH = Math.max(
      Math.min(Math.round(width * 0.75), 300),
      MIN_FIELD_WIDTH,
    );
    const FIELD_HEIGHT = Math.max(
      Math.min(Math.round(48 * scaleH), 48),
      MIN_FIELD_HEIGHT,
    );

    const TOP_PADDING = Math.round(60 * scaleH);
    const FIELD_MARGIN_BOTTOM = Math.round(60 * scaleH);

    // Смещение кнопок вверх
    const BUTTONS_SHIFT_UP = Math.round(40 * scaleH);

    // Шрифт
    const fontSize = Math.max(
      theme.FONT_SIZE + 20 * scaleW,
      theme.FONT_SIZE + 12,
    );

    // Черный фон
    const bg = createWidget(widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: width,
      h: height,
      color: 0x000000,
    });
    this.#widgets.push(bg);

    // Поле ввода
    this.#textWidget = createWidget(widget.TEXT, {
      x: (width - FIELD_WIDTH) / 2,
      y: TOP_PADDING,
      w: FIELD_WIDTH,
      h: FIELD_HEIGHT,
      text: "",
      color: theme.TEXT_COLOR,
      text_size: fontSize,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text_style: text_style.NONE,
    });
    this.#widgets.push(this.#textWidget);

    // Считаем старт по X с дополнительным сдвигом для маленьких экранов
    let totalRowWidth = 4 * BUTTON_WIDTH + 3 * BUTTON_H_GAP;
    let startX = (width - totalRowWidth) / 2;

    if (width <= 416 && height <= 416) {
      startX += 5; // Сдвигаем вправо на 5 пикселей для маленьких экранов
    }

    const startY =
      TOP_PADDING + FIELD_HEIGHT + FIELD_MARGIN_BOTTOM - BUTTONS_SHIFT_UP;

    const keys = [
      ["1", "2", "3", "OK"],
      ["4", "5", "6", "<-"],
      ["7", "8", "9", "0"],
    ];

    keys.forEach((row, rowIndex) => {
      const y = startY + rowIndex * (BUTTON_HEIGHT + BUTTON_V_GAP);

      row.forEach((label, colIndex) => {
        const x = startX + colIndex * (BUTTON_WIDTH + BUTTON_H_GAP);

        const btn = createWidget(widget.TEXT, {
          x,
          y,
          w: BUTTON_WIDTH,
          h: BUTTON_HEIGHT,
          text: label,
          color: theme.TEXT_COLOR,
          text_size: fontSize,
          text_style: text_style.NONE,
          align_h: align.CENTER_H,
          align_v: align.CENTER_V,
        });

        btn.addEventListener(event.CLICK_DOWN, () => {
          this.#handleInput(label);
        });

        this.#widgets.push(btn);
      });
    });
  }

  #handleInput(label) {
    if (label === "<-") {
      this.#inputText = this.#inputText.slice(0, -1);
    } else if (label === "OK") {
      this.#onConfirm(this.#inputText);
    } else {
      this.#inputText += label;
    }

    this.#textWidget.setProperty(prop.TEXT, this.#inputText);
  }

  set visible(v) {
    this.#widgets.forEach((w) => w.setProperty(prop.VISIBLE, v));
  }

  get visible() {
    return this.#widgets[0]?.getProperty(prop.VISIBLE) ?? false;
  }

  get value() {
    return this.#inputText;
  }

  set value(v) {
    this.#inputText = v.toString();
    this.#textWidget.setProperty(prop.TEXT, this.#inputText);
  }
}
