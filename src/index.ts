console.log("hi");

interface Material {
  nodes: {[s: string]: MatNode}
}

interface MatNode {
  type: string
}

function Noise(x: number, y: number) {
  return Math.random();
}

var testMaterial: Material = {
  nodes: {
    root: {
      type: "Noise"
    }
  }
}