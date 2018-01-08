/* eslint-disable */
export default function convert(list, options) {
  const styles = [];
  const newStyles = {};

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const id = options.base ? item[0] + options.base : item[0];

    const css = item[1];
    const media = item[2];
    const sourceMap = item[3];

    const part = { css, media, sourceMap };

    if (!newStyles[id]) {
      styles.push(newStyles[id] = { id, parts: [part] });
    } else {
      newStyles[id].parts.push(part);
    }
  }

  return styles;
}
