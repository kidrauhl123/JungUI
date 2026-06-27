# JungUI Site

Jung 的 UI / 交互样式实验站。**这里的代码就是规范本身**——审美以页面实际呈现为准，不维护单独的文字规则文档（文字总会偏差）。要知道某个风格怎么做，去看对应组件的源码。

## 收藏规则：逆向真代码，原原本本复刻

往这里收藏外部网站的样式时，**必须 1:1 还原源站的真实样子，不许凭印象近似**。

**最正确的方法：逆向源站作者写的真实 CSS / 源码，不要靠截图猜。** 取值优先级：

1. **逆向真实 CSS 规则（首选）**——把命中目标元素的**作者声明**抠出来：选择器、属性、以及 `var(--x)` 这类**绑定关系**。看到的是源头（例如 `border-radius: var(--radius)` + `--radius: 26px`），而不是被浏览器解析/裁切后的死值。
   - 在 DevTools 或用脚本遍历 `document.styleSheets`，对目标 `el.matches(selector)` 收集命中规则；同时抠出 `:root` / `.dark` 等处的主题变量定义（`--card`、`--card-foreground`、`--background`、`--radius` …）。
   - 复刻时**保留同样的绑定**（也写 `border-radius: var(--radius)`），而不是把解析值写死——这样形状/主题联动才和源站一致。
2. **计算样式（次选）**——拿不到作者规则时，用 `getComputedStyle` 取真实值；注意这是解析后的值，圆角等可能已被裁切，不等于源码。
3. **截图（仅用于肉眼核对）**——只用来最后并排比对，**绝不**作为抠值来源。

其余要求：

- **图标 / SVG 直接照搬源站的 path**，不要自己重画。
- **能用源站的技术栈、源码就用**（同一份 React 组件、同样的类名/变量）；确实用不了时，把源站实值/绑定原样转写进来。
- 收藏件顶部用注释把**来源**和逆向出来的**每条源规则**记上，方便日后核对。

判断标准：把收藏件和源站并排放，应当看不出差别。

## 本地开发

```bash
cd /Users/jung/GitHub/JungUI/app
npm install
npm run dev
```

Vite 默认地址 `http://localhost:5173`。

## 源码导航

- `src/App.jsx`：页面结构和展示区。
- `src/index.css`：全局 token、布局、各展示样式。
- `src/components/`：各个交互样式（RevealCard、CardStack、RippleField、vizzes 等）。

## 构建与预览

```bash
npm run build   # 产物在 dist/
npm run preview
```

## 发布：Git 自动部署（push 即上线）

已接 Cloudflare Pages 的 Git 自动部署。仓库 `github.com/kidrauhl123/JungUI`（私有），Pages 项目 `jungui`，正式域名 `https://jungui-cle.pages.dev/`。

发布 = 推到生产分支：

```bash
cd /Users/jung/GitHub/JungUI
git add -A && git commit -m "..." && git push
```

Cloudflare 自动 `npm run build` 并上线。Pages 端构建配置（一次性已设）：

- Production branch: `main`
- Root directory: `app`（Vite 项目在子目录）
- Build command: `npm run build`，Output: `dist`

发布后核对正式域名已切到新构建：

```bash
curl -L --compressed -s https://jungui-cle.pages.dev/ | grep '/assets/index-'
```

## 交付前检查

```bash
npm run lint
npm run build
```
