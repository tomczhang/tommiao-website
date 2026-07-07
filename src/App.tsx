import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Code2,
  ExternalLink,
  FileText,
  Github,
  Home,
  Layers,
  Monitor,
  Newspaper,
  PenLine,
  RefreshCw,
  Rocket,
  Sparkles,
  Tags,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

type SectionId = "home" | "works" | "articles" | "os";
type IntroPhase = "booting" | "zooming" | "done";
type HashRoute = {
  section: SectionId;
  articleSlug: string | null;
  normalizedHash: string;
};
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
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  year: string;
  status: string;
  stack: string[];
  metrics: Array<{ label: string; value: string }>;
  href?: string;
};

type Article = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
  readingTime: string;
  category: string;
  location: string;
  excerpt: string[];
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
    id: "website",
    title: "tommiao-website",
    subtitle: "个人介绍网站",
    description: "个人介绍网站，正在搭建作品、文章和个人 OS 的入口。",
    tags: ["Website", "Frontend", "AI"],
    year: "2026",
    status: "Building",
    stack: ["React", "Tailwind CSS", "daisyUI", "Vite"],
    metrics: [
      { label: "Routes", value: "4" },
      { label: "Mode", value: "CLI intro" },
      { label: "Focus", value: "Personal OS" },
    ],
  },
  {
    id: "workflow-lab",
    title: "AI workflow lab",
    subtitle: "Agent 工作流实验室",
    description: "用于沉淀 Agent 工作流、自动化脚本和个人效率实验的项目位。",
    tags: ["AI", "Automation", "Workflow"],
    year: "2026",
    status: "Prototype",
    stack: ["Codex", "Scripts", "Playbooks", "Docs"],
    metrics: [
      { label: "Loops", value: "Daily" },
      { label: "Output", value: "Tools" },
      { label: "Style", value: "Reusable" },
    ],
  },
  {
    id: "creative-tools",
    title: "creative tools",
    subtitle: "内容创作小工具集",
    description: "放置面向内容创作的小工具，后续可接入编辑器、生成器或看板。",
    tags: ["Tools", "Creator", "Web"],
    year: "2025",
    status: "Collecting",
    stack: ["Web UI", "Prompting", "Markdown", "Assets"],
    metrics: [
      { label: "Use", value: "Writing" },
      { label: "Input", value: "Ideas" },
      { label: "Output", value: "Drafts" },
    ],
  },
];

const articles: Article[] = [
  {
    slug: "agent-first-year",
    title: "跟 Agent 搭档的第 1 年",
    summary: "记录我如何把 AI 从工具变成日常创作和开发的搭档。",
    date: "2026-07-01",
    tags: ["AI", "Workflow", "Essay"],
    readingTime: "8min",
    category: "公众号文章",
    location: "Shanghai",
    excerpt: [
      "一开始我只是把 Agent 当成一个更快的搜索框，后来才意识到，真正变化的是工作组织方式。",
      "当任务可以被拆成上下文、反馈和验证，个人创作就不再只是灵感驱动，而是可以被持续复利的系统。",
    ],
  },
  {
    slug: "personal-os",
    title: "为什么我要搭一个自己的 OS",
    summary: "把项目、文章、工具和灵感放进一个可演化的个人系统。",
    date: "2026-06-18",
    tags: ["OS", "Personal System", "Build"],
    readingTime: "6min",
    category: "方法论",
    location: "Hangzhou",
    excerpt: [
      "个人 OS 不是一个复杂仪表盘，而是一套能让输入、加工、输出自然流动的界面。",
      "它应该像桌面一样被使用，像笔记一样被修改，像作品集一样被展示。",
    ],
  },
  {
    slug: "ship-small-tools",
    title: "先发布小工具，再解释大愿景",
    summary: "用小而完整的作品训练自己的产品感和表达密度。",
    date: "2026-05-26",
    tags: ["Product", "Tools", "Build"],
    readingTime: "5min",
    category: "项目复盘",
    location: "Shanghai",
    excerpt: [
      "很多想法不是想清楚以后才开始做，而是在做成一个可使用的小东西时被迫变清楚。",
      "小工具的价值不只是解决问题，也是在给未来的系统留下接口。",
    ],
  },
  {
    slug: "writing-loop",
    title: "写作的最小闭环",
    summary: "从一个素材到一篇可发布文章，中间需要哪些稳定动作。",
    date: "2026-04-12",
    tags: ["Writing", "Workflow"],
    readingTime: "7min",
    category: "写作",
    location: "Shanghai",
    excerpt: [
      "素材、观点、结构、语气和发布节奏是五个不同层级，混在一起时最容易卡住。",
      "我更喜欢把写作看成一次小型编译：先让内容能跑，再让表达变漂亮。",
    ],
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

const sectionIds = navItems.map((item) => item.id);

function getHashRoute(): HashRoute {
  if (typeof window === "undefined") {
    return { section: "home", articleSlug: null, normalizedHash: "#home" };
  }

  const [rawSection, rawSlug] = window.location.hash.replace(/^#/, "").split("/");
  const section = sectionIds.includes(rawSection as SectionId) ? (rawSection as SectionId) : "home";
  const decodedSlug = rawSlug ? decodeURIComponent(rawSlug) : "";
  const articleSlug =
    section === "articles" && articles.some((article) => article.slug === decodedSlug) ? decodedSlug : null;

  return {
    section,
    articleSlug,
    normalizedHash: articleSlug ? `#articles/${encodeURIComponent(articleSlug)}` : `#${section}`,
  };
}

function getHashSection(): SectionId {
  return getHashRoute().section;
}

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
  activeSection,
  introStarted,
  visibleLaunchLines,
  showProgressBar,
  progress,
  zoomRect,
  onNavigate,
  onStart,
}: {
  phase: IntroPhase;
  activeSection: SectionId;
  introStarted: boolean;
  visibleLaunchLines: number;
  showProgressBar: boolean;
  progress: number;
  zoomRect: ZoomRect | null;
  onNavigate: (id: SectionId) => void;
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

        <nav className="intro-nav-preview" aria-label="首屏导航">
          <div className="nav-capsule" role="tablist">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === activeSection;
              return (
                <button
                  className={`nav-capsule-item ${isActive ? "nav-capsule-item-active" : ""}`}
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                >
                  <Icon size={15} />
                  <span className="nav-capsule-number">{item.number}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

function HomePage({ navigateToSection }: { navigateToSection: (id: SectionId) => void }) {
  return (
    <div className="home-story" id="home-page">
      <section className="home-story-panel home-story-hero">
        <div className="section-inner">
          <div className="home-grid">
            <div className="home-copy">
              <div className="section-kicker">
                <Sparkles size={16} />
                <span>tommiao.site</span>
              </div>
              <h1>1 person + AI = 1 team</h1>
              <p>这里是汤姆喵的个人入口：把 GitHub 项目、公众号文章和自己的 OS 看板放在同一个创作系统里。</p>
              <div className="home-actions">
                <button className="btn btn-primary" onClick={() => navigateToSection("works")}>
                  <Github size={18} />
                  看作品集
                </button>
                <button className="btn" onClick={() => navigateToSection("os")}>
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
              <button className="home-command-row" onClick={() => navigateToSection("works")}>
                <span>works/</span>
                <strong>GitHub 项目</strong>
                <ArrowRight size={16} />
              </button>
              <button className="home-command-row" onClick={() => navigateToSection("articles")}>
                <span>articles.md</span>
                <strong>公众号文章</strong>
                <ArrowRight size={16} />
              </button>
              <button className="home-command-row" onClick={() => navigateToSection("os")}>
                <span>tommiao-os.app</span>
                <strong>个人 OS 画板</strong>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="home-story-panel home-story-system">
        <div className="section-inner">
          <div className="home-story-grid">
            <div>
              <div className="section-kicker">
                <Layers size={16} />
                <span>system map</span>
              </div>
              <h2>把零散输入变成可持续输出。</h2>
              <p>我把想法、代码、文章和工具放进同一个循环里：收集、判断、构建、发布，再回到下一轮。</p>
            </div>
            <div className="home-flow" aria-label="个人系统流程">
              {["Capture", "Shape", "Build", "Publish"].map((item, index) => (
                <div className="home-flow-item" key={item}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home-story-panel home-story-build">
        <div className="section-inner">
          <div className="home-story-grid">
            <div className="home-workbench">
              <div className="home-workbench-line">
                <Code2 size={18} />
                <span>code with agent</span>
              </div>
              <div className="home-workbench-line">
                <PenLine size={18} />
                <span>write in public</span>
              </div>
              <div className="home-workbench-line">
                <Rocket size={18} />
                <span>ship tiny tools</span>
              </div>
            </div>
            <div>
              <div className="section-kicker">
                <Rocket size={16} />
                <span>current loop</span>
              </div>
              <h2>小步发布，让个人站自己长出来。</h2>
              <p>作品集承接 GitHub 项目，文章承接公众号内容，我的 OS 则负责把过程本身变成可探索的画板。</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function WorksPage({
  selectedProject,
  selectedProjectId,
  setSelectedProjectId,
}: {
  selectedProject: Project;
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
}) {
  return (
    <section className="content-band works-route" id="works-page">
      <div className="section-inner">
        <div className="section-kicker">
          <Github size={16} />
          <span>ls works/</span>
        </div>
        <div className="section-heading">
          <h1>我的作品集</h1>
          <p>左侧选择项目，右侧展示项目详情。这里先放结构和占位数据，等你给真实 GitHub 列表后直接替换。</p>
        </div>

        <div className="works-browser">
          <aside className="works-list" aria-label="作品列表">
            {githubProjects.map((project) => {
              const isActive = selectedProjectId === project.id;
              return (
                <button
                  className={`works-list-item ${isActive ? "works-list-item-active" : ""}`}
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  type="button"
                >
                  <span>{project.year}</span>
                  <strong>{project.title}</strong>
                  <small>{project.subtitle}</small>
                </button>
              );
            })}
          </aside>

          <article className="works-preview">
            <div className="works-preview-top">
              <div>
                <span className="badge badge-soft badge-primary">{selectedProject.status}</span>
                <h2>{selectedProject.title}</h2>
                <p>{selectedProject.description}</p>
              </div>
              {selectedProject.href ? (
                <a className="btn btn-sm btn-primary" href={selectedProject.href} rel="noreferrer" target="_blank">
                  <ExternalLink size={16} />
                  GitHub
                </a>
              ) : (
                <span className="badge badge-outline">待补充链接</span>
              )}
            </div>

            <div className="works-preview-visual" aria-hidden="true">
              <div className="works-preview-window">
                <div />
                <div />
                <div />
              </div>
              <div className="works-preview-code">
                <span>project.run()</span>
                <strong>{selectedProject.subtitle}</strong>
                <small>{selectedProject.stack.join(" / ")}</small>
              </div>
            </div>

            <div className="works-metrics">
              {selectedProject.metrics.map((metric) => (
                <div key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </div>
              ))}
            </div>

            <div className="works-tags">
              {selectedProject.tags.map((tag) => (
                <span className="badge badge-soft" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function ArticlesPage({
  openedArticleSlug,
  selectedArticleSlug,
  selectedTag,
  onBackToArticles,
  onOpenArticle,
  setSelectedArticleSlug,
  setSelectedTag,
}: {
  openedArticleSlug: string | null;
  selectedArticleSlug: string;
  selectedTag: string;
  onBackToArticles: () => void;
  onOpenArticle: (slug: string) => void;
  setSelectedArticleSlug: (slug: string) => void;
  setSelectedTag: (tag: string) => void;
}) {
  const tagOptions = ["全部", ...Array.from(new Set(articles.flatMap((article) => article.tags)))];
  const sortedArticles = [...articles].sort((a, b) => b.date.localeCompare(a.date));
  const filteredArticles =
    selectedTag === "全部" ? sortedArticles : sortedArticles.filter((article) => article.tags.includes(selectedTag));
  const selectedArticle =
    filteredArticles.find((article) => article.slug === selectedArticleSlug) ?? filteredArticles[0] ?? sortedArticles[0];
  const openedArticle = openedArticleSlug
    ? sortedArticles.find((article) => article.slug === openedArticleSlug) ?? null
    : null;
  const groupedArticles = filteredArticles.reduce<Record<string, Article[]>>((groups, article) => {
    const year = article.date.slice(0, 4);
    groups[year] = [...(groups[year] ?? []), article];
    return groups;
  }, {});

  useEffect(() => {
    if (selectedArticle && selectedArticle.slug !== selectedArticleSlug) {
      setSelectedArticleSlug(selectedArticle.slug);
    }
  }, [selectedArticle, selectedArticleSlug, setSelectedArticleSlug]);

  if (openedArticle) {
    return (
      <section className="content-band articles-route article-detail-route" id="articles-page">
        <div className="section-inner article-detail-inner">
          <button className="article-detail-back" onClick={onBackToArticles} type="button">
            <ArrowLeft size={16} />
            文章列表
          </button>

          <article className="article-detail-shell">
            <div className="article-breadcrumb">首页 / 文章 / {openedArticle.category}</div>
            <h1>{openedArticle.title}</h1>
            <div className="article-meta article-detail-meta">
              <span>
                <FileText size={14} />
                {profile.name}
              </span>
              <span>
                <Calendar size={14} />
                {openedArticle.date}
              </span>
              <span>
                <Clock size={14} />
                {openedArticle.readingTime}
              </span>
            </div>
            <p className="article-detail-summary">{openedArticle.summary}</p>
            <div className="article-detail-tags">
              {openedArticle.tags.map((tag) => (
                <span className="badge badge-outline" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            <div className="article-detail-body">
              {openedArticle.excerpt.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        </div>
      </section>
    );
  }

  return (
    <section className="content-band articles-route" id="articles-page">
      <div className="section-inner">
        <div className="section-kicker">
          <BookOpen size={16} />
          <span>cat articles.md</span>
        </div>
        <div className="section-heading">
          <h1>我的文章</h1>
          <p>按时间倒序排列，支持标签过滤。右侧预览后续可以接入真实公众号文章详情。</p>
        </div>

        <div className="article-tags" aria-label="文章标签筛选">
          {tagOptions.map((tag) => (
            <button
              className={`badge ${selectedTag === tag ? "badge-primary" : "badge-soft"}`}
              key={tag}
              onClick={() => setSelectedTag(tag)}
              type="button"
            >
              <Tags size={12} />
              {tag}
            </button>
          ))}
        </div>

        <div className="articles-layout">
          <div className="articles-list">
            {Object.entries(groupedArticles).map(([year, yearArticles]) => (
              <section className="article-year" key={year}>
                <h2>{year}</h2>
                {yearArticles.map((article) => {
                  const isActive = selectedArticle.slug === article.slug;
                  return (
                    <button
                      className={`article-row ${isActive ? "article-row-active" : ""}`}
                      data-article-slug={article.slug}
                      key={article.slug}
                      onClick={() => onOpenArticle(article.slug)}
                      onFocus={() => setSelectedArticleSlug(article.slug)}
                      onMouseEnter={() => setSelectedArticleSlug(article.slug)}
                      type="button"
                    >
                      <span>{article.date.slice(5)}</span>
                      <strong>{article.title}</strong>
                      <small>{article.readingTime}</small>
                    </button>
                  );
                })}
              </section>
            ))}
          </div>

          <article className="article-preview">
            <div className="article-breadcrumb">
              首页 / 文章 / {selectedArticle.category}
            </div>
            <h2>{selectedArticle.title}</h2>
            <div className="article-meta">
              <span>
                <FileText size={14} />
                {profile.name}
              </span>
              <span>
                <Calendar size={14} />
                {selectedArticle.date}
              </span>
              <span>
                <Clock size={14} />
                {selectedArticle.readingTime}
              </span>
            </div>
            <p className="article-summary">{selectedArticle.summary}</p>
            <div className="article-preview-tags">
              {selectedArticle.tags.map((tag) => (
                <span className="badge badge-outline" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            <div className="article-excerpt">
              {selectedArticle.excerpt.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function App() {
  const [activeSection, setActiveSection] = useState<SectionId>(() => getHashSection());
  const [introPhase, setIntroPhase] = useState<IntroPhase>("booting");
  const [introStarted, setIntroStarted] = useState(false);
  const [visibleLaunchLines, setVisibleLaunchLines] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [progress, setProgress] = useState(0);
  const [zoomRect, setZoomRect] = useState<ZoomRect | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState(githubProjects[0].id);
  const [selectedArticleTag, setSelectedArticleTag] = useState("全部");
  const [selectedArticleSlug, setSelectedArticleSlug] = useState(articles[0].slug);
  const [openedArticleSlug, setOpenedArticleSlug] = useState<string | null>(() => getHashRoute().articleSlug);
  const [boardView, setBoardView] = useState({ x: 0, y: 0, scale: 1 });
  const dragState = useRef<{ pointerId: number; x: number; y: number; startX: number; startY: number } | null>(
    null,
  );
  const selectedProject = githubProjects.find((project) => project.id === selectedProjectId) ?? githubProjects[0];

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
    const syncRoute = () => {
      const nextRoute = getHashRoute();
      setActiveSection(nextRoute.section);
      setOpenedArticleSlug(nextRoute.articleSlug);

      if (nextRoute.articleSlug) {
        setSelectedArticleSlug(nextRoute.articleSlug);
      }

      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
      });
    };

    const initialRoute = getHashRoute();
    if (window.location.hash !== initialRoute.normalizedHash) {
      window.history.replaceState(null, "", initialRoute.normalizedHash);
    }

    syncRoute();
    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  const navigateToSection = useCallback((id: SectionId) => {
    if (window.location.hash === `#${id}`) {
      setActiveSection(id);
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    window.location.hash = id;
  }, []);

  const navigateToArticle = useCallback((slug: string) => {
    const nextHash = `#articles/${encodeURIComponent(slug)}`;
    if (window.location.hash === nextHash) {
      setActiveSection("articles");
      setOpenedArticleSlug(slug);
      setSelectedArticleSlug(slug);
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    window.location.hash = nextHash;
  }, []);

  const navigateBackToArticles = useCallback(() => {
    navigateToSection("articles");
  }, [navigateToSection]);

  const navigateFromIntro = useCallback(
    (id: SectionId) => {
      navigateToSection(id);
      startIntro();
    },
    [navigateToSection, startIntro],
  );

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
        navigateToSection("works");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSection, introPhase, navigateToSection, startIntro]);

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
          activeSection={activeSection}
          introStarted={introStarted}
          onNavigate={navigateFromIntro}
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
        {activeSection === "home" && <HomePage navigateToSection={navigateToSection} />}

        {activeSection === "works" && (
          <WorksPage
            selectedProject={selectedProject}
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
          />
        )}

        {activeSection === "articles" && (
          <ArticlesPage
            openedArticleSlug={openedArticleSlug}
            onBackToArticles={navigateBackToArticles}
            onOpenArticle={navigateToArticle}
            selectedArticleSlug={selectedArticleSlug}
            selectedTag={selectedArticleTag}
            setSelectedArticleSlug={setSelectedArticleSlug}
            setSelectedTag={setSelectedArticleTag}
          />
        )}

        {activeSection === "os" && (
        <section className="content-band os-band" id="os-page">
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
        )}

        <footer className="px-6 pb-28 pt-12 text-center text-sm text-base-content/60">
          <p>© 2026 {profile.name} · Built with AI & code</p>
        </footer>

        <nav className="bottom-nav" aria-label="页面导航">
          <div role="tablist" className="nav-capsule">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  className={`nav-capsule-item ${isActive ? "nav-capsule-item-active" : ""}`}
                  key={item.id}
                  onClick={(event) => {
                    event.preventDefault();
                    navigateToSection(item.id);
                  }}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                >
                  <Icon size={15} />
                  <span className="nav-capsule-number">{item.number}</span>
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
