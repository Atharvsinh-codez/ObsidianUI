"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { useDashboard } from "./context";
import type { AnalyticsPullRequest } from "./data";
import { ArrowUpIcon, ClaudeIcon, DraftIcon, ImageIcon, PanelIcon, PullRequestIcon, TriangleIcon } from "./icons";
import { PersonAvatar } from "./ui";

export type Phase = "in" | "out" | "pre";

type Message = { id: number; role: "user" | "assistant"; text: string; pending?: boolean };

type Props = {
  pr: AnalyticsPullRequest;
  phase: Phase;
  /** Slide-over state below the desktop breakpoint. */
  open: boolean;
  /** Whether the panel is on screen in the current layout. */
  visible: boolean;
  panelRef: RefObject<HTMLElement | null>;
  hideRef: RefObject<HTMLButtonElement | null>;
  onHide: () => void;
};

const STATUS_ICON = { merged: PullRequestIcon, review: DraftIcon, open: PullRequestIcon } as const;

export function PrDetails({ pr, phase, open, visible, panelRef, hideRef, onHide }: Props) {
  const { uid, assistantName, answer } = useDashboard();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [threads, setThreads] = useState<Record<number, Message[]>>({});
  const nextId = useRef(1);
  const timers = useRef<number[]>([]);
  const mounted = useRef(true);
  const messages = threads[pr.number] ?? [];

  useEffect(() => {
    mounted.current = true;
    const pending = timers.current;
    return () => {
      mounted.current = false;
      pending.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  function scrollToEnd() {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
  }

  function resolve(prNumber: number, botId: number, text: string) {
    if (!mounted.current) return;
    setThreads((t) => ({
      ...t,
      [prNumber]: (t[prNumber] ?? []).map((m) => (m.id === botId ? { ...m, pending: false, text } : m)),
    }));
    scrollToEnd();
  }

  function ask(question: string) {
    const target = pr;
    const userId = nextId.current++;
    const botId = nextId.current++;
    setThreads((t) => ({
      ...t,
      [target.number]: [
        ...(t[target.number] ?? []),
        { id: userId, role: "user", text: question },
        { id: botId, role: "assistant", text: "", pending: true },
      ],
    }));
    scrollToEnd();
    if (answer) {
      Promise.resolve()
        .then(() => answer(question, target))
        .then(
          (text) => resolve(target.number, botId, text),
          () => resolve(target.number, botId, "Something went wrong while answering. Try again."),
        );
      return;
    }
    timers.current.push(window.setTimeout(() => resolve(target.number, botId, answerFor(target)), 1400));
  }

  function onScroll() {
    const el = scrollRef.current;
    if (el) el.dataset.scrolled = String(el.scrollTop > 4);
  }

  const StatusIcon = STATUS_ICON[pr.status.kind];
  const panelId = `${uid}-details`;
  const titleId = `${uid}-details-title`;

  return (
    <aside ref={panelRef} id={panelId} className="details" data-open={open} inert={!visible} aria-labelledby={titleId}>
      <header className="details-bar enter" style={{ "--i": 1 } as CSSProperties}>
        <button
          ref={hideRef}
          type="button"
          className="icon-btn press has-tip tip-below details-hide"
          data-tip="Hide PR details"
          aria-label="Hide PR details"
          aria-expanded={visible}
          aria-controls={panelId}
          onClick={onHide}
        >
          <PanelIcon side="right" open size={15} />
        </button>
        <span id={titleId} className="details-bar-title">
          <span key={pr.number} className="swap-in">
            PR #{pr.number} Details
          </span>
        </span>
      </header>

      <div className="details-scroll" ref={scrollRef} onScroll={onScroll}>
        <div className="details-body enter" style={{ "--i": 2 } as CSSProperties}>
          <div className="details-swap" data-phase={phase}>
            <p className="status" data-kind={pr.status.kind}>
              <StatusIcon size={15} />
              {pr.status.label}
            </p>
            <h2 className="details-title">{pr.title}</h2>

            <dl className="kv">
              <div>
                <dt>Author</dt>
                <dd>
                  <PersonAvatar handle={pr.author} size={22} />
                  {pr.author}
                </dd>
              </div>
              <div>
                <dt>Repository</dt>
                <dd>{pr.repository}</dd>
              </div>
              <div>
                <dt>Opened</dt>
                <dd>{pr.opened}</dd>
              </div>
            </dl>

            <Disclosure key={`p-${pr.number}`} title="Problem">
              {pr.problem.map((p, i) => (
                <p key={i}>
                  <RichText text={p} />
                </p>
              ))}
            </Disclosure>
            <Disclosure key={`a-${pr.number}`} title="Approach">
              {pr.approach.map((p, i) => (
                <p key={i}>
                  <RichText text={p} />
                </p>
              ))}
            </Disclosure>

            {messages.length > 0 && (
              <ol className="thread" aria-label="Conversation" aria-live="polite">
                {messages.map((m) => (
                  <li key={m.id} className={`msg msg-${m.role}`}>
                    {m.pending ? <span className="shimmer">{assistantName} is thinking…</span> : m.text}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>

      <div className="enter composer-slot" style={{ "--i": 3 } as CSSProperties}>
        <Composer onSubmit={ask} />
      </div>
    </aside>
  );
}

function Composer({ onSubmit }: { onSubmit: (text: string) => void }) {
  const { uid, assistantName } = useDashboard();
  const [value, setValue] = useState("");
  const [files, setFiles] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const hasValue = value.trim().length > 0;
  const inputId = `${uid}-composer`;

  function submit(e?: FormEvent) {
    e?.preventDefault();
    if (!hasValue) return;
    onSubmit(value.trim());
    setValue("");
    setFiles(0);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  }

  const fileLabel = files === 0 ? "Image/Files" : `${files} ${files === 1 ? "file" : "files"}`;

  return (
    <form className="composer" onSubmit={submit} data-has-value={hasValue}>
      <label htmlFor={inputId} className="sr-only">
        Ask anything about PR
      </label>
      <textarea
        id={inputId}
        className="composer-input"
        rows={1}
        placeholder="Ask anything about PR"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <div className="composer-row">
        <button type="button" className="chip press" onClick={() => fileRef.current?.click()}>
          <ImageIcon size={15} />
          <span key={fileLabel} className="swap-in">
            {fileLabel}
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          hidden
          accept="image/*,.txt,.md,.diff,.patch,.log"
          onChange={(e) => setFiles(e.target.files?.length ?? 0)}
        />
        <button type="button" className="chip chip-claude press" aria-label={`Model: ${assistantName}`}>
          <ClaudeIcon size={15} className="claude-icon" />
          {assistantName}
        </button>
        <button type="submit" className="send press" aria-label="Send" disabled={!hasValue}>
          <ArrowUpIcon size={15} />
        </button>
      </div>
    </form>
  );
}

function Disclosure({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const id = useId();
  return (
    <div className="acc" data-open={open}>
      <button type="button" className="acc-head" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        <TriangleIcon size={10} className="acc-tri" />
        {title}
      </button>
      <div className="acc-panel" id={id}>
        <div className="acc-inner">{children}</div>
      </div>
    </div>
  );
}

function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("`").map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className="code-chip">
            {part}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

function answerFor(pr: AnalyticsPullRequest) {
  const firstSentence = (pr.approach[0] ?? pr.title).split(". ")[0].replace(/`/g, "");
  return `${firstSentence}. It touches ${pr.repository} and was opened by ${pr.author} at ${pr.opened}.`;
}
