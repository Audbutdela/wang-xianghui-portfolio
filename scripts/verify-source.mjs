import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const expected = new Map([
  ["public/landing-pages/inner-green-3d.html", "c66c7dbfd5b7c714668a92a3f44c42681fb2747d297655d6545450c16d4359c1"],
  ["public/landing-pages/wang-sketchbook.html", "0a96e812ac47635d9f35d8fb9affdf2e6e822042502e194428b54f67e3bf85ac"],
  ["public/landing-pages/portfolio-detail.html", "84b879cc8772a8ced462f75e63956b5651f1aa72dea9bb126c687a6a30007c92"],
  ["public/landing-pages/inner-green-assets/three.min.js", "8a5f7249903b54d30f79f708699d2fed2d6a1d0741a4cd41377d1f01bb5a2271"],
  ["public/landing-pages/inner-green-assets/card-ecostove.jpg", "70ce084084902bc502f00c366405b661ecdff90dee95d363b36a6e146829e433"],
  ["public/landing-pages/inner-green-assets/card-ethos.jpg", "337627390f499b3ae272cec9e2f83c817694a82f42e1aa10a7b26a2c7d679dff"],
  ["public/landing-pages/inner-green-assets/lexend-latin.woff2", "1ec8f6ee2750554b4bc59ff0b507d316a82a7ba37e0e5bebc41d3bd9b9faad46"],
  ["public/landing-pages/inner-green-assets/wang-and-cat-transparent.png", "b056c917d9dea18fc921332516d9fc81d106edb36182ef9c7dab63d13d84bbb1"],
  ["public/landing-pages/meng-to-sketchbook/instrument-serif.woff2", "60c06664b5a95c7de6cc3e00d1f9034d78bd1e40b564016b241674449a067d4d"],
  ["public/landing-pages/meng-to-sketchbook/instrument-serif-italic.woff2", "6ee678c33f388dd7ba59700ebea635deb98821baafd817b09891f7927177f702"],
  ["public/landing-pages/meng-to-sketchbook/newsreader.woff2", "01817351be3edfc1714fe6d60ddea6a22a169a5ebd033b50c7f9495e5d9c386a"],
  ["public/landing-pages/portfolio-book/01-home.svg", "de49629b8ba1e0920db51b74e5d8e57e371f0333a7e0853dfdaf49fe3347f2c3"],
  ["public/landing-pages/portfolio-book/02-resume.svg", "723c7c2d4aab7940d326cb43ad07dc8fa1f348861bc644f90aa6043b6d1a622f"],
  ["public/landing-pages/portfolio-book/03-tools.svg", "43b38423e024c321eadb67ccea6239536e661b0144fae8d2674e616f1f747f1c"],
  ["public/landing-pages/portfolio-book/04-contact.svg", "4b28c9fb4498e1ee6a1bc5fdee9d50876de155f9b327860eaa9e3736f00ed3ea"],
  ["public/landing-pages/portfolio-book/cat-player.png", "01757608cf54fb55ff2c064a84913b16d874b444966f9b7869c13f8e51f4cdd8"],
  ["public/landing-pages/portfolio-book/vine-wreath.png", "d72c8a1f72d7950e062b66a8a3f750ffd5d843e6549864b276dfbd0000021b1d"],
  ["public/landing-pages/portfolio-book/moss-hex-tile.png", "c5b8f3ec8ce5216fe6cda959e765a819185f2a7fc3dc71c329d8a764a809b608"],
  ["public/landing-pages/portfolio-book/vine-board-background.png", "87d170f6e1d9a60d936a5a6ed6775cb8caabdd9f1a5cc070593be47c1c5769d8"],
  ["public/landing-pages/portfolio-book/wechat-qr.png", "e66d4fccfd177f235de5affcf196e2ebc0d952170f6f19c4c0852e7561829616"],
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
