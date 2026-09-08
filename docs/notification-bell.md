# Notification bell 来源与接入

来源：[Rare UI](https://www.rareui.com/components/notificationbell)，作者 Swami Malode，MIT 许可。源码使用 GitHub main 的 notification-bell.tsx，并与先前克隆副本逐字比较一致。完整许可保存在可安装 TSX 文件头部，随源码一起分发。

采用原组件的 SVG、尺寸比例、铃舌延迟、弹簧参数、连续通知的速度叠加和数字滚动算法。Tailwind 工具类转换为局部 CSS，颜色使用 light-dark() 跟随容器 color-scheme；业务状态仍由 count 传入，不依赖 JungUI 站点。

演示保持初始 8 条、72px 铃铛、加减通知和五色调色板。调色板保留拖动能力，拖动入口限定在把手；组件安装不包含演示调色板。

分类：L2，基于真源码的忠实移植。已检查桌面与手机布局、深浅模式、数量增减、9→10 两位数滚动、归零时隐藏徽标和切换徽标颜色。调色板拖动保留 Motion 约束实现，尚未自动验证拖动手势。12 件组件通过真实 shadcn 安装和独立 Vite 编译。数字上限、圆点与 asChild 保留原 API。没有引入原站追踪脚本或服务端依赖。
