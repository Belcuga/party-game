import { Question } from '../types/question';
import { localQuestions, nextQuestionId, nowIso } from './localQuestionsStore';
import { NhieStatement } from '../types/nhieStatement';
import { localNhieStatements } from './localNhieStore';
import { MostLikelyStatement } from '../types/mostLikelyStatement';
import { localMostLikelyStatements } from './localMostLikelyStore';
import { TruthDarePrompt } from '../types/truthDarePrompt';
import { localTruthDarePrompts } from './localTruthDareStore';
import { CategoryPrompt } from '../types/categoryPrompt';
import { localCategoryPrompts } from './localCategoryStore';
import { Feedback } from '../types/feedback';
import { localFeedback } from './localFeedbackStore';
import { QuestionSuggestion } from '../types/questionSuggestion';
import { localQuestionSuggestions } from './localQuestionSuggestionsStore';
import { RouletteEffect } from '../types/rouletteEffect';
import { localRouletteEffects } from './localRouletteEffectsStore';
import { GameMessage } from '../types/gameMessage';
import { localGameMessages } from './localGameMessagesStore';
import { WastedPrompt } from '../types/wastedPrompt';
import { localWastedPrompts } from './localWastedPromptsStore';
import { WingmanPrompt } from '../types/wingmanPrompt';
import { localWingmanPrompts } from './localWingmanPromptsStore';
import { BondingQuestion } from '../types/bondingQuestion';
import { localBondingQuestions } from './localBondingQuestionsStore';

// Persists each mock table to localStorage so admin edits and user feedback survive a
// page refresh on the same browser (there's no real backend behind this local mock).
const STORAGE_PREFIX = 'tipsyMock:';

function hydrateFromStorage<T>(key: string, store: T[]) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw === null) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      store.length = 0;
      store.push(...parsed);
    }
  } catch (error) {
    console.error(`Failed to load persisted "${key}" from localStorage:`, error);
  }
}

function persistToStorage<T>(key: string, store: T[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(store));
  } catch (error) {
    console.error(`Failed to persist "${key}" to localStorage:`, error);
  }
}

hydrateFromStorage('questions', localQuestions);

type Result = { data: Question[] | null; error: { message: string } | null };

class MockQuestionsQuery implements PromiseLike<Result> {
  private op: 'select' | 'delete' | 'update' | 'insert' = 'select';
  private orders: { column: keyof Question; ascending: boolean }[] = [];
  private rangeFrom = 0;
  private rangeTo = Infinity;
  private eqColumn: keyof Question | null = null;
  private eqValue: unknown = null;
  private updatePayload: Partial<Question> | null = null;
  private insertPayload: Partial<Question>[] | null = null;

  select() {
    this.op = 'select';
    return this;
  }

  delete() {
    this.op = 'delete';
    return this;
  }

  update(payload: Partial<Question>) {
    this.op = 'update';
    this.updatePayload = payload;
    return this;
  }

  insert(payload: Partial<Question>[]) {
    this.op = 'insert';
    this.insertPayload = payload;
    return this;
  }

  range(from: number, to: number) {
    this.rangeFrom = from;
    this.rangeTo = to;
    return this;
  }

  order(column: keyof Question, opts: { ascending: boolean }) {
    this.orders.push({ column, ascending: opts.ascending });
    return this;
  }

  eq(column: keyof Question, value: unknown) {
    this.eqColumn = column;
    this.eqValue = value;
    return this;
  }

  private execute(): Result {
    if (this.op === 'select') {
      let rows = [...localQuestions];
      for (const { column, ascending } of this.orders) {
        rows.sort((a, b) => {
          const av = a[column] as unknown;
          const bv = b[column] as unknown;
          if (av === bv) return 0;
          if (av === null || av === undefined) return ascending ? -1 : 1;
          if (bv === null || bv === undefined) return ascending ? 1 : -1;
          return (av < bv ? -1 : 1) * (ascending ? 1 : -1);
        });
      }
      rows = rows.slice(this.rangeFrom, this.rangeTo + 1);
      return { data: rows, error: null };
    }

    if (this.op === 'delete') {
      const idx = localQuestions.findIndex((q) => q[this.eqColumn as keyof Question] === this.eqValue);
      if (idx !== -1) localQuestions.splice(idx, 1);
      persistToStorage('questions', localQuestions);
      return { data: null, error: null };
    }

    if (this.op === 'update') {
      const idx = localQuestions.findIndex((q) => q[this.eqColumn as keyof Question] === this.eqValue);
      if (idx !== -1 && this.updatePayload) {
        localQuestions[idx] = { ...localQuestions[idx], ...this.updatePayload };
      }
      persistToStorage('questions', localQuestions);
      return { data: null, error: null };
    }

    if (this.op === 'insert' && this.insertPayload) {
      for (const partial of this.insertPayload) {
        localQuestions.push({
          id: nextQuestionId(),
          created_at: nowIso(),
          question: '',
          dirty: false,
          challenge: false,
          punishment: 1,
          like_count: 0,
          dislike_count: 0,
          difficulty: 1,
          all_players: false,
          need_opposite_gender: false,
          ...partial,
        });
      }
      persistToStorage('questions', localQuestions);
      return { data: null, error: null };
    }

    return { data: null, error: { message: 'Unsupported operation in local mock' } };
  }

  then<TResult1 = Result, TResult2 = never>(
    onfulfilled?: ((value: Result) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected);
  }
}

/** Generic mock for tables that only need select/update/order/range/eq
 *  (the "statement pool" shape shared by Never Have I Ever, Most Likely To, ...). */
function createSimpleMockQuery<T extends { id: number }>(store: T[], storageKey: string) {
  hydrateFromStorage(storageKey, store);

  type SimpleResult = { data: T[] | null; error: { message: string } | null };

  return class SimpleMockQuery implements PromiseLike<SimpleResult> {
    private op: 'select' | 'update' | 'insert' | 'delete' = 'select';
    private orders: { column: keyof T; ascending: boolean }[] = [];
    private rangeFrom = 0;
    private rangeTo = Infinity;
    private eqColumn: keyof T | null = null;
    private eqValue: unknown = null;
    private updatePayload: Partial<T> | null = null;
    private insertPayload: Omit<T, 'id'>[] | null = null;

    select() {
      this.op = 'select';
      return this;
    }

    update(payload: Partial<T>) {
      this.op = 'update';
      this.updatePayload = payload;
      return this;
    }

    insert(payload: Omit<T, 'id'> | Omit<T, 'id'>[]) {
      this.op = 'insert';
      this.insertPayload = Array.isArray(payload) ? payload : [payload];
      return this;
    }

    delete() {
      this.op = 'delete';
      return this;
    }

    range(from: number, to: number) {
      this.rangeFrom = from;
      this.rangeTo = to;
      return this;
    }

    order(column: keyof T, opts: { ascending: boolean }) {
      this.orders.push({ column, ascending: opts.ascending });
      return this;
    }

    eq(column: keyof T, value: unknown) {
      this.eqColumn = column;
      this.eqValue = value;
      return this;
    }

    private execute(): SimpleResult {
      if (this.op === 'select') {
        let rows = [...store];
        for (const { column, ascending } of this.orders) {
          rows.sort((a, b) => {
            const av = a[column] as unknown;
            const bv = b[column] as unknown;
            if (av === bv) return 0;
            if (av === null || av === undefined) return ascending ? -1 : 1;
            if (bv === null || bv === undefined) return ascending ? 1 : -1;
            return (av < bv ? -1 : 1) * (ascending ? 1 : -1);
          });
        }
        rows = rows.slice(this.rangeFrom, this.rangeTo + 1);
        return { data: rows, error: null };
      }

      if (this.op === 'update') {
        const idx = store.findIndex((s) => s[this.eqColumn as keyof T] === this.eqValue);
        if (idx !== -1 && this.updatePayload) {
          store[idx] = { ...store[idx], ...this.updatePayload };
        }
        persistToStorage(storageKey, store);
        return { data: null, error: null };
      }

      if (this.op === 'insert' && this.insertPayload) {
        for (const row of this.insertPayload) {
          const nextId = store.length ? Math.max(...store.map((s) => s.id)) + 1 : 1;
          store.push({ ...(row as object), id: nextId } as T);
        }
        persistToStorage(storageKey, store);
        return { data: null, error: null };
      }

      if (this.op === 'delete') {
        const idx = store.findIndex((s) => s[this.eqColumn as keyof T] === this.eqValue);
        if (idx !== -1) store.splice(idx, 1);
        persistToStorage(storageKey, store);
        return { data: null, error: null };
      }

      return { data: null, error: { message: 'Unsupported operation in local mock' } };
    }

    then<TResult1 = SimpleResult, TResult2 = never>(
      onfulfilled?: ((value: SimpleResult) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
    ): PromiseLike<TResult1 | TResult2> {
      return Promise.resolve(this.execute()).then(onfulfilled, onrejected);
    }
  };
}

const MockNhieQuery = createSimpleMockQuery<NhieStatement>(localNhieStatements, 'nhie_statements');
const MockMostLikelyQuery = createSimpleMockQuery<MostLikelyStatement>(localMostLikelyStatements, 'most_likely_statements');
const MockTruthDareQuery = createSimpleMockQuery<TruthDarePrompt>(localTruthDarePrompts, 'truth_dare_prompts');
const MockCategoryQuery = createSimpleMockQuery<CategoryPrompt>(localCategoryPrompts, 'category_prompts');
const MockFeedbackQuery = createSimpleMockQuery<Feedback>(localFeedback, 'feedback');
const MockQuestionSuggestionQuery = createSimpleMockQuery<QuestionSuggestion>(localQuestionSuggestions, 'question_suggestions');
const MockRouletteEffectQuery = createSimpleMockQuery<RouletteEffect>(localRouletteEffects, 'roulette_effects');
const MockGameMessageQuery = createSimpleMockQuery<GameMessage>(localGameMessages, 'game_messages');
const MockWastedPromptQuery = createSimpleMockQuery<WastedPrompt>(localWastedPrompts, 'wasted_prompts');
const MockWingmanPromptQuery = createSimpleMockQuery<WingmanPrompt>(localWingmanPrompts, 'wingman_prompts');
const MockBondingQuestionQuery = createSimpleMockQuery<BondingQuestion>(localBondingQuestions, 'bonding_questions');

export const localSupabase = {
  from(table: string) {
    if (table === 'questions') return new MockQuestionsQuery();
    if (table === 'nhie_statements') return new MockNhieQuery();
    if (table === 'most_likely_statements') return new MockMostLikelyQuery();
    if (table === 'truth_dare_prompts') return new MockTruthDareQuery();
    if (table === 'category_prompts') return new MockCategoryQuery();
    if (table === 'feedback') return new MockFeedbackQuery();
    if (table === 'question_suggestions') return new MockQuestionSuggestionQuery();
    if (table === 'roulette_effects') return new MockRouletteEffectQuery();
    if (table === 'game_messages') return new MockGameMessageQuery();
    if (table === 'wasted_prompts') return new MockWastedPromptQuery();
    if (table === 'wingman_prompts') return new MockWingmanPromptQuery();
    if (table === 'bonding_questions') return new MockBondingQuestionQuery();
    throw new Error(`Local Supabase mock does not support table "${table}"`);
  },
};
