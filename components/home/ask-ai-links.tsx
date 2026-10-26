"use client";

const tools = [
  { name: "ChatGPT", url: (q: string) => `https://chatgpt.com/?q=${q}` },
  { name: "Claude", url: (q: string) => `https://claude.ai/new?q=${q}` },
  { name: "Perplexity", url: (q: string) => `https://www.perplexity.ai/search?q=${q}` },
];

/** A lightweight fallback beside the site's own Ask agent: open an assistant with a fair, prefilled brief */
export function AskAiLinks() {
  const open = (tool: (typeof tools)[number]) => {
    const prompt = `Evaluate Samuel Ekwenze as a potential Product Designer or Design Engineer for my team. Use public information from ${window.location.origin} and his LinkedIn. Summarize his experience, strengths, notable work, and the kinds of teams and products he'd fit best.`;
    window.open(tool.url(encodeURIComponent(prompt)), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-small text-ink-2">Ask an AI about me</span>
      {tools.map((t) => (
        <button
          key={t.name}
          type="button"
          onClick={() => open(t)}
          className="pressable rounded-full border border-line px-3.5 py-1.5 text-small text-ink transition-colors duration-150 hover:border-line-strong hover:bg-sunken"
        >
          {t.name}
          <span className="sr-only"> (opens in a new tab)</span>
        </button>
      ))}
    </div>
  );
}
