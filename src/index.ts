interface Material {
  nodes: { [s: string]: MatNode }
}

interface NodeParams {
  w: number
  h: number
}

interface MatNode {
  func: (id: string, renderContext: RenderContext) => number[][]
  data?: { [s: string]: any }
}

interface RenderContext {
  mat: Material
  nodeCache: { [s: string]: number[][] }
  w: number
  h: number
}

function Noise(id: string, renderContext: RenderContext) {
  var output = [];
  var node = renderContext.mat.nodes[id];

  for (var y = 0; y < renderContext.h; y++) {
    var row: number[] = [];
    output.push(row);
    for (var x = 0; x < renderContext.w; x++) {
      row.push(Math.random());
    }
  }
  return output;
}

function Levels(id: string, renderContext: RenderContext) {
  var node = renderContext.mat.nodes[id];

  var input = fetchNodeFromContext(node.data.input, renderContext);
  var output = [];
  for (var y = 0; y < renderContext.h; y++) {
    var row: number[] = [];
    output.push(row);
    for (var x = 0; x < renderContext.w; x++) {
      row.push(input[y][x] * 0.1);
    }
  }
  return output;
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
      data: {input: "myNoise"}
    },
    myNoise: {
      func: Noise
    }
  }
}

renderMaterial(testMaterial, 512, 512);