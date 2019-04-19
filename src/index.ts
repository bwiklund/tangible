interface Material {
  nodes: { [s: string]: MatNode }
}

interface NodeParams {
  w: number
  h: number
}

interface MatNode {
  func: (id: string, renderContext: RenderContext) => number[][]
  params?: { [s: string]: any }
}

interface RenderContext {
  mat: Material
  nodeCache: { [s: string]: number[][] }
  w: number
  h: number
}

function iterateBuffer(w: number, h: number, func: (x: number, y: number) => number) {
  var output: number[][] = [];
  for (var y = 0; y < h; y++) {
    var row: number[] = [];
    output.push(row);
    for (var x = 0; x < w; x++) {
      row.push(func(x, y));
    }
  }
  return output;
}

function Noise(id: string, renderContext: RenderContext) {
  return iterateBuffer(renderContext.w, renderContext.h, (x, y) => Math.random());
}

function Levels(id: string, renderContext: RenderContext) {
  var node = renderContext.mat.nodes[id];

  var input = fetchNodeFromContext(node.params.input, renderContext);
  var { fromLow, fromHigh, toLow, toHigh } = node.params;

  return iterateBuffer(renderContext.w, renderContext.h, (x, y) => {
    var val = input[y][x];
    val -= fromLow;
    val /= (fromHigh - fromLow);
    val = toLow + val * (toHigh - toLow);
    return val;
  })
}

function fetchNodeFromContext(id: string, renderContext: RenderContext) {
  if (!renderContext.nodeCache[id]) {
    renderContext.nodeCache[id] = renderContext.mat.nodes[id].func(id, renderContext);
  }
  return renderContext.nodeCache[id];
}

function renderMaterial(def: Material, w: number, h: number) {
  var startTime = new Date();

  var canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  canvas.width = w;
  canvas.height = h;
  var ctx = canvas.getContext('2d')!;
  var iData = ctx.getImageData(0, 0, w, h);
  var data = iData.data;

  var renderContext: RenderContext = { nodeCache: {}, w, h, mat: def }

  var root = def.nodes.root;

  var output = root.func("root", renderContext);

  for (var y = 0; y < output.length; y++) {
    var row = output[y];
    for (var x = 0; x < row.length; x++) {
      var i = x + y * w;
      var I = i * 4;

      var val = row[x];

      data[I + 0] = val * 255;
      data[I + 1] = val * 255;
      data[I + 2] = val * 255;
      data[I + 3] = 255;
    }
  }


  ctx.putImageData(iData, 0, 0);

  document.body.appendChild(canvas);

  var endTime = new Date();

  console.log(`Rendered ${w}x${h} material in ${endTime.getTime() - startTime.getTime()}ms`)
}



var testMaterial: Material = {
  nodes: {
    root: {
      func: Levels,
      params: {
        input: "myNoise",
        fromLow: 0,
        fromHigh: 1,
        toLow: 0,
        toHigh: 0.5
      }
    },
    myNoise: {
      func: Noise
    }
  }
}

renderMaterial(testMaterial, 512, 512);