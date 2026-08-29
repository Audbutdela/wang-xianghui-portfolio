import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const expected = new Map([
  ["public/landing-pages/inner-green-3d.html", "c66c7dbfd5b7c714668a92a3f44c42681fb2747d297655d6545450c16d4359c1"],
  ["public/landing-pages/wang-sketchbook.html", "07ab124d62fd33dae8760ca488d35bdd823a7af762d0319c5664281926c83b62"],
  ["public/landing-pages/portfolio-detail.html", "f347a6bd63d86ea60b794941241f69a66cda70008c11d6ab800e3620da824078"],
  ["public/landing-pages/inner-green-assets/three.min.js", "8a5f7249903b54d30f79f708699d2fed2d6a1d0741a4cd41377d1f01bb5a2271"],
  ["public/landing-pages/inner-green-assets/card-ecostove.jpg", "70ce084084902bc502f00c366405b661ecdff90dee95d363b36a6e146829e433"],
  ["public/landing-pages/inner-green-assets/card-ethos.jpg", "337627390f499b3ae272cec9e2f83c817694a82f42e1aa10a7b26a2c7d679dff"],
  ["public/landing-pages/inner-green-assets/lexend-latin.woff2", "1ec8f6ee2750554b4bc59ff0b507d316a82a7ba37e0e5bebc41d3bd9b9faad46"],
  ["public/landing-pages/inner-green-assets/wang-and-cat-transparent.png", "b056c917d9dea18fc921332516d9fc81d106edb36182ef9c7dab63d13d84bbb1"],
  ["public/landing-pages/meng-to-sketchbook/instrument-serif.woff2", "60c06664b5a95c7de6cc3e00d1f9034d78bd1e40b564016b241674449a067d4d"],
  ["public/landing-pages/meng-to-sketchbook/instrument-serif-italic.woff2", "6ee678c33f388dd7ba59700ebea635deb98821baafd817b09891f7927177f702"],
  ["public/landing-pages/meng-to-sketchbook/newsreader.woff2", "01817351be3edfc1714fe6d60ddea6a22a169a5ebd033b50c7f9495e5d9c386a"],
  ["public/landing-pages/portfolio-book/01-home.svg", "1c169c3f5e2f05eed4672bcb8ffe503c4b275966493cd7d1f083ea9fd826d377"],
  ["public/landing-pages/portfolio-book/02-resume.svg", "723c7c2d4aab7940d326cb43ad07dc8fa1f348861bc644f90aa6043b6d1a622f"],
  ["public/landing-pages/portfolio-book/03-tools.svg", "43b38423e024c321eadb67ccea6239536e661b0144fae8d2674e616f1f747f1c"],
  ["public/landing-pages/portfolio-book/04-contact.svg", "4b28c9fb4498e1ee6a1bc5fdee9d50876de155f9b327860eaa9e3736f00ed3ea"],
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
