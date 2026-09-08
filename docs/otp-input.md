# OTP Input 来源与接入

来源：[Rare UI](https://www.rareui.com/components/otpinput)，作者 Swami Malode，MIT 许可。以 GitHub main 的 `components/ui/otp-input.tsx` 为基准，与已有克隆副本比较一致。完整许可随可安装 TSX 分发。

L2，基于真源码移植。保留字符滚入、光标弹簧移动、退格与方向键、粘贴过滤、短信自动填充属性、成功描边和错误轻晃。演示继续使用六位数字，123456 成功，其他组合失败。

Tailwind 类替换为独立 CSS，深浅颜色跟随容器 color-scheme；格子在窄容器中收缩。补充 aria-invalid，动画字符对读屏隐藏，减少动态效果偏好下不闪烁光标；原生清空或剪切也能清除该格。没有加入展示站依赖或真实短信验证服务。
