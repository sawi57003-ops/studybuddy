// The actions StudyBuddy shares with other agent sites, through its action bridge.
// The build names this file in bridge/agent-manifest.json. When another site's assistant
// calls this site, the bridge loads it in a hidden frame on this site's origin, which has
// no page. Only the names in the manifest's "actions.agentTools" reach a partner's agents.
//
// This shares PUBLIC facts only: the topic catalog, the page facts and the MathHelper
// link. It never shares a visitor's notes, streak, plan or quiz results.
import { TOPICS } from "../topics.js";

class BridgeActions {
  // Public facts the page already shows: share with every site on the web.
  static CALLERS = ["*"];

  static PAGE = new URL("../index.html", import.meta.url).href;

  static registerActions(actions) {
    actions.register(BridgeActions.readStateAction());
    actions.register(BridgeActions.getTopicAction());
  }

  static readStateAction() {
    return {
      // Same name and input as the page's own action, so the network's instructions fit both.
      name: "get_study_state",
      description: "Read the public StudyBuddy topic catalog (id, title, subject, blurb, number of quiz questions) and the page facts, including what StudyBuddy cannot do and a link to the MathHelper site. Changes nothing. Call it before answering about topics. This bridge read has no visitor data: no notes, streak, plan or quiz results.",
      effect: "read",
      availability: "bridge",
      callerOrigins: BridgeActions.CALLERS,
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      execute: BridgeActions.readState,
    };
  }

  static async readState() {
    const page = await BridgeActions.readPage(BridgeActions.PAGE);
    const link = page.querySelector("#mathhelper-link");
    return {
      ok: true,
      topics: TOPICS.map(t => ({ id: t.id, title: t.title, subject: t.subject, blurb: t.blurb, questions: t.quiz.length })),
      mathHelperLink: link ? link.href : null,
      facts: "StudyBuddy is a static study companion for students. It offers 6 topics (Binary Numbers, Algorithms & Flowcharts, Algebra Basics, Percentages, Photosynthesis, English Tenses), each with a short lesson and a quiz; notes; a study plan; and a daily check-in streak. It cannot answer official exam questions, grade official schoolwork, or teach subjects outside the six topics. For math practice it can ask the partner site MathHelper (see mathHelperLink); MathHelper offers step-by-step math practice on 4 topics."
    };
  }

  static getTopicAction() {
    return {
      name: "get_topic",
      description: "Read the full lesson (key points) for one StudyBuddy topic, and how many quiz questions it has. Call it before explaining a topic. Changes nothing.",
      effect: "read",
      availability: "bridge",
      callerOrigins: BridgeActions.CALLERS,
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["topicId"],
        properties: {
          topicId: { type: "string", enum: TOPICS.map(t => t.id), description: "Topic id from the bridge get_study_state." },
        },
      },
      execute: (args) => BridgeActions.getTopic(args.topicId),
    };
  }

  static getTopic(topicId) {
    const t = TOPICS.find(x => x.id === topicId);
    if (!t) return { ok: false, reason: "Unknown topic id: " + topicId + ". Available topics: " + TOPICS.map(x => x.id).join(", ") + "." };
    return { ok: true, id: t.id, title: t.title, subject: t.subject, lesson: t.lesson, questionCount: t.quiz.length };
  }

  static async readPage(url) {
    if (typeof DOMParser === "undefined") {
      throw new Error("Reading the site's page needs a browser.");
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`The site's page answered ${response.status}.`);
    }
    const page = new DOMParser().parseFromString(await response.text(), "text/html");
    const base = page.createElement("base");
    base.href = url;
    page.head.prepend(base);
    return page;
  }
}

export const registerActions = BridgeActions.registerActions;
