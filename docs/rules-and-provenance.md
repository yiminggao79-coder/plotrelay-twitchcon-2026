# 赛事与来源核验（2026-10-26）

[官方规则](https://twitchcon-codex.devpost.com/rules) · [官方FAQ/资源](https://twitchcon-codex.devpost.com/resources)

当前开放，截止 **2026-11-03 06:00北京时间**（11月2日14:00PST）。全线上，不到TwitchCon不影响现金奖。参赛者须满18岁且达到居住地成年年龄，并符合地区及利益冲突限制。中国大陆未在列举的排除地区中，仍需用户完成身份声明。作品须在10月23日起新建，用Codex并真实接Twitch。材料需英文、代码仓库（私库可给testing@devpost.com）、实际构建会话ID、少于3分钟公有YouTube视频；视频展示实际Twitch运行及Codex制作。当前未投稿。

现金奖：1万/6000/4000美元及2个2500美元，合计2.5万美元；评估创新、影响、实现与设计。无普遍参赛证书承诺。可保留Devpost项目/提交确认作为参赛凭证；获奖以正式公告及身份、贡献、税务等核验完成为准。获奖表格通常发送后10个工作日内返回。不能保证得奖或证书。

## 技术与开源来源

| 来源 | 许可/核验 | 实际复用与新增 |
|---|---|---|
| [Twitch Chat认证](https://dev.twitch.tv/docs/chat/authenticating/)和[EventSub事件](https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/) | 官方服务规则适用 | 按协议独立实现适配器，无整段样例代码复制 |
| [Twurple](https://github.com/twurple/twurple) | 仓库显示MIT | 评估过的开源备选；未复制或作为依赖 |
| Node.js内置HTTP/WebSocket/crypto/test | Node发行许可；不打包运行时 | 原生实现，不装框架或聊天SDK |
| Image Gen概念图 | 本会话生成 | 仅设计参考；没有复制第三方游戏/商标/素材 |

原创增量：章节导演流程、来源隔离的公平投票引擎、可回顾的故事历史、只读OBS显示、本地演练与可测试的Twitch接入。原始会话在README，未虚构旧项目改造历史。

## 难度与投入判断（估计，不是赛事事实）

只有5个获奖名额，作品需真实直播互动与清楚演示；有实现并不等于容易获奖。登记人数不是有效作品数，无法推算中奖概率。概念目前小而完整，创新区分还需在真实主播使用场景中证明。

预计用户操作20–40分钟（已有账号与顺畅授权情况下），包括身份核对、Twitch授权、实测、视频审核/上传及最终投稿；注册或网络受阻会延长。应用无需GPU或训练，仅Node和浏览器；不要求付费部署，Twitch/Codex账号可用性另计。
