import { CheckIcon, CloseIcon } from "@/components/ui/icons";

/** Survey answers as labelled bars. The first answer of each question is the one the design acted on */
export function Survey({ questions, tint = "var(--accent)" }: { questions: { question: string; answers: [string, number][] }[]; tint?: string }) {
  return (
    <div className="my-10 grid gap-3 sm:grid-cols-2 lg:-mr-[12%]" style={{ "--tint": tint } as React.CSSProperties}>
      {questions.map((q) => (
        <figure key={q.question} className="rounded-[var(--radius-m)] border border-line bg-surface p-5 sm:last:odd:col-span-2">
          <figcaption className="text-small font-medium text-ink">{q.question}</figcaption>
          <dl className="mt-4 space-y-3">
            {q.answers.map(([label, value], i) => (
              <div key={label}>
                <div className="flex justify-between gap-4 text-small">
                  <dt className={i === 0 ? "text-ink" : "text-ink-2"}>{label}</dt>
                  <dd className={`tabular ${i === 0 ? "font-medium text-ink" : "text-ink-2"}`}>{value}%</dd>
                </div>
                <div aria-hidden="true" className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sunken">
                  <div className="h-full rounded-full" style={{ width: `${value}%`, background: i === 0 ? "var(--tint)" : "var(--line-strong)" }} />
                </div>
              </div>
            ))}
          </dl>
        </figure>
      ))}
    </div>
  );
}

/** Features by product, yes or no. `highlight` marks the row that mattered */
export function FeatureTable({
  products,
  rows,
  highlight,
}: {
  products: string[];
  rows: { feature: string; has: boolean[] }[];
  highlight?: string;
}) {
  return (
    <div className="my-10 overflow-x-auto rounded-[var(--radius-m)] border border-line bg-surface lg:-mr-[12%]" tabIndex={0} role="region" aria-label="Competitive analysis">
      <table className="w-full border-collapse text-small max-sm:text-micro">
        <thead>
          <tr className="border-b border-line text-left text-ink-2">
            <th scope="col" className="px-4 py-3 font-medium max-sm:px-3">
              Feature
            </th>
            {products.map((p) => (
              <th key={p} scope="col" className="px-3 py-3 text-center font-medium max-sm:px-1">
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const strong = r.feature === highlight;
            return (
              <tr key={r.feature} className={`border-b border-line last:border-0 ${strong ? "bg-accent-soft" : ""}`}>
                <th scope="row" className={`px-4 py-2.5 text-left max-sm:px-3 ${strong ? "font-semibold text-ink" : "font-normal text-ink"}`}>
                  {r.feature}
                </th>
                {r.has.map((yes, i) => (
                  <td key={products[i]} className="px-3 py-2.5 max-sm:px-1">
                    <span className={`mx-auto grid size-5 place-items-center ${yes ? "text-signal" : "text-danger"}`}>
                      {yes ? <CheckIcon /> : <CloseIcon />}
                      <span className="sr-only">{yes ? "Yes" : "No"}</span>
                    </span>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
