import Jimp from "jimp";

const img = await Jimp.read("/Users/janmatthewquinto/Desktop/pos-system/public/logo.png");

img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
  const r = this.bitmap.data[idx + 0];
  const g = this.bitmap.data[idx + 1];
  const b = this.bitmap.data[idx + 2];
  // Make near-white pixels transparent
  if (r > 230 && g > 230 && b > 230) {
    this.bitmap.data[idx + 3] = 0;
  }
});

await img.write("/Users/janmatthewquinto/Desktop/pos-system/public/logo.png");
await img.write("/Users/janmatthewquinto/Desktop/pos-system/public/image.png");
console.log("done");
