import React, { lazy, Suspense, useCallback, useEffect, useState } from "react";

import EncryptedText from "./EncryptedText";
import LetterGlitch from "./LetterGlitch";
import bandImage from "./band-paw.svg";
import cardModel from "./card-optimized.glb";
import backImage from "./paw-back-720.png";
import portraitImage from "./portrait-cutout-720.png";
import "./portfolio-intro.css";

const detailHref = (page) => `./landing-pages/portfolio-detail.html?page=${page}`;
const lanyardModule = import("./Lanyard");
const Lanyard = lazy(() => lanyardModule);

export function PortfolioIntro() {
  const [cardReady, setCardReady] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(() => document.visibilityState === "visible");
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 760);
  const markCardReady = useCallback(() => setCardReady(true), []);
  const revealCard = cardReady;
  const timing = isMobile
    ? { titleOne: 720, titleTwo: 850, lineOne: 1050, lineTwo: 1500 }
    : { titleOne: 560, titleTwo: 650, lineOne: 780, lineTwo: 1200 };

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth <= 760);
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    const updateVisibility = () => {
      const visible = document.visibilityState === "visible";
      setIsPageVisible(visible);
      if (!visible) setCardReady(false);
    };
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

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
        <h1 id="portfolio-intro-title"><EncryptedText text="Hi，我是" delay={isMobile ? 120 : 100} duration={timing.titleOne} /><EncryptedText text="王祥辉" delay={isMobile ? 420 : 360} duration={timing.titleTwo} /></h1>
        <p><EncryptedText text="一名关注 AI 落地的互联网招聘 HR。" delay={isMobile ? 850 : 700} duration={timing.lineOne} /><EncryptedText text="对互联网、游戏与 AI 充满兴趣，保持好奇，在持续学习与实践中探索招聘工作的更多可能。" delay={isMobile ? 1150 : 980} duration={timing.lineTwo} /></p>
      </div>
      <div className={`portfolio-intro__lanyard${revealCard ? " is-ready" : ""}`} aria-label="可交互个人工卡" aria-busy={!revealCard}>
        <div className={`portfolio-intro__card-loader${revealCard ? " is-ready" : ""}`} aria-hidden="true">
          <span />
          <small>工卡加载中</small>
        </div>
        {isPageVisible ? (
          <Suspense fallback={null}>
            <Lanyard position={[0, 0, 18]} gravity={[0, -40, 0]} fov={17} frontImage={portraitImage} frontTitle="王祥辉" frontSubtitle="互联网 HR" backImage={backImage} backColor="#263329" backFit="contain" imageFit="cover" lanyardImage={bandImage} lanyardWidth={1} onReady={markCardReady} />
          </Suspense>
        ) : null}
      </div>
    </section>
  );
}
