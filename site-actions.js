// Registers StudyBuddy's operations with the agent runtime.
// agent-manifest.json loads this module through "actions.module". Only the names in
// "actions.agentTools" become model tools, called website_<name>.
//
// Operations return {ok: false, reason} when they refuse input, before changing
// anything, and throw only on unexpected failures. A throw is reported as "unknown".
// Import the page script by the same URL the page uses (no ?v= query), or the actions
// get a second, separate copy of the page state.
import { App } from "./script.js";

// Topic ids, built from the real catalog so the model cannot invent a topic.
const TOPIC_IDS = App.page.getState().topics.map(t => t.id);

class SiteActions {
  static registerActions(actions) {
    actions.register(SiteActions.getStudyStateAction());
    actions.register(SiteActions.getTopicAction());
    actions.register(SiteActions.startQuizAction());
    actions.register(SiteActions.answerQuizAction());
    actions.register(SiteActions.addNoteAction());
    actions.register(SiteActions.deleteNoteAction());
    actions.register(SiteActions.createPlanAction());
    actions.register(SiteActions.checkInAction());
  }

  static getStudyStateAction() {
    return {
      name: "get_study_state",
      description: "Read the actual study topics, the visitor's streak and check-in status, their notes, their study plan, the latest quiz result and the current quiz on this page. Call it before answering about topics, streak, notes, plans or quiz results, and again in each turn that needs it: the visitor can also use the page. Returns the page facts too, including what StudyBuddy cannot do and a link to the MathHelper site.",
      effect: "read",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      execute: () => App.page.getState(),
    };
  }

  static getTopicAction() {
    return {
      name: "get_topic",
      description: "Read the full lesson (key points) for one topic, and how many quiz questions it has. Call it before explaining a topic or starting its quiz, and again in each turn that needs it. Does not start a quiz.",
      effect: "read",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["topicId"],
        properties: {
          topicId: { type: "string", enum: TOPIC_IDS, description: "Topic id from website_get_study_state." },
        },
      },
      execute: (args) => App.page.getTopic(args.topicId),
    };
  }

  static startQuizAction() {
    return {
      name: "start_quiz",
      description: "Start a quiz on one topic. Call it only when the visitor asks for a quiz. It shows the quiz questions on the page. Returns the topic and the number of questions. Does not answer or score anything; use website_answer_quiz after the visitor gives their answers.",
      effect: "write",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["topicId"],
        properties: {
          topicId: { type: "string", enum: TOPIC_IDS, description: "Topic id from website_get_study_state." },
        },
      },
      execute: (args) => App.page.startQuiz(args.topicId),
    };
  }

  static answerQuizAction() {
    return {
      name: "answer_quiz",
      description: "Score the answers for the quiz that is currently running. Call it only when the visitor asks, after they give their answers, with one answer index (0-3) per question, in order. In the same turn, first call website_get_study_state to confirm a quiz is running and how many questions it has. Returns the score, which answers were right or wrong, and the explanation for each. Also counts as a daily check-in. The visitor can retake the quiz afterwards.",
      effect: "write",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["answers"],
        properties: {
          answers: {
            type: "array",
            minItems: 1,
            maxItems: 10,
            items: { type: "integer", minimum: 0, maximum: 3 },
            description: "One answer index (0-3) per question, in the order the quiz shows them. The index is the position of the option: 0 is the first option.",
          },
        },
      },
      execute: (args) => App.page.answerQuiz(args.answers),
    };
  }

  static addNoteAction() {
    return {
      name: "add_note",
      description: "Save a short note for the visitor. Call it only when the visitor asks to save a note. The note shows in the notes list on the page. Max 280 characters.",
      effect: "write",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["text"],
        properties: {
          text: { type: "string", minLength: 1, maxLength: 280, description: "The note text the visitor gave." },
        },
      },
      execute: (args) => App.page.addNote(args.text),
    };
  }

  static deleteNoteAction() {
    return {
      name: "delete_note",
      description: "Delete one note by its id. The browser asks the visitor to confirm first. In the turn you call it, first call website_get_study_state and wait for its result to get the note's id. The deletion cannot be undone.",
      effect: "irreversible",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["id"],
        properties: {
          id: { type: "integer", description: "The note id from website_get_study_state." },
        },
      },
      execute: (args) => App.page.deleteNote(args.id),
    };
  }

  static createPlanAction() {
    return {
      name: "create_plan",
      description: "Create a study plan for one topic: how many sessions per week and how many minutes per session. Call it only when the visitor asks for a plan. Replaces any existing plan. Returns the plan.",
      effect: "write",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["topicId", "sessionsPerWeek", "minutesPerSession"],
        properties: {
          topicId: { type: "string", enum: TOPIC_IDS, description: "Topic id from website_get_study_state." },
          sessionsPerWeek: { type: "integer", minimum: 1, maximum: 7, description: "Sessions per week, 1 to 7." },
          minutesPerSession: { type: "integer", minimum: 10, maximum: 180, description: "Minutes per session, 10 to 180." },
        },
      },
      execute: (args) => App.page.createPlan(args.topicId, args.sessionsPerWeek, args.minutesPerSession),
    };
  }

  static checkInAction() {
    return {
      name: "check_in",
      description: "Mark today as a study day and update the streak. Call it only when the visitor asks, when they say they studied today. If they already checked in today, the streak stays the same. Answering a quiz also counts as a check-in.",
      effect: "write",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      execute: () => App.page.checkIn(),
    };
  }
}

export const registerActions = SiteActions.registerActions;
