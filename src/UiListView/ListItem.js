import {
  createWidget,
  widget,
  text_style,
  align,
  event,
  getTextLayout,
  prop,
} from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import theme from "../UiCompositor";
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

const ICON_SIZE = DEVICE_WIDTH < 380 ? 48 : 56;
const ICON_MARGIN = 20;
const CONTENT_PADDING_TOP = 12;
const TEXT_SPACING = 4;
const PADDING_LEFT = ICON_SIZE + ICON_MARGIN * 2;
const PLACEHOLDER_TEXT = "Please add content or delete this empty item";
const TITLE_TEXT_SIZE = theme.FONT_SIZE + 4; // Было 28
const DESCRIPTION_TEXT_SIZE = theme.FONT_SIZE; // Было 24

export function ListItem({
  children = [],
  backgroundColor = 0x000000,
  titleColor = theme.TEXT_COLOR,
  descriptionColor = theme.TEXT_COLOR_2,
  radius = 20,
  y,
  gap = 5,
  endPadding = 0,
}) {
  if (y === undefined || y === null) {
    y = DEVICE_HEIGHT / 2;
  }
  const widgets = [];
  let currentY = y;

  // Массив для хранения виджетов текста (title и description) для каждого элемента
  const textWidgetsByItem = [];

  children.forEach((item, index) => {
    const {
      icon,
      title = "",
      description = "",
      onClick,
      iconPosition = "left",
    } = item;
    const hasTitle = title.trim().length > 0;
    const hasDescription = description.trim().length > 0;
    const isEmpty = !icon && !hasTitle && !hasDescription;

    let titleHeight = 0;
    if (hasTitle) {
      const titleLayout = getTextLayout(title, {
        text_size: TITLE_TEXT_SIZE,
        text_width: DEVICE_WIDTH - PADDING_LEFT - ICON_MARGIN,
      });
      titleHeight = titleLayout.height;
    }

    let descriptionHeight = 0;
    if (hasDescription) {
      const descLayout = getTextLayout(description, {
        text_size: DESCRIPTION_TEXT_SIZE,
        text_width: DEVICE_WIDTH - PADDING_LEFT - ICON_MARGIN,
      });
      descriptionHeight = descLayout.height + TEXT_SPACING;
    }

    let placeholderHeight = 0;
    if (isEmpty) {
      const placeholderLayout = getTextLayout(PLACEHOLDER_TEXT, {
        text_size: DESCRIPTION_TEXT_SIZE,
        text_width: DEVICE_WIDTH - ICON_MARGIN * 2,
      });
      placeholderHeight = placeholderLayout.height;
    }

    const textContentHeight = titleHeight + descriptionHeight;
    const contentHeight = isEmpty
      ? placeholderHeight
      : Math.max(ICON_SIZE, textContentHeight);

    const totalHeight = CONTENT_PADDING_TOP * 2 + contentHeight;
    const bgColor = isEmpty ? 0x444444 : backgroundColor;
    const bgRadius = radius;

    // bg
    const bg = createWidget(widget.FILL_RECT, {
      x: 0,
      y: currentY,
      w: DEVICE_WIDTH,
      h: totalHeight,
      radius: bgRadius,
      color: bgColor,
    });
    widgets.push(bg);
    if (onClick) bg.addEventListener(event.CLICK_UP, onClick);

    if (isEmpty) {
      const placeholderText = createWidget(widget.TEXT, {
        x: ICON_MARGIN,
        y: currentY + CONTENT_PADDING_TOP,
        w: DEVICE_WIDTH - ICON_MARGIN * 2,
        h: placeholderHeight,
        color: theme.TEXT_COLOR_2,
        text_size: DESCRIPTION_TEXT_SIZE,
        text_style: text_style.WRAP,
        align_h: align.CENTER_H,
        align_v: align.TOP,
        text: PLACEHOLDER_TEXT,
      });
      widgets.push(placeholderText);
      if (onClick) placeholderText.addEventListener(event.CLICK_UP, onClick);

      // для пустого элемента сохраняем пустой объект
      textWidgetsByItem[index] = {};
    } else {
      // icon
      if (icon) {
        const iconX =
          iconPosition === "right"
            ? DEVICE_WIDTH - ICON_SIZE - ICON_MARGIN
            : ICON_MARGIN;
        const iconWidget = createWidget(widget.IMG, {
          x: iconX,
          y: currentY + CONTENT_PADDING_TOP,
          w: ICON_SIZE,
          h: ICON_SIZE,
          src: `icon/${ICON_SIZE}/${icon}.png`,
        });
        widgets.push(iconWidget);
        if (onClick) iconWidget.addEventListener(event.CLICK_UP, onClick);
        item.iconWidget = iconWidget;
      }

      const singleText =
        (hasTitle && !hasDescription) || (!hasTitle && hasDescription);

      let titleTextWidget = null;
      let descriptionTextWidget = null;

      if (singleText) {
        const singleTextHeight = hasTitle ? titleHeight : descriptionHeight;
        const textY =
          currentY +
          CONTENT_PADDING_TOP +
          (contentHeight - singleTextHeight) / 2;

        const textX = icon
          ? iconPosition === "left"
            ? PADDING_LEFT
            : ICON_MARGIN
          : ICON_MARGIN;
        const textWidth = icon
          ? DEVICE_WIDTH - PADDING_LEFT - ICON_MARGIN
          : DEVICE_WIDTH - ICON_MARGIN * 2;

        if (hasTitle) {
          titleTextWidget = createWidget(widget.TEXT, {
            x: textX,
            y: textY,
            w: textWidth,
            h: titleHeight,
            color: titleColor,
            text_size: TITLE_TEXT_SIZE,
            text_style: text_style.WRAP,
            align_h: align.LEFT,
            align_v: align.TOP,
            text: title,
          });
          widgets.push(titleTextWidget);
          if (onClick)
            titleTextWidget.addEventListener(event.CLICK_UP, onClick);
        }
        if (hasDescription) {
          descriptionTextWidget = createWidget(widget.TEXT, {
            x: textX,
            y: textY,
            w: textWidth,
            h: descriptionHeight,
            color: descriptionColor,
            text_size: DESCRIPTION_TEXT_SIZE,
            text_style: text_style.WRAP,
            align_h: align.LEFT,
            align_v: align.TOP,
            text: description,
          });
          widgets.push(descriptionTextWidget);
          if (onClick)
            descriptionTextWidget.addEventListener(event.CLICK_UP, onClick);
        }
      } else {
        let textX, textWidth;
        if (icon && iconPosition === "left") {
          textX = PADDING_LEFT;
          textWidth = DEVICE_WIDTH - PADDING_LEFT - ICON_MARGIN;
        } else if (icon && iconPosition === "right") {
          textX = ICON_MARGIN;
          textWidth = DEVICE_WIDTH - PADDING_LEFT - ICON_MARGIN;
        } else {
          textX = ICON_MARGIN;
          textWidth = DEVICE_WIDTH - ICON_MARGIN * 2;
        }

        if (hasTitle) {
          titleTextWidget = createWidget(widget.TEXT, {
            x: textX,
            y: currentY + CONTENT_PADDING_TOP,
            w: textWidth,
            h: titleHeight,
            color: titleColor,
            text_size: TITLE_TEXT_SIZE,
            text_style: text_style.WRAP,
            align_h: align.LEFT,
            align_v: align.TOP,
            text: title,
          });
          widgets.push(titleTextWidget);
          if (onClick)
            titleTextWidget.addEventListener(event.CLICK_UP, onClick);
        }
        if (hasDescription) {
          descriptionTextWidget = createWidget(widget.TEXT, {
            x: textX,
            y: currentY + CONTENT_PADDING_TOP + titleHeight + TEXT_SPACING,
            w: textWidth,
            h: descriptionHeight,
            color: descriptionColor,
            text_size: DESCRIPTION_TEXT_SIZE,
            text_style: text_style.WRAP,
            align_h: align.LEFT,
            align_v: align.TOP,
            text: description,
          });
          widgets.push(descriptionTextWidget);
          if (onClick)
            descriptionTextWidget.addEventListener(event.CLICK_UP, onClick);
        }
      }

      textWidgetsByItem[index] = {
        titleTextWidget,
        descriptionTextWidget,
      };
    }

    currentY += totalHeight;

    if (gap > 0 && index < children.length - 1) {
      currentY += gap;
    }
  });

  if (endPadding > 0) {
    const spacer = createWidget(widget.FILL_RECT, {
      x: 0,
      y: currentY,
      w: DEVICE_WIDTH,
      h: endPadding,
      radius: 0,
      color: 0x000000,
      alpha: 0,
    });
    widgets.push(spacer);
    currentY += endPadding;
  }

  // Обновление текста title/description у конкретного элемента

  function updateProps(index, newProps) {
    if (index < 0 || index >= children.length) return;

    const item = children[index];
    const { title, description, icon } = newProps;
    const textWidgets = textWidgetsByItem[index];
    if (!textWidgets) return;

    if (title !== undefined && textWidgets.titleTextWidget) {
      textWidgets.titleTextWidget.setProperty(prop.MORE, { text: title });
      item.title = title;
    }
    if (description !== undefined && textWidgets.descriptionTextWidget) {
      textWidgets.descriptionTextWidget.setProperty(prop.MORE, {
        text: description,
      });
      item.description = description;
    }

    if (icon !== undefined && item.iconWidget) {
      item.iconWidget.setProperty(prop.MORE, {
        src: `icon/${ICON_SIZE}/${icon}.png`,
      });
      item.icon = icon;
    }
  }

  return {
    widgets,
    getHeight() {
      return currentY;
    },
    updateProps,
  };
}
