/**
 * Hand-off channel between the search dialog / chapter modal / home page and
 * the solver, plus the practice page. A module variable is enough — it never
 * needs to survive a reload — and the subscription lets an already-mounted
 * solver react immediately.
 */
type Listener = (value: string) => void;

let pendingProblem: string | null = null;
const problemListeners = new Set<Listener>();

export function setPendingProblem(value: string): void {
  pendingProblem = value;
  problemListeners.forEach((listener) => listener(value));
}

export function takePendingProblem(): string | null {
  const value = pendingProblem;
  pendingProblem = null;
  return value;
}

export function subscribePendingProblem(listener: Listener): () => void {
  problemListeners.add(listener);
  return () => {
    problemListeners.delete(listener);
  };
}

let pendingPracticeTopic: string | null = null;

export function setPendingPractice(topic: string): void {
  pendingPracticeTopic = topic;
}

export function takePendingPractice(): string | null {
  const value = pendingPracticeTopic;
  pendingPracticeTopic = null;
  return value;
}
