/*
 * 02 AI 创意广告短片：创意思路页面文案。
 * 后续主要修改这个文件即可：
 * - thinking：首屏标题、说明、关键词
 * - strategy：四个创意策略点
 * - workflow：制作流程时间线
 */
window.WORK02_CONTENT = {
  thinking: {
    kicker: "CREATIVE THINKING",
    title: "创意思路与制作流程",
    subtitle: "AI CREATIVE ADVERTISING",
    intro: "从项目需求出发，通过差异化创意、用户情绪调动、画面统一性和视觉吸引力，完成从方案构思到 AI 生成、配音、剪辑落地的完整广告短片制作流程。",
    tags: [
      "DIFFERENTIATION",
      "EMOTION HOOK",
      "VISUAL UNITY",
      "AIGC WORKFLOW"
    ]
  },

  strategy: {
    label: "CREATIVE STRATEGY",
    items: [
      {
        number: "01",
        title: "寻找差异化",
        body: "分析同类游戏广告素材的常见表达方式，寻找更容易被用户注意到的视觉切入点，避免画面同质化。"
      },
      {
        number: "02",
        title: "调动用户情绪",
        body: "通过冲突、爽点、悬念、反馈等方式制造观看动机，让用户在短时间内产生兴趣。"
      },
      {
        number: "03",
        title: "画面统一性",
        body: "统一角色、场景、色调、镜头节奏和广告氛围，避免 AI 生成画面之间风格割裂。"
      },
      {
        number: "04",
        title: "视觉吸引力",
        body: "强化开头 3 秒的视觉冲击力，通过高对比画面、动态镜头、夸张表情或强事件点提升停留率。"
      }
    ]
  },

  workflow: {
    kicker: "WORKFLOW",
    title: "从创意方案到项目落地",
    intro: "把广告创意拆解为可执行流程：先确定方向，再生成素材，补充声音情绪，最后完成剪辑包装与输出。",
    steps: [
      {
        number: "01",
        title: "创意方案",
        tool: "ChatGPT / Claude",
        body: "用于创意方向生成、脚本拆解、分镜规划、卖点提炼。"
      },
      {
        number: "02",
        title: "AI生成与后期处理",
        tool: "Gemini / Nano Banana / Seedance",
        body: "用于图像生成、角色设定、场景生成、镜头补充和视频片段生成。"
      },
      {
        number: "03",
        title: "配音与配乐",
        tool: "Suno / SongGenerator / ElevenLabs",
        body: "用于生成视频配音、背景音乐、情绪音效和节奏辅助。"
      },
      {
        number: "04",
        title: "剪辑合成",
        tool: "剪映 / AE",
        body: "用于素材整合、节奏剪辑、文案包装、转场处理和最终输出。"
      }
    ]
  }
};
