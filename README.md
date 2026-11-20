# 李琼玲中英文学术主页

基于 [Minimal Light](https://github.com/yaoyao-liu/minimal-light) 的可编辑学术主页。完整模板来源见 [TEMPLATE.md](TEMPLATE.md)。

## 日常修改哪些文件

| 想修改的内容 | 编辑文件 |
| --- | --- |
| 姓名、职称、单位、邮箱、Scholar 链接、更新日期 | `_data/profile.yml` |
| 新增论文、修改作者、期刊、年份、DOI | `_data/publications.yml` |
| 中文简介、研究方向、经历、项目、教学、奖励 | `content/zh.md` |
| 对应的英文内容 | `content/en.md` |
| 个人照片 | `assets/img/portrait.jpg` |
| 页面布局与样式 | `_layouts/homepage.html`、`assets/css/custom.css` |

不要直接编辑 `dist/`：它是自动生成的发布文件，下次构建会覆盖。论文和联系信息由两种语言共用；个人经历等正文需要同步修改两份 Markdown 文件。

## 新增一篇论文

在 `_data/publications.yml` 末尾添加如下条目，用真实信息替换示例：

```yaml
- year: 2026
  title: "论文英文标题"
  authors: "Qiongling Li, 其他作者"
  journal: "期刊名称 · 卷号, 页码"
  url: "https://doi.org/实际DOI"
```

保留每个字段前的两个空格。没有链接时使用 `url: ""`。论文会按年份自动倒序，同年按照文件中的顺序排列。中英文页面使用同一个论文列表，因此只需修改一次。

## 修改简介或经历

打开 `content/zh.md`，像编辑普通文档一样修改段落。`##` / `###` 是标题，`-` 是列表，`**文字**` 是加粗。然后同步修改 `content/en.md`。

保留 `<h2 id="...">` 的 id 和 `{{ publications }}` 这一行，它们分别用于侧栏跳转和自动插入论文。项目条目是摘要，详细项目名称可按需要自行扩展。

## 本地预览和检查

安装 Node.js 22 或更高版本，在这个文件夹打开终端：

```sh
npm ci
npm run check
npm run preview
```

浏览器打开 `http://127.0.0.1:4173`。中文地址是 `/zh.html`，英文是 `/en.html`。每次改动内容后重新运行预览命令；只生成文件可运行 `npm run build`。`npm run check` 验证双语页面、资源引用，以及内容更新是否传播到生成页面。

## 放到你自己的 GitHub 后自动发布

源码包已准备好，但尚未创建你个人账号中的 GitHub 仓库。

1. 登录 GitHub，新建一个仓库。若希望主页网址为 `https://你的用户名.github.io/`，仓库名使用 `你的用户名.github.io`；普通仓库名也支持，会使用子路径网址。
2. 将源码包解压后，把文件夹内的文件上传到仓库根目录。必须包含隐藏目录 `.github`、`package-lock.json`、`_data`、`content`、`assets`、`_layouts` 和 `scripts`。不要上传 `node_modules`；`.openai` 仅用于当前 Sites 托管，可在 GitHub 副本中省略。
3. 确认默认分支为 `main`。在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
4. 在 **Actions** 页面运行 `Build and deploy academic homepage` 工作流；如果上传时已运行但 Pages 尚未启用，重新运行一次。
5. 以后在 GitHub 网页中打开需要修改的 Markdown/YAML 文件，点击铅笔图标修改并提交到 `main`。工作流会自动检查、构建和更新 GitHub Pages。

工作流使用相对路径，因此同时支持用户名主页和项目子目录。不需要改代码中的网站地址，不依赖当前 Sites 托管。GitHub Pages 公开后可供学术访问者直接访问。

## 当前 Sites 地址与更新方式

当前站点为 `https://qiongling-li-academic.sdmcai2026-2.chatgpt.site`，仍保留原访问权限。可以继续告诉 Codex 修改资料并发布；仅修改本地文件不会自动更新该网址。GitHub Actions 只更新你的 GitHub Pages 网址，不会自动更新 Sites 网址。

网站源码和 GitHub 发布配置都可继续编辑。现有 `?lang=zh` / `?lang=en` 链接会转到相应语言页面。

## 顶部导航与独立页面
主页包含简介、经历和奖励；研究页包含研究方向与项目；论文、教学、联系各有独立页面。语言切换保留当前栏目。页面内容仍编辑 content/zh.md 与 content/en.md，构建器按带 id 的标题分配到各页面。论文按年份倒序分组。

## CClab 实验室页面更新
导航顺序为 Home、News、Team、Funding、Publications、Teaching、Contact。主页只展示实验室简介和教育与科研经历，不再展示奖励。新闻在 content/zh.md 和 content/en.md 的 news 段落中修改；成员在 _data/team.yml 中添加，name 填姓名、photo 填 assets/img 下照片的相对路径、description 填简介。空记录会显示预留照片框，不代表真实成员。论文从 Google Scholar 导入，排除预印本、重复记录、封面及没有期刊信息的条目；导入记录见 docs/publication-import.json。

## 首页研究介绍与个人资料
首页现在只放实验室简介及三项代表研究。研究介绍、图注及文献链接在 `_data/research.yml` 中编辑，图片位于 `assets/img/research/`。教育科研经历仍在 `content/zh.md` 和 `content/en.md` 的 experience 段落中编辑，页面会将其显示在 Team 中。个人照片和职称也位于 Team 顶部。原图可以点击打开大图，来源标注在每个研究区块中。
