// StudyBuddy — plain study companion (no agent yet).
// Data + state + operations. The page script is a module that exports App.page
// with a state reader and one method per operation; the page's own buttons call
// the same methods. Operations refuse bad input with {ok:false, reason}.

import { TOPICS } from "./topics.js";

const STORE_KEY = "studybuddy-v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      return { notes: s.notes || [], streak: s.streak || 0, lastCheckin: s.lastCheckin || null, quizResults: s.quizResults || [], plan: s.plan || null, currentQuiz: null };
    }
  } catch (e) { /* corrupted storage: start fresh */ }
  return { notes: [], streak: 0, lastCheckin: null, quizResults: [], plan: null, currentQuiz: null };
}
function saveState(s) {
  try {
    const { currentQuiz, ...persist } = s;
    localStorage.setItem(STORE_KEY, JSON.stringify(persist));
  } catch (e) { /* storage unavailable (e.g. Node tests, private mode): state stays in memory */ }
}
function todayStr() { return new Date().toISOString().slice(0, 10); }
function yesterdayStr() { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); }

const state = loadState();
let selectedTopicId = null;

export const App = {};
App.page = {
  getState() {
    let mathHelperLink = null;
    try {
      const a = document.querySelector("#mathhelper-link");
      if (a) mathHelperLink = a.href;
    } catch (e) { /* no DOM (tests): link omitted */ }
    return {
      ok: true,
      topics: TOPICS.map(t => ({ id: t.id, title: t.title, subject: t.subject, blurb: t.blurb, questions: t.quiz.length })),
      streak: state.streak,
      lastCheckin: state.lastCheckin,
      checkedInToday: state.lastCheckin === todayStr(),
      notesCount: state.notes.length,
      notes: state.notes,
      plan: state.plan,
      latestQuizResult: state.quizResults.length ? state.quizResults[state.quizResults.length - 1] : null,
      quizCount: state.quizResults.length,
      currentQuiz: state.currentQuiz ? { topicId: state.currentQuiz.topicId, title: state.currentQuiz.title, total: state.currentQuiz.questions.length } : null,
      mathHelperLink,
      facts: "StudyBuddy is a static study companion for students. It offers 6 topics (Binary Numbers, Algorithms & Flowcharts, Algebra Basics, Percentages, Photosynthesis, English Tenses), each with a short lesson and a quiz; notes; a study plan; and a daily check-in streak. It cannot answer official exam questions, grade official schoolwork, or teach subjects outside the six topics. For math practice it can ask the partner site MathHelper (see mathHelperLink); MathHelper offers step-by-step math practice on 4 topics."
    };
  },
  getTopic(topicId) {
    const t = TOPICS.find(x => x.id === topicId);
    if (!t) return { ok: false, reason: "Unknown topic id: " + topicId + ". Available topics: " + TOPICS.map(x => x.id).join(", ") + "." };
    return { ok: true, id: t.id, title: t.title, subject: t.subject, lesson: t.lesson, questionCount: t.quiz.length };
  },
  startQuiz(topicId) {
    const t = TOPICS.find(x => x.id === topicId);
    if (!t) return { ok: false, reason: "Unknown topic id: " + topicId + "." };
    state.currentQuiz = { topicId: t.id, title: t.title, questions: t.quiz.map(q => ({ q: q.q, options: q.options })) };
    renderQuiz();
    return { ok: true, topicId: t.id, title: t.title, total: t.quiz.length, message: "Quiz started on " + t.title + " (" + t.quiz.length + " questions). Answer all questions, then submit." };
  },
  answerQuiz(answers) {
    if (!state.currentQuiz) return { ok: false, reason: "No quiz is running. Start a quiz first." };
    if (!Array.isArray(answers) || answers.length !== state.currentQuiz.questions.length) {
      return { ok: false, reason: "Please answer all " + state.currentQuiz.questions.length + " questions." };
    }
    const t = TOPICS.find(x => x.id === state.currentQuiz.topicId);
    let score = 0;
    const detail = t.quiz.map((q, i) => {
      const chosen = answers[i];
      const correct = chosen === q.answer;
      if (correct) score++;
      return { question: q.q, chosen: q.options[chosen] ?? null, correctAnswer: q.options[q.answer], correct, explain: q.explain };
    });
    const result = { topicId: t.id, title: t.title, score, total: t.quiz.length, at: new Date().toISOString(), detail };
    state.quizResults.push(result);
    state.currentQuiz = null;
    this.checkIn();
    saveState(state);
    renderAll();
    return { ok: true, ...result, message: "You scored " + score + " out of " + t.quiz.length + " on " + t.title + ". Your streak is now " + state.streak + " day(s)." };
  },
  abandonQuiz() {
    if (!state.currentQuiz) return { ok: false, reason: "No quiz is running." };
    const title = state.currentQuiz.title;
    state.currentQuiz = null;
    renderQuiz();
    return { ok: true, message: "Quiz on " + title + " abandoned. Nothing was scored." };
  },
  addNote(text) {
    if (typeof text !== "string" || !text.trim()) return { ok: false, reason: "Note text is empty." };
    if (text.trim().length > 280) return { ok: false, reason: "Note is too long (max 280 characters)." };
    const note = { id: Date.now(), text: text.trim(), at: new Date().toISOString() };
    state.notes.push(note);
    saveState(state);
    renderNotes();
    return { ok: true, note, message: "Note saved." };
  },
  deleteNote(id) {
    const idx = state.notes.findIndex(n => n.id === Number(id));
    if (idx === -1) return { ok: false, reason: "No note with that id." };
    const removed = state.notes.splice(idx, 1)[0];
    saveState(state);
    renderNotes();
    return { ok: true, message: "Note deleted: \"" + removed.text + "\"" };
  },
  createPlan(topicId, sessionsPerWeek, minutesPerSession) {
    const t = TOPICS.find(x => x.id === topicId);
    if (!t) return { ok: false, reason: "Unknown topic id: " + topicId + "." };
    const s = Number(sessionsPerWeek), m = Number(minutesPerSession);
    if (!Number.isInteger(s) || s < 1 || s > 7) return { ok: false, reason: "Sessions per week must be a whole number from 1 to 7." };
    if (!Number.isInteger(m) || m < 10 || m > 180) return { ok: false, reason: "Minutes per session must be a whole number from 10 to 180." };
    state.plan = { topicId: t.id, title: t.title, sessionsPerWeek: s, minutesPerSession: m, createdAt: new Date().toISOString() };
    saveState(state);
    renderPlan();
    return { ok: true, plan: state.plan, message: "Plan created: " + t.title + ", " + s + " session(s) per week, " + m + " minutes each." };
  },
  checkIn() {
    const today = todayStr();
    if (state.lastCheckin === today) return { ok: true, streak: state.streak, already: true, message: "Already checked in today. Streak stays at " + state.streak + " day(s)." };
    state.streak = state.lastCheckin === yesterdayStr() ? state.streak + 1 : 1;
    state.lastCheckin = today;
    saveState(state);
    renderStreak();
    return { ok: true, streak: state.streak, already: false, message: "Checked in! Streak is now " + state.streak + " day(s)." };
  },
  getLatestResult() {
    if (!state.quizResults.length) return { ok: false, reason: "No quiz taken yet." };
    return { ok: true, result: state.quizResults[state.quizResults.length - 1] };
  }
};

// ---- UI rendering (page's own buttons call the same App.page methods) ----
const $ = id => document.getElementById(id);

function renderTopics() {
  const grid = $("topic-grid");
  grid.innerHTML = "";
  TOPICS.forEach(t => {
    const card = document.createElement("div");
    card.className = "topic-card";
    card.innerHTML = "<h3>" + t.title + "</h3><p>" + t.blurb + "</p><div class='meta'>" + t.subject + " · " + t.quiz.length + " quiz questions</div>";
    card.addEventListener("click", () => showLesson(t.id));
    grid.appendChild(card);
  });
  const sel = $("plan-topic");
  sel.innerHTML = TOPICS.map(t => "<option value='" + t.id + "'>" + t.title + "</option>").join("");
}
function showLesson(topicId) {
  const t = TOPICS.find(x => x.id === topicId);
  if (!t) return;
  selectedTopicId = topicId;
  $("lesson-title").textContent = t.title + " (" + t.subject + ")";
  $("lesson-body").innerHTML = "<ul>" + t.lesson.map(p => "<li>" + p + "</li>").join("") + "</ul>";
  $("lesson").hidden = false;
  $("lesson").scrollIntoView({ behavior: "smooth" });
}
function renderQuiz() {
  const sec = $("quiz");
  if (!state.currentQuiz) { sec.hidden = true; $("quiz-form").innerHTML = ""; $("quiz-result").innerHTML = ""; return; }
  sec.hidden = false;
  $("quiz-title").textContent = "Quiz: " + state.currentQuiz.title;
  $("quiz-form").innerHTML = state.currentQuiz.questions.map((q, i) =>
    "<div class='quiz-q'><p>" + (i + 1) + ". " + q.q + "</p>" +
    q.options.map((o, j) => "<label><input type='radio' name='q" + i + "' value='" + j + "'> " + o + "</label>").join("") +
    "</div>").join("");
  $("quiz-result").innerHTML = "";
}
function renderStreak() {
  $("streak-count").textContent = state.streak;
  $("streak-status").textContent = state.lastCheckin === todayStr() ? "checked in today ✓" : (state.lastCheckin ? "last check-in " + state.lastCheckin : "no check-in today yet");
}
function renderNotes() {
  const ul = $("note-list");
  ul.innerHTML = "";
  state.notes.forEach(n => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = n.text;
    li.appendChild(span);
    const del = document.createElement("button");
    del.className = "del";
    del.textContent = "Delete";
    del.addEventListener("click", () => App.page.deleteNote(n.id));
    li.appendChild(del);
    ul.appendChild(li);
  });
}
function renderPlan() {
  const d = $("plan-display");
  if (!state.plan) { d.innerHTML = "<p>No plan yet.</p>"; return; }
  d.innerHTML = "<p><strong>" + state.plan.title + "</strong> — " + state.plan.sessionsPerWeek + " session(s) per week, " + state.plan.minutesPerSession + " minutes each. Created " + state.plan.createdAt.slice(0, 10) + ".</p>";
}
function renderLatest() {
  const d = $("latest-result");
  if (!state.quizResults.length) { d.innerHTML = "<p>No quiz taken yet.</p>"; return; }
  const r = state.quizResults[state.quizResults.length - 1];
  d.innerHTML = "<p><strong>" + r.title + "</strong>: " + r.score + " / " + r.total + " (" + r.at.slice(0, 10) + ")</p>";
}
function renderAll() { renderStreak(); renderNotes(); renderPlan(); renderLatest(); renderQuiz(); }

$("start-quiz-btn").addEventListener("click", () => { if (selectedTopicId) App.page.startQuiz(selectedTopicId); });
$("close-lesson-btn").addEventListener("click", () => { $("lesson").hidden = true; });
$("abandon-quiz-btn").addEventListener("click", () => App.page.abandonQuiz());
$("submit-quiz-btn").addEventListener("click", () => {
  if (!state.currentQuiz) return;
  const answers = state.currentQuiz.questions.map((_, i) => {
    const sel = document.querySelector("input[name='q" + i + "']:checked");
    return sel ? Number(sel.value) : -1;
  });
  if (answers.some(a => a === -1)) { $("quiz-result").innerHTML = "<p class='wrong'>Please answer all questions first.</p>"; return; }
  const res = App.page.answerQuiz(answers);
  if (res.ok) {
    $("quiz-result").innerHTML = "<p><strong>You scored " + res.score + " / " + res.total + ".</strong></p>" +
      res.detail.map((d, i) => "<p>" + (i + 1) + ". " + d.question + "<br><span class='" + (d.correct ? "correct" : "wrong") + "'>" + (d.correct ? "Correct" : "Wrong — correct answer: " + d.correctAnswer) + "</span><br><span class='explain'>" + d.explain + "</span></p>").join("");
    $("quiz-form").innerHTML = "";
  }
});
$("note-form").addEventListener("submit", e => {
  e.preventDefault();
  const res = App.page.addNote($("note-text").value);
  if (res.ok) $("note-text").value = "";
});
$("plan-form").addEventListener("submit", e => {
  e.preventDefault();
  App.page.createPlan($("plan-topic").value, $("plan-sessions").value, $("plan-minutes").value);
});
$("checkin-btn").addEventListener("click", () => {
  const res = App.page.checkIn();
  $("checkin-msg").textContent = res.message;
});

renderTopics();
renderAll();
