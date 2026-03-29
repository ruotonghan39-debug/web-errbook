(() => {
  const STORAGE_KEY = "web_errbook_demo_v1";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const statusLabel = {
    DRAFT: "未完善",
    READY_FOR_TEACHER: "待老师讲解",
    EXPLAINED: "已讲解待复习",
    REVIEW_PENDING: "待学生复习",
    REVIEWED: "已完成复习",
    MASTERY_CONFIRMED: "掌握确认",
    PRACTICE_PENDING: "待再练强化",
    ARCHIVED: "已完全掌握",
    DISABLED: "异常",
  };

  const statusPillClass = {
    DRAFT: "pill-DRAFT",
    READY_FOR_TEACHER: "pill-READY_FOR_TEACHER",
    EXPLAINED: "pill-EXPLAINED",
    REVIEW_PENDING: "pill-REVIEW_PENDING",
    REVIEWED: "pill-REVIEWED",
    MASTERY_CONFIRMED: "pill-MASTERY_CONFIRMED",
    PRACTICE_PENDING: "pill-PRACTICE_PENDING",
    ARCHIVED: "pill-ARCHIVED",
    DISABLED: "pill-DISABLED",
  };

  // 智能再练：静态题库示例（MVP）
  const practicePool = [
    {
      id: "p1",
      subject: "数学",
      knowledgePoints: ["一元二次方程", "判别式"],
      errorTypes: ["计算错误"],
      prompt: "练习1：已知 x^2 - 4x + 4 = 0，求x。",
      correctAnswer: "x=2",
    },
    {
      id: "p2",
      subject: "数学",
      knowledgePoints: ["一元二次方程", "求根公式"],
      errorTypes: ["计算错误", "粗心"],
      prompt: "练习2：用求根公式解方程 x^2 + 5x + 6 = 0。",
      correctAnswer: "x=-2或-3",
    },
    {
      id: "p3",
      subject: "数学",
      knowledgePoints: ["一元二次方程", "判别式"],
      errorTypes: ["概念不清"],
      prompt: "练习3：判断方程 x^2 - 2x + 2 = 0 的根的情况（有无实数根）。",
      correctAnswer: "无实数根",
    },
    {
      id: "p4",
      subject: "英语",
      knowledgePoints: ["语法", "时态"],
      errorTypes: ["审题错误", "粗心"],
      prompt: "练习4：Yesterday, he ____ (go) to school on foot.",
      correctAnswer: "went",
    },
    {
      id: "p5",
      subject: "数学",
      knowledgePoints: ["函数", "图像与性质"],
      errorTypes: ["审题错误", "概念不清"],
      prompt: "练习5：关于函数 y=ax+b，若 a>0 且 b<0，下列说法正确的是？",
      correctAnswer: "图像上升且y轴截距为负",
    },
    {
      id: "p6",
      subject: "物理",
      knowledgePoints: ["力学", "受力分析"],
      errorTypes: ["概念不清", "计算错误"],
      prompt: "练习6：在水平面上匀速滑动，摩擦力大小与什么相等？",
      correctAnswer: "与拉力大小相等",
    },
  ];

  const initialState = {
    version: 3,
    role: "student", // student | teacher
    panel: "review", // review | practice | export
    activeWrongQuestionId: null,
    wrongQuestions: [],
    lastUpdatedAt: Date.now(),
    filter: {
      status: "ALL",
      subject: "ALL",
      year: "ALL"
    },
    searchKeyword: "",
  };

  function now() {
    return Date.now();
  }

  function uid(prefix) {
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
  }

  function safeJsonParse(s) {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  }

  function normalizeAnswer(s) {
    if (s === undefined || s === null) return "";
    return String(s)
      .trim()
      .replace(/\s+/g, "")
      .replace(/，/g, ",")
      .toLowerCase();
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatTime(ts) {
    if (!ts) return "-";
    const d = new Date(ts);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function parseKnowledgePoints(input) {
    return String(input || "")
      .split(/[,，\/\n]/g)
      .map((s) => s.trim())
      .filter(Boolean);
  }



  function seedDemoData() {
    const t0 = now() - 1000 * 60 * 60 * 24 * 3;
    const t1 = now() - 1000 * 60 * 60 * 24 * 2;
    const t2 = now() - 1000 * 60 * 60 * 24;
    const t3 = now() - 1000 * 60 * 30;
    return {
      ...initialState,
      role: "student",
      panel: "review",
      activeWrongQuestionId: "w_q4",
      lastUpdatedAt: now(),
      wrongQuestions: [
        {
          id: "w_q1",
          subject: "数学",
          knowledge_points: ["一元二次方程", "判别式"],
          question_content: "已知 x^2 - 5x + 6 = 0，求x。",
          student_answer: "x=1或4",
          correct_answer: "x=2或3",
          error_type: "计算错误",
          source: "作业",
          status: "EXPLAINED",
          mastery_level: 0,
          created_at: t0,
          updated_at: t0,
          media: { questionImageDataUrl: null },
          annotations: [
            {
              id: "ann_auto_1",
              teacher_id: "t_demo",
              annotation_type: "text",
              text: "错因：计算过程中符号/系数代入有误。先把方程化为标准形式，再认真计算判别式。",
              steps:
                "1) 写出 a,b,c（a=1, b=-5, c=6）\n2) 计算判别式 Δ=b^2-4ac=25-24=1\n3) 代入公式 x=(-b±√Δ)/(2a) 得 x=2或3\n4) 检验代回原式",
              created_at: t1,
            },
          ],
          reviewSessions: [],
          practiceRecords: [],
        },
        {
          id: "w_q2",
          subject: "数学",
          knowledge_points: ["一元二次方程", "求根公式"],
          question_content: "解方程：x^2 + 5x + 6 = 0。",
          student_answer: "x=-1或-6",
          correct_answer: "x=-2或-3",
          error_type: "粗心",
          source: "考试",
          status: "EXPLAINED",
          mastery_level: 1,
          created_at: t1,
          updated_at: t1,
          media: { questionImageDataUrl: null },
          annotations: [
            {
              id: "ann1",
              teacher_id: "t_demo",
              annotation_type: "text",
              text: "这里使用求根公式，注意符号与判别式计算。",
              steps: "1) 写出a,b,c\n2) 计算Δ\n3) 代入求根公式并化简",
              created_at: t1 + 1000 * 60 * 4,
            },
          ],
          reviewSessions: [],
          practiceRecords: [],
        },
        {
          id: "w_q3",
          subject: "数学",
          knowledge_points: ["函数", "二次函数"],
          question_content: "求函数 y = x^2 - 4x + 3 的最小值。",
          student_answer: "0",
          correct_answer: "-1",
          error_type: "计算错误",
          source: "作业",
          status: "PRACTICE_PENDING",
          mastery_level: 2,
          created_at: t2,
          updated_at: t2,
          media: { questionImageDataUrl: null },
          annotations: [
            {
              id: "ann2",
              teacher_id: "t_demo",
              annotation_type: "text",
              text: "二次函数求最小值可以用配方法或公式法。配方后为 y = (x-2)^2 - 1，所以最小值为-1。",
              steps: "1) 配方：y = x^2 - 4x + 4 - 1 = (x-2)^2 - 1\n2) 当x=2时，y取得最小值-1",
              created_at: t2 + 1000 * 60 * 2,
            },
          ],
          reviewSessions: [
            {
              id: "rev2",
              student_id: "s_demo",
              mode: "hidden_answer",
              student_solution: "0",
              system_judgement: false,
              confidence_rating: 3,
              mastery_decision: "not_mastered",
              created_at: t2 + 1000 * 60 * 5,
            },
          ],
          practiceRecords: [],
        },
        {
          id: "w_q4",
          subject: "英语",
          knowledge_points: ["语法", "时态"],
          question_content: "Yesterday, he ____ (go) to school on foot.",
          student_answer: "go",
          correct_answer: "went",
          error_type: "审题错误",
          source: "作业",
          status: "ARCHIVED",
          mastery_level: 2,
          created_at: t3,
          updated_at: t3,
          media: { questionImageDataUrl: null },
          annotations: [],
          reviewSessions: [
            {
              id: "rev1",
              student_id: "s_demo",
              mode: "hidden_answer",
              student_solution: "go",
              system_judgement: false,
              confidence_rating: 2,
              mastery_decision: "not_mastered",
              created_at: t3,
            },
          ],
          practiceRecords: [{ id: "pr1", practice_pool_id: "p4", student_answer: "went", is_correct: true }],
        },
        {
          id: "w_q5",
          subject: "英语",
          knowledge_points: ["词汇", "固定搭配"],
          question_content: "She is good ____ playing the piano.",
          student_answer: "in",
          correct_answer: "at",
          error_type: "概念不清",
          source: "考试",
          status: "EXPLAINED",
          mastery_level: 0,
          created_at: t2 - 1000 * 60 * 60,
          updated_at: t2 - 1000 * 60 * 60,
          media: { questionImageDataUrl: null },
          annotations: [
            {
              id: "ann4",
              teacher_id: "t_demo",
              annotation_type: "text",
              text: "固定搭配：be good at doing sth. 表示擅长做某事。",
              steps: "1) 记住固定搭配 be good at\n2) at 后面接动名词形式",
              created_at: t2 - 1000 * 60 * 50,
            },
          ],
          reviewSessions: [],
          practiceRecords: [],
        },
        {
          id: "w_q6",
          subject: "物理",
          knowledge_points: ["力学", "受力分析"],
          question_content: "在水平面上匀速滑动，摩擦力大小与拉力大小相等。请问摩擦力大小应与什么相等？",
          student_answer: "与法向力相等",
          correct_answer: "与拉力大小相等",
          error_type: "概念不清",
          source: "考试",
          status: "REVIEW_PENDING",
          mastery_level: 0,
          created_at: t2 - 1000 * 60 * 12,
          updated_at: t2 - 1000 * 60 * 12,
          media: { questionImageDataUrl: null },
          annotations: [
            {
              id: "ann3",
              teacher_id: "t_demo",
              annotation_type: "text",
              text: "匀速意味着合力为0。水平方向：摩擦力与拉力大小相等、方向相反。",
              steps: "1) 判断运动状态（匀速）\n2) 合力为0\n3) 受力分析：水平方向摩擦力=拉力",
              created_at: t2 - 1000 * 60 * 10,
            },
          ],
          reviewSessions: [],
          practiceRecords: [],
        },
        {
          id: "w_q7",
          subject: "物理",
          knowledge_points: ["电学", "欧姆定律"],
          question_content: "电阻为10Ω的导体，通过的电流为2A，求导体两端的电压。",
          student_answer: "5V",
          correct_answer: "20V",
          error_type: "计算错误",
          source: "作业",
          status: "EXPLAINED",
          mastery_level: 1,
          created_at: t1 - 1000 * 60 * 30,
          updated_at: t1 - 1000 * 60 * 30,
          media: { questionImageDataUrl: null },
          annotations: [
            {
              id: "ann5",
              teacher_id: "t_demo",
              annotation_type: "text",
              text: "根据欧姆定律 U=IR，代入数值计算：U=2A×10Ω=20V。",
              steps: "1) 写出欧姆定律公式 U=IR\n2) 代入数值：I=2A, R=10Ω\n3) 计算：U=2×10=20V",
              created_at: t1 - 1000 * 60 * 25,
            },
          ],
          reviewSessions: [],
          practiceRecords: [],
        },
      ],
    };
  }

  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedDemoData();
    const parsed = safeJsonParse(raw);
    if (!parsed || parsed.version !== initialState.version) return seedDemoData();
    return parsed;
  }

  function saveState(s) {
    s.lastUpdatedAt = now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }

  let appState = loadState();

  function setPanel(panel) {
    appState.panel = panel;
    saveState(appState);
    renderAll();
  }

  function setRole(role) {
    appState.role = role;
    saveState(appState);
    renderAll();
  }

  function setActiveWrongQuestion(id) {
    appState.activeWrongQuestionId = id;
    // 根据错题状态自动切换到相应的面板
    const question = getActiveQuestion();
    if (question) {
      if (question.status === "REVIEW_PENDING" || question.status === "EXPLAINED" || question.status === "ARCHIVED") {
        appState.panel = "review";
      } else if (question.status === "PRACTICE_PENDING") {
        appState.panel = "practice";
      }
    }
    saveState(appState);
    renderAll();
  }

  function getActiveQuestion() {
    return appState.wrongQuestions.find((q) => q.id === appState.activeWrongQuestionId) || null;
  }

  function statusBadge(status) {
    const pill = statusPillClass[status] || "pill-ARCHIVED";
    const text = statusLabel[status] || status;
    return `<span class="status-pill ${pill}"><span class="dot"></span>${escapeHtml(text)}</span>`;
  }

  function countByStatus() {
    const counts = {};
    for (const q of appState.wrongQuestions) counts[q.status] = (counts[q.status] || 0) + 1;
    return counts;
  }

  function countBySubject() {
    const counts = {};
    for (const q of appState.wrongQuestions) {
      const subject = q.subject || "未分类";
      counts[subject] = (counts[subject] || 0) + 1;
    }
    return counts;
  }

  function setSearchKeyword(keyword) {
    appState.searchKeyword = keyword.trim().toLowerCase();
    saveState(appState);
    renderAll();
  }

  function matchesSearch(question, keyword) {
    if (!keyword) return true;
    
    const searchFields = [
      question.question_content || "",
      question.subject || "",
      question.error_type || "",
      question.source || "",
      question.student_answer || "",
      question.correct_answer || "",
      ...(question.knowledge_points || []),
    ];
    
    const searchText = searchFields.join(" ").toLowerCase();
    return searchText.includes(keyword);
  }

  function renderStatusChips() {
    const counts = countByStatus();
    const reviewCount = (counts.EXPLAINED || 0) + (counts.REVIEW_PENDING || 0);
    const statusChips = [
      ["ALL", "全部", appState.wrongQuestions.length],
      ["REVIEW", "待复习", reviewCount],
      ["PRACTICE_PENDING", "再练中", counts.PRACTICE_PENDING || 0],
      ["ARCHIVED", "已归档", counts.ARCHIVED || 0],
    ];
    
    const subjectCounts = countBySubject();
    const subjectChips = [
      ["ALL", "全部科目"]
    ];
    for (const [subject, count] of Object.entries(subjectCounts)) {
      subjectChips.push([subject, subject, count]);
    }
    
    const el = $("#statusChips");
    el.innerHTML = `
      <div class="sidebar-title" style="margin-bottom:10px;">状态筛选</div>
      <div class="chips" id="statusFilterChips">
        ${statusChips.map(([key, label, cnt]) => 
          `<button class="chip ${appState.filter.status === key ? 'active' : ''}" type="button" data-status="${escapeHtml(key)}">${escapeHtml(label)} <span style="opacity:.85">(${cnt || appState.wrongQuestions.length})</span></button>`
        ).join("")}
      </div>
      <div class="sidebar-title" style="margin-top:16px; margin-bottom:10px;">科目筛选</div>
      <div class="chips" id="subjectFilterChips">
        ${subjectChips.map(([key, label, cnt]) => 
          `<button class="chip ${appState.filter.subject === key ? 'active' : ''}" type="button" data-subject="${escapeHtml(key)}">${escapeHtml(label)} ${cnt ? `<span style="opacity:.85">(${cnt})</span>` : ''}</button>`
        ).join("")}
      </div>
    `;
    
    // 添加状态筛选点击事件
    $$("#statusFilterChips .chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        appState.filter.status = btn.getAttribute("data-status");
        saveState(appState);
        renderAll();
      });
    });
    
    // 添加科目筛选点击事件
    $$("#subjectFilterChips .chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        appState.filter.subject = btn.getAttribute("data-subject");
        saveState(appState);
        renderAll();
      });
    });
  }

  function renderSidebar() {

    // remove & rebuild list to avoid duplication
    const old = $("#wrongQuestionListWrap");
    if (old) old.remove();

    const firstSection = $$(".sidebar-section")[0];
    const wrap = document.createElement("div");
    wrap.id = "wrongQuestionListWrap";
    wrap.className = "sidebar-section";
    wrap.innerHTML = `<div class="sidebar-title">全部错题（点击切换选中）</div><div class="list" id="wrongQuestionList"></div>`;
    firstSection.parentElement.insertBefore(wrap, firstSection.nextSibling);

    const list = $("#wrongQuestionList", wrap);
    
    // 根据筛选条件过滤错题
    let filteredQuestions = appState.wrongQuestions;
    
    // 状态筛选
    if (appState.filter.status !== "ALL") {
      if (appState.filter.status === "REVIEW") {
        filteredQuestions = filteredQuestions.filter(q => q.status === "REVIEW_PENDING" || q.status === "EXPLAINED");
      } else {
        filteredQuestions = filteredQuestions.filter(q => q.status === appState.filter.status);
      }
    }
    
    // 科目筛选
    if (appState.filter.subject !== "ALL") {
      filteredQuestions = filteredQuestions.filter(q => q.subject === appState.filter.subject);
    }
    
    // 年份筛选
    if (appState.filter.year !== "ALL") {
      const now = Date.now();
      const yearInMs = 365 * 24 * 60 * 60 * 1000;
      const years = parseInt(appState.filter.year);
      const cutoffTime = now - (years * yearInMs);
      filteredQuestions = filteredQuestions.filter(q => (q.created_at || 0) >= cutoffTime);
    }
    
    // 搜索过滤
    if (appState.searchKeyword) {
      filteredQuestions = filteredQuestions.filter(q => matchesSearch(q, appState.searchKeyword));
    }
    
    if (!filteredQuestions.length) {
      list.innerHTML = `<div class="tiny">暂无符合条件的错题</div>`;
    } else {
      const items = filteredQuestions
        .slice()
        .sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0))
        .map((qq) => {
          const active = qq.id === appState.activeWrongQuestionId;
          const kps = qq.knowledge_points || [];
          return `<div class="item" data-id="${escapeHtml(qq.id)}" data-active="${active ? "true" : "false"}" tabindex="0" role="button">
            <div class="item-title">${escapeHtml(qq.subject)}</div>
            <div class="item-meta">${escapeHtml(qq.error_type)}</div>
            <div style="margin-top:8px;">
              ${kps.map(kp => `<span class="knowledge-tag">${escapeHtml(kp)}</span>`).join("")}
            </div>
            <div style="margin-top:10px;">${statusBadge(qq.status)}</div>
          </div>`;
        })
        .join("");
      list.innerHTML = items;
    }

    const listItems = $$("#wrongQuestionList .item", wrap);
    listItems.forEach((el) => {
      const id = el.getAttribute("data-id");
      el.addEventListener("click", (event) => {
        event.preventDefault();
        setActiveWrongQuestion(id);
      });
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setActiveWrongQuestion(id);
        }
      });
    });
    
    // 确保默认选中第一个错题
    if (listItems.length > 0) {
      const firstId = listItems[0].getAttribute("data-id");
      if (!appState.activeWrongQuestionId) {
        setActiveWrongQuestion(firstId);
      } else {
        // 检查当前激活的错题是否在当前筛选结果中
        const activeInList = listItems.some(item => item.getAttribute("data-id") === appState.activeWrongQuestionId);
        if (!activeInList) {
          setActiveWrongQuestion(firstId);
        }
      }
    }

    // Segmented Control buttons - 只更新UI，不绑定事件
    $$("#panelSegmented .seg-btn").forEach((btn) => {
      const panel = btn.getAttribute("data-panel");
      btn.classList.toggle("active", appState.panel === panel);
    });

    // 导出功能相关
    $("#btnExport").onclick = () => {
      openExportModal();
    };

    $("#closeExportModal").onclick = () => {
      closeExportModal();
    };

    $("#btnCancelExport").onclick = () => {
      closeExportModal();
    };

    $("#btnConfirmExport").onclick = () => {
      exportSelectedQuestions();
    };
  }

  function renderLeftAndRight() {
    const panel = appState.panel;
    const right = $("#mainRight");
    right.innerHTML = "";
    if (panel === "review") {
      const selected = getActiveQuestion();
      if (!selected) {
        right.innerHTML = `<div class="empty-state">请选择一道错题</div>`;
        return;
      }
      
      right.innerHTML = `
        <div class="panel">
          <h2>错题详情</h2>
          <div class="answer-box">
            <div class="tiny">题目</div>
            <div style="margin-top:8px; white-space:pre-wrap; line-height:1.55;">${escapeHtml(selected.question_content)}</div>
          </div>
          <div class="answer-box" style="margin-top:12px;">
            <div class="tiny">你的答案</div>
            <div style="margin-top:8px; white-space:pre-wrap; line-height:1.55;">${escapeHtml(selected.student_answer)}</div>
          </div>
          <div class="answer-box" style="margin-top:12px;">
            <div class="tiny">正确答案</div>
            <div style="margin-top:8px; white-space:pre-wrap; line-height:1.55;">${escapeHtml(selected.correct_answer)}</div>
          </div>
          <div class="answer-box" style="margin-top:12px;">
            <div class="tiny">老师讲解</div>
            <div style="margin-top:8px; white-space:pre-wrap; line-height:1.55;">${escapeHtml(selected.annotations && selected.annotations.length ? selected.annotations[selected.annotations.length - 1].text : "暂无讲解")}</div>
            ${selected.annotations && selected.annotations.length && selected.annotations[selected.annotations.length - 1].steps ? `
              <div style="margin-top:10px;">
                <div class="tiny">标准步骤</div>
                <div style="margin-top:6px; white-space:pre-wrap; line-height:1.55;">${escapeHtml(selected.annotations[selected.annotations.length - 1].steps)}</div>
              </div>
            ` : ""}
          </div>
          <div class="answer-box" style="margin-top:12px;">
            <div class="tiny">基本信息</div>
            <div style="margin-top:8px; line-height:1.6;">
              科目：${escapeHtml(selected.subject)}<br/>
              知识点：${escapeHtml((selected.knowledge_points || []).join(" / "))}<br/>
              错因：${escapeHtml(selected.error_type)}<br/>
              来源：${escapeHtml(selected.source)}<br/>
              状态：${statusBadge(selected.status)}<br/>
              创建时间：${escapeHtml(formatTime(selected.created_at))}
            </div>
          </div>
        </div>
      `;
    } else if (panel === "practice") {
      const selected = getActiveQuestion();
      if (!selected) {
        right.innerHTML = `<div class="empty-state">请选择一道错题</div>`;
        return;
      }
      
      const recs = recommendPracticesForQuestion(selected);
      const practiceRecords = selected.practiceRecords || [];
      const doneMap = new Map(practiceRecords.map((r) => [r.practice_pool_id, r]));
      
      right.innerHTML = `
        <div class="practice-card">
          <div class="practice-header">
            <div>
              <h2 class="practice-title">智能再练</h2>
              <div class="subtle">对应错题摘要</div>
            </div>
            <div class="practice-stats">
              <div class="stats-percentage">84%</div>
              <div class="stats-count">12/15</div>
            </div>
          </div>
          
          <div class="question-area">
            <div class="question-text">${escapeHtml(selected.question_content || "")}</div>
          </div>
          
          <div class="knowledge-area">
            <div class="knowledge-box">
              <h4>核心概念</h4>
              <div class="knowledge-content">${escapeHtml((selected.knowledge_points || []).join(" / ") || "-")}</div>
            </div>
            <div class="knowledge-box">
              <h4>关键公式</h4>
              <div class="knowledge-content">v² = u² + 2as</div>
            </div>
          </div>
          
          <div class="answer-area">
            <h4>写下你的答案</h4>
            <textarea class="answer-input" id="prac_${selected.id}" placeholder="请输入"></textarea>
            
            <div style="margin-top:16px;">
              <div>
                <div class="tiny">上传图片</div>
                <div style="margin-top:8px;">
                  <div class="image-upload-box" id="img_box_${selected.id}">
                    <span class="image-upload-plus">+</span>
                    <input type="file" id="img_${selected.id}" accept="image/*" multiple>
                  </div>
                  <div class="image-preview-container" id="img_preview_${selected.id}"></div>
                </div>
              </div>
              <div style="margin-top:24px;">
                <div class="tiny">录制音频</div>
                <div style="margin-top:8px;">
                  <div id="record_container_${selected.id}">
                    <button class="record-btn" type="button" id="record_${selected.id}" ${navigator.mediaDevices ? "" : "disabled title='浏览器不支持音频录制'"}>
                      <div class="record-icon"></div>
                    </button>
                    <div class="record-status" id="record_status_${selected.id}" style="display:none;">录制中</div>
                    <div class="audio-controls" id="audio_controls_${selected.id}" style="display:none;">
                      <button class="confirm-record-btn" type="button" id="confirm_record_${selected.id}" disabled>确认</button>
                    </div>
                  </div>
                  <div class="audio-list" id="audio_list_${selected.id}"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bottom-actions">
            <button class="skip-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
              跳过此题
            </button>
            <button class="submit-btn" data-do="${selected.id}">
              提交
            </button>
          </div>
        </div>
      `;
      
      // 图片上传预览
      const imgInput = $("#img_" + selected.id, right);
      const imgPreview = $("#img_preview_" + selected.id, right);
      const uploadedImages = [];
      
      if (imgInput) {
        imgInput.addEventListener("change", (e) => {
          if (e.target.files && e.target.files.length > 0) {
            Array.from(e.target.files).forEach(file => {
              const reader = new FileReader();
              reader.onload = (event) => {
                const imgData = event.target.result;
                uploadedImages.push(imgData);
                renderImagePreview();
              };
              reader.readAsDataURL(file);
            });
          }
        });
      }
      
      function renderImagePreview() {
        imgPreview.innerHTML = "";
        uploadedImages.forEach((imgData, index) => {
          const itemDiv = document.createElement("div");
          itemDiv.className = "image-preview-item";
          itemDiv.innerHTML = `
            <img src="${imgData}" alt="上传的图片">
            <button class="image-preview-remove" type="button" data-index="${index}">×</button>
          `;
          imgPreview.appendChild(itemDiv);
          
          const removeBtn = itemDiv.querySelector(".image-preview-remove");
          removeBtn.addEventListener("click", () => {
            uploadedImages.splice(index, 1);
            renderImagePreview();
          });
        });
      }

      // 音频录制功能
      const mediaRecorderMap = {};
      const audioChunksMap = {};
      const isRecordingMap = {};
      const recordedAudios = [];

      const recordButton = $("#record_" + selected.id, right);
      const recordStatus = $("#record_status_" + selected.id, right);
      const audioControls = $("#audio_controls_" + selected.id, right);
      const confirmBtn = $("#confirm_record_" + selected.id, right);
      const audioList = $("#audio_list_" + selected.id, right);

      if (recordButton) {
        recordButton.addEventListener("click", async () => {
          const isRecording = isRecordingMap[selected.id];
          
          if (!isRecording) {
            // 开始录制
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              const mediaRecorder = new MediaRecorder(stream);
              const audioChunks = [];
              
              mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                  audioChunks.push(event.data);
                }
              };
              
              mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                mediaRecorderMap[selected.id + "_temp"] = { url: audioUrl, blob: audioBlob };
                confirmBtn.disabled = false;
              };
              
              mediaRecorder.start();
              mediaRecorderMap[selected.id] = mediaRecorder;
              audioChunksMap[selected.id] = audioChunks;
              isRecordingMap[selected.id] = true;
              
              // 更新UI为录制中状态
              recordButton.classList.add("recording");
              recordButton.innerHTML = `
                <div class="pause-icon">
                  <div class="pause-bar"></div>
                  <div class="pause-bar"></div>
                </div>
              `;
              recordStatus.style.display = "block";
              audioControls.style.display = "flex";
              
            } catch (error) {
              console.error("音频录制失败:", error);
              alert("音频录制失败，请检查权限设置");
            }
          } else {
            // 暂停录制
            const mediaRecorder = mediaRecorderMap[selected.id];
            if (mediaRecorder && mediaRecorder.state !== "inactive") {
              mediaRecorder.stop();
              mediaRecorder.stream.getTracks().forEach(track => track.stop());
              isRecordingMap[selected.id] = false;
              
              // 更新UI为暂停状态
              recordButton.classList.remove("recording");
              recordButton.innerHTML = `<div class="record-icon"></div>`;
              recordStatus.style.display = "none";
            }
          }
        });
      }

      if (confirmBtn) {
        confirmBtn.addEventListener("click", () => {
          const tempAudio = mediaRecorderMap[selected.id + "_temp"];
          if (tempAudio) {
            recordedAudios.push({ id: uid("audio"), url: tempAudio.url, blob: tempAudio.blob });
            renderAudioList();
            
            // 重置录制按钮
            confirmBtn.disabled = true;
            audioControls.style.display = "none";
            delete mediaRecorderMap[selected.id + "_temp"];
          }
        });
      }
      
      function renderAudioList() {
        audioList.innerHTML = "";
        recordedAudios.forEach((audio, index) => {
          const itemDiv = document.createElement("div");
          itemDiv.className = "audio-item";
          itemDiv.innerHTML = `
            <audio controls src="${audio.url}"></audio>
            <button class="remove-audio-btn" type="button" data-index="${index}">×</button>
          `;
          audioList.appendChild(itemDiv);
          
          const removeBtn = itemDiv.querySelector(".remove-audio-btn");
          removeBtn.addEventListener("click", () => {
            recordedAudios.splice(index, 1);
            renderAudioList();
          });
        });
      }

      // 提交完成按钮
      const submitButton = $("[data-do='" + selected.id + "']", right);
      if (submitButton) {
        submitButton.onclick = () => {
          const textarea = $("#prac_" + selected.id, right);
          const ans = textarea.value.trim();
          if (!ans) return alert("请先填写答案后提交。");

          // 收集媒体数据
          const media = {};
          
          // 图片数据 - 使用已上传的图片数组
          if (uploadedImages.length > 0) {
            media.images = uploadedImages;
          }
          
          // 音频数据 - 使用已录制的音频数组
          if (recordedAudios.length > 0) {
            media.audios = recordedAudios.map(a => a.url);
          }
          
          savePracticeRecord(selected.id, ans, selected, media, selected);
        };
      }

      function savePracticeRecord(pid, ans, prac, media, selected) {
        // 由于我们现在直接使用错题本身作为练习，我们假设用户的答案是正确的
        // 在实际应用中，这里应该有一个更复杂的判断逻辑
        const is_correct = true;
        selected.practiceRecords = selected.practiceRecords || [];
        const existing = selected.practiceRecords.find((r) => r.practice_pool_id === pid);
        if (existing) {
          existing.student_answer = ans;
          existing.is_correct = is_correct;
          existing.media = media;
        } else {
          selected.practiceRecords.push({ id: uid("pr"), practice_pool_id: pid, student_answer: ans, is_correct, media });
        }
        selected.updated_at = now();
        saveState(appState);
        renderAll();
      }

      $("#btnFinishPractice", right).onclick = () => {
        const finishedCount = recs.filter((p) => (selected.practiceRecords || []).some((r) => r.practice_pool_id === p.id)).length;
        if (finishedCount < recs.length) {
          alert("请先完成所有推荐练习的提交。");
          return;
        }
        const correctCount = recs.reduce((acc, p) => {
          const r = (selected.practiceRecords || []).find((x) => x.practice_pool_id === p.id);
          return acc + (r && r.is_correct ? 1 : 0);
        }, 0);

        const mastered = correctCount >= Math.ceil(recs.length * 0.5);
        selected.status = "ARCHIVED";
        selected.mastery_level = mastered ? 5 : 2;
        selected.updated_at = now();
        saveState(appState);
        renderAll();
        setPanel("export");
      };
    } else if (panel === "export") {
      right.innerHTML = `
        <div class="panel">
          <h2>导出与沉淀</h2>
          <div class="subtle">生成“打印版错题本”（浏览器打印/PDF）与 JSON 数据导出。</div>
          <div class="form" style="margin-top:10px;">
            <div class="field">
              <label>科目筛选</label>
              <select id="ex_subject">
                <option value="">全部科目</option>
                <option value="数学">数学</option>
                <option value="英语">英语</option>
                <option value="物理">物理</option>
              </select>
            </div>
            <div class="field">
              <label>仅未掌握</label>
              <select id="ex_not_mastered">
                <option value="yes">是（mastery_level&lt;5）</option>
                <option value="no">否（包含已掌握）</option>
              </select>
            </div>
          </div>
          <div class="btnRow">
            <button class="btn primary" type="button" id="btnPrint">打开打印版错题本</button>
            <button class="btn" type="button" id="btnDownloadJson">导出 JSON</button>
          </div>
          <div class="answer-box" style="margin-top:12px;">
            <div class="tiny">预览</div>
            <div class="list" id="exportPreview" style="margin-top:10px;"></div>
          </div>
        </div>
      `;
      
      function getExportList() {
        const subject = $("#ex_subject").value;
        const notMastered = $("#ex_not_mastered").value === "yes";
        return appState.wrongQuestions
          .filter((q) => q.status === "ARCHIVED")
          .filter((q) => (subject ? q.subject === subject : true))
          .filter((q) => (notMastered ? (q.mastery_level || 0) < 5 : true))
          .slice()
          .sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0));
      }

      function renderPreview() {
        const list = getExportList();
        const host = $("#exportPreview");
        if (!list.length) {
          host.innerHTML = `<div class="tiny">没有满足筛选条件的归档错题</div>`;
          return;
        }
        host.innerHTML = list
          .map((q) => {
            const kps = (q.knowledge_points || []).slice(0, 2).join(" / ");
            return `
              <div class="item" style="cursor:default;">
                <div class="item-title">${escapeHtml(q.subject)} · ${escapeHtml(kps || "未分类")}</div>
                <div class="item-meta">${escapeHtml(q.error_type)} · ${escapeHtml(q.source)} · ${escapeHtml(formatTime(q.updated_at))}</div>
              </div>
            `;
          })
          .join("");
      }

      $("#ex_subject").addEventListener("change", renderPreview);
      $("#ex_not_mastered").addEventListener("change", renderPreview);
      renderPreview();

      $("#btnDownloadJson").onclick = () => {
        const list = getExportList();
        const payload = {
          exported_at: now(),
          wrongQuestions: list,
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `errbook_export_${now()}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      };

      $("#btnPrint").onclick = () => {
        const list = getExportList();
        if (!list.length) return alert("没有可导出的内容，请先调整筛选条件。");

        // 分组：按科目
        const groups = new Map();
        for (const q of list) {
          if (!groups.has(q.subject)) groups.set(q.subject, []);
          groups.get(q.subject).push(q);
        }

        const title = "错题本（打印版）- Web 原型";
        const html = `
          <!doctype html>
          <html lang="zh-CN">
            <head>
              <meta charset="utf-8"/>
              <title>${escapeHtml(title)}</title>
              <style>
                body{font-family:"PingFang SC","Heiti SC","Microsoft YaHei",sans-serif; margin:22px; color:#111;}
                h1{font-size:18px; margin:0 0 12px;}
                h2{font-size:14px; margin:18px 0 10px; border-bottom:1px solid #eee; padding-bottom:6px;}
                .card{border:1px solid #e8e8e8; border-radius:12px; padding:12px; margin:10px 0;}
                .meta{color:#666; font-size:12px; margin-bottom:8px;}
                .content{line-height:1.6; margin-bottom:10px;}
                .answer{margin-top:8px; padding-top:8px; border-top:1px dashed #eee;}
                .answer-label{font-size:12px; color:#666; margin-bottom:4px;}
              </style>
            </head>
            <body>
              <h1>${escapeHtml(title)}</h1>
              ${Array.from(groups.entries())
                .map(([subject, questions]) => `
                  <h2>${escapeHtml(subject)}</h2>
                  ${questions
                    .map((q) => `
                      <div class="card">
                        <div class="meta">${escapeHtml(q.error_type)} · ${escapeHtml(q.source)} · ${escapeHtml(formatTime(q.updated_at))}</div>
                        <div class="content">${escapeHtml(q.question_content)}</div>
                        <div class="answer">
                          <div class="answer-label">学生答案：</div>
                          <div>${escapeHtml(q.student_answer || "未填写")}</div>
                        </div>
                        <div class="answer">
                          <div class="answer-label">正确答案：</div>
                          <div>${escapeHtml(q.correct_answer || "未填写")}</div>
                        </div>
                        ${q.annotations && q.annotations.length ? `
                          <div class="answer">
                            <div class="answer-label">老师讲解：</div>
                            <div>${escapeHtml(q.annotations[q.annotations.length - 1].text)}</div>
                          </div>
                        ` : ""}
                      </div>
                    `)
                    .join("")}
                `)
                .join("")}
            </body>
          </html>
        `;

        const w = window.open();
        if (!w) return alert("请允许弹窗以打开打印预览。");
        w.document.write(html);
        w.document.close();
        w.addEventListener("load", () => w.print());
      };
    }
  }





  function renderReviewPanel() {
    let relevant = appState.wrongQuestions
      .filter((q) => q.status === "REVIEW_PENDING" || q.status === "EXPLAINED")
      .slice();
    
    // 科目筛选
    if (appState.filter.subject !== "ALL") {
      relevant = relevant.filter(q => q.subject === appState.filter.subject);
    }
    
    relevant.sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0));

    const left = document.createElement("div");
    left.className = "panel";
    left.innerHTML = `
      <h2>学生复习（隐藏答案模式）</h2>
      <div class="subtle">提交后展示结论：正确/错误 + 信心评分（1-5） → 决定是否再练。</div>
      <div class="list" style="margin-top:12px;">
        ${
          relevant.length
            ? relevant
                .map((q) => {
                  const active = q.id === appState.activeWrongQuestionId;
                  return `<div class="item" data-id="${escapeHtml(q.id)}" data-active="${active ? "true" : "false"}" tabindex="0" role="button">
                    <div class="item-title">${escapeHtml(q.subject)} · ${escapeHtml(q.knowledge_points.slice(0, 2).join(" / ") || "未分类")}</div>
                    <div class="item-meta">${escapeHtml(q.error_type)} · 来源：${escapeHtml(q.source)}</div>
                    <div style="margin-top:10px;">${statusBadge(q.status)}</div>
                  </div>`;
                })
                .join("")
            : `<div class="tiny">暂无待复习错题</div>`
        }
      </div>
    `;

    const right = document.createElement("div");
    right.className = "panel";
    const selected = getActiveQuestion();

    if (!selected) {
      right.innerHTML = `<h2>复习作答区</h2><div class="tiny">请先选择一条错题。</div>`;
      return { left, right };
    }

    right.innerHTML = `<h2>复习作答区</h2>
      <div class="subtle">隐藏答案复习：提交后展示结论，并决定是否再练。</div>`;

    const lastReview = selected.reviewSessions && selected.reviewSessions.length ? selected.reviewSessions[selected.reviewSessions.length - 1] : null;
    const lastAnn = selected.annotations && selected.annotations.length ? selected.annotations[selected.annotations.length - 1] : null;

    if (lastReview) {
      right.innerHTML += `
        <div class="answer-box">
          <div class="tiny">本次复习已提交</div>
          <div style="margin-top:8px; line-height:1.6;">
            系统判定：${lastReview.system_judgement ? "正确" : "错误"}<br/>
            信心评分：${escapeHtml(String(lastReview.confidence_rating))}/5<br/>
            掌握结论：${escapeHtml(lastReview.mastery_decision === "mastered" ? "已掌握" : "未掌握")}
          </div>
          <div class="tiny" style="margin-top:10px;">提交时间：${escapeHtml(formatTime(lastReview.created_at))}</div>
        </div>
      `;
    }

    right.innerHTML += `
      <div class="answer-box" style="margin-top:12px;">
        <div class="tiny">老师讲解（展示）</div>
        <div style="margin-top:8px; white-space:pre-wrap; line-height:1.55;">${escapeHtml(lastAnn?.text || "暂无讲解（演示数据）")}</div>
        ${
          lastAnn?.steps
            ? `<div style="margin-top:10px;">
                <div class="tiny">标准步骤</div>
                <div style="margin-top:6px; white-space:pre-wrap; line-height:1.55;">${escapeHtml(lastAnn.steps)}</div>
              </div>`
            : ""
        }
      </div>
    `;

    right.innerHTML += `
      <div class="answer-box" style="margin-top:12px;">
        <div class="tiny">题目（答案隐藏）</div>
        <div style="margin-top:8px; white-space:pre-wrap; line-height:1.55;">${escapeHtml(selected.question_content)}</div>
        <div class="tiny" style="margin-top:10px;">正确答案（隐藏后续展示结果时再看）</div>
        <div class="answer-hidden" style="margin-top:6px;">${escapeHtml(selected.correct_answer || "-")}</div>
      </div>

      <div class="answer-box" style="margin-top:12px;">
        <div class="tiny">学生重新作答</div>
        <textarea id="r_solution" style="margin-top:8px; min-height:110px;" placeholder="请重新作答（文本录入演示：也可只写关键答案/步骤）"></textarea>
        <div class="tiny" style="margin-top:10px;">信心评分（1-5）</div>
        <input type="range" id="r_conf" min="1" max="5" value="3" />
        <div class="tiny" style="margin-top:8px;">当前：<span id="r_conf_out">3</span>/5</div>
        <div class="tiny" style="margin-top:10px;">MVP 判定规则：系统比对正确 且 信心>=4 → 已掌握；否则未掌握进入再练。</div>
      </div>

      <div class="btnRow">
        <button class="btn primary" type="button" id="btnReviewSubmit">提交复习与掌握判定</button>
        <button class="btn" type="button" id="btnReviewClear">清空本次作答</button>
      </div>
      <div id="reviewResult" style="margin-top:12px;"></div>
    `;

    // conf output
    const conf = $("#r_conf", right);
    const out = $("#r_conf_out", right);
    out.textContent = conf.value;
    conf.addEventListener("input", () => (out.textContent = conf.value));

    $$(".item", left).forEach((el) => {
      const id = el.getAttribute("data-id");
      el.onclick = () => setActiveWrongQuestion(id);
    });

    $("#btnReviewClear", right).onclick = () => {
      $("#r_solution", right).value = "";
      conf.value = "3";
      out.textContent = "3";
      $("#reviewResult", right).innerHTML = "";
    };

    $("#btnReviewSubmit", right).onclick = () => {
      const student_solution = $("#r_solution", right).value.trim();
      const confidence_rating = Number(conf.value);
      if (!student_solution) {
        alert("请先填写重新作答内容。");
        return;
      }

      const sysCorrect = normalizeAnswer(student_solution) === normalizeAnswer(selected.correct_answer);
      const mastery_decision = sysCorrect && confidence_rating >= 4 ? "mastered" : "not_mastered";
      const mastery_level = mastery_decision === "mastered" ? 5 : 2;

      selected.reviewSessions = selected.reviewSessions || [];
      selected.reviewSessions.push({
        id: uid("rev"),
        student_id: "s_demo",
        mode: "hidden_answer",
        student_solution,
        system_judgement: sysCorrect,
        confidence_rating,
        mastery_decision,
        created_at: now(),
      });

      selected.status = mastery_decision === "mastered" ? "ARCHIVED" : "PRACTICE_PENDING";
      selected.mastery_level = mastery_level;
      selected.updated_at = now();
      saveState(appState);
      renderAll();

      const result = `
        <div class="answer-box">
          <div class="tiny">提交结果</div>
          <div style="margin-top:8px; line-height:1.6;">
            系统判定：${sysCorrect ? "正确" : "错误"}<br/>
            信心评分：${escapeHtml(String(confidence_rating))}/5<br/>
            掌握结论：${mastery_decision === "mastered" ? "已掌握（归档）" : "未掌握（进入再练）"}
          </div>
          <div style="margin-top:12px;">
            <div class="tiny">正确答案</div>
            <div style="margin-top:6px; white-space:pre-wrap;">${escapeHtml(selected.correct_answer || "")}</div>
          </div>
        </div>
      `;
      $("#reviewResult", right).innerHTML = result;

      setTimeout(() => {
        if (mastery_decision !== "mastered") setPanel("practice");
      }, 600);
    };

    return { left, right };
  }

  function recommendPracticesForQuestion(q) {
    const qKp = new Set(q.knowledge_points || []);
    const qErr = q.error_type;
    const scored = practicePool
      .map((p) => {
        let score = 0;
        if (p.subject === q.subject) score += 3;
        const kpMatches = (p.knowledgePoints || []).filter((k) => qKp.has(k)).length;
        score += kpMatches * 3;
        if ((p.errorTypes || []).includes(qErr)) score += 4;
        return { p, score };
      })
      .sort((a, b) => b.score - a.score);
    return scored.slice(0, 3).map((x) => x.p);
  }

  function renderPracticePanel() {
    const role = "student";
    let relevant = appState.wrongQuestions
      .filter((q) => q.status === "PRACTICE_PENDING")
      .slice();
    
    // 科目筛选
    if (appState.filter.subject !== "ALL") {
      relevant = relevant.filter(q => q.subject === appState.filter.subject);
    }
    
    relevant.sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0));

    const left = document.createElement("div");
    left.className = "panel";
    left.innerHTML = `
      <h2>智能再练</h2>
      <div class="subtle">从同科目/同知识点/同错误类型推荐练习题；完成后归档并更新掌握等级。</div>
      <div class="list" style="margin-top:12px;">
        ${
          relevant.length
            ? relevant
                .map((q) => {
                  const active = q.id === appState.activeWrongQuestionId;
                  return `<div class="item" data-id="${escapeHtml(q.id)}" data-active="${active ? "true" : "false"}" tabindex="0" role="button">
                    <div class="item-title">${escapeHtml(q.subject)} · ${escapeHtml(q.knowledge_points.slice(0, 2).join(" / ") || "未分类")}</div>
                    <div class="item-meta">${escapeHtml(q.error_type)} · 来源：${escapeHtml(q.source)}</div>
                    <div style="margin-top:10px;">${statusBadge(q.status)}</div>
                  </div>`;
                })
                .join("")
            : `<div class="tiny">暂无待再练错题</div>`
        }
      </div>
    `;

    const right = document.createElement("div");
    right.className = "panel";
    const selected = getActiveQuestion();
    if (!selected) {
      right.innerHTML = `<h2>推荐练习</h2><div class="tiny">请先在左侧选择一条错题。</div>`;
      return { left, right };
    }

    const recs = recommendPracticesForQuestion(selected);
    const practiceRecords = selected.practiceRecords || [];
    const doneMap = new Map(practiceRecords.map((r) => [r.practice_pool_id, r]));

    right.innerHTML = `
      <h2>推荐练习</h2>
      <div class="subtle">作答并提交：完成后更新掌握结果。</div>
      <div class="answer-box">
        <div class="tiny">对应错题摘要</div>
        <div style="margin-top:8px; white-space:pre-wrap; line-height:1.55;">${escapeHtml(selected.question_content || "")}</div>
        <div class="tiny" style="margin-top:10px;">错因：${escapeHtml(selected.error_type)}；知识点：${escapeHtml((selected.knowledge_points || []).join(" / ") || "-")}</div>
      </div>

      <div class="list" style="margin-top:12px;">
        ${recs
          .map((p, idx) => {
            const done = doneMap.get(p.id);
            const disabled = role !== "student" || done;
            return `
              <div class="item" style="cursor:default;" data-rec="${escapeHtml(p.id)}">
                <div class="item-title">推荐${idx + 1}：${escapeHtml(p.subject)} · ${escapeHtml((p.knowledgePoints || []).slice(0, 2).join(" / "))}</div>
                <div class="item-meta">来自：${escapeHtml((p.errorTypes || []).join(" / "))}</div>
                <div style="margin-top:10px; white-space:pre-wrap; line-height:1.55;">${escapeHtml(p.prompt)}</div>
                <div style="margin-top:10px;">
                  <div class="tiny">你的答案</div>
                  <textarea id="prac_${escapeHtml(p.id)}" style="margin-top:8px; min-height:90px;" ${done ? "disabled" : ""} placeholder="写下你的答案"></textarea>
                  ${done ? `<div class="tiny" style="margin-top:8px;">完成情况：${done.is_correct ? "正确" : "错误"}</div>` : ""}
                  <div class="btnRow">
                    <button class="btn small primary" type="button" ${disabled ? "disabled" : ""} data-do="${escapeHtml(p.id)}">提交完成</button>
                  </div>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>

      <div class="btnRow" style="margin-top:12px;">
        <button class="btn primary" type="button" id="btnFinishPractice">完成后归档</button>
      </div>
      <div class="tiny" style="margin-top:10px;">
        MVP 归档规则：推荐题至少答对一半 → 已掌握；否则未掌握先归档（方便导出回看）。
      </div>
    `;

    $$(".item[data-rec]", left).forEach(() => {}); // keep structure; handlers below
    $$(".item", left).forEach((el) => {
      const id = el.getAttribute("data-id");
      if (!id) return;
      el.onclick = () => setActiveWrongQuestion(id);
    });

    $$(".item [data-do]", right).forEach((btn) => {
      btn.onclick = () => {
        const pid = btn.getAttribute("data-do");
        const prac = practicePool.find((x) => x.id === pid);
        if (!prac) return;
        // 使用纯 id 查询，避免 CSS.escape 的兼容性问题
        const textarea = $("#prac_" + pid, right);
        const ans = textarea.value.trim();
        if (!ans) return alert("请先填写答案后提交。");

        const is_correct = normalizeAnswer(ans) === normalizeAnswer(prac.correctAnswer);
        selected.practiceRecords = selected.practiceRecords || [];
        const existing = selected.practiceRecords.find((r) => r.practice_pool_id === pid);
        if (existing) {
          existing.student_answer = ans;
          existing.is_correct = is_correct;
        } else {
          selected.practiceRecords.push({ id: uid("pr"), practice_pool_id: pid, student_answer: ans, is_correct });
        }
        selected.updated_at = now();
        saveState(appState);
        renderAll();
      };
    });

    $("#btnFinishPractice", right).onclick = () => {
      const finishedCount = recs.filter((p) => (selected.practiceRecords || []).some((r) => r.practice_pool_id === p.id)).length;
      if (finishedCount < recs.length) {
        alert("请先完成所有推荐练习的提交。");
        return;
      }
      const correctCount = recs.reduce((acc, p) => {
        const r = (selected.practiceRecords || []).find((x) => x.practice_pool_id === p.id);
        return acc + (r && r.is_correct ? 1 : 0);
      }, 0);

      const mastered = correctCount >= Math.ceil(recs.length * 0.5);
      selected.status = "ARCHIVED";
      selected.mastery_level = mastered ? 5 : 2;
      selected.updated_at = now();
      saveState(appState);
      renderAll();
      setPanel("export");
    };

    return { left, right };
  }

  function renderExportPanel() {
    const wrapper = document.createElement("div");
    wrapper.className = "panel";

    wrapper.innerHTML = `
      <h2>导出与沉淀</h2>
      <div class="subtle">生成“打印版错题本”（浏览器打印/PDF）与 JSON 数据导出。</div>
      <div class="form" style="margin-top:10px;">
        <div class="field">
          <label>科目筛选</label>
          <select id="ex_subject">
            <option value="">全部科目</option>
            <option value="数学">数学</option>
            <option value="英语">英语</option>
            <option value="物理">物理</option>
          </select>
        </div>
        <div class="field">
          <label>仅未掌握</label>
          <select id="ex_not_mastered">
            <option value="yes">是（mastery_level&lt;5）</option>
            <option value="no">否（包含已掌握）</option>
          </select>
        </div>
      </div>

      <div class="btnRow">
        <button class="btn primary" type="button" id="btnPrint">打开打印版错题本</button>
        <button class="btn" type="button" id="btnDownloadJson">导出 JSON</button>
      </div>

      <div class="answer-box" style="margin-top:12px;">
        <div class="tiny">预览</div>
        <div class="list" id="exportPreview" style="margin-top:10px;"></div>
      </div>
    `;

    function getExportList() {
      const subject = $("#ex_subject", wrapper).value;
      const notMastered = $("#ex_not_mastered", wrapper).value === "yes";
      return appState.wrongQuestions
        .filter((q) => q.status === "ARCHIVED")
        .filter((q) => (subject ? q.subject === subject : true))
        .filter((q) => (notMastered ? (q.mastery_level || 0) < 5 : true))
        .slice()
        .sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0));
    }

    function renderPreview() {
      const list = getExportList();
      const host = $("#exportPreview", wrapper);
      if (!list.length) {
        host.innerHTML = `<div class="tiny">没有满足筛选条件的归档错题</div>`;
        return;
      }
      host.innerHTML = list
        .map((q) => {
          const kps = (q.knowledge_points || []).slice(0, 2).join(" / ");
          return `
            <div class="item" style="cursor:default;">
              <div class="item-title">${escapeHtml(q.subject)} · ${escapeHtml(kps || "未分类")}</div>
              <div class="item-meta">${escapeHtml(q.error_type)} · ${escapeHtml(q.source)} · ${escapeHtml(formatTime(q.updated_at))}</div>
            </div>
          `;
        })
        .join("");
    }

    $("#ex_subject", wrapper).addEventListener("change", renderPreview);
    $("#ex_not_mastered", wrapper).addEventListener("change", renderPreview);
    renderPreview();

    $("#btnDownloadJson", wrapper).onclick = () => {
      const list = getExportList();
      const payload = {
        exported_at: now(),
        wrongQuestions: list,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `errbook_export_${now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    };

    $("#btnPrint", wrapper).onclick = () => {
      const list = getExportList();
      if (!list.length) return alert("没有可导出的内容，请先调整筛选条件。");

      // 分组：按科目
      const groups = new Map();
      for (const q of list) {
        if (!groups.has(q.subject)) groups.set(q.subject, []);
        groups.get(q.subject).push(q);
      }

      const title = "错题本（打印版）- Web 原型";
      const html = `
        <!doctype html>
        <html lang="zh-CN">
          <head>
            <meta charset="utf-8"/>
            <title>${escapeHtml(title)}</title>
            <style>
              body{font-family:"PingFang SC","Heiti SC","Microsoft YaHei",sans-serif; margin:22px; color:#111;}
              h1{font-size:18px; margin:0 0 12px;}
              h2{font-size:14px; margin:18px 0 10px; border-bottom:1px solid #eee; padding-bottom:6px;}
              .card{border:1px solid #e8e8e8; border-radius:12px; padding:12px; margin:10px 0;}
              .meta{color:#666; font-size:12px; margin-bottom:8px;}
              .tag{display:inline-block; padding:3px 8px; border-radius:999px; background:#f5f7ff; border:1px solid #e6e9ff; margin-right:6px; font-size:12px;}
              .row{margin-top:10px; font-size:13px; white-space:pre-wrap; line-height:1.55;}
              img{max-width:100%; border-radius:10px; border:1px solid #eee;}
              .good{color:#0b7a2a}
              .bad{color:#b42318}
            </style>
          </head>
          <body>
            <h1>${escapeHtml(title)}</h1>
            <div class="meta">生成时间：${escapeHtml(formatTime(now()))}（演示：数据来自浏览器本地存储）</div>
            ${Array.from(groups.entries())
              .map(([subject, qs]) => {
                const subjectHtml = `<h2>${escapeHtml(subject)}（共 ${qs.length} 条）</h2>`;
                const cards = qs
                  .map((q) => {
                    const lastAnn = q.annotations && q.annotations.length ? q.annotations[q.annotations.length - 1] : null;
                    const lastReview = q.reviewSessions && q.reviewSessions.length ? q.reviewSessions[q.reviewSessions.length - 1] : null;
                    const masteryText = (q.mastery_level || 0) >= 5 ? "已掌握" : "未掌握";
                    return `
                      <div class="card">
                        <div class="meta">
                          <span class="tag">${escapeHtml(q.error_type)}</span>
                          <span class="tag">来源：${escapeHtml(q.source)}</span>
                          <span class="tag">掌握：<span class="${(q.mastery_level || 0) >= 5 ? "good" : "bad"}">${escapeHtml(masteryText)}</span></span>
                        </div>
                        <div class="row"><b>题目：</b>${escapeHtml(q.question_content || "")}</div>
                        <div class="row"><b>学生答案：</b>${escapeHtml(q.student_answer || "-")}</div>
                        <div class="row"><b>正确答案：</b>${escapeHtml(q.correct_answer || "")}</div>
                        <div class="row"><b>知识点：</b>${escapeHtml((q.knowledge_points || []).join(" / ") || "-")}</div>
                        ${
                          lastAnn
                            ? `<div class="row" style="margin-top:12px;"><b>老师讲解：</b>${escapeHtml(lastAnn.text || "")}
                               ${lastAnn.steps ? `\n标准步骤：\n${escapeHtml(lastAnn.steps)}` : ""}</div>`
                            : `<div class="row small" style="margin-top:12px; color:#777;">老师讲解：暂无</div>`
                        }
                        ${
                          lastReview
                            ? `<div class="row" style="margin-top:10px;"><b>复习结论：</b>${escapeHtml(lastReview.mastery_decision === "mastered" ? "已掌握" : "未掌握")}（信心：${escapeHtml(String(lastReview.confidence_rating))}/5；系统：${lastReview.system_judgement ? "正确" : "错误"}）</div>`
                            : ""
                        }
                      </div>
                    `;
                  })
                  .join("");
                return subjectHtml + cards;
              })
              .join("")}
          </body>
        </html>
      `;

      const w = window.open("", "_blank");
      if (!w) return alert("浏览器阻止了弹窗，无法打开打印版。请允许弹窗或改用 JSON 导出。");
      w.document.open();
      w.document.write(html);
      w.document.close();
      setTimeout(() => {
        try {
          w.focus();
          w.print();
        } catch {}
      }, 250);
    };

    return wrapper;
  }

  function renderAll() {
    renderSidebar();
    renderLeftAndRight();
    updateFilterButtons();
  }

  function updateFilterButtons() {
    // 更新状态筛选按钮文本
    const statusBtn = $("#statusFilterBtn");
    let statusText = "状态筛选";
    if (appState.filter.status !== "ALL") {
      const statusMap = {
        "REVIEW": "待复习",
        "PRACTICE_PENDING": "再练中",
        "ARCHIVED": "已归档"
      };
      statusText = statusMap[appState.filter.status] || appState.filter.status;
    }
    statusBtn.textContent = statusText;
    statusBtn.classList.toggle("active", appState.filter.status !== "ALL");

    // 更新科目筛选按钮文本
    const subjectBtn = $("#subjectFilterBtn");
    let subjectText = "科目筛选";
    if (appState.filter.subject !== "ALL") {
      subjectText = appState.filter.subject;
    } else {
      subjectText = "全部科目";
    }
    subjectBtn.textContent = subjectText;
    subjectBtn.classList.toggle("active", appState.filter.subject !== "ALL");

    // 更新年份筛选按钮文本
    const yearBtn = $("#yearFilterBtn");
    let yearText = "年份筛选";
    if (appState.filter.year !== "ALL") {
      const yearMap = {
        "1": "最近一年",
        "3": "最近三年"
      };
      yearText = yearMap[appState.filter.year] || appState.filter.year;
    }
    yearBtn.textContent = yearText;
    yearBtn.classList.toggle("active", appState.filter.year !== "ALL");
  }

  // 筛选弹窗相关函数
  let currentFilterType = "status"; // 当前筛选类型：status 或 subject

  function openFilterModal(type) {
    currentFilterType = type || "status";
    renderFilterModal(type);
    $("#filterModal").style.display = "flex";
  }

  function closeFilterModal() {
    $("#filterModal").style.display = "none";
  }

  function renderFilterModal(type) {
    const modalHeader = $$(".modal-header h3")[0];
    const statusSection = $$(".filter-section")[0];
    const subjectSection = $$(".filter-section")[1];
    const yearSection = $$(".filter-section")[2];

    if (type === "status") {
      modalHeader.textContent = "状态筛选";
      statusSection.style.display = "block";
      subjectSection.style.display = "none";
      yearSection.style.display = "none";
      
      const counts = countByStatus();
      const reviewCount = (counts.EXPLAINED || 0) + (counts.REVIEW_PENDING || 0);
      const statusChips = [
        ["ALL", "全部", appState.wrongQuestions.length],
        ["REVIEW", "待复习", reviewCount],
        ["PRACTICE_PENDING", "再练中", counts.PRACTICE_PENDING || 0],
        ["ARCHIVED", "已归档", counts.ARCHIVED || 0],
      ];
      
      const statusEl = $("#modalStatusChips");
      statusEl.innerHTML = statusChips.map(([key, label, cnt]) => 
        `<button class="chip ${appState.filter.status === key ? 'active' : ''}" type="button" data-status="${escapeHtml(key)}">${escapeHtml(label)} <span style="opacity:.85">(${cnt || appState.wrongQuestions.length})</span></button>`
      ).join("");
      
      // 添加点击事件
      $$("#modalStatusChips .chip").forEach((btn) => {
        btn.addEventListener("click", (event) => {
          event.preventDefault();
          $$("#modalStatusChips .chip").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
        });
      });
    } else if (type === "subject") {
      modalHeader.textContent = "科目筛选";
      statusSection.style.display = "none";
      subjectSection.style.display = "block";
      yearSection.style.display = "none";
      
      const subjectCounts = countBySubject();
      const subjectChips = [["ALL", "全部科目"]];
      for (const [subject, count] of Object.entries(subjectCounts)) {
        subjectChips.push([subject, subject, count]);
      }
      
      const subjectEl = $("#modalSubjectChips");
      subjectEl.innerHTML = subjectChips.map(([key, label, cnt]) => 
        `<button class="chip ${appState.filter.subject === key ? 'active' : ''}" type="button" data-subject="${escapeHtml(key)}">${escapeHtml(label)} ${cnt ? `<span style="opacity:.85">(${cnt})</span>` : ''}</button>`
      ).join("");
      
      // 添加点击事件
      $$("#modalSubjectChips .chip").forEach((btn) => {
        btn.addEventListener("click", (event) => {
          event.preventDefault();
          $$("#modalSubjectChips .chip").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
        });
      });
    } else if (type === "year") {
      modalHeader.textContent = "年份筛选";
      statusSection.style.display = "none";
      subjectSection.style.display = "none";
      yearSection.style.display = "block";
      
      const yearChips = [
        ["ALL", "全部年份"],
        ["1", "最近一年"],
        ["3", "最近三年"]
      ];
      
      const yearEl = $("#modalYearChips");
      yearEl.innerHTML = yearChips.map(([key, label]) => 
        `<button class="chip ${appState.filter.year === key ? 'active' : ''}" type="button" data-year="${escapeHtml(key)}">${escapeHtml(label)}</button>`
      ).join("");
      
      // 添加点击事件
      $$("#modalYearChips .chip").forEach((btn) => {
        btn.addEventListener("click", (event) => {
          event.preventDefault();
          $$("#modalYearChips .chip").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
        });
      });
    }
  }

  function applyFilter() {
    if (currentFilterType === "status") {
      const statusChip = $$("#modalStatusChips .chip.active")[0];
      if (statusChip) {
        appState.filter.status = statusChip.getAttribute("data-status");
      }
    } else if (currentFilterType === "subject") {
      const subjectChip = $$("#modalSubjectChips .chip.active")[0];
      if (subjectChip) {
        appState.filter.subject = subjectChip.getAttribute("data-subject");
      }
    } else if (currentFilterType === "year") {
      const yearChip = $$("#modalYearChips .chip.active")[0];
      if (yearChip) {
        appState.filter.year = yearChip.getAttribute("data-year");
      }
    }
    
    saveState(appState);
    // 先关闭弹窗再重新渲染，确保弹窗不会被重新渲染影响
    closeFilterModal();
    renderAll();
  }

  function clearFilter() {
    appState.filter.status = "ALL";
    appState.filter.subject = "ALL";
    appState.filter.year = "ALL";
    saveState(appState);
  }

  // 导出功能相关函数
  function openExportModal() {
    const exportList = $("#exportList");
    
    // 根据筛选条件过滤错题
    let filteredQuestions = appState.wrongQuestions;
    
    // 状态筛选
    if (appState.filter.status !== "ALL") {
      if (appState.filter.status === "REVIEW") {
        filteredQuestions = filteredQuestions.filter(q => q.status === "REVIEW_PENDING" || q.status === "EXPLAINED");
      } else {
        filteredQuestions = filteredQuestions.filter(q => q.status === appState.filter.status);
      }
    }
    
    // 科目筛选
    if (appState.filter.subject !== "ALL") {
      filteredQuestions = filteredQuestions.filter(q => q.subject === appState.filter.subject);
    }
    
    // 年份筛选
    if (appState.filter.year !== "ALL") {
      const now = Date.now();
      const yearInMs = 365 * 24 * 60 * 60 * 1000;
      const years = parseInt(appState.filter.year);
      const cutoffTime = now - (years * yearInMs);
      filteredQuestions = filteredQuestions.filter(q => (q.created_at || 0) >= cutoffTime);
    }
    
    if (!filteredQuestions.length) {
      exportList.innerHTML = `<div class="tiny" style="padding: 24px; text-align: center;">暂无符合条件的错题</div>`;
    } else {
      const items = filteredQuestions.map((q) => {
        const kps = q.knowledge_points.slice(0, 2).join(" / ");
        return `
          <div class="export-item">
            <input type="checkbox" class="export-checkbox" data-id="${escapeHtml(q.id)}">
            <div class="export-item-content">
              <div class="export-item-title">${escapeHtml(q.subject)} · ${escapeHtml(kps || "未分类")}</div>
              <div class="export-item-meta">${escapeHtml(q.error_type)} · ${escapeHtml(q.source)}</div>
            </div>
          </div>
        `;
      }).join("");
      exportList.innerHTML = items;
      
      // 添加复选框点击事件
      $$(".export-checkbox").forEach((checkbox) => {
        checkbox.addEventListener("change", (event) => {
          const item = event.target.closest(".export-item");
          if (event.target.checked) {
            item.classList.add("selected");
          } else {
            item.classList.remove("selected");
          }
        });
      });
    }
    
    $("#exportModal").style.display = "flex";
  }

  function closeExportModal() {
    $("#exportModal").style.display = "none";
  }

  function exportSelectedQuestions() {
    const selectedCheckboxes = $$(".export-checkbox:checked");
    if (selectedCheckboxes.length === 0) {
      alert("请至少选择一道错题");
      return;
    }
    
    const selectedIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.getAttribute("data-id"));
    const selectedQuestions = appState.wrongQuestions.filter(q => selectedIds.includes(q.id));
    
    // 跳转到错题预览界面
    openExportPreview(selectedQuestions);
    closeExportModal();
  }

  function openExportPreview(questions) {
    if (!questions || questions.length === 0) {
      alert("没有可预览的错题");
      return;
    }

    // 分组：按科目
    const groups = new Map();
    for (const q of questions) {
      if (!groups.has(q.subject)) groups.set(q.subject, []);
      groups.get(q.subject).push(q);
    }

    const title = "错题本预览 - Web 原型";
    const html = `
      <!doctype html>
      <html lang="zh-CN">
        <head>
          <meta charset="utf-8"/>
          <title>${escapeHtml(title)}</title>
          <style>
            body{font-family:"PingFang SC","Heiti SC","Microsoft YaHei",sans-serif; margin:22px; color:#111;}
            h1{font-size:18px; margin:0 0 12px;}
            h2{font-size:14px; margin:18px 0 10px; border-bottom:1px solid #eee; padding-bottom:6px;}
            .card{border:1px solid #e8e8e8; border-radius:12px; padding:12px; margin:10px 0;}
            .meta{color:#666; font-size:12px; margin-bottom:8px;}
            .tag{display:inline-block; padding:3px 8px; border-radius:999px; background:#f5f7ff; border:1px solid #e6e9ff; margin-right:6px; font-size:12px;}
            .row{margin-top:10px; font-size:13px; white-space:pre-wrap; line-height:1.55;}
            img{max-width:100%; border-radius:10px; border:1px solid #eee;}
            .good{color:#0b7a2a}
            .bad{color:#b42318}
            .header-bar{display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding-bottom:10px; border-bottom:1px solid #eee;}
            .print-btn{padding:8px 16px; background:#4f46e5; color:white; border:none; border-radius:8px; cursor:pointer; font-size:14px;}
            .print-btn:hover{background:#4338ca;}
          </style>
        </head>
        <body>
          <div class="header-bar">
            <h1>${escapeHtml(title)}</h1>
            <button class="print-btn" onclick="window.print()">打印为PDF</button>
          </div>
          <div class="meta">生成时间：${escapeHtml(formatTime(now()))}（演示：数据来自浏览器本地存储）</div>
          ${Array.from(groups.entries())
            .map(([subject, qs]) => {
              const subjectHtml = `<h2>${escapeHtml(subject)}（共 ${qs.length} 条）</h2>`;
              const cards = qs
                .map((q) => {
                  const lastAnn = q.annotations && q.annotations.length ? q.annotations[q.annotations.length - 1] : null;
                  const lastReview = q.reviewSessions && q.reviewSessions.length ? q.reviewSessions[q.reviewSessions.length - 1] : null;
                  const masteryText = (q.mastery_level || 0) >= 5 ? "已掌握" : "未掌握";
                  return `
                    <div class="card">
                      <div class="meta">
                        <span class="tag">${escapeHtml(q.error_type)}</span>
                        <span class="tag">来源：${escapeHtml(q.source)}</span>
                        <span class="tag">掌握：<span class="${(q.mastery_level || 0) >= 5 ? "good" : "bad"}">${escapeHtml(masteryText)}</span></span>
                      </div>
                      <div class="row"><b>题目：</b>${escapeHtml(q.question_content || "")}</div>
                      <div class="row"><b>学生答案：</b>${escapeHtml(q.student_answer || "-")}</div>
                      <div class="row"><b>正确答案：</b>${escapeHtml(q.correct_answer || "")}</div>
                      <div class="row"><b>知识点：</b>${escapeHtml((q.knowledge_points || []).join(" / ") || "-")}</div>
                      ${lastAnn ? `
                        <div class="row" style="margin-top:12px;"><b>老师讲解：</b>${escapeHtml(lastAnn.text || "")}
                          ${lastAnn.steps ? `\n标准步骤：\n${escapeHtml(lastAnn.steps)}` : ""}
                        </div>
                      ` : `
                        <div class="row small" style="margin-top:12px; color:#777;">老师讲解：暂无</div>
                      `}
                      ${lastReview ? `
                        <div class="row" style="margin-top:10px;"><b>复习结论：</b>${escapeHtml(lastReview.mastery_decision === "mastered" ? "已掌握" : "未掌握")}（信心：${escapeHtml(String(lastReview.confidence_rating))}/5；系统：${lastReview.system_judgement ? "正确" : "错误"}）</div>
                      ` : ""}
                    </div>
                  `;
                })
                .join("");
              return subjectHtml + cards;
            })
            .join("")}
        </body>
      </html>
    `;

    const w = window.open("", "_blank");
    if (!w) return alert("浏览器阻止了弹窗，无法打开预览。请允许弹窗。");
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  function init() {
    if (!appState.activeWrongQuestionId && appState.wrongQuestions.length) {
      appState.activeWrongQuestionId = appState.wrongQuestions[0].id;
      saveState(appState);
    }
    
    // 先获取搜索框元素
    const searchInput = $(".search-input");
    
    // 绑定 Segmented Control 按钮
    $$("#panelSegmented .seg-btn").forEach((btn) => {
      const panel = btn.getAttribute("data-panel");
      btn.onclick = () => setPanel(panel);
    });
    
    // 绑定筛选弹窗相关事件
    $("#statusFilterBtn").onclick = () => {
      openFilterModal("status");
    };
    $("#subjectFilterBtn").onclick = () => {
      openFilterModal("subject");
    };
    $("#yearFilterBtn").onclick = () => {
      openFilterModal("year");
    };
    $("#closeFilterModal").onclick = () => {
      closeFilterModal();
    };
    $("#btnApplyFilter").onclick = () => {
      applyFilter();
    };
    $("#btnClearFilter").onclick = () => {
      if (currentFilterType === "status") {
        appState.filter.status = "ALL";
        saveState(appState);
        renderFilterModal(currentFilterType);
      } else if (currentFilterType === "subject") {
        appState.filter.subject = "ALL";
        saveState(appState);
        renderFilterModal(currentFilterType);
      } else if (currentFilterType === "year") {
        appState.filter.year = "ALL";
        saveState(appState);
        renderFilterModal(currentFilterType);
      }
    };
    
    // 绑定搜索框输入事件
    if (searchInput) {
      searchInput.value = appState.searchKeyword || "";
      searchInput.addEventListener("input", (e) => {
        setSearchKeyword(e.target.value);
      });
    }
    
    renderAll();
  }

  init();
})();

