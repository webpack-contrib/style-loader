/* eslint-disable */
import { JSDOM, VirtualConsole } from 'jsdom';

const html = (scripts) => `
<!DOCTYPE html>
<html>
  <head>
  </head>
  <body>
    <div id="root"></div>
    <script>${scripts[0]}</script>
    <script>${scripts[1]}</script>
  </body>
</html>`;

const virtualConsole = new VirtualConsole().sendTo(console)

export default function (scripts) {
  const dom = new JSDOM(
    html(scripts),
    { runScripts: "dangerously", virtualConsole }
  );

  return dom;
};
