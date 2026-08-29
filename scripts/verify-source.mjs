import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const expected = new Map([
  ["public/landing-pages/inner-green-3d.html", "087221f2250d8c123a9a95be2c57d6fcc9018d47692ea8f7eea205924ee21bcd"],
  ["public/landing-pages/wang-sketchbook.html", "014060087f9bc0fd3e4b13b6b2883b96b8395b58b33d2f1565f5a34b6e18f2f2"],
  ["public/landing-pages/portfolio-detail.html", "970de7bfe73dc010b81f20fc58535ceaf45ff597ef929971ac3332336dcb5f71"],
  ["public/landing-pages/inner-green-assets/three.min.js", "8a5f7249903b54d30f79f708699d2fed2d6a1d0741a4cd41377d1f01bb5a2271"],
  ["public/landing-pages/inner-green-assets/card-ecostove.jpg", "70ce084084902bc502f00c366405b661ecdff90dee95d363b36a6e146829e433"],
  ["public/landing-pages/inner-green-assets/card-ethos.jpg", "337627390f499b3ae272cec9e2f83c817694a82f42e1aa10a7b26a2c7d679dff"],
  ["public/landing-pages/inner-green-assets/lexend-latin.woff2", "1ec8f6ee2750554b4bc59ff0b507d316a82a7ba37e0e5bebc41d3bd9b9faad46"],
  ["public/landing-pages/inner-green-assets/wang-and-cat-transparent.png", "b056c917d9dea18fc921332516d9fc81d106edb36182ef9c7dab63d13d84bbb1"],
  ["public/landing-pages/meng-to-sketchbook/instrument-serif.woff2", "60c06664b5a95c7de6cc3e00d1f9034d78bd1e40b564016b241674449a067d4d"],
  ["public/landing-pages/meng-to-sketchbook/instrument-serif-italic.woff2", "6ee678c33f388dd7ba59700ebea635deb98821baafd817b09891f7927177f702"],
  ["public/landing-pages/meng-to-sketchbook/newsreader.woff2", "01817351be3edfc1714fe6d60ddea6a22a169a5ebd033b50c7f9495e5d9c386a"],
  ["public/landing-pages/portfolio-book/01-home.svg", "607f7251ce3e52a4665adc8c67f43d99fc5f2aaa02715bc78c15f721ca23c1fa"],
  ["public/landing-pages/portfolio-book/02-resume.svg", "723c7c2d4aab7940d326cb43ad07dc8fa1f348861bc644f90aa6043b6d1a622f"],
  ["public/landing-pages/portfolio-book/03-tools.svg", "225d5512ac6290e14ad0918d2d0c74d4cc350862df92b33abc929c25c5c63678"],
  ["public/landing-pages/portfolio-book/04-contact.svg", "826551d1985ee29cc9ee1297bf2bf627da8615b43f71aa8c5676de38274b9d2a"],
]);

let failed = false;

for (const [path, expectedHash] of expected) {
  const bytes = await readFile(new URL(`../${path}`, import.meta.url));
  const actualHash = createHash("sha256").update(bytes).digest("hex");
  const matches = actualHash === expectedHash;
  console.log(`${matches ? "PASS" : "FAIL"} ${path}`);
  if (!matches) {
    console.error(`  expected ${expectedHash}`);
    console.error(`  actual   ${actualHash}`);
    failed = true;
  }
}

if (failed) process.exitCode = 1;
