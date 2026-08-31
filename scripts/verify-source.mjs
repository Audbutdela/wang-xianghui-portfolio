import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const expected = new Map([
  ["public/landing-pages/inner-green-3d.html", "1b089f30a7521d9db04b096c20a3f28744c3fd5ffd171d322106ffbccfdddb16"],
  ["public/landing-pages/wang-sketchbook.html", "eab44c6a17d8a99beaab56b71d2da0c8e9a79a72e2da3a2aad01cdb71cc718c8"],
  ["public/landing-pages/portfolio-detail.html", "0f7b81c4b3a11ead0b476eba6a7f156de081b116f7ee39c0a5ab40ad364d131d"],
  ["public/landing-pages/assets/wang-xianghui-resume.pdf", "a925ed1f7dc19b06e130e38316942c5a6ebb6bff2f7f7d5bfe79658c9a56b018"],
  ["public/landing-pages/inner-green-assets/three.min.js", "8a5f7249903b54d30f79f708699d2fed2d6a1d0741a4cd41377d1f01bb5a2271"],
  ["public/landing-pages/inner-green-assets/card-ecostove.jpg", "70ce084084902bc502f00c366405b661ecdff90dee95d363b36a6e146829e433"],
  ["public/landing-pages/inner-green-assets/card-ethos.jpg", "337627390f499b3ae272cec9e2f83c817694a82f42e1aa10a7b26a2c7d679dff"],
  ["public/landing-pages/inner-green-assets/lexend-latin.woff2", "1ec8f6ee2750554b4bc59ff0b507d316a82a7ba37e0e5bebc41d3bd9b9faad46"],
  ["public/landing-pages/inner-green-assets/wang-and-cat-transparent.png", "b056c917d9dea18fc921332516d9fc81d106edb36182ef9c7dab63d13d84bbb1"],
  ["public/landing-pages/inner-green-assets/wang-and-cat-720.webp", "61d944239b9e6133ba2eab7cc63ab6e8353e1fd4e861ed9ebde8e52c7dc68c15"],
  ["public/landing-pages/meng-to-sketchbook/instrument-serif.woff2", "60c06664b5a95c7de6cc3e00d1f9034d78bd1e40b564016b241674449a067d4d"],
  ["public/landing-pages/meng-to-sketchbook/instrument-serif-italic.woff2", "6ee678c33f388dd7ba59700ebea635deb98821baafd817b09891f7927177f702"],
  ["public/landing-pages/meng-to-sketchbook/newsreader.woff2", "01817351be3edfc1714fe6d60ddea6a22a169a5ebd033b50c7f9495e5d9c386a"],
  ["public/landing-pages/portfolio-book/01-home.svg", "938fc61398c12e1b4154d89969a5ec65b7498b012e914c06a26bdb0757d53a3e"],
  ["public/landing-pages/portfolio-book/02-resume.svg", "522b509cfa5674a7c58a81a7eba493e17d097d925f1f75f69b3532117df86fb3"],
  ["public/landing-pages/portfolio-book/03-tools.svg", "f56ee30d15bfed059082c8691bf94037e87f438852166fb4cd46747f86194afe"],
  ["public/landing-pages/portfolio-book/04-contact.svg", "4a59e644c633b0d97f41c9f8e86a881a4999603d3cee6e4da83f5528ec7fb459"],
  ["public/landing-pages/portfolio-book/cat-player.png", "01757608cf54fb55ff2c064a84913b16d874b444966f9b7869c13f8e51f4cdd8"],
  ["public/landing-pages/portfolio-book/cat-player-360.webp", "fcd6fa3c0634598aa369af2b671255a323f03d1c035b07aa76e125707040bcb2"],
  ["public/landing-pages/portfolio-book/vine-wreath.png", "d72c8a1f72d7950e062b66a8a3f750ffd5d843e6549864b276dfbd0000021b1d"],
  ["public/landing-pages/portfolio-book/vine-wreath-360.png", "e464d0fc952f52da13f5695353aff9d4da8f63a7f2a29ec962e2ef928ed9d348"],
  ["public/landing-pages/portfolio-book/moss-hex-tile.png", "c5b8f3ec8ce5216fe6cda959e765a819185f2a7fc3dc71c329d8a764a809b608"],
  ["public/landing-pages/portfolio-book/moss-hex-tile-320.webp", "972f9665b6f6d6f4db643a8f7ed90b33fc1ae56814314e055ddfc1212e90a55b"],
  ["public/landing-pages/portfolio-book/vine-board-background.png", "87d170f6e1d9a60d936a5a6ed6775cb8caabdd9f1a5cc070593be47c1c5769d8"],
  ["public/landing-pages/portfolio-book/vine-board-background-900.webp", "22063905a3e33c510f07cab3aecaf69c9942c9f0470c8164a189bcc814766eb9"],
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
