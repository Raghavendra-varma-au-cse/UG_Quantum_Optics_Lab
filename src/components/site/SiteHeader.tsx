"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useProgress } from "@/lib/store/progress";

const PRIMARY = [
  { href: "/experiments", label: "Experiments" },
  { href: "/components", label: "Components" },
  { href: "/mathematics", label: "Mathematics" },
  { href: "/practical", label: "Practical" },
  { href: "/exam", label: "Examination" }
];

const INDEX_GROUPS: { title: string; links: { href: string; label: string; note: string }[] }[] = [
  {
    title: "Laboratory",
    links: [
      { href: "/", label: "Overview", note: "The laboratory and its progression" },
      { href: "/experiments", label: "Experiment index", note: "Eight experiments, three modes each" },
      { href: "/hardware", label: "Hardware inventory", note: "Kits, parts and verification status" },
      { href: "/components", label: "Component library", note: "Optics, optomechanics, instruments" }
    ]
  },
  {
    title: "Foundations",
    links: [
      { href: "/mathematics", label: "Mathematics for optics", note: "Derivations with interactive parameters" },
      { href: "/quantum-mechanics", label: "Quantum mechanics", note: "States, operators, measurement" },
      { href: "/alignment", label: "Alignment trainer", note: "Build and diagnose a beam path" },
      { href: "/instruments", label: "Instrumentation", note: "Detectors, scopes, stages, noise" }
    ]
  },
  {
    title: "Practice",
    links: [
      { href: "/practical", label: "Practical mode", note: "Checklists, data entry, reports" },
      { href: "/analysis", label: "Data analysis", note: "CSV import, fits, uncertainties" },
      { href: "/notebook", label: "Laboratory notebook", note: "Local-first experiment records" },
      { href: "/exam", label: "Examination", note: "Quizzes, viva, timed papers" }
    ]
  }
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const progress = useProgress((s) => s.overallPercent);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-[2px]">
        <div className="shell flex h-[64px] items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3" aria-label="Quantum Optics Laboratory home">
            <span className="relative flex h-[30px] w-[30px] items-center justify-center border border-ink">
              <span className="absolute h-[1px] w-[16px] bg-ink" />
              <span className="absolute h-[16px] w-[1px] bg-ink" />
              <span className="absolute h-[8px] w-[8px] rounded-full border border-vermilion" />
            </span>
            <span className="leading-none">
              <span className="block font-display text-[1.02rem] tracking-[-0.01em] text-ink">Quantum Optics</span>
              <span className="mt-[3px] block font-mono text-[0.55rem] uppercase tracking-[0.18em] text-muted">
                Laboratory · Undergraduate
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
            {PRIMARY.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative py-1 font-mono text-[0.68rem] uppercase tracking-[0.1em] transition-colors ${
                  isActive(item.href) ? "text-ink" : "text-muted hover:text-ink"
                }`}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.label}
                {isActive(item.href) ? <span className="absolute inset-x-0 -bottom-[3px] h-[1px] bg-vermilion" /> : null}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/progress"
              className="hidden items-center gap-2 border border-line-strong px-2.5 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted transition-colors hover:border-ink hover:text-ink sm:flex"
              title="Your learning progress"
            >
              <span className="inline-block h-[5px] w-[5px] bg-petrol" />
              {Math.round(progress)}%
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="lab-index"
              className="flex items-center gap-2 border border-ink px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper-2"
            >
              {open ? "Close" : "Index"}
              <span className="relative block h-[8px] w-[10px]" aria-hidden>
                <span className={`absolute left-0 top-0 h-[1px] w-full bg-current transition-transform ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
                <span className={`absolute left-0 top-[7px] h-[1px] w-full bg-current transition-transform ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="lab-index"
            role="dialog"
            aria-modal="true"
            aria-label="Laboratory index"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 top-[64px] z-30 overflow-y-auto bg-paper"
          >
            <div className="shell py-10 md:py-14">
              <div className="mb-8 flex items-end justify-between border-b border-line pb-4">
                <p className="label">Laboratory index</p>
                <p className="hidden font-mono text-[0.65rem] text-muted sm:block">Eight experiments · local-first progress</p>
              </div>
              <div className="grid gap-10 md:grid-cols-3 md:gap-8">
                {INDEX_GROUPS.map((group, gi) => (
                  <motion.div
                    key={group.title}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * gi, duration: 0.3 }}
                  >
                    <p className="label mb-4 text-vermilion">{String(gi + 1).padStart(2, "0")} — {group.title}</p>
                    <ul>
                      {group.links.map((link) => (
                        <li key={link.href} className="border-b border-line">
                          <Link href={link.href} className="group flex items-baseline justify-between gap-4 py-3">
                            <span>
                              <span className="block font-display text-[1.15rem] leading-tight text-ink group-hover:text-vermilion">
                                {link.label}
                              </span>
                              <span className="mt-1 block text-[0.7rem] text-muted">{link.note}</span>
                            </span>
                            <span className="font-mono text-[0.7rem] text-muted transition-transform group-hover:translate-x-1">→</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
              <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
                <p className="max-w-xl text-[0.7rem] leading-relaxed text-muted">
                  Educational simulations are labelled separately from laboratory measurements. Hardware configurations
                  carry a verification status; nothing is presented as a Thorlabs specification without a source.
                </p>
                <Link href="/experiments" className="arrow-link">
                  Enter the experiment index →
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
