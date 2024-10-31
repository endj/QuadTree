const canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.strokeStyle = "white";
ctx.font = "30px roboto";

const chars = [];

function* textGenerator(text) {
  let x = 0;
  let y = 50;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const width = ctx.measureText(text[i - 1] || "").width;
    x += width;

    if (char === "\n" || (x > canvas.width * 0.8 && char === " ")) {
      y += 30;
      x = 0;
    }

    chars.push({ char, x, y, light: 1, index: i });
    yield chars[i];
  }
}

const gen = textGenerator(quote);
const quadtree = new Quadtree(
  { x: 0, y: 0, width: canvas.width, height: canvas.height },
  4,
);

const redraw = () => {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  chars.forEach(({ char, x, y, light, index }) => {
    if (light > 0) {
      ctx.fillStyle = `rgba(255, 240, 0, ${light})`;
      ctx.fillText(char, x, y);
      chars[index].light -= 0.002;
    }
  });
};

const tick = () => {
  const next = gen.next();
  if (!next.done) {
    const node = next.value;
    quadtree.insert([node.x, node.y, node]);
    redraw();
    requestAnimationFrame(tick);
  }
};

tick();

addEventListener("mousemove", (e) => {
  const foundPoints = quadtree.queryRange({
    x: e.offsetX - 50,
    y: e.offsetY - 50,
    width: 100,
    height: 100,
  });
  foundPoints.forEach((p) => {
    const [, , char] = p;
    chars[char.index].light = 1;
  });
  if (foundPoints > 0) {
    redraw();
  }
});
