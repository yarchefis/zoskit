import { getDeviceInfo } from "@zos/device";
import {
  createWidget,
  widget,
  align,
  text_style,
  getTextLayout,
  prop,
} from "@zos/ui";
import theme from "../UiCompositor";
const { width: DEVICE_WIDTH } = getDeviceInfo();

export function TitleBar({ title = "Title", subtitle = null }) {
  const paddingTop = 30;
  const contentWidth = DEVICE_WIDTH - 120;
  const marginX = (DEVICE_WIDTH - contentWidth) / 2;

  // Локальные переменные для хранения виджетов
  let titleWidget = null;
  let subtitleWidget = null;

  // Заголовок
  const titleLayout = getTextLayout(title, {
    text_size: theme.FONT_SIZE + 2,
    text_width: contentWidth,
  });

  titleWidget = createWidget(widget.TEXT, {
    x: marginX,
    y: paddingTop,
    w: contentWidth,
    h: titleLayout.height,
    color: theme.TEXT_COLOR,
    text_size: theme.FONT_SIZE + 2,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.WRAP,
    text: title,
  });

  let currentY = paddingTop + titleLayout.height;

  // Подзаголовок (если есть)
  if (subtitle) {
    const subtitleLayout = getTextLayout(subtitle, {
      text_size: theme.FONT_SIZE - 4,
      text_width: contentWidth,
    });

    subtitleWidget = createWidget(widget.TEXT, {
      x: marginX,
      y: currentY,
      w: contentWidth,
      h: subtitleLayout.height,
      color: theme.TEXT_COLOR_2,
      text_size: theme.FONT_SIZE - 4,
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text_style: text_style.WRAP,
      text: subtitle,
    });

    currentY += subtitleLayout.height;
  }

  currentY += 30;

  function updateProps(newProps) {
    if (newProps.title !== undefined && titleWidget) {
      const newTitleLayout = getTextLayout(newProps.title, {
        text_size: theme.FONT_SIZE + 2,
        text_width: contentWidth,
      });
      titleWidget.setProperty(prop.MORE, {
        text: newProps.title,
        h: newTitleLayout.height,
      });
    }
    if (newProps.subtitle !== undefined) {
      if (newProps.subtitle === null || newProps.subtitle === "") {
        // Если нужно убрать подзаголовок
        if (subtitleWidget) {
          subtitleWidget.setProperty(prop.MORE, { text: "" });
        }
      } else {
        const newSubLayout = getTextLayout(newProps.subtitle, {
          text_size: theme.FONT_SIZE - 4,
          text_width: contentWidth,
        });
        if (subtitleWidget) {
          subtitleWidget.setProperty(prop.MORE, {
            text: newProps.subtitle,
            h: newSubLayout.height,
          });
        } else {
          // Если подзаголовка не было, а теперь появился — создать виджет
          subtitleWidget = createWidget(widget.TEXT, {
            x: marginX,
            y: paddingTop + titleWidget.h, // позиционируем ниже title
            w: contentWidth,
            h: newSubLayout.height,
            color: theme.TEXT_COLOR_2,
            text_size: theme.FONT_SIZE - 4,
            align_h: align.CENTER_H,
            align_v: align.CENTER_V,
            text_style: text_style.WRAP,
            text: newProps.subtitle,
          });
        }
      }
    }
  }

  return {
    safeY: currentY,
    widgets: [titleWidget].concat(subtitleWidget ? [subtitleWidget] : []),
    updateProps,
  };
}
