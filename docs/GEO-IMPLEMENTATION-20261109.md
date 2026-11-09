# DeadPixelTest GEO（生成式搜索优化）实施与验收 — 2026-11-09

> **定义：** GEO 是让独立、有价值、可被抓取的页面内容更容易被搜索/AI 答案系统正确识别、理解和引用的内容工程；不是保证被 ChatGPT、Google AI Overviews 或 Copilot 引用的营销按钮。
>
> **V1.2 边界：** 仍然是原定的 **15 个英文/巴西葡语核心页面（英文 9、pt-BR 6）**，不因为 GEO 概念新增一批薄内容 URL，保留现有 50 条 Sitemap。此前 400 行 Semrush 研究、87 组目标候选、4 组 `HOLD_SERP` 的验证状态不变。GEO 不会取代关键词意图分析或 Search Console 数据。

## 本轮实际改动

1. **14 条现有语言/设备页面**：新建 `data/geoAnswers.ts`，每页有独立问题、直接结论、3 条用户操作/判读要点、能力限制及相关一手来源（适用时），由 `src/pages/[...slug].astro` 输出到**服务器生成的原始 HTML**。页面支持用户在禁用 JavaScript 时阅读关键答案。所有 pt-BR 卡片使用巴西葡语。
2. **英文主站首页**：在 `src/pages/index.astro` 增加独立「How can I test a screen for dead pixels online?」精简解答、颜色判读示例、不同故障的内部跳转、能力边界和 Dell 厂商说明。
3. **技术资料出处**：重点引用 Dell 对亮/暗子像素及制造商特定保修规则的解释、Samsung OLED 残影与面板护理、MDN 对 `Screen.width` 和 `devicePixelRatio` 的定义；在 `/about` 明确解释“浏览器显示”与“物理测量/厂商判定”的区别。外链仅支持对应技术事实，不能自动证明本站检测结果。
4. **结构化数据一致性**：首期着陆页现有 `WebPage`/`WebApplication` 与可见用途保持一致，并显式加入其 `inLanguage`；没有增加 `FAQPage` 富媒体资格声明、虚构评论评分、实际不能证明的维修效果、虚构机构资质或伪造更新时间。
5. **持续质量闸门**：`scripts/audit-astro-build.mjs` 检查 15 个核心页面可见的直接解答、去重问题、实用步骤、限制、语言与 JSON-LD 的实际语种。以前 SEO 的 Canonical/hreflang/noindex/Sitemap、链接完整性与浏览器测试保留原状。

## 15 页实际答案主题

| URL | 用户可直接读取的答案意图 | 限制要点 |
| --- | --- | --- |
| `/` | How can I test a screen for dead pixels online? | 人工观察，非自动诊断 |
| `/laptop-screen-dead-pixel-test` | How do I check a laptop screen for dead pixels? | 内外屏对比不能独立判断部件 |
| `/dead-pixel-fixer` | Can a website fix a dead or stuck pixel? | 静态观察工具，不能保证修复 |
| `/phone-screen-dead-pixel-test` | How can I test my iPhone or Android screen? | 截图不能可靠证明物理坏点 |
| `/what-is-a-dead-pixel` | Difference between dead and stuck pixels? | 症状与硬件原因不能等同 |
| `/dead-pixel-line-test` | Is a whole screen line the same as a pixel? | 无法鉴定屏幕/线缆/输入故障 |
| `/image-retention-test` | Temporary retention vs OLED burn-in? | 不能恢复永久损耗或远程确诊 |
| `/screen-resolution-test` | Can a website read native resolution? | CSS 像素、DPR 不等于原生分辨率 |
| `/screen-contrast-test` | Can a webpage measure contrast ratio? | 无法测 nits、物理对比度 |
| `/pt-br` | Como testar pixels mortos online? | Inspeção visual, sem laudo |
| `/pt-br/pixel-morto-notebook` | Como verificar um pixel morto no notebook? | Não identifica componente defeituoso |
| `/pt-br/pixel-morto-iphone` | É possível testar pixel morto no iPhone? | Captura digital não certifica defeito |
| `/pt-br/reparar-pixel-preso` | Um pixel preso pode ser reparado online? | Não há reparo garantido |
| `/pt-br/o-que-e-dead-pixel` | O que é dead pixel e pixel preso? | Diferenciação observacional |
| `/pt-br/teste-de-cores` | Teste de cores mede precisão do monitor? | Medição colorimétrica exige instrumento |

## 主要外部规范和事实来源

- [Google Search Central — AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)：Google 表示没有专门 GEO 结构化数据或机器可读文件的额外要求；AI Overviews 和 AI Mode 的链接需满足正常搜索的索引与摘要条件。可抓取链接、正文文本、可靠内容、结构化数据一致等基础 SEO 仍然适用。
- [Bing Webmaster — AI Performance](https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c)：可查看部分微软 AI 搜索体验中的引用页面、引用次数和 grounding queries。数据可能聚合、抽样，不代表点击、全量覆盖或排名。
- [Dell — Display Pixel Guidelines](https://www.dell.com/support/kbdoc/en-us/000126004/dell-display-pixel-guidelines)：亮/暗像素及厂商相关维修/保修说明，不代表其他品牌政策。
- [Samsung — OLED image retention / burn-in](https://www.samsung.com/sg/support/displays/how-to-troubleshoot-burnin-or-image-retention-on-your-samsung-oled-monitor/)：特定 OLED 显示设备的面板护理与维护建议。
- [MDN — Screen.width](https://developer.mozilla.org/en-US/docs/Web/API/Screen/width) 和 [MDN — devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio)：浏览器 CSS 宽度与像素缩放比的技术定义。

## 尚未完成的外部 GEO 验证

| 优先级 | 事项 | 证据状态 |
| --- | --- | --- |
| P0 | Google Search Console 资源验证/索引/实际曝光及 AI Overview 相关 Web 流量 | **UNKNOWN（无可用授权账户数据）** |
| P0 | Bing Webmaster Tools 站点验证、AI Performance 中总引用、被引用页面、grounding queries | **UNKNOWN（无可用授权账户数据）** |
| P1 | 对 15 页重点问题进行区域/语言限定的 AI 搜索手工提示与引用 URL 验证（日期、搜索位置、提示词要留档） | **未实测** |
| P1 | 浏览器、移动设备与不同显示器上的实际工具判读可靠性 | **仍需真实设备人工验收** |
| P2 | 可信外部链接、真实作者/机构信息及长期内容维护 | **持续工作；不得编造** |

Google 明确说 **不必为了 AI Overviews 额外创建 `llms.txt` 等特殊机器可读文件或特殊 Schema**。因此这轮不发布宣传“AI 优化”的伪技术文件，也不会为了采集机器人而放开敏感数据；现有 `robots.txt` 允许公开页面抓取，但具体抓取与引用由对方决定。

**最终判断：** 此文档仅证明“GEO 内容与站点代码实施、质量门槛”完成；要宣称被 AI 引用、增加曝光或带来新客户，仍需对应平台可验证的数据。
