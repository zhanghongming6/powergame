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

## Phase E0：基础模型扩充（资产）✅ 2026-09-03 完成
目标：mobs 7→25。实际新增 18 个 CC0 GLB（Quaternius 16 + KayKit 2）：bat/snake/slime/goblin/skeleton/zombie/orc/orcEnemy(巨魔)/demon(火元素)/blueDemon/golemIce/golemEvo/shaman/dragonWhelp/direwolf(Husky)/wraith(Ghost)/knightBlack/rogue（bear/mammoth/troll 无 CC0 动画源，弃）
- 流程：_dl3d.js 下载 GLB → _tmp3d/ → _bake3d.js（Walk/Idle/Attack 裁剪保留）→ models_mobs.js（2.6→14.4MB）
- 验证：probe3d 37 key 全绿（无 PARSE_FAIL，baked minY=0）；尺寸表入 findings；models_debug 目检随 E1 展示层一并复查

## Phase E1：数据 schema 与图鉴生成（主文件）✅ 2026-09-03 完成
- SPECIES(24)：{sp, cn, model, base{hp,atk,spd,def,shield}, weak[], tame?, size}
  - 旧 7 种全部并入（wight/walker/wolf/spider/giant/bandit/nk→species 'nk' 仅作 boss 基底）
- ELEMS(6)：{id:'',frost,fire,poison,shadow,holy · cn 无/冰/火/毒/影/圣 · tint(0x…) · weak 轮转表 · statMod{hp,atk}}
- TIERS(4)：normal{×1,exp×1,scale×1}/elite{×2.2,exp×2.5,scale×1.12,光环}/champ{×4,exp×5,scale×1.22}/boss{×8,exp×12,scale×1.35,专属前缀}
- 启动生成（seeded RNG 确定化）：key=`${sp}.${elem}.${tier}`；名=元素前缀+种名+阶级后缀（如「霜怨·异鬼·首领」）；数值=base×elem×tier×(1±.08 抖动)；weak 按轮转
- BOSSNAMED(36+)：{id,name(原著感),sp,elem,mods,drop(橙装key),gate(chapter/map/poi)}；例：异鬼·寒王(walker/frost)、巨魔·裂颅者、猛犸·长牙先祖、黑骑士·暮谷亡将、幼龙·灰翼……
- 引擎兼容：makeUnit/foeTier 不动——剧情波次仍用旧基 key（FOE_TIERS 照旧）；变种 key 自带档位，makeUnit 内识别 `.` key 跳过 FOE_TIERS 防双重缩放
- 3D 表现（adapter）：bModel 改按 key 前缀查 SPECIES.model；bEnsure 增 elemTint（材质 color 乘 tint，复用 clone 材质通路）+ tier 光环（boss/champ 脚底 RingGeometry 发光）+ scale×tier
- 验证：harness 断言 Object.keys(FOES).length≥500、named boss≥36；新 shot 模式 var：元素染色+光环截图目检
- 实测：FOES 619 key（基7+变种576+命名36）；e1 10/10 PASS；var/varz 目检过；回归 SMOKE/c1/c2/clix/camp 全绿
- 实现细节偏差（优于计划处）：dot-key 免章节档用 vt 标志（命名 boss 无点也免档）；2D 兜底 VARSPR 模板；boss/champ 光环=RingGeometry（色=元素tint）

## Phase E2：遇敌与 boss 接入 ✅ 2026-09-03 完成
- MAPS.mobs → 池化：{sp[],weights,elemBias(北境frost/君临fire/狼林poison/龙石岛shadow),tierRoll(elite12%/champ4%)}；**roll-at-spawn**（buildMobs/respawn 调 poolRoll，偏差见下）；区域章节门槛（champ ch≥4/elite ch≥2）
- 世界 BOSS：7 个守门 POI（north×2/wf/ww/kl/ds 各1）；interact→evBossPoi→bossCand（bossZone north 按 region 拆 wall/north；gate.ch≤章节+未旗标，按 ch 升序取首）；胜→flag+G.bossDrops.push(drop)+图鉴 seen；败→50% 复活回 TOWNS_C[0]
- 剧情波次微调：DESERTER(w1 2×fire.elite / w2 champ+2×elite)/ESCORT(3×poison.elite) 引入 elite 视觉，FINAL 不动
- 驯服：E1 已种级（tameSp），池化后自然生效
- 实测：e2 harness 13/13 PASS（roll 合法性/章节门槛/候选序/旗标/墙区拆分/7 POI 挂载/胜战 flag+drop+seen+scene 恢复/四图 buildMobs）；bpoi 目检（骨柱红带+浮空「守门者」标签）、wmob 目检（雪原池化狼 3D）
- 回归全绿：SMOKE1-4+E2 链、c1 19/19、c2 11/11、clix 13/13、camp ×3 = 3/3 WIN（100%≥60%）
- 实现细节偏差：①池抽取放在 spawn（buildMobs/respawn）而非 startEncounter——遇敌直接拿现成 mob key，respawn 也走同一池；②boss 败北不走 defeat()（会进 end 场景），改就地复活 50%+回城，状态契约对齐 enterExplore（partyBar/worldHud/scene/cam）

## Phase E3：武器装备系统 ✅ 2026-09-03 完成
- 槽位 p.eq={wpn,arm,acc}；effAtk/effDef/effMaxhp/effCrit/hasFx 接入伤害/受击/暴击/经验/吸血；basemaxhp 不变量（maxhp=basemaxhp+eqHp）
- EQUIP_DEF 72（20 模板×3 rar + 橙 12 原著命名）；fx 池收为 3（critUp+6%/expUp×1.25/lifesteal 吸血，优于计划的 8 种空挂）
- 掉落：equipDropRoll 按 tier 8/25/60/100%（rar 权重随 tier，boss 池无白无橙）；命名 boss 必掉 e.drop；击杀点入 battleDrops→victory 收 bagEq+ribbon 播报
- 锻造：forgeUp +1..+5（+10%/级，成功率 1/.9/.75/.6/.45，耗 ore=lv+1，失败不掉级，橙装拒绝）；forgeOrange（bossDrops 材料 1+ore 2→橙装入包）；铁匠 mikken/porther 对话入口
- #equipPanel（I 键，队伍 chips+3 槽+属性对比+背包 rar 色框）/#forgeOv 全 Kenney；RARCOL 白蓝紫橙
- 存档 v:2（bagEq/up/players.eq/basemaxhp），旧档迁移（basemaxhp=maxhp、eq 缺省空槽）
- harness：e3 20/20 PASS + eqp/fgv 目检 ✅；c2 增 rest_eq → 12/12；回归 SMOKE1-4+E2 全绿、c1 19/19、clix 13/13、camp ×3=3/3 WIN

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
| e2 cand_flagged FAIL（roll 段遗留 G.chapter=7 致 ch6 boss 仍候选） | 1 | D 段起始重置 `G.chapter=1;G.exp.region=REG.north` → 13/13 |
| **zoom3x() 在 explore 场景挂死 Chrome**（swiftshader+虚拟时间下 spawnSync ETIMEDOUT 420s，残留进程） | E2 bpoi | 不在探索场景用 zoom3x；改拍原图后用 $TEMP/bfshot/crop.ps1 本地裁切（powershell -ExecutionPolicy Bypass -File crop.ps1 src x y w h dst） |
