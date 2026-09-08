import React, { lazy, Suspense, useCallback, useState } from "react";

import LetterGlitch from "./LetterGlitch";
import bandImage from "./band-paw.svg";
import cardModel from "./card.glb";
import backImage from "./paw-back-720.png";
import portraitImage from "./portrait-cutout-720.png";
import "./portfolio-intro.css";

const detailHref = (page) => `./landing-pages/portfolio-detail.html?page=${page}`;
const Lanyard = lazy(() => import("./Lanyard"));

export function PortfolioIntro() {
  const [cardReady, setCardReady] = useState(false);
  const markCardReady = useCallback(() => setCardReady(true), []);

  return (
    <section className="portfolio-intro" id="home" aria-labelledby="portfolio-intro-title">
      <link rel="preload" as="fetch" href={cardModel} crossOrigin="anonymous" />
      <link rel="preload" as="image" href={portraitImage} />
      <link rel="preload" as="image" href={backImage} />
      <link rel="preload" as="image" href={bandImage} />
      <LetterGlitch className="portfolio-intro__glitch" glitchColors={["#1f764e", "#1d5038", "#00aaff"]} glitchSpeed={5} centerVignette outerVignette smooth />
      <div className="portfolio-intro__wash" aria-hidden="true" />
      <header className="portfolio-intro__header">
        <a className="portfolio-intro__brand" href="./" aria-label="返回作品集封皮首页">王祥辉｜作品集</a>
        <nav className="portfolio-intro__nav" aria-label="作品集导航">
          <a href={detailHref("about")}>关于我</a>
          <a href={detailHref("resume")}>个人简历</a>
          <a href={detailHref("ai")}>AI 应用</a>
          <a href={detailHref("contact")}>联系我</a>
        </nav>
      </header>
      <div className="portfolio-intro__copy">
        <h1 id="portfolio-intro-title"><span>Hi，我是</span><span>王祥辉</span></h1>
        <p><span>一名关注 AI 落地的互联网招聘 HR。</span><span>对互联网、游戏与 AI 充满兴趣，保持好奇，在持续学习与实践中探索招聘工作的更多可能。</span></p>
      </div>
      <div className="portfolio-intro__lanyard" aria-label="可交互个人工卡">
        <div className={`portfolio-intro__card-placeholder${cardReady ? " is-ready" : ""}`} aria-hidden="true">
          <strong>王祥辉</strong>
          <span>互联网 HR</span>
          <img src={portraitImage} alt="" />
        </div>
        <Suspense fallback={null}>
          <Lanyard position={[0, 0, 18]} gravity={[0, -40, 0]} fov={17} frontImage={portraitImage} frontTitle="王祥辉" frontSubtitle="互联网 HR" backImage={backImage} backColor="#263329" backFit="contain" imageFit="cover" lanyardImage={bandImage} lanyardWidth={1} onReady={markCardReady} />
        </Suspense>
      </div>
    </section>
  );
}
