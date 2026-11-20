# 模板来源与定制说明

本网站基于公开学术主页模板 **Minimal Light**：

- 原始仓库：https://github.com/yaoyao-liu/minimal-light
- 使用版本：`1ea07f39518ac44644406380c83da6f89037c4fc`
- 许可证：CC0 1.0 Universal，完整文本保留在 `licenses/minimal-light-CC0.txt`
- `assets/css/minimal-light.css` 原样取自上游 `html_source_file/assets/css/style-no-dark-mode.css`
- `_layouts/homepage.html` 改编自上游 `_layouts/homepage.html`，保留 wrapper / header / section 和个人资料侧栏结构

本项目使用该模板的静态 HTML 路线，增加 Markdown/YAML 内容构建、中英文独立页面、语言切换、可访问性、移动布局和 GitHub Actions 发布。构建使用 Node.js，不需要安装 Ruby 或 Jekyll；因此不使用原仓库的 Jekyll `_config.yml`。

个人内容与模板分离：`_data/profile.yml` 管理身份、联系信息和中英文标签；`_data/publications.yml` 管理论文；`content/zh.md` 与 `content/en.md` 管理两种语言的正文。更新模板时请保留这些内容文件和 `assets/css/custom.css`。

模板许可证仅描述上游代码的许可；照片、简历和个人研究资料的权利不因模板许可而改变。
