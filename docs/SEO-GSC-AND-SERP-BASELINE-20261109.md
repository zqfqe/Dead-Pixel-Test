# DeadPixelTest SEO — Search Console / SERP 验收基线

**记录日期：2026-11-09。目标站点：** https://deadpixeltest.cc/  
**范围：** V1.2 400 行 Semrush 研究、15 个首期页、50 个当前 Sitemap URL。  
**状态口径：** 本文件严格区分「HTTP 可抓取」「搜索引擎实际收录」「排名/曝光/点击」「市场 SERP 竞争验证」，没有后台证据绝不填 0 或“通过”。

## 1. 已独立确认的公开技术状态

- 正式站点：`https://deadpixeltest.cc/`。
- 当前 `https://deadpixeltest.cc/sitemap.xml`：**50 条 URL**（公开页面及此前通过的代码/实站检查）。`https://deadpixeltest.cc/robots.txt` 公告此 Sitemap；计划页有自引用 canonical，生产环境不再发送 `noindex`。
- **不是 GSC 证据：** 可访问、收录允许、Sitemap 包含都不意味着 Google 已抓取/收录，亦不等于有自然搜索流量。
- 代码通过 `GitHub Actions` 自动化和生产 HTTP/SEO 检查，验收详情在 `docs/V1.2-ACCEPTANCE-20261109.md`。
- **尚无授权读取数据的 Search Console 账户连接**：资源所有权验证状态、Sitemap 在 GSC 的处理状态、Page Indexing 分类、Google-selected canonical、搜索曝光/点击/CTR/位置均为 **UNKNOWN**，不得写“已提交”或“0”。
- 若 GSC 已在用户 Google 账户配置，以上仅表示当前工作流没有读取权限；不能据此断言 Google 账户尚未验证资源。

## 2. 15 个首期核心页面：待 GSC 填报的监控表

| 组别 | 首期核心 URL | 首要检索意图 | 市场 | 重要性 | 当前搜索收录 |
|---|---|---|---|---|---|
| EN01 | `/` | dead pixel test | US | P0 | UNKNOWN |
| EN02 | `/laptop-screen-dead-pixel-test` | dead pixels on laptop screen | US | P0 | UNKNOWN |
| EN03 | `/dead-pixel-fixer` | laptop dead pixel repair / safety limits | US | P0 | UNKNOWN |
| EN04 | `/phone-screen-dead-pixel-test` | phone screen test | US | P1 | UNKNOWN |
| EN05 | `/what-is-a-dead-pixel` | what is a dead pixel | US | P1 | UNKNOWN |
| EN06 | `/dead-pixel-line-test` | dead line of pixels / monitor line | US | P1 | UNKNOWN |
| EN07 | `/image-retention-test` | lcd image persistence | US | P1 | UNKNOWN |
| EN08 | `/screen-resolution-test` | display resolution test | US | P2 | UNKNOWN |
| EN09 | `/screen-contrast-test` | contrast/grayscale; brightness check still HOLD | US | P2 | UNKNOWN |
| BR01 | `/pt-br` | teste de dead pixel | BR | P0 | UNKNOWN |
| BR02 | `/pt-br/pixel-morto-notebook` | pixel morto notebook | BR | P0 | UNKNOWN |
| BR03 | `/pt-br/pixel-morto-iphone` | pixel morto iphone | BR | P0 | UNKNOWN |
| BR04 | `/pt-br/reparar-pixel-preso` | pixel preso; static observation | BR | P1 | UNKNOWN |
| BR05 | `/pt-br/o-que-e-dead-pixel` | o que é dead pixel | BR | P1 | UNKNOWN |
| BR06 | `/pt-br/teste-de-cores` | teste de cores | BR | P1 | UNKNOWN |

首期每个 URL 的单独 `Indexed / Not indexed` 状态，应使用 GSC URL Inspection 的 **Google Index** 结果，不能通过 `site:` 查询数量推断；`robots.txt`、自引用 canonical、页面回 200 仅代表网站端可索引条件。

## 3. 4 个 HOLD_SERP 关键词：2026-11-09 公开搜索预核验

此处只记录公开引擎搜索的**意图线索，不是 Google 美国桌面/手机端、无个性化、指定日期 SERP 前 10 的逐条落地页核查**。原 V1.2 状态 `HOLD_SERP` 在完整检查前不升级。

| 关键词 | V1.2 美国 Semrush Volume / KD | 当前公开证据 | 暂定处理 |
|---|---|---|---|
| `dying pixels laptop` | 40,500 / 26 | 可找到围绕笔记本像素异常、症状及排查的解释页，例如 [TechUpdateLab](https://techupdatelab.com/dying-pixels-laptop/)；但检索结果不等于 40,500 真实/月需求或工具使用量。 | **HOLD_SERP；EN02 支持解释**。不新建同义页，不把该词当首页流量预测。 |
| `dead line of pixels` | 9,900 / 24 | 公开结果包括 [Screen Issues 的 dead pixel line 故障解释](https://www.screenissues.com/en/dead-pixel/line)，符合“整行/整列异常”而非“单个死点”。 | **HOLD_SERP；EN06 内容吻合**。增强故障鉴别，不承诺修复线路或硬件。 |
| `brightness check` | 170 / 14 | [Zpeedometer 亮度测试](https://zpeedometer.com/screen-brightness/)是近黑/近白视觉明暗检查，不能从浏览器测物理 nits。词义涵盖亮度控制、可视性与屏幕测试。 | **HOLD_SERP；不主攻 EN09**。有证据时优先评估 `/tests/brightness` 与 `/screen-contrast-test` 是否存在意图分工。 |
| `lcdtest` | 110 / 19 | [lcdtest 源代码仓库](https://github.com/Energoblock/lcdtest/)记录独立的 LCD 测试图案程序（SDL），具有具体软件名称/下载意图。 | **HOLD_SERP；暂不布局新页**。先确认前 10 是否有品牌导航/软件包需求。 |

注意：搜索工具返回的是不受我们控制的区域、语言、位置与个性化结果，因此无法以这批结果充当严格 US SERP top-10 验收。

## 4. Search Console 接入与真实观测

### 4.1 必须在有权 Google 账户中确认的事项

1. 打开 [Google Search Console](https://search.google.com/search-console/)，选择或建立 `deadpixeltest.cc` **域名属性**，通过 DNS TXT 验证（或者既有 URL-prefix 属性也可用于相应 URL 的检查）。验证步骤见 [Google 官方说明](https://support.google.com/webmasters/answer/9008080)。
2. 进入 **Sitemaps**，检查或提交 `https://deadpixeltest.cc/sitemap.xml`，记录 **Submitted / Last read / Status / Discovered pages**。Sitemap 已在 `robots.txt` 公告，但这不等于 GSC 面板中的“已提交”状态。
3. 在 **Page indexing** 中按 Sitemap 范围查看 `Indexed`、`Crawled - currently not indexed`、`Discovered - currently not indexed`、`Duplicate`、`Alternate canonical` 等分布；不要要求所有 50 页立即 100% 收录。官方：[页面索引报告](https://support.google.com/webmasters/answer/7440203?hl=en)。
4. 用 **URL Inspection** 逐个检查 15 个首期 URL：Google 最后抓取时间、`Page is indexed?`、Google 选定规范 URL 和移动抓取结果。仅在必要时对 P0 请求索引，不重复轰炸。官方：[重新抓取指南](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)。
5. 打开 **Performance → Search results**，选 **Web + last 28 days**，分别设置 **Country: United States / Brazil**。记录查询、页面、国家、设备维度的 **clicks / impressions / CTR / average position**；对新站可再看近 7 天作为辅助，不把 0 曝光推断为 noindex。官方：[高级筛选与比较](https://support.google.com/webmasters/answer/17011165?hl=en)。
6. 导出相应数据或连接有权限的 Google Search Console 读取服务，才可将下方的 UNKNOWN 替换为实际数值。截止日期、设备及国家过滤条件必须和报表一同记录。

### 4.2 记录格式与决策闸门

**文件：** `docs/seo-gsc-page-baseline.csv` 已列出 15 个首期 URL；`gsc_* ` 字段保持空白，避免虚构性能数据。

- **P0 收录被技术阻断**（响应错误、robots、页面 noindex、非预期 canonical）：优先修真实错误，重测后要求 Google 重新检索。按类别区分网站端与 Google 端原因。
- **P0/P1 有曝光但 CTR 偏低**：先看查询意图、标题/摘要匹配、排名段位，不凭一日数据改标题。
- **有曝光却位置较低**：比较查询着陆页、独立工具价值、竞争页面和内部链接；必要时优先补有用内容，避免生成近重复页面。
- **完全没有曝光**：先查是否收录与数据时间窗；不能无证据推断“关键词没搜索量”。
- **目标地区错配**：EN 主要用美国数据，pt-BR 主要用巴西数据；不同 Semrush 库的 KD/Volume 不可混算。
- **SEO 工作不等于结果保证**：技术 SEO、GSC 资源验证、Sitemap 提交、实际 Google 收录、搜索点击和广告收入分属不同事实状态。

**下一次依据 GSC 的决策所需最少材料：** GSC 的 Page indexing / Sitemaps 状态以及最近 28 天 Web 搜索的 `Pages` 和 `Queries` 数据（美国与巴西分别筛选）。不要在未授权或数据缺失时宣称已读取、已提交或已有自然搜索流量。
