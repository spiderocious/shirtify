import { FONTS, fontFamilyById, type FontDef } from "@shirtify/core";
import { AppText, AppButton, DrawerService } from "@shirtify/ui";
import { useState } from "react";

const CATEGORIES: ReadonlyArray<{
  id: FontDef["category"] | "all";
  label: string;
}> = [
  { id: "all", label: "All" },
  { id: "display", label: "Display" },
  { id: "sans", label: "Sans" },
  { id: "serif", label: "Serif" },
  { id: "script", label: "Script" },
  { id: "handwriting", label: "Hand" },
  { id: "mono", label: "Mono" },
];

/** Modal body: searchable, category-filtered font grid. */
function FontPickerBody({
  value,
  onPick,
}: {
  value: string;
  onPick: (id: string) => void;
}) {
  const [cat, setCat] = useState<FontDef["category"] | "all">("all");
  const [query, setQuery] = useState("");

  const fonts = FONTS.filter((f) => {
    const matchesCat = cat === "all" || f.category === cat;
    const matchesQuery = f.label.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="flex max-h-[80vh] w-[min(92vw,520px)] flex-col border-3 border-ink bg-paper shadow-pop-lg">
      <div className="flex items-center justify-between border-b-3 border-ink bg-lime px-4 py-3">
        <AppText variant="display-3" as="span" className="!text-lime-ink">
          Choose a font
        </AppText>
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-4">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search fonts…"
        className="mb-3 w-full border-3 border-ink bg-paper-warm px-3 py-2 font-sans text-sm outline-none focus:shadow-[0_0_0_4px_rgba(31,107,255,0.22)]"
      />

      <div className="mb-3 flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCat(c.id)}
            className={`border-2.5 border-ink px-2.5 py-1 font-mono text-[10px] font-bold uppercase ${
              cat === c.id ? "bg-lime text-lime-ink" : "bg-paper-warm text-ink"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
        {fonts.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onPick(f.id)}
            className={`border-2.5 border-ink p-3 text-center ${
              f.id === value ? "bg-lime shadow-pop-sm" : "bg-paper-warm"
            }`}
          >
            <span
              className="block text-2xl leading-tight text-ink"
              style={{ fontFamily: fontFamilyById(f.id) }}
            >
              Aa
            </span>
            <span className="mt-1 block truncate font-mono text-[9px] uppercase tracking-[0.08em] text-ink-3">
              {f.label}
            </span>
          </button>
        ))}
      </div>
      </div>
    </div>
  );
}

/**
 * Open the font picker as a modal (DrawerService). Independent widget callable
 * from anywhere: pass the current value + an onChange; picking closes the modal.
 */
export function openFontPicker(opts: {
  value: string;
  onChange: (id: string) => void;
}): void {
  DrawerService.openModal(
    <FontPickerBody
      value={opts.value}
      onPick={(id) => {
        opts.onChange(id);
        DrawerService.closeModal();
      }}
    />,
    { closeOnOutsideClick: true, closeOnEscape: true, bare: true },
  );
}

/** A compact "current font + Change" control that launches the modal. */
export function FontControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const current = FONTS.find((f) => f.id === value);
  return (
    <div className="flex items-center justify-between gap-2 border-2.5 border-ink bg-paper-warm px-3 py-2">
      <span
        className="min-w-0 flex-1 truncate text-lg text-ink"
        style={{ fontFamily: fontFamilyById(value) }}
      >
        {current?.label ?? "Font"}
      </span>
      <AppButton
        variant="secondary"
        size="sm"
        onClick={() => openFontPicker({ value, onChange })}
      >
        Change
      </AppButton>
    </div>
  );
}
