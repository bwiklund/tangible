interface Material {
  nodes: { [s: string]: MatNode }
}

interface MatNode {
  type: (x: number, y: number) => number
}

function Noise(x: number, y: number) {
  return Math.random();
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

  // TODO: when things get eval'd for the first time, calculate their whole buffer and save it. it's faster.
  // var nodeCache: { [s: string]: Float32Array } = {};

  var root = def.nodes.root;

  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var i = x + y * w;
      var I = i * 4;


      var val = root.type(x, y);

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
      type: Noise
    }
  }
}

renderMaterial(testMaterial, 512, 512);