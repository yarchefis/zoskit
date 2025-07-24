import { getText } from "@zos/i18n";
import {
  createWidget,
  widget,
  prop,
  align,
  text_style,
  event,
  deleteWidget,
} from "@zos/ui";
import { setStatusBarVisible } from "@zos/ui";
import {
  getDeviceInfo,
  SCREEN_SHAPE_SQUARE,
  SCREEN_SHAPE_ROUND,
} from "@zos/device";
import { log, px } from "@zos/utils";
import { back } from "@zos/router";
import { onGesture, offGesture } from "@zos/interaction";
import { setScrollLock } from "@zos/page";

const {
  width: DEVICE_WIDTH,
  height: DEVICE_HEIGHT,
  screenShape,
} = getDeviceInfo();

const PALETTE_POS_X = (DEVICE_WIDTH - px(260)) / 2;
const PALETTE_POS_Y =
  screenShape === SCREEN_SHAPE_SQUARE
    ? (DEVICE_HEIGHT - px(260 + 60)) / 2
    : (DEVICE_HEIGHT - px(260)) / 2;

setStatusBarVisible(false);
setScrollLock({ lock: true });

let h = 0; // angle
let s = 0; // radius
let v = 0; // lightness

let colorPreview;
let inputColor = 0xffffff;

//#region functions
function hex2rgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return { r, g, b };
}
function toRadian(degree) {
  return degree * (Math.PI / 180);
}
function toDegree(radian) {
  return radian * (180 / Math.PI);
}
function lineLenght(dX, dY) {
  return Math.sqrt(Math.pow(Math.abs(dX), 2) + Math.pow(Math.abs(dY), 2));
}
function angleDeg(dX, dY) {
  let angle = Math.atan2(dY, dX);
  let angleDeg = toDegree(angle);
  if (angleDeg < 0) angleDeg += 360;
  return angleDeg;
}

function setColor() {
  //logger.log(`setColor`);
  //logger.log(`hsv (${h}, ${s}, ${v})`);
  let rgb = hsvToRgb(h, s, v);
  let color = RGBToNumber(rgb[0], rgb[1], rgb[2]);
  colorPreview.setProperty(prop.COLOR, color);
  //logger.log(`rgb (${rgb[0]}, ${rgb[1]}, ${rgb[2]})`);
}

function RGBToHex(r, g, b) {
  return (
    "0x" +
    r.toString(16).padStart(2, "0") +
    g.toString(16).padStart(2, "0") +
    b.toString(16).padStart(2, "0")
  );
}

// https://gist.github.com/mjackson/5311256

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b) {
  ((r /= 255), (g /= 255), (b /= 255));

  var max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  var h,
    s,
    l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return [h, s, l];
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [r * 255, g * 255, b * 255];
}

/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
function rgbToHsv(r, g, b) {
  ((r /= 255), (g /= 255), (b /= 255));

  var max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  var h,
    s,
    v = max;

  var d = max - min;
  s = max == 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return [h, s, v];
}

/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
function hsvToRgb(h, s, v) {
  var r, g, b;

  var i = Math.floor(h * 6);
  var f = h * 6 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      ((r = v), (g = t), (b = p));
      break;
    case 1:
      ((r = q), (g = v), (b = p));
      break;
    case 2:
      ((r = p), (g = v), (b = t));
      break;
    case 3:
      ((r = p), (g = q), (b = v));
      break;
    case 4:
      ((r = t), (g = p), (b = v));
      break;
    case 5:
      ((r = v), (g = p), (b = q));
      break;
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

///////////////////////////
function RGBToNumber(r, g, b) {
  return (r << 16) + (g << 8) + b;
}

//#endregion

class PaletteSelect {
  constructor(x, y, color) {
    this.widgets = [];
    //logger.log(`PaletteSelect (${x}, ${y}, ${color})`);
    let palette = createWidget(widget.IMG, {
      x: x,
      y: y,
      src: "zoskit/palletesrc/Palette_r.png",
    });
    this.widgets.push(palette);
    palette.addEventListener(event.CLICK_DOWN, function (info) {
      //logger.log("CLICK_DOWN");
      let posX = info.x - x;
      let posY = info.y - y;
      let dX = posX - px(260 / 2);
      let dY = posY - px(260 / 2);

      let angle = angleDeg(dX, dY);
      h = angle / 360;
      let lenght = lineLenght(dX, dY);
      if (lenght > px(250 / 2)) lenght = px(250 / 2);
      s = lenght / px(250 / 2);

      if (pointer) {
        pointer.setProperty(prop.MORE, {
          pos_x: px((260 + s * 250) / 2),
          angle: h * 360,
        });
      }
      setColor();

      let rgbNew = hsvToRgb(h, s, 1);
      let colorNew = RGBToNumber(rgbNew[0], rgbNew[1], rgbNew[2]);
      if (lightness) lightness.setProperty(prop.COLOR, colorNew);
    });
    palette.addEventListener(event.MOVE, function (info) {
      let posX = info.x - x;
      let posY = info.y - y;
      let dX = posX - px(260 / 2);
      let dY = posY - px(260 / 2);

      let angle = angleDeg(dX, dY);
      h = angle / 360;
      let lenght = lineLenght(dX, dY);
      if (lenght > px(250 / 2)) lenght = px(250 / 2);
      s = lenght / px(250 / 2);
      if (pointer) {
        pointer.setProperty(prop.MORE, {
          pos_x: px((260 + s * 250) / 2),
          angle: h * 360,
        });
      }
      setColor();

      let rgbNew = hsvToRgb(h, s, 1);
      let colorNew = RGBToNumber(rgbNew[0], rgbNew[1], rgbNew[2]);
      if (lightness) lightness.setProperty(prop.COLOR, colorNew);
    });

    let colorString = "#" + color.toString(16).padStart(6, "0");
    const rgb = hex2rgb(colorString);
    const r = rgb.r;
    const g = rgb.g;
    const b = rgb.b;
    //logger.log(`rgb (${r}, ${g}, ${b})`);

    let hsv = rgbToHsv(r, g, b);
    h = hsv[0]; // angle
    s = hsv[1]; // radius
    v = hsv[2]; // lightness

    //logger.log(`hsv (${h}, ${s}, ${v})`);

    let pointer = createWidget(widget.IMG, {
      x: x - px(10),
      y: y - px(10),
      w: px(260 + 20),
      h: px(260 + 20),
      pos_x: px((260 + s * 250) / 2),
      pos_y: px(260 / 2),
      center_x: px((260 + 20) / 2),
      center_y: px((260 + 20) / 2),
      angle: h * 360,
      src: "zoskit/palletesrc/Pointer_r.png",
    });
    this.widgets.push(pointer);
    pointer.setEnable(false);

    //////////////////
    let lightness = createWidget(widget.FILL_RECT, {
      x: x + px(5),
      y: y + px(275),
      w: px(250),
      h: px(35),
      color: color,
    });
    this.widgets.push(lightness);
    let lightnessMask = createWidget(widget.IMG, {
      x: x,
      y: y + px(270),
      src: "zoskit/palletesrc/LightnessMask.png",
    });
    this.widgets.push(lightnessMask);
    let lightnessPointer = createWidget(widget.IMG, {
      x: x + px(v * 250),
      y: y + px(270 - 5),
      src: "zoskit/palletesrc/Pointer.png",
    });
    this.widgets.push(lightnessPointer);
    lightnessPointer.setEnable(false);

    lightnessMask.addEventListener(event.CLICK_DOWN, function (info) {
      //logger.log("CLICK_DOWN");
      let posX = info.x - x + px(5);
      let scale = posX / px(250);
      if (scale > 1) scale = 1;
      if (scale < 0) scale = 0;
      //logger.log(`posX = ${posX}, scale = ${scale}`);
      v = scale;

      if (lightnessPointer) {
        lightnessPointer.setProperty(prop.X, px(x + v * 250));
      }
      setColor();
    });
    lightnessMask.addEventListener(event.MOVE, function (info) {
      // logger.log('MOVE');
      let posX = info.x - x + px(5);
      let scale = posX / px(250);
      if (scale > 1) scale = 1;
      if (scale < 0) scale = 0;
      //logger.log(`posX = ${posX}, scale = ${scale}`);
      v = scale;

      if (lightnessPointer) {
        lightnessPointer.setProperty(prop.X, x + px(v * 250));
      }
      setColor();
    });
  }
}

export function createColorPalette(visible = false) {
  const widgets = [];
  const fill = createWidget(widget.FILL_RECT, {
    x: 0,
    y: 0,
    w: DEVICE_WIDTH,
    h: DEVICE_HEIGHT,
    radius: 0,
    color: 0x000000,
  });
  widgets.push(fill);
  colorPreview = createWidget(widget.FILL_RECT, {
    x: (DEVICE_WIDTH - px(150)) / 2,
    y: screenShape === SCREEN_SHAPE_SQUARE ? px(10) : px(30),
    w: px(150),
    h: px(50),
    radius: 10,
    color: 0x000000,
  });
  widgets.push(colorPreview);

  const palette = new PaletteSelect(PALETTE_POS_X, PALETTE_POS_Y, inputColor);
  widgets.push(...palette.widgets);
  setColor();

  let button_cancel = createWidget(widget.BUTTON, {
    x:
      screenShape === SCREEN_SHAPE_SQUARE
        ? DEVICE_WIDTH / 2 - px(210)
        : px(-120),
    y:
      screenShape === SCREEN_SHAPE_SQUARE
        ? DEVICE_HEIGHT - px(60)
        : (DEVICE_HEIGHT - px(90)) / 2,
    w: -1,
    h: -1,
    normal_src: "zoskit/palletesrc/button_cancel.png",
    press_src: "zoskit/palletesrc/button_cancel.png",
    click_func: () => {
      offGesture();
      //logger.log("button_cancel");
      widgets.forEach((w) => w.setProperty(prop.VISIBLE, false));
    },
  });
  widgets.push(button_cancel);

  let button_ok = createWidget(widget.BUTTON, {
    x:
      screenShape === SCREEN_SHAPE_SQUARE
        ? DEVICE_WIDTH / 2 + px(10)
        : DEVICE_WIDTH - px(80),
    y:
      screenShape === SCREEN_SHAPE_SQUARE
        ? DEVICE_HEIGHT - px(60)
        : (DEVICE_HEIGHT - px(90)) / 2,
    w: -1,
    h: -1,
    normal_src: "zoskit/palletesrc/button_ok.png",
    press_src: "zoskit/palletesrc/button_ok.png",
    click_func: () => {
      offGesture();
      console.log("button_ok");

      //widgets.forEach((w) => w.setProperty(prop.VISIBLE, false));

      //logger.log(`hsv (${h}, ${s}, ${v})`);
      let rgb = hsvToRgb(h, s, v);
      let colorHex = RGBToHex(rgb[0], rgb[1], rgb[2]);
      //logger.log(`rgb (${rgb[0]}, ${rgb[1]}, ${rgb[2]})`);
      //console.log("COLOR", colorHex);

      if (typeof api.onConfirm === "function") {
        api.onConfirm(colorHex);
      }
    },
  });
  widgets.push(button_ok);
  widgets.forEach((w) => w.setProperty(prop.VISIBLE, visible));

  const api = {
    widgets,
    palette,
    onConfirm: null, // сюда снаружи можно положить функцию

    set visible(value) {
      widgets.forEach((w) => w.setProperty(prop.VISIBLE, value));
      if (value) {
        onGesture({
          callback: () => true,
        });
      } else {
        offGesture();
      }
    },
    get visible() {
      return widgets.length ? widgets[0].getProperty(prop.VISIBLE) : false;
    },
  };

  return api;
}
