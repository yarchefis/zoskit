import { getDeviceInfo, SCREEN_SHAPE_ROUND } from "@zos/device";
import { createWidget, deleteWidget, widget, event } from "@zos/ui";
import { text_style, align } from "@zos/ui";
import theme from "../UiCompositor";

export function ShapeAwareButtons({
  buttons = [],
  position = "bottom", // top, bottom, left, right
  showMainButtonBg = false,
  showMenuButtonBg = false,
  menuBgColor = theme.BUTTON_PRESSED,
  mainButtonBgColor = theme.BUTTON_NORMAL,
  menuButtonBgColor = theme.BUTTON_NORMAL,
  extraElements,
} = {}) {
  const btnSize = 48;
  const margin = 20;
  const radiusMargin = 10;
  const menuPadding = 10;
  const menuSpacing = 8;

  const { width, height, screenShape } = getDeviceInfo();
  const widgets = [];
  const openMenus = [];
  const menuStates = new Map(); // tracks which menu is open

  function polarToCartesian(cx, cy, r, angleDeg) {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad) - btnSize / 2,
      y: cy + r * Math.sin(rad) - btnSize / 2,
    };
  }

  function getDirectionFromPosition(position) {
    switch (position) {
      case "left":
        return "right";
      case "right":
        return "left";
      case "top":
        return "down";
      case "bottom":
        return "up";
      default:
        return "up";
    }
  }

  function clearMenus() {
    while (openMenus.length) {
      deleteWidget(openMenus.pop());
    }
    menuStates.clear();
  }

  function createMenu(btn, baseX, baseY, direction, btnIndex) {
    const items = btn.menu;
    if (!items || items.length === 0) return;

    // Размер меню по ширине и высоте, в зависимости от направления
    const menuW =
      direction === "left" || direction === "right"
        ? items.length * (btnSize + menuSpacing) + menuPadding * 2 - menuSpacing
        : btnSize + menuPadding * 2;

    const menuH =
      direction === "up" || direction === "down"
        ? items.length * (btnSize + menuSpacing) + menuPadding * 2 - menuSpacing
        : btnSize + menuPadding * 2;

    // Позиционирование меню строго относительно кнопки (ровно рядом/над/под)
    let menuX = baseX;
    let menuY = baseY;

    if (direction === "right") {
      menuX += btnSize + 4;
      menuY += btnSize / 2 - menuH / 2;
    } else if (direction === "left") {
      menuX -= menuW + 4;
      menuY += btnSize / 2 - menuH / 2;
    } else if (direction === "up") {
      menuY -= menuH + 4;
      menuX += btnSize / 2 - menuW / 2;
    } else if (direction === "down") {
      menuY += btnSize + 4;
      menuX += btnSize / 2 - menuW / 2;
    }

    // Фон меню (круглые края)
    const menuBg = createWidget(widget.FILL_RECT, {
      x: menuX,
      y: menuY,
      w: menuW,
      h: menuH,
      radius: btnSize / 2,
      color: menuBgColor,
    });
    openMenus.push(menuBg);

    items.forEach((item, i) => {
      let x = menuX + menuPadding;
      let y = menuY + menuPadding;

      if (direction === "right" || direction === "left") {
        x += i * (btnSize + menuSpacing);
      } else {
        y += i * (btnSize + menuSpacing);
      }

      // Подложка под кнопку меню (круглая)
      if (showMenuButtonBg) {
        const menuBtnBg = createWidget(widget.FILL_RECT, {
          x,
          y,
          w: btnSize,
          h: btnSize,
          radius: btnSize / 2,
          color: menuButtonBgColor,
        });
        openMenus.push(menuBtnBg);
      }

      const mBtn = createWidget(widget.BUTTON, {
        x,
        y,
        w: btnSize,
        h: btnSize,
        radius: btnSize / 2,
        normal_src: `icon/48/${item.icon}.png`,
        press_src: `icon/48/${item.icon}.png`,
      });
      if (item.onClick) mBtn.addEventListener(event.CLICK_UP, item.onClick);
      openMenus.push(mBtn);
    });

    menuStates.set(btnIndex, true);
  }

  const direction = getDirectionFromPosition(position);

  if (screenShape === SCREEN_SHAPE_ROUND) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - btnSize / 2 - radiusMargin;

    const arcMap = {
      top: [-135, -45],
      bottom: [135, 45],
      left: [225, 135],
      right: [-45, 45],
    };
    const [arcStart, arcEnd] = arcMap[position] || [135, 45];
    const angleStep = (arcEnd - arcStart) / Math.max(buttons.length - 1, 1);

    buttons.forEach((btn, i) => {
      const angle = arcStart + i * angleStep;
      const { x, y } = polarToCartesian(centerX, centerY, radius, angle);

      // Подложка под основную кнопку (круглая)
      if (showMainButtonBg) {
        const mainBtnBg = createWidget(widget.FILL_RECT, {
          x,
          y,
          w: btnSize,
          h: btnSize,
          radius: btnSize / 2,
          color: mainButtonBgColor,
        });
        widgets.push(mainBtnBg);
      }

      const btnWidget = createWidget(widget.BUTTON, {
        x,
        y,
        w: btnSize,
        h: btnSize,
        radius: btnSize / 2,
        normal_src: `icon/48/${btn.icon}.png`,
        press_src: `icon/48/${btn.icon}.png`,
      });

      btnWidget.addEventListener(event.CLICK_UP, () => {
        if (menuStates.get(i)) {
          clearMenus();
        } else {
          clearMenus();
          if (btn.menu) {
            createMenu(btn, x, y, direction, i);
          } else if (btn.onClick) {
            btn.onClick();
          }
        }
      });

      widgets.push(btnWidget);
    });
  } else {
    const spacing = 12;
    const btnCount = buttons.length;
    buttons.forEach((btn, i) => {
      let x = 0,
        y = 0;

      if (position === "top" || position === "bottom") {
        x =
          (width - btnCount * btnSize - (btnCount - 1) * spacing) / 2 +
          i * (btnSize + spacing);
        y = position === "top" ? margin : height - btnSize - margin;
      } else if (position === "left" || position === "right") {
        y =
          (height - btnCount * btnSize - (btnCount - 1) * spacing) / 2 +
          i * (btnSize + spacing);
        x = position === "left" ? margin : width - btnSize - margin;
      }

      // Подложка под основную кнопку (круглая)
      if (showMainButtonBg) {
        const mainBtnBg = createWidget(widget.FILL_RECT, {
          x,
          y,
          w: btnSize,
          h: btnSize,
          radius: btnSize / 2,
          color: mainButtonBgColor,
        });
        widgets.push(mainBtnBg);
      }

      const btnWidget = createWidget(widget.BUTTON, {
        x,
        y,
        w: btnSize,
        h: btnSize,
        radius: btnSize / 2,
        normal_src: `icon/48/${btn.icon}.png`,
        press_src: `icon/48/${btn.icon}.png`,
      });

      btnWidget.addEventListener(event.CLICK_UP, () => {
        if (menuStates.get(i)) {
          clearMenus();
        } else {
          clearMenus();
          if (btn.menu) {
            createMenu(btn, x, y, direction, i);
          } else if (btn.onClick) {
            btn.onClick();
          }
        }
      });

      widgets.push(btnWidget);
    });
  }
  const view = createWidget(widget.VIEW_CONTAINER, {
    x: 0,
    y: 0,
    w: width,
    h: height,
    z_index: -1,
  });
  if (typeof extraElements === "function") {
    extraElements(view);
  }

  return { widgets, clearMenus };
}
