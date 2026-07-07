import {
  ArrowRight,
  BookOpen,
  Github,
  Home,
  Monitor,
  Newspaper,
  RefreshCw,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

type SectionId = "home" | "works" | "articles" | "os";
type IntroPhase = "booting" | "zooming" | "done";
type ZoomRect = {
  left: number;
  top: number;
  width: number;
  height: number;
  dx: number;
  dy: number;
  scale: number;
};

type Project = {
  title: string;
  description: string;
  tags: string[];
  href?: string;
};

type Article = {
  title: string;
  summary: string;
  meta: string;
  href?: string;
};

type OsCard = {
  title: string;
  body: string;
  x: number;
  y: number;
  tone: "blue" | "yellow" | "green" | "rose" | "ink";
};

const profile = {
  name: "汤姆喵",
  handle: "tommiao",
  headline: "把代码、AI 和写作组织成自己的创作系统。",
  terminalHost: "tommiao@universe ~ zsh",
};

const githubProjects: Project[] = [
  {
    title: "tommiao-website",
    description: "个人介绍网站，正在搭建作品、文章和个人 OS 的入口。",
    tags: ["React", "Tailwind", "daisyUI"],
  },
  {
    title: "AI workflow lab",
    description: "用于沉淀 Agent 工作流、自动化脚本和个人效率实验的项目位。",
    tags: ["AI", "Automation", "Workflow"],
  },
  {
    title: "creative tools",
    description: "放置面向内容创作的小工具，后续可接入编辑器、生成器或看板。",
    tags: ["Tools", "Creator", "Web"],
  },
];

const articles: Article[] = [
  {
    title: "公众号文章占位 01",
    summary: "这里会替换成你的公众号文章标题、摘要和原文链接。",
    meta: "WeChat Official Account",
  },
  {
    title: "公众号文章占位 02",
    summary: "可以按系列、主题或发布时间组织，保留封面位也很容易扩展。",
    meta: "Writing / Notes",
  },
  {
    title: "公众号文章占位 03",
    summary: "后续你把文章清单发来，我会把这部分换成真实内容。",
    meta: "Coming soon",
  },
];

const osCards: OsCard[] = [
  {
    title: "Inbox",
    body: "想法、资料、灵感先进入收件箱。",
    x: 68,
    y: 64,
    tone: "yellow",
  },
  {
    title: "Build",
    body: "把能复用的流程沉淀成脚本、网页或 Agent。",
    x: 376,
    y: 118,
    tone: "blue",
  },
  {
    title: "Publish",
    body: "作品和文章统一归档，形成可展示的输出面。",
    x: 214,
    y: 318,
    tone: "green",
  },
  {
    title: "Review",
    body: "定期回看项目、写作和学习节奏。",
    x: 592,
    y: 288,
    tone: "rose",
  },
  {
    title: "Archive",
    body: "保留完成记录，让系统越来越像自己。",
    x: 746,
    y: 72,
    tone: "ink",
  },
];

const navItems: Array<{ id: SectionId; label: string; number: string; icon: LucideIcon }> = [
  { id: "home", label: "首页", number: "01", icon: Home },
  { id: "works", label: "作品集", number: "02", icon: Github },
  { id: "articles", label: "文章", number: "03", icon: Newspaper },
  { id: "os", label: "我的OS", number: "04", icon: Monitor },
];

const terminalLines = [
  { prefix: "$", content: "whoami", kind: "command" },
  { prefix: ">", content: `${profile.name} / ${profile.handle}`, kind: "output" },
  { prefix: "$", content: "cat about.md", kind: "command" },
  { prefix: ">", content: profile.headline, kind: "output" },
  { prefix: "", content: "GitHub projects -> works/", kind: "muted" },
  { prefix: "", content: "WeChat articles -> writing/", kind: "muted" },
  { prefix: "$", content: 'echo "1 person + AI = 1 team"', kind: "command" },
  { prefix: ">", content: "1 person + AI = 1 team", kind: "highlight" },
  { prefix: "$", content: "open tommiao-os.app", kind: "command" },
  { prefix: ">", content: "launching...", kind: "output" },
] as const;

type TerminalLine = (typeof terminalLines)[number];

const staticTerminalLines = terminalLines.slice(0, 8);
const launchTerminalLines = terminalLines.slice(8);

function TerminalLineItem({
  line,
  animated = false,
  showCursor = false,
}: {
  line: TerminalLine;
  animated?: boolean;
  showCursor?: boolean;
}) {
  return (
    <div className={`terminal-line terminal-line-${line.kind} ${animated ? "terminal-line-animated" : ""}`}>
      {line.prefix && <span className="terminal-prefix">{line.prefix}</span>}
      <span className="terminal-line-content">
        {line.content}
        {showCursor && <span className="terminal-inline-cursor" aria-hidden="true" />}
      </span>
    </div>
  );
}

function IntroScreen({
  phase,
  introStarted,
  visibleLaunchLines,
  showProgressBar,
  progress,
  zoomRect,
  onStart,
}: {
  phase: IntroPhase;
  introStarted: boolean;
  visibleLaunchLines: number;
  showProgressBar: boolean;
  progress: number;
  zoomRect: ZoomRect | null;
  onStart: () => void;
}) {
  const zoomStyle = zoomRect
    ? ({
        "--screen-left": `${zoomRect.left}px`,
        "--screen-top": `${zoomRect.top}px`,
        "--screen-width": `${zoomRect.width}px`,
        "--screen-height": `${zoomRect.height}px`,
        "--screen-dx": `${zoomRect.dx}px`,
        "--screen-dy": `${zoomRect.dy}px`,
        "--screen-scale": zoomRect.scale,
      } as CSSProperties)
    : undefined;

  return (
    <div className={`intro-overlay intro-${phase}`} aria-label={`${profile.name} 的 CLI 启动动画`}>
      {phase === "zooming" && zoomRect && (
        <>
          <div className="screen-expander" style={zoomStyle}>
            <div className="screen-expander-screen" />
          </div>
          <div className="screen-blue-cover" />
        </>
      )}
      <div className="intro-stage">
        <div className="laptop-shell intro-laptop">
          <div className="laptop-frame">
            <div className="terminal-screen">
              <div className="terminal-titlebar">
                <div className="flex gap-2" aria-hidden="true">
                  <span className="traffic-dot bg-error" />
                  <span className="traffic-dot bg-warning" />
                  <span className="traffic-dot bg-success" />
                </div>
                <span>{profile.terminalHost}</span>
                <span className="w-14" />
              </div>
              <div className="terminal-body">
                <div className="terminal-static-block">
                  {staticTerminalLines.map((line) => (
                    <TerminalLineItem line={line} key={line.content} />
                  ))}
                </div>

                <div className="terminal-launch-block">
                  {launchTerminalLines.slice(0, visibleLaunchLines).map((line) => (
                    <TerminalLineItem
                      animated={introStarted && line.content === "launching..."}
                      line={line}
                      key={line.content}
                      showCursor={!introStarted && line.content === "open tommiao-os.app"}
                    />
                  ))}

                  {showProgressBar && (
                    <div className="terminal-loading-row">
                      <span aria-hidden="true">[</span>
                      <span className="terminal-progress" aria-label={`加载进度 ${progress}%`}>
                        <span className="terminal-progress-fill" style={{ width: `${progress}%` }} />
                      </span>
                      <span aria-hidden="true">]</span>
                      <span>{progress}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="laptop-base" aria-hidden="true" />
          <div className="laptop-shadow" aria-hidden="true" />
        </div>

        {!introStarted && phase === "booting" && (
          <button className="intro-launch-prompt" type="button" onClick={onStart}>
            <span>Press Enter to Launch</span>
            <span className="intro-launch-arrow" aria-hidden="true">
              ↓
            </span>
          </button>
        )}

        <div className="intro-nav-preview" aria-hidden="true">
          <div className="tabs tabs-box tabs-xs flex-nowrap bg-base-100/90 shadow-lg backdrop-blur sm:tabs-sm">
            {navItems
              .filter((item) => item.id !== "articles")
              .map((item) => {
                const Icon = item.icon;
                const isActive = item.id === "home";
                return (
                  <div
                    className={`tab h-10 gap-1 whitespace-nowrap px-3 text-xs sm:h-11 sm:gap-2 sm:px-5 sm:text-sm ${
                      isActive ? "tab-active text-primary" : ""
                    }`}
                    key={item.id}
                    role="tab"
                  >
                    <Icon size={15} />
                    <span className="text-xs opacity-55">{item.number}</span>
                    <span>{item.label}</span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [activeSection, setActiveSection] = useState<SectionId>("home");
  const [introPhase, setIntroPhase] = useState<IntroPhase>("booting");
  const [introStarted, setIntroStarted] = useState(false);
  const [visibleLaunchLines, setVisibleLaunchLines] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [progress, setProgress] = useState(0);
  const [zoomRect, setZoomRect] = useState<ZoomRect | null>(null);
  const [boardView, setBoardView] = useState({ x: 0, y: 0, scale: 1 });
  const dragState = useRef<{ pointerId: number; x: number; y: number; startX: number; startY: number } | null>(
    null,
  );

  const startIntro = useCallback(() => {
    if (introPhase === "booting" && !introStarted) {
      setIntroStarted(true);
    }
  }, [introPhase, introStarted]);

  useEffect(() => {
    if (introPhase !== "booting") {
      return;
    }

    setVisibleLaunchLines(1);
    setShowProgressBar(false);
    setProgress(0);
    setZoomRect(null);

    if (!introStarted) {
      return;
    }

    let progressValue = 0;
    let progressTimer: number | undefined;
    let progressRevealTimer: number | undefined;
    let zoomTimer: number | undefined;

    const launchLineTimer = window.setTimeout(() => setVisibleLaunchLines(2), 160);

    progressRevealTimer = window.setTimeout(() => {
      setShowProgressBar(true);

      progressTimer = window.setInterval(() => {
        progressValue = Math.min(progressValue + 10, 100);
        setProgress(progressValue);

        if (progressValue === 100) {
          if (progressTimer) {
            window.clearInterval(progressTimer);
          }

          zoomTimer = window.setTimeout(() => {
            const frame = document.querySelector(".intro-overlay .laptop-frame");
            const screen = document.querySelector(".intro-overlay .terminal-screen");
            const frameRect = frame?.getBoundingClientRect();
            const screenRect = screen?.getBoundingClientRect();

            if (frameRect && screenRect) {
              const screenScale = Math.max(
                window.innerWidth / screenRect.width,
                window.innerHeight / screenRect.height,
              );

              setZoomRect({
                left: frameRect.left,
                top: frameRect.top,
                width: frameRect.width,
                height: frameRect.height,
                dx: window.innerWidth / 2 - (frameRect.left + frameRect.width / 2),
                dy: window.innerHeight / 2 - (frameRect.top + frameRect.height / 2),
                scale: screenScale * 1.05,
              });
            }

            setIntroPhase("zooming");
          }, 110);
        }
      }, 48);
    }, 460);

    return () => {
      window.clearTimeout(launchLineTimer);
      if (progressRevealTimer) {
        window.clearTimeout(progressRevealTimer);
      }
      if (progressTimer) {
        window.clearInterval(progressTimer);
      }
      if (zoomTimer) {
        window.clearTimeout(zoomTimer);
      }
    };
  }, [introPhase, introStarted]);

  useEffect(() => {
    if (introPhase !== "zooming") {
      return;
    }

    const doneTimer = window.setTimeout(() => setIntroPhase("done"), 1320);
    return () => window.clearTimeout(doneTimer);
  }, [introPhase]);

  useEffect(() => {
    document.documentElement.classList.toggle("intro-locked", introPhase !== "done");

    if (introPhase === "done") {
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
    }

    return () => document.documentElement.classList.remove("intro-locked");
  }, [introPhase]);

  useEffect(() => {
    const observedSections = navItems
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveSection(visible.target.id as SectionId);
        }
      },
      { threshold: [0.35, 0.55, 0.75] },
    );

    observedSections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter") {
        return;
      }

      if (introPhase !== "done") {
        event.preventDefault();
        startIntro();
        return;
      }

      if (activeSection === "home") {
        scrollToSection("works");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSection, introPhase, startIntro]);

  const scrollToSection = (id: SectionId) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleBoardPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = {
      pointerId: event.pointerId,
      x: boardView.x,
      y: boardView.y,
      startX: event.clientX,
      startY: event.clientY,
    };
  };

  const handleBoardPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    setBoardView((current) => ({
      ...current,
      x: drag.x + event.clientX - drag.startX,
      y: drag.y + event.clientY - drag.startY,
    }));
  };

  const handleBoardPointerUp = () => {
    dragState.current = null;
  };

  const handleBoardWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.08 : 0.08;
    setBoardView((current) => ({
      ...current,
      scale: Math.min(1.35, Math.max(0.72, Number((current.scale + delta).toFixed(2)))),
    }));
  };

  const updateZoom = (delta: number) => {
    setBoardView((current) => ({
      ...current,
      scale: Math.min(1.35, Math.max(0.72, Number((current.scale + delta).toFixed(2)))),
    }));
  };

  return (
    <>
      {introPhase !== "done" && (
        <IntroScreen
          introStarted={introStarted}
          onStart={startIntro}
          phase={introPhase}
          progress={progress}
          showProgressBar={showProgressBar}
          visibleLaunchLines={visibleLaunchLines}
          zoomRect={zoomRect}
        />
      )}

      <main
        className={`site-shell min-h-screen overflow-x-hidden bg-base-100 text-base-content ${
          introPhase === "done" ? "site-shell-ready" : "site-shell-hidden"
        }`}
      >
        <section id="home" className="front-home-section">
          <div className="section-inner">
            <div className="home-grid">
              <div>
                <div className="section-kicker">
                  <Sparkles size={16} />
                  <span>tommiao.site</span>
                </div>
                <h1>1 person + AI = 1 team</h1>
                <p>
                  这里是汤姆喵的个人入口：把 GitHub 项目、公众号文章和自己的 OS 看板放在同一个创作系统里。
                </p>
                <div className="home-actions">
                  <button className="btn btn-primary" onClick={() => scrollToSection("works")}>
                    <Github size={18} />
                    看作品集
                  </button>
                  <button className="btn" onClick={() => scrollToSection("os")}>
                    <Monitor size={18} />
                    打开我的 OS
                  </button>
                </div>
              </div>

              <div className="home-command-panel" aria-label="网站模块入口">
                <div className="home-panel-title">
                  <span className="status status-success" />
                  <span>frontend.page</span>
                </div>
                <button className="home-command-row" onClick={() => scrollToSection("works")}>
                  <span>works/</span>
                  <strong>GitHub 项目</strong>
                  <ArrowRight size={16} />
                </button>
                <button className="home-command-row" onClick={() => scrollToSection("articles")}>
                  <span>articles.md</span>
                  <strong>公众号文章</strong>
                  <ArrowRight size={16} />
                </button>
                <button className="home-command-row" onClick={() => scrollToSection("os")}>
                  <span>tommiao-os.app</span>
                  <strong>个人 OS 画板</strong>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="works" className="content-band">
        <div className="section-inner">
          <div className="section-kicker">
            <Github size={16} />
            <span>ls works/</span>
          </div>
          <div className="section-heading">
            <h1>我的作品集</h1>
            <p>先放 GitHub 项目的展示位，后续你给我项目列表后我会换成真实仓库、链接和截图。</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {githubProjects.map((project) => (
              <article className="card card-border bg-base-100 shadow-sm" key={project.title}>
                <div className="card-body">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="card-title text-lg">{project.title}</h2>
                    <Github className="shrink-0 text-primary" size={20} />
                  </div>
                  <p className="min-h-20 text-sm leading-6 text-base-content/70">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span className="badge badge-soft" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="card-actions mt-2">
                    {project.href ? (
                      <a className="btn btn-sm btn-primary" href={project.href} rel="noreferrer" target="_blank">
                        <Github size={16} />
                        GitHub
                      </a>
                    ) : (
                      <span className="badge badge-outline">待补充链接</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
        </section>

        <section id="articles" className="content-band bg-base-200/55">
        <div className="section-inner">
          <div className="section-kicker">
            <BookOpen size={16} />
            <span>cat articles.md</span>
          </div>
          <div className="section-heading">
            <h1>我的文章</h1>
            <p>公众号文章入口会按主题整理，适合放长期沉淀、教程和项目复盘。</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {articles.map((article) => (
              <article className="card card-border bg-base-100 shadow-sm" key={article.title}>
                <div className="card-body">
                  <span className="text-xs font-semibold uppercase text-primary">{article.meta}</span>
                  <h2 className="card-title text-lg">{article.title}</h2>
                  <p className="text-sm leading-6 text-base-content/70">{article.summary}</p>
                  <div className="card-actions mt-auto">
                    {article.href ? (
                      <a className="btn btn-sm" href={article.href} rel="noreferrer" target="_blank">
                        <Newspaper size={16} />
                        阅读
                      </a>
                    ) : (
                      <span className="badge badge-outline">待补充原文</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
        </section>

        <section id="os" className="content-band os-band">
        <div className="section-inner">
          <div className="section-kicker">
            <Monitor size={16} />
            <span>open tommiao-os.app</span>
          </div>
          <div className="section-heading">
            <h1>我的 OS</h1>
            <p>先按 hiesther.me 的画板感搭出骨架，具体模块内容等你后续发来再填。</p>
          </div>

          <div className="os-window">
            <div className="os-toolbar">
              <div className="flex items-center gap-2">
                <Sparkles className="text-accent" size={18} />
                <span className="font-semibold">Tommiao OS Board</span>
              </div>
              <div className="flex gap-2">
                <div className="tooltip tooltip-bottom" data-tip="缩小">
                  <button className="btn btn-xs btn-square" onClick={() => updateZoom(-0.1)} aria-label="缩小画板">
                    <ZoomOut size={15} />
                  </button>
                </div>
                <div className="tooltip tooltip-bottom" data-tip="放大">
                  <button className="btn btn-xs btn-square" onClick={() => updateZoom(0.1)} aria-label="放大画板">
                    <ZoomIn size={15} />
                  </button>
                </div>
                <div className="tooltip tooltip-bottom" data-tip="重置">
                  <button
                    className="btn btn-xs btn-square"
                    onClick={() => setBoardView({ x: 0, y: 0, scale: 1 })}
                    aria-label="重置画板"
                  >
                    <RefreshCw size={15} />
                  </button>
                </div>
              </div>
            </div>
            <div
              className="os-canvas"
              onPointerDown={handleBoardPointerDown}
              onPointerMove={handleBoardPointerMove}
              onPointerUp={handleBoardPointerUp}
              onPointerCancel={handleBoardPointerUp}
              onWheel={handleBoardWheel}
            >
              <div
                className="os-board"
                style={{
                  transform: `translate(${boardView.x}px, ${boardView.y}px) scale(${boardView.scale})`,
                }}
              >
                <div className="os-orbit os-orbit-one" />
                <div className="os-orbit os-orbit-two" />
                {osCards.map((card) => (
                  <article className={`os-node os-node-${card.tone}`} key={card.title} style={{ left: card.x, top: card.y }}>
                    <span>{card.title}</span>
                    <p>{card.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
        </section>

        <footer className="px-6 pb-28 pt-12 text-center text-sm text-base-content/60">
          <p>© 2026 {profile.name} · Built with AI & code</p>
        </footer>

        <nav className="bottom-nav" aria-label="页面导航">
          <div role="tablist" className="tabs tabs-box tabs-xs flex-nowrap bg-base-100/90 shadow-lg backdrop-blur sm:tabs-sm">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  className={`tab h-10 gap-1 whitespace-nowrap px-2 text-xs sm:h-11 sm:gap-2 sm:px-5 sm:text-sm ${isActive ? "tab-active text-primary" : ""}`}
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  role="tab"
                  aria-selected={isActive}
                >
                  <Icon size={15} />
                  <span className="hidden text-xs opacity-55 md:inline">{item.number}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </main>
    </>
  );
}

export default App;
