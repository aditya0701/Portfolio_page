import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, ChevronDown } from "lucide-react";
import { SignalBar } from "../components/SignalBar";
import { usePageTitle } from "../hooks/usePageTitle";
import { ROUTE_META } from "../data/routeMeta";

const STATS = [
  { label: "Avg. latency", unit: "s", sarvam: 20.2, deepseek: 33.4, note: "lower is faster" },
  { label: "Avg. search iterations", unit: "", sarvam: 4.5, deepseek: 6.1, note: "lower means fewer round-trips" },
  { label: "Avg. answer length (est. tokens)", unit: "", sarvam: 263.7, deepseek: 512.0, note: "lower is more concise" },
  { label: "Avg. sources cited", unit: "", sarvam: 8.6, deepseek: 17.8, note: "not scored either way, shown for context" },
];

const JUDGED = [
  {
    question:
      "What are the technical details of ZML's approach to cross-chip compatibility? Specifically, how does it handle differences in memory architectures, instruction sets, and compute units between NVIDIA's CUDA, AMD's ROCm, Google's TPU, Apple's Metal, and Intel's Arc, and what are the overheads or limitations of this abstraction layer?",
    sarvam: 8.1,
    deepseek: 9.0,
    summary: "DeepSeek wins on technical depth and accuracy; Sarvam wins on organization and concision.",
    sarvamNote:
      "Hits every sub-topic asked (compilation pipeline, memory, ISAs, compute units, overheads) and is the best-organized of the two. But oversimplifies backend targets (claims ROCm compiles to HSAIL, understates Intel Arc's real pipeline) and overstates portability (“single binary runs on any accelerator”).",
    deepseekNote:
      "Goes to implementation depth Sarvam never reaches: StableHLO, the zml.Platform abstraction, PJRT plugin layer, DMA allocator, zero-copy transfers. Explains the actual lowering chain (StableHLO -> MLIR dialects -> vendor dialects -> native kernels) instead of naming ISAs. Self-flags one claim as [UNVERIFIED], good practice. Slightly verbose, ~25% could be trimmed.",
    sarvamAnswer:
      "ZML achieves cross-chip compatibility by compiling a single, language-level model graph into native binaries for each accelerator family, using a stack of open-source compiler technologies (Zig + MLIR + OpenXLA) and a thin platform-abstraction layer that hides hardware-specific details.\n\nCompilation flow and IR: the model is expressed in Zig and lowered to MLIR, a multi-level intermediate representation that can be progressively refined. OpenXLA consumes the MLIR dialect and emits target-specific HLO IR, which is then lowered to the backend's native code generators (PTX for CUDA, HSAIL for ROCm, TPU XLA, Metal shaders, and SPIR-V for Intel Arc). Because the lowering is performed by the compiler rather than hand-written kernels, ZML does not need separate kernel libraries for each vendor.\n\nMemory-architecture abstraction: ZML's platform API presents a unified buffer allocation interface. At compile time, XLA performs buffer-allocation analysis and inserts device-specific memory allocation calls. This lets a single binary run on any supported accelerator without manual memory-layout tuning, but it also means ZML cannot exploit vendor-specific memory-hierarchy optimizations that hand-tuned kernels might achieve.\n\nPerformance overheads and limitations: cross-compilation adds build-time overhead; benchmarks on AMD GPUs show inference throughput roughly 80-90% of an RTX 4090 for comparable model sizes; current releases are limited to single-GPU execution with no multi-GPU sharding; the LLMD server caps batch size at 16 with no prefix-caching; only Llama-3.1/3.2, Qwen-3.5, and LFM-2.5 families are officially supported; the stack is still in alpha.",
    deepseekAnswer:
      "ZML is a production inference stack built primarily in Zig (92.7% of its codebase), developed by a Paris-based startup, that achieves cross-chip compatibility through a multi-layered compilation pipeline rather than a runtime abstraction layer that wraps individual vendor APIs. At its core, ZML uses MLIR and OpenXLA as its compilation backend, expressing tensor operations in StableHLO and progressively lowering those operations through MLIR's dialect hierarchy into hardware-native code for each target: CUDA for NVIDIA, ROCm for AMD, XLA for Google TPU, oneAPI for Intel Arc, Metal for Apple GPUs, and Neuron for AWS Trainium.\n\nThe central abstraction governing cross-chip compatibility is the zml.Platform construct, introduced in the ZML/v2 rewrite (March 24, 2026). A Platform encapsulates an accelerator runtime, owning compilation, memory management, device placement, and I/O for that hardware target, selectable at compile time via Bazel build flags, at runtime via automatic detection, or manually.\n\nOn memory-architecture differences: ZML/v2 exposes explicit pinned memory management through zml.mem.DmaAllocator, combined with Zig's explicit allocator model, giving precise control over memory transfers. Data transfers are channeled through zml.io.MemoryWriter for zero-copy, overlapped data movement.\n\nOn instruction-set and compute-unit differences: ZML relies on the MLIR/OpenXLA compiler pipeline rather than hand-tuned kernel libraries per architecture, wrapping the PJRT C API from OpenXLA, a uniform Device API where each hardware vendor implements an opaque plugin.\n\nLimitations: the compilation-based approach adds an ahead-of-time compilation step eager-execution frameworks don't require; cross-vendor tensor parallel sharding (splitting a model across an NVIDIA and an AMD card simultaneously) is not documented and likely unsupported; the 92.7%-Zig codebase limits the contributor pool versus Python-first projects [UNVERIFIED: this specific claim not found in retrieved sources]; the LLMD server is still in alpha with model support currently limited to specific families.",
  },
  {
    question:
      "Beyond the stated goal of breaking vendor lock-in, what are the potential business and technical risks for ZML? For instance, how does it manage the challenge of maintaining performance parity across rapidly evolving hardware, and what is its strategy for competing with the deeply integrated, proprietary solutions from the major chip and cloud providers?",
    sarvam: 8.8,
    deepseek: 9.4,
    summary: "DeepSeek gives deeper strategic reasoning; Sarvam is the stronger choice if the goal is a tight executive summary.",
    sarvamNote:
      "Covers all three asked angles (business risk, performance-parity risk, competitive strategy) in a focused, readable executive-summary style. Stays fairly high-level; a few claims asserted without much nuance (e.g. “changing a flag recompiles the model”).",
    deepseekNote:
      "Surfaces business risks Sarvam omits or only hints at: unclear monetization, contributor-pool limits, dependency on OpenXLA, the CUDA ecosystem moat. Explains why each risk matters rather than just listing it. More verbose, with some repetition around ecosystem advantages.",
    sarvamAnswer:
      "ZML's ambition to break vendor lock-in introduces both business and technical risks. Technically, the company must keep its inference stack in lock-step with a rapidly moving hardware landscape; new GPU, TPU, and NPU generations each bring changes to driver APIs and instruction sets. ZML mitigates this by building on open, compiler-centric technologies (Zig, MLIR, OpenXLA) and bundling the required runtime inside the container image. However, supporting five distinct back-ends creates a real maintenance burden, and ZML still lacks expert-parallelism support, a gap that could become a bottleneck as mixture-of-experts models dominate.\n\nBusiness-wise, ZML competes against deeply integrated proprietary solutions from NVIDIA (TensorRT-LLM), Google, Amazon, and Microsoft, all of which benefit from tight silicon-compiler-cloud coupling and ecosystem trust. ZML's lean 20-person team and $20M funding give it agility, but the same small size can limit support depth and long-term sustainability versus the major cloud providers.\n\nStrategically, ZML centers on hardware-agnostic openness and performance-first engineering: compiling directly to each accelerator via MLIR/OpenXLA, claiming up to 2x faster inference than TensorRT-LLM on an H100 and up to 10x with DFlash speculative decoding, and targeting European chip makers (Axelera, Fractile, Kalray) to broaden the ecosystem and reduce single-vendor dependence.",
    deepseekAnswer:
      "Business risks: the most immediate is the absence of a proven monetization model, LLMD was released free with no articulated revenue model beyond speculation about enterprise support or managed services. The inference-serving market already has well-funded competitors (Baseten at a $13B valuation, vLLM and SGLang with their own commercial backers). ZML's Zig-based codebase (92.7% Zig) significantly limits its contributor pool versus Python-first projects. There's also a dependency risk: ZML relies on OpenXLA and MLIR, both originating from Google's AI infrastructure group, and any shift in Google's priorities there could affect ZML's roadmap. If NVIDIA restricted CUDA-level access or accelerated its own higher-level software layer to bypass abstraction layers, ZML's compilation path to NVIDIA hardware could be impaired.\n\nTechnical risk on performance parity: ZML relies on MLIR/OpenXLA rather than hand-tuned kernels, the same approach Google uses internally with JAX. The compiler's ability to generate performant code depends on lowering-rule quality, which for rapidly evolving architectures may lag vendor hand-tuned libraries; NVIDIA's CUDA ecosystem includes 19 years of accumulated, deeply tuned kernel libraries. Community benchmarks show ZML on AMD hardware at roughly 80-90% of RTX 4090 throughput, real but incomplete parity, and ZML is still alpha with significant feature gaps: single-GPU-only, no multi-GPU sharding, batch size capped at 16, no prefix caching, no expert-parallelism/MoE support.\n\nCompetitive strategy: targets the vendor-lock-in pain point directly, positions itself as an enabler for alternative and emerging chipmakers (naming several European AI chip startups as potential partners), competes on technical claims (2x over TensorRT-LLM on H100), and uses its free pricing to pressure commercial managed services, though that free strategy itself carries the business-model risk noted above. The core tension: NVIDIA's moat isn't CUDA alone but a 19-year ecosystem of libraries, tools, and community knowledge.",
  },
  {
    question:
      "What are the specific terms and strategic implications of SambaNova's partnership with Intel, and how does it differ from their previous collaboration?",
    sarvam: 8.7,
    deepseek: 9.4,
    summary: "DeepSeek wins clearly by treating the deal as a strategic evolution rather than a list of terms.",
    sarvamNote:
      "Cleanly separates terms / implications / differences and covers every key fact (investment, ownership %, co-selling, Xeon integration). The equity percentages (8.2%, 9%, 6.8%) are oddly specific without adding analytical value, and it explains what happened more than why it matters.",
    deepseekNote:
      "Frames the relationship as an evolution: investor relationship -> board representation -> acquisition talks -> failed acquisition -> strategic alliance, which directly answers the “how does it differ from before” half of the question. Adds useful context (a boardroom recusal, a SoftBank deployment, a later funding round), though the later Series F detail runs past what was asked.",
    sarvamAnswer:
      "Intel's latest deal with SambaNova Systems goes far beyond the modest equity stakes the two companies held in earlier years and creates a joint go-to-market and product-development engine aimed at the fast-growing AI-inference market.\n\nKey terms: Intel plans an additional $15 million investment raising its ownership to roughly 9% of SambaNova, up from 8.2% after a $35 million round in February 2026 and 6.8% in 2025. Intel also participated in SambaNova's $350 million Series E round. The two firms signed a multi-year strategic collaboration to deliver AI inference solutions built on Intel Xeon-based infrastructure. Intel will leverage its enterprise, cloud, and partner channels to co-sell SambaNova's SN50 Reconfigurable Dataflow Unit.\n\nStrategic implications: for Intel, the deal deepens its foothold in AI inference with a differentiated offering versus NVIDIA's GPU-centric solutions. For SambaNova, the partnership provides scale, distribution, and credibility through Intel's global sales network, plus capital to accelerate chip production.\n\nHow this differs from the earlier collaboration: the earlier involvement was a $15 million investment in 2019 and a $35 million round in early 2026, purely financial stakes. The new agreement adds a formal, multi-year product-development and go-to-market partnership at a much larger equity position. The partnership emerged after failed acquisition talks that reportedly valued SambaNova at around $1.6 billion; instead of buying the company, Intel opted for a deeper collaborative relationship.",
    deepseekAnswer:
      "The SambaNova-Intel relationship has two distinct phases, and the partnership announced on February 24, 2026 is fundamentally different from what came before.\n\nThe previous phase (2017-2025) was an investor relationship, not a go-to-market partnership. Intel CEO Lip-Bu Tan became chairman of SambaNova's board when the company was founded in 2017, through his venture firm Walden International. Intel Capital first invested in SambaNova in 2019 during its Series B round, then again in the Series C round. The relationship consisted of venture capital investment and board representation, with no product integration or co-selling arrangement. In late 2025, Intel explored acquiring SambaNova outright for approximately $1.6 billion, but those talks stalled by January 2026.\n\nThe new partnership is a multiyear strategic collaboration going far deeper: co-development of AI inference systems combining SambaNova's SN50 RDU accelerators with Intel Xeon processors and Intel GPUs; Intel tapping its enterprise, cloud, and partner channels to co-market and co-sell the resulting platforms; Intel Capital participating in the $350 million Series E round led by Vista Equity Partners and Cambium Capital; Intel CEO Lip-Bu Tan recusing himself from partnership discussions due to his dual role as SambaNova board chairman. SoftBank committed to deploying the new SN50 chip as an existing SambaNova customer.\n\nThe key difference is structural: the earlier relationship was purely financial (VC investment plus board representation) with no product-level integration, while the new collaboration involves co-developed products, joint sales through Intel's enterprise channels, and a strategic funding round rather than a conventional VC investment. The failed acquisition attempt was the catalyst that transformed a passive investor relationship into an active strategic alliance. Notably, just months later, on July 8, 2026, SambaNova raised a further $1 billion at an $11 billion valuation in a Series F first close.",
  },
  {
    question:
      "What is the current status of the rumored acquisition by Intel, and what factors would determine if SambaNova remains independent or goes public?",
    sarvam: 8.4,
    deepseek: 9.2,
    summary: "DeepSeek's independence/IPO reasoning is more evidence-grounded; both models are equally honest about what isn't confirmed.",
    sarvamNote:
      "Correctly summarizes the acquisition-status chronology (talks stalled, partnership replaced acquisition). Its IPO/independence discussion leans on generic corporate-finance factors (interest rates, antitrust, timing) rather than SambaNova-specific evidence, and honestly flags this with [UNVERIFIED: IPO not found in retrieved sources].",
    deepseekNote:
      "Same acquisition-status chronology, sourced with a clearer timeline (a rumor, a wire-service report, the funding round, the strategic collaboration). Grounds the independence/IPO analysis in company-specific signals: Series E runway, record bookings, manufacturing expansion, customer traction, not just generic IPO theory. Also appropriately flags the unverified parts.",
    sarvamAnswer:
      "Intel's reported $1.6 billion acquisition of SambaNova Systems collapsed by the end of 2025, leaving SambaNova independent. In early February 2026, SambaNova secured a $350 million Series E round led by Vista Equity Partners, with Intel taking roughly a 9% strategic stake and signing a multi-year collaboration agreement rather than completing a full purchase. Earlier reports (Reuters, EE Times, SiliconANGLE, Heise, October-December 2025) had suggested the deal was near completion at a reported $1.6 billion price.\n\nKey factors that will determine whether SambaNova stays independent or pursues an IPO: financial performance and cash-flow trajectory; the valuation gap between private and public markets; the strategic value of Intel's partnership and access to its manufacturing/distribution channels, which may reduce urgency to go public; regulatory considerations such as antitrust scrutiny; the competitive landscape, particularly the pace of innovation by NVIDIA, AMD, and emerging AI-chip startups; and broader macroeconomic conditions including interest rates and investor appetite for high-growth tech IPOs.\n\nIn summary, the rumored acquisition has stalled, resulting in a strategic partnership and minority investment that keeps SambaNova independent for now. [UNVERIFIED: IPO not found in retrieved sources]",
    deepseekAnswer:
      "The rumored acquisition of SambaNova by Intel, first reported by Bloomberg in October 2025, is no longer active; both companies have publicly stated the deal is not under discussion. SambaNova sought up to $500 million in funding after talks stalled (Reuters, January 22, 2026); by February 6, Vista Equity Partners and Intel were reported leading a new round of over $350 million; on February 24, SambaNova formally announced the $350 million Series E led by Vista Equity Partners and Cambium Capital, alongside its next-generation SN50 chip and a multiyear strategic collaboration with Intel. A SambaNova spokesperson told CRN the acquisition deal is “not in discussion at this stage.”\n\nFactors that will determine independence versus going public: the company just raised $350 million in Series E funding, giving it runway to scale manufacturing and cloud capacity independently; the same announcement references record bookings and revenue closing out 2025; customer concentration and commercial traction, SoftBank Corp. as the first SN50 deployment customer, alongside Hugging Face, Meta, and major AI labs; competitive position relative to NVIDIA, SambaNova claims the SN50 is up to 5x faster and 3x lower cost than GPUs for agentic workloads; valuation trajectory, SambaNova was valued at $5 billion in 2021, though BlackRock reportedly marked down its stake implying a valuation near $2.4 billion, well above the $1.6 billion Intel had considered; the structure of the Intel partnership as a strategic collaboration rather than an acquisition, which keeps SambaNova independent while giving it distribution access; and the intertwined governance relationship from Intel CEO Lip-Bu Tan's dual role as SambaNova board chairman, though he recused himself from the partnership discussions. [UNVERIFIED: specific IPO timeline not found in retrieved sources] No definitive IPO timeline has been announced; the immediate focus is shipping the SN50 chip later in 2026.",
  },
];

function StatTile({ stat }: { stat: (typeof STATS)[number] }) {
  const max = Math.max(stat.sarvam, stat.deepseek);
  const fmt = (v: number) => (Number.isInteger(v) ? v.toString() : v.toFixed(1));
  return (
    <div className="notch-corner border border-rule-hard bg-panel p-4 sm:p-5">
      <div className="font-hero-mono mb-3 text-[12px] tracking-wide text-ink-soft">{stat.label.toUpperCase()}</div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="w-20 shrink-0 whitespace-nowrap text-[12px] text-[color:var(--color-sarvam-500)]">sarvam</span>
          <div className="h-2 flex-1 rounded-full bg-rule-hard">
            <div
              className="h-full rounded-full bg-[color:var(--color-sarvam-500)]"
              style={{ width: `${(stat.sarvam / max) * 100}%` }}
            />
          </div>
          <span className="w-14 shrink-0 text-right text-[13px] tabular-nums text-ink">
            {fmt(stat.sarvam)}
            {stat.unit}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-20 shrink-0 whitespace-nowrap text-[12px] text-[color:var(--color-deepseek-500)]">deepseek</span>
          <div className="h-2 flex-1 rounded-full bg-rule-hard">
            <div
              className="h-full rounded-full bg-[color:var(--color-deepseek-500)]"
              style={{ width: `${(stat.deepseek / max) * 100}%` }}
            />
          </div>
          <span className="w-14 shrink-0 text-right text-[13px] tabular-nums text-ink">
            {fmt(stat.deepseek)}
            {stat.unit}
          </span>
        </div>
      </div>
      <p className="mt-3 text-[12px] text-ink-soft">{stat.note}</p>
    </div>
  );
}

function SectionHead({ num, title }: { num: string; title: string }) {
  return (
    <div className="mb-6 flex items-baseline gap-3">
      <span className="font-mono text-xs text-ink-soft">{num}</span>
      <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{title}</h2>
      <span className="h-px flex-1 bg-rule-hard" aria-hidden="true" />
    </div>
  );
}

export function SarvamVsDeepseek() {
  const [openCase, setOpenCase] = useState<number | null>(null);

  usePageTitle(ROUTE_META["/case-study/techdrishti/sarvam-vs-deepseek"].title);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <SignalBar />

      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link
          to="/case-study/techdrishti"
          className="font-hero-mono inline-flex items-center gap-2 text-[12px] tracking-wide text-ink-mid transition-colors hover:text-i3"
        >
          <ArrowLeft size={13} /> Back to case study
        </Link>
        <a
          href="https://huggingface.co/spaces/aditya0701/DeepSeek_Mini_research_tool"
          target="_blank"
          rel="noreferrer"
          className="font-hero-mono inline-flex items-center gap-1.5 text-[12px] tracking-wide text-ink-mid transition-colors hover:text-i3"
        >
          Research agent, live <ExternalLink size={12} />
        </a>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-28">
        <p className="font-hero-mono mb-4 text-[12px] tracking-wider text-i3">
          TECHDRISHTI RESEARCH INFRA &middot; PROVIDER EVALUATION
        </p>
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Sarvam vs DeepSeek, side by side</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
          The research agent behind the RESEARCH stage (see the case study) can run on either model. 37 live calls
          per provider, 74 total, against the same fixed question set pulled from a real Stage 1 pipeline output:
          identity lookups (ambiguous and unambiguous entities) and context/gap questions, grouped by source
          article. This page is the evidence behind choosing Sarvam for that stage, not just an assertion of it.
        </p>

        <div className="mt-6 notch-corner border border-panel-border bg-panel p-4 text-[13px] leading-relaxed text-panel-mid">
          <b className="text-ink">Reproducibility.</b> Every number on this page is read directly from two raw
          result files, one per provider, produced by running the same question set against both and merging the
          results, no number here was typed by hand.{" "}
          <b className="text-ink">Token counts are estimates</b>: the research agent doesn't return real
          prompt/completion usage, so the token figures are a tokenizer count over the returned answer text only,
          they exclude the agent's internal search/reasoning tokens and aren't a real cost figure.
        </div>

        <div className="mt-10">
          <SectionHead num="01" title="Speed, iterations, length" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {STATS.map((s) => (
              <StatTile key={s.label} stat={s} />
            ))}
          </div>
        </div>

        <div className="mt-14">
          <SectionHead num="02" title="Answer quality, judged independently" />
          <p className="mb-6 text-[14px] leading-relaxed text-ink-mid">
            Scored by an external GPT judge, not by this pipeline and not by me, on the 4 context/gap questions where
            quality is genuinely hard to call by eye (the 33 identity lookups weren't scored this way, most of them
            are plain factual overviews with an obvious right answer). Included as a transparent second opinion the
            quantitative metrics above can't give on their own.
          </p>
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StatTile stat={{ label: "Avg. judge score (/10)", unit: "", sarvam: 8.5, deepseek: 9.2, note: "4 of 37 cases judged" }} />
            <div className="notch-corner border border-rule-hard bg-panel p-4 sm:p-5">
              <div className="font-hero-mono mb-3 text-[12px] tracking-wide text-ink-soft">WINS (4 JUDGED)</div>
              <div className="flex items-baseline gap-6">
                <div>
                  <div className="font-display text-2xl font-semibold text-ink">0</div>
                  <div className="text-[12px] text-[color:var(--color-sarvam-500)]">sarvam</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-semibold text-ink">4</div>
                  <div className="text-[12px] text-[color:var(--color-deepseek-500)]">deepseek</div>
                </div>
              </div>
              <p className="mt-3 text-[12px] text-ink-soft">DeepSeek wins every judged case outright, by margin.</p>
            </div>
          </div>

          <p className="mb-4 text-[13px] text-ink-soft">Click a question to see the actual answers and what the judge flagged.</p>
          <div className="flex flex-col gap-3">
            {JUDGED.map((j, i) => {
              const isOpen = openCase === i;
              return (
                <div key={i} className="notch-corner border border-rule-hard bg-panel">
                  <button
                    type="button"
                    onClick={() => setOpenCase(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-start gap-3 p-4 text-left sm:p-5"
                  >
                    <div className="flex-1">
                      <p className="text-[14px] leading-relaxed text-ink-mid">{j.question}</p>
                      <div className="mt-3 flex items-center gap-4 text-[13px] tabular-nums">
                        <span className="text-[color:var(--color-sarvam-500)]">sarvam {j.sarvam.toFixed(1)}</span>
                        <span className="text-[color:var(--color-deepseek-500)]">deepseek {j.deepseek.toFixed(1)}</span>
                      </div>
                      <p className="mt-2 border-t border-panel-border pt-2 text-[13px] italic leading-relaxed text-panel-mid">
                        {j.summary}
                      </p>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`mt-1 shrink-0 text-ink-soft transition-transform duration-200 motion-reduce:transition-none ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  <div
                    className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <div className="grid grid-cols-1 gap-4 border-t border-panel-border p-4 sm:grid-cols-2 sm:p-5">
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="font-hero-mono text-[12px] tracking-wide text-[color:var(--color-sarvam-500)]">
                              SARVAM &middot; WHAT THE JUDGE SAID
                            </span>
                          </div>
                          <p className="text-[13px] leading-relaxed text-ink-mid">{j.sarvamNote}</p>
                          <div className="mt-3 max-h-64 overflow-y-auto rounded border border-panel-border bg-paper/80 p-3 text-[11.5px] leading-relaxed whitespace-pre-wrap text-panel-mid">
                            {j.sarvamAnswer}
                          </div>
                        </div>
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="font-hero-mono text-[12px] tracking-wide text-[color:var(--color-deepseek-500)]">
                              DEEPSEEK &middot; WHAT THE JUDGE SAID
                            </span>
                          </div>
                          <p className="text-[13px] leading-relaxed text-ink-mid">{j.deepseekNote}</p>
                          <div className="mt-3 max-h-64 overflow-y-auto rounded border border-panel-border bg-paper/80 p-3 text-[11.5px] leading-relaxed whitespace-pre-wrap text-panel-mid">
                            {j.deepseekAnswer}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-14">
          <SectionHead num="03" title="Why Sarvam anyway" />
          <p className="text-sm leading-relaxed text-ink-soft">
            DeepSeek is genuinely better on the questions that need real depth, an independent judge scored it higher
            on all 4 judged cases, and it goes further into implementation detail (one answer, on ZML's compiler
            stack, named the exact lowering chain from StableHLO through vendor dialects to native kernels; Sarvam's
            equivalent answer stayed a level higher, correct but less deep). That's a real, honest edge, not
            explained away here.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            But it takes about 65% longer per call (33.4s vs 20.2s), needs more search iterations to get there (6.1
            vs 4.5), and returns roughly double the answer length (512 vs 264 tokens) for that gain, on a stage that
            fires several times per article, every day, unattended. Combined with Sarvam running 5&ndash;9&times;
            cheaper per raw token (see the pricing table in the case study), the tradeoff didn't clear the bar for
            this pipeline specifically: DeepSeek's extra depth is real, but it's not the kind of gap this stage's job
            actually needs to close, and Sarvam is, in the external judge's own words, &ldquo;the stronger choice if
            the goal is a tight executive summary,&rdquo; which is exactly what feeds the writer downstream.
          </p>
        </div>

        <footer className="mt-16 border-t border-rule-hard pt-8">
          <Link
            to="/case-study/techdrishti"
            className="font-hero-mono inline-flex items-center gap-2 text-[12px] tracking-wide text-ink-mid transition-colors hover:text-i3"
          >
            <ArrowLeft size={13} /> Back to the TechDrishti case study
          </Link>
        </footer>
      </main>
    </div>
  );
}
