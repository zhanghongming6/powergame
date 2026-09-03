# 任务规划：《冰火旅人》v6 · 内容大扩充（怪物/boss/装备/UI/比例）

## 历史（v1–v5 一句话版，详档见 progress.md 会话①–⑯）
- v1 战斗演示 → v2 剧情地图 → v3 开放世界（备份 冰火旅人_v3_backup.html）
- v4 全面改版：7章主线/5图/16支线/招募曲线/Kenney UI/LPC+MF 建模/演出/存档/通关率 ✅（Phase A–D 全验）
- v5 真3D 重写：Three.js r128，assets3d/adapter3d.js 唯一耦合；D0–D3 ✅（探索+战斗 3D、点击流、尺寸层级 BS=2.4；回归全绿 2026-09-03）；D4 头像 3D 化并入本计划 E4，D5 清理并入 E5

## 用户反馈 → v6 对策映射
| # | 反馈 | 对策 |
|---|------|------|
| 1 | 怪物类型太少（仅7种） | 24 基础模型 ×6 元素 ×4 阶级 = **576 图鉴条目**（程序化变种，用户已选定此路线） |
| 2 | 缺 boss 级别 | **命名 BOSS 表 36+**（章节/地域守门）+ 野外精英/首领阶 |
| 3 | 武器装备系统缺失 | 3 槽位（武器/护甲/饰品）+ **70+ 装备**（含 10+ 原著命名橙装）+ 掉落/锻造强化/背包面板 |
| 4 | UI 建模丑 | 剩余裸 CSS 面板全 Kenney 化 + 头像 3D 渲染 + 图鉴/装备新面板 Kenney 原生 |
| 5 | 人物建筑有大有小 | 比例约定表 + 探索/战斗 capH·sy 全审计 + 截图目检 |

## 现状审计（2026-09-03 · 行号基线 4498 行）
- FOES L826–841 仅 7 key（wight/walker/nk/spider/giant/wolf/bandit）；FOE_TIERS L1071 按章分档；makeUnit L1079–84 缩放
- 波次 6 数组（WALL/GIANT/CRYPT/ESCORT/DESERTER/FINAL）；随机遇敌 startEncounter L3763（1+40%第二只）；MAPS.mobs 硬编码 L3159/3168
- ITEMS_DEF L845–850 仅 4 物；G.items(战斗)/G.bag(材料)；**无任何装备槽**；victory L1764–87 仅掉 meat(L1784)
- 图鉴=beastPanel L1893–920 仅 3 可驯；G.seen L1421
- 面板多已 Kenney；裸 CSS：banner/turnBadge/muteBtn/recruitOv/loadOv/partyBar 背景
- 伤害：physicalAttack L1612(1626 公式)、hitEnemy L1632–65、rollEnemyDmg L1716、hitPlayer L1718
- MODELS3D：chars 7（jon/arya/dany/bri/npc1/npc2/king）· mobs 7（wolf/giant/spider/wight/walker/dragon/dragonEvo）· props 50；_bake3d.js 读 _tmp3d/ GLB
- 3D：bEnsure/bModel(adapter L463–486) 按 u.key 查 MOB3D；place() capH（hero 1.2/npc 1.12）；tint 仅用于建筑实例

---

## Phase E0：基础模型扩充（资产）
目标：mobs 7→24。新增 17 个 CC0 GLB（Quaternius/KayKit/Kenney，优先同风格低模）：
候选清单（按包可得性微调）：bat 蝙蝠 · snake 蛇 · slime 史莱姆 · goblin 地精 · skeleton 骷髅兵 · bear 熊 · boar 野猪 · mammoth 猛犸 · golemIce 冰魔像 · elemFire 火元素 · wraith 怨灵 · troll 巨魔 · knightBlack 黑骑士 · archer 弓手(人形) · shaman 萨满(人形) · direwolf 冰原狼 · dragonWhelp 幼龙
- 流程：下载 GLB → _tmp3d/ → _bake3d.js（Walk/Idle/Attack 裁剪保留）→ 追加写 models_mobs.js（或新 models_mobs2.js + html 增 script 标签）
- 验证：models_debug.html 陈列目检 + probe3d 扩 KEYS：每新 key baked minY≈0 且尺寸入 findings 尺寸表

## Phase E1：数据 schema 与图鉴生成（主文件）
- SPECIES(24)：{sp, cn, model, base{hp,atk,spd,def,shield}, weak[], tame?, size}
  - 旧 7 种全部并入（wight/walker/wolf/spider/giant/bandit/nk→species 'nk' 仅作 boss 基底）
- ELEMS(6)：{id:'',frost,fire,poison,shadow,holy · cn 无/冰/火/毒/影/圣 · tint(0x…) · weak 轮转表 · statMod{hp,atk}}
- TIERS(4)：normal{×1,exp×1,scale×1}/elite{×2.2,exp×2.5,scale×1.12,光环}/champ{×4,exp×5,scale×1.22}/boss{×8,exp×12,scale×1.35,专属前缀}
- 启动生成（seeded RNG 确定化）：key=`${sp}.${elem}.${tier}`；名=元素前缀+种名+阶级后缀（如「霜怨·异鬼·首领」）；数值=base×elem×tier×(1±.08 抖动)；weak 按轮转
- BOSSNAMED(36+)：{id,name(原著感),sp,elem,mods,drop(橙装key),gate(chapter/map/poi)}；例：异鬼·寒王(walker/frost)、巨魔·裂颅者、猛犸·长牙先祖、黑骑士·暮谷亡将、幼龙·灰翼……
- 引擎兼容：makeUnit/foeTier 不动——剧情波次仍用旧基 key（FOE_TIERS 照旧）；变种 key 自带档位，makeUnit 内识别 `.` key 跳过 FOE_TIERS 防双重缩放
- 3D 表现（adapter）：bModel 改按 key 前缀查 SPECIES.model；bEnsure 增 elemTint（材质 color 乘 tint，复用 clone 材质通路）+ tier 光环（boss/champ 脚底 RingGeometry 发光）+ scale×tier
- 验证：harness 断言 Object.keys(FOES).length≥500、named boss≥36；新 shot 模式 var：元素染色+光环截图目检

## Phase E2：遇敌与 boss 接入
- MAPS.mobs → 池化：{sp[],weights,elemBias(北境frost/君临fire/狼林poison/龙石岛shadow),tierRoll(elite12%/champ4%)}；startEncounter 改抽池；区域章节门槛
- 世界 BOSS：每图 1–2 守门 POI（interact → BOSSNAMED 按章节取未灭者）；胜 → flag+橙装+图鉴；败复活回城
- 剧情波次微调：DESERTER/ESCORT 引入 elite 视觉（tier 后缀 key），FINAL 保持原著不魔改
- 驯服：tame 按 species 判定（元素变体皆可驯，TAMEABLE 扩到 species 级）
- 验证：smoke 增抽 20 次遇敌全合法 key；boss POI 战胜+掉橙装断言

## Phase E3：武器装备系统
- 槽位：p.eq={wpn,arm,acc}；effAtk/effDef/effMaxhp 汇总函数，接入 physicalAttack(L1626 用 effAtk)、hitPlayer(def)、入队/升级时重算 maxhp
- EQUIP_DEF(70+)：{key,n,slot,rar(白/蓝/紫/橙),atk,def,hp,crit,spd,fx?,desc}
  - 橙装 12（原著命名）：长爪/缝衣针/寒冰/守誓者/寡妇之嚎/光明使者/龙克锤/夜王碎片披风/学士链/鱼梁木弓/熊岛战斧/多恩毒刃
  - fx 池：lifesteal/weakBonus/critUp/expUp/tameUp/guardRetaliate/shieldOnEntry/spdUp
- 掉落引擎（victory 改）：每敌 roll——材料(保留)+装备概率按 tier(8/25/60/100%)；rar 权重随 tier；boss 必掉命名橙；ribbon+SFX 播报
- 锻造：铁匠(porther/mikken) 对话扩展：强化 +1..+5（耗 ore×阶，失败不掉级）；橙装不可强化
- 面板 #equipPanel（Kenney 9-slice，键 I）：左队伍列表 → 右 3 槽+属性对比；背包装备网格 rar 色框；点击装备/卸下
- 存档：save 增 eq/bagEq；版本字段 v:2，旧档迁移缺省空槽
- 验证：新 harness e3 模式：注入掉落→装备→effAtk 生效→存档读档保持；c2 增 rest_eq 断言

## Phase E4：UI 美化 + 头像 3D（吸收 D4）
- 裸 CSS Kenney 化：banner/turnBadge/recruitOv/loadOv/partyBar 背景/muteBtn（border-image assets/ui/*）
- 头像：A3D.renderPortrait(model) 离屏 64×64（头部 bbox 特写正交、透明底）缓存；partyBar/dlg/recruitOv/equipPanel 统一用；!A3D 回退 LPC 裁切
- 图鉴 #dexPanel（键 B）：种卡网格（元素色点+阶级星+名/???）；筛选（元素/阶级/可驯/boss）；详情（数值/弱点/掉落/出没地）；计数 seen/killed/tamed
- 验证：截图 title/dlg/equip/dex/b4_ui 目检；clix 回归不回归（partyBar 指针透传逻辑不破）

## Phase E5：比例审计 + 回归 + 文档 + 清理（吸收 D5）
- 比例约定表入 findings：人=1.2u；建筑 sy 含义（墙 2.9≈2.4×人）；树/塔/门逐级；审计 place() capH 与 instCells sy，修离群
- 回归：c1/c2/clix/smoke/camp×3 + 新 e1/e2/e3 模式全绿；通关率 ≥60%
- 文档：游戏说明文档（装备/图鉴/boss 章）、全流程攻略（boss 表+橙装表）同步
- 清理：2D 回退代码保留（RENDER_MODE='2d' 兜底），仅删无引用旧美术文件；临时脚本清
- 验证 + progress/findings 收工更新

## 验收标准（v6）
1. 图鉴条目 ≥500、命名 boss ≥36，全部可战/可见/可驯规则自洽
2. 装备 ≥70（橙 ≥10）；掉落/强化/装备/存档全链路通
3. 面板全 Kenney；头像 3D；图鉴/装备面板可用
4. 比例表合规，探索+战斗截图目检过
5. 回归全绿 + 通关率 ≥60%

## 范围纪律（不做）
- 战斗内核（破防/弱点/增幅/五指令）不改；驯服机制不改；主线剧情不改
- 不联机/不移动端/不内购式数值墙

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| c2 ch1/rest_obj flake（虚拟时间预算 60s 被 waitf 空转吃 48s） | v6 规划前 | 先等击杀目标文本再注入 kills（_chK 快照约束：注入须晚于目标激活）；11/11 ×2 |
| Explore 子代理 400 model Qwen3.8-max 不存在 | 1 | 显式 model=sonnet 重试成功 |
