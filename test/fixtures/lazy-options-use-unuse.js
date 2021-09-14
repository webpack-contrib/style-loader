import style from './style.css';

style.use({
  insertInto: document.body,
  additionalStyles: '.some-element {color: red;}'
});

style.unuse();
