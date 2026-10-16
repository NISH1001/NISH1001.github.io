---
layout: post
title:  "decision-eval: Benchmarking Zero-Shot Decision Models"
date:   2026-10-16 09:00:00 +0545
categories: research
tags: research llm benchmark evaluation decision-models zero-shot classification calibration latency
subtitle: "Accuracy, latency, cost and calibration of zero-shot decision models (Laya, GLiNER2.5-Decide, Jev, GPT-6 Luna) on the same requests, suite by suite."
comments: false
published: true
toc: true
---

<style>
/* decision-eval. Scoped to this post; the page is self-contained: the data is the inline JSON block
   near the end and every chart is drawn from it in the browser. Colours are site variables with light
   fallbacks so the header theme toggle drives the figures. Model colours are validated for
   colour-vision deficiency in both themes; every bar also carries a hatch. */
.de{--m0:#2a78d6;--m1:#1baf7a;--m2:#6250d6;--m3:#e34948;--m4:#008300;--de-hatch:rgba(0,0,0,.4);
  --de-ink:var(--title,#343331);--de-muted:var(--text,#6f6e69);--de-grid:var(--border,#e6e4d9);
  font-size:.86rem;color:var(--de-muted)}
[data-theme="dark"] .de{--m0:#3987e5;--m1:#199e70;--m2:#9085e9;--m3:#e66767;--m4:#008300;--de-hatch:rgba(0,0,0,.5)}
.de-abstract{border-left:3px solid var(--brand,#3aa99f);padding:.2rem 0 .2rem 1rem;margin:1.5rem 0;font-size:.95rem}
.de-models{font-size:.9rem}
.de-models li{margin:.2rem 0}
/* wide figures break out of the 48rem text column on large screens */
@media (min-width:1100px){.de-wide{position:relative;left:50%;transform:translateX(-50%);width:min(64rem,calc(100vw - 3rem));max-width:none}}
/* sidenotes: right margin when there is room, inline otherwise */
.de-side{display:block;font-size:.76rem;line-height:1.5;opacity:.85;border-left:2px solid var(--border,#e6e4d9);
  padding:.1rem 0 .1rem .7rem;margin:.6rem 0 1rem}
@media (min-width:1260px){.de-side{float:right;clear:right;width:13rem;margin:.2rem -15.5rem 1rem 0;border-left:0;
  padding:.35rem 0 0;border-top:1px solid var(--border,#e6e4d9)}}
/* figures, ConceptGate-style captions */
figure.de-figure{margin:2rem 0}
figure.de-figure figcaption{font-size:.85rem;line-height:1.5;color:var(--text,#666);opacity:.85;margin-top:.55rem}
/* control bar */
.de-ctl{position:sticky;top:0;z-index:30;display:flex;flex-wrap:wrap;gap:.5rem .9rem;align-items:center;
  padding:.5rem .7rem;margin:1.4rem 0;border:1px solid var(--border,#e6e4d9);border-radius:.5rem;
  background:var(--bg2,#f2f0e5);font-size:.78rem}
.de-ctl .lab{opacity:.7;margin-right:.1rem}
.de-seg{display:inline-flex;flex-wrap:wrap;max-width:100%;border:1px solid var(--border,#e6e4d9);border-radius:.35rem;overflow:hidden;background:var(--bg2,#f2f0e5)}
.de-seg button,.de-btn{font:inherit;font-size:.75rem;padding:.22rem .6rem;border:0;background:transparent;color:var(--text,#6f6e69);cursor:pointer}
.de-seg button+button{border-left:1px solid var(--border,#e6e4d9)}
.de-seg button[aria-pressed="true"]{background:var(--bg,#fffcf0);color:var(--brand,#3aa99f);font-weight:600}
.de-seg button:disabled{opacity:.45;cursor:not-allowed}
.de-btn{border:1px solid var(--border,#e6e4d9);border-radius:.35rem;background:var(--bg2,#f2f0e5)}
.de-btn:hover:not(:disabled){border-color:var(--brand,#3aa99f);color:var(--brand,#3aa99f)}
.de-btn:disabled{opacity:.4;cursor:default}
.de-card{border:1px solid var(--border,#e6e4d9);border-radius:.5rem;background:var(--bg,#fffcf0);overflow:hidden}
.de-head{display:flex;flex-wrap:wrap;gap:.4rem .8rem;align-items:center;justify-content:space-between;
  padding:.45rem .75rem;background:var(--bg2,#f2f0e5);border-bottom:1px solid var(--border,#e6e4d9)}
.de-head .t{font-weight:600;color:var(--de-ink);font-size:.8rem}
.de-head .tools{display:flex;flex-wrap:wrap;gap:.35rem;align-items:center}
.de-body{padding:.6rem .75rem}
.de-legend{display:flex;flex-wrap:wrap;gap:.3rem .5rem;margin-bottom:.4rem}
.de-chip{display:inline-flex;align-items:center;gap:.35rem;font:inherit;font-size:.74rem;cursor:pointer;
  padding:.12rem .5rem;border-radius:1rem;border:1px solid var(--border,#e6e4d9);background:var(--bg,#fffcf0);color:var(--de-ink)}
.de-chip[aria-pressed="false"]{opacity:.4;text-decoration:line-through}
.de-sw{width:.85rem;height:.85rem;border-radius:.15rem;border:1px solid rgba(0,0,0,.45);flex:0 0 auto;display:inline-block}
.de svg{display:block;width:100%;height:auto;overflow:visible}
.de-tip{position:fixed;z-index:80;pointer-events:none;max-width:22rem;font-size:.75rem;line-height:1.45;
  background:var(--title,#343331);color:var(--bg,#fffcf0);padding:.45rem .6rem;border-radius:.35rem;
  box-shadow:0 6px 20px rgba(0,0,0,.25);opacity:0;transition:opacity .1s}
/* paper view: white, serif, print-ready; SVGs carry literal colours so they export cleanly */
.de-paper .de-card,.de-paper .de-body{background:#fff}
.de-paper .de-card{border-color:#ccc}
.de-paper .de-body td,.de-paper .de-body th{color:#111;font-family:'Times New Roman',Times,STIXGeneral,serif}
.de-only-paper{display:none}
.de-paper .de-only-paper{display:inline-flex}
/* tables */
.de-scroll{overflow-x:auto}
.de table{width:100%;border-collapse:collapse;font-size:.78rem;margin:0}
.de th,.de td{padding:.4rem .5rem;border-bottom:1px solid var(--border,#e6e4d9);text-align:right;white-space:nowrap}
.de th:first-child,.de td:first-child{text-align:left}
.de th{font-weight:600;color:var(--de-ink);cursor:pointer;user-select:none}
.de th[aria-sort] span{color:var(--brand,#3aa99f)}
.de td small{opacity:.6;font-size:.68rem}
.de td .v{color:var(--de-ink);font-variant-numeric:tabular-nums}
.de .best .v{font-weight:700}
/* explorer */
.de-ex-ctl{display:flex;flex-wrap:wrap;gap:.4rem;align-items:center}
.de-ex-ctl select,.de-ex-ctl input{font:inherit;font-size:.76rem;padding:.22rem .4rem;border-radius:.35rem;
  border:1px solid var(--border,#e6e4d9);background:var(--bg,#fffcf0);color:var(--de-ink)}
.de-ex-ctl input{flex:1 1 9rem;min-width:0}
.de-item{border-top:1px solid var(--border,#e6e4d9);padding:.65rem .75rem}
.de-tag{display:inline-block;font-size:.66rem;padding:.04rem .45rem;border-radius:1rem;border:1px solid var(--border,#e6e4d9);margin-right:.35rem;opacity:.85}
.de-q{color:var(--de-ink);font-weight:600;margin:.3rem 0 .45rem;font-size:.86rem}
.de-opts{display:grid;grid-template-columns:repeat(auto-fit,minmax(9.5rem,1fr));gap:.3rem}
.de-opt{border:1px solid var(--border,#e6e4d9);border-radius:.35rem;padding:.25rem .45rem;font-size:.78rem;display:flex;flex-wrap:wrap;gap:.25rem;align-items:center}
.de-opt.gold{border-color:var(--brand,#3aa99f);box-shadow:inset 0 0 0 1px var(--brand,#3aa99f)}
.de-opt .lt{opacity:.55;font-size:.7rem}
.de-opt .tx{color:var(--de-ink);margin-right:auto}
.de-pick{display:inline-flex;align-items:center;gap:.2rem;font-size:.64rem;padding:0 .3rem;border-radius:.2rem;border:1px solid var(--border,#e6e4d9);color:var(--de-ink)}
.de-pick i{width:.55rem;height:.55rem;border-radius:.1rem;display:inline-block}
.de-lines{margin-top:.45rem;font-size:.74rem;display:grid;gap:.2rem}
.de-ok{color:var(--brand,#3aa99f);font-weight:600}
.de-pager{display:flex;gap:.5rem;align-items:center;justify-content:space-between;padding:.5rem .75rem;border-top:1px solid var(--border,#e6e4d9);font-size:.74rem}
.de-err{padding:1rem;font-size:.8rem}
/* suite-specific text: shown only while that suite is selected */
[data-suite]{display:none}
div[data-suite].on{display:block}
span[data-suite].on{display:inline}
/* hover citations */
.de-cite{position:relative;cursor:help;white-space:nowrap}
.de-cite>a{text-decoration:none;font-variant-numeric:tabular-nums}
.de-cite::after{content:attr(data-ref);position:absolute;left:50%;bottom:1.7em;transform:translateX(-50%);
  width:min(30rem,82vw);z-index:60;background:#17181a;color:#f2f3f5;font-size:.78rem;line-height:1.5;font-weight:400;
  padding:.6rem .75rem;border-radius:.35rem;border:1px solid #33363b;box-shadow:0 8px 28px rgba(0,0,0,.4);
  display:none;white-space:normal;text-align:left;pointer-events:none}
/* display:none, not visibility:hidden: a hidden tooltip near the right edge would still widen the page on phones */
.de-cite:hover::after{display:block}
.de-refs{font-size:.82rem}
.de-refs li{margin:.3rem 0}
/* citation: plain, copyable BibTeX with a copy button, as in the other reports */
.content .language-bibtex .highlight span{color:#24292f!important;font-style:normal!important;font-weight:normal!important}
.content .language-bibtex{position:relative}
.de-copy{position:absolute;top:.5rem;right:.5rem;font:600 .68rem/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.03em;padding:.4em .7em;border-radius:6px;border:1px solid #d0d7de;background:rgba(255,255,255,.85);color:#57606a;cursor:pointer;opacity:.8;transition:opacity .15s,background .15s,color .15s}
.de-copy:hover{opacity:1;background:#efece2}
.de-copy.ok{color:#1a7f37;border-color:#1a7f37}
</style>

<div class="de-abstract" markdown="1">

**decision-eval** compares zero-shot decision models on identical requests and reports accuracy, latency, cost and calibration per *suite*. A decision model is a zero-shot classifier with a typed interface: given a text and a set of questions, it returns calibrated probabilities over the answers you allow, in one of three modes: `choice` (pick one of *k* options), `noul` (yes/no) or `score` (a level on an ordered scale). It never generates text. Each suite asks every item in every mode it supports, so the same item is scored as a choice, a verification and a rating. Code and per-item results: [NISH1001/decision-eval](https://github.com/NISH1001/decision-eval).

</div>

**Models.**

<ul class="de-models">
<li><b>Laya</b>, english checkpoint: <a href="https://huggingface.co/convaiinnovations/laya">convaiinnovations/laya</a> <span class="de-cite" data-ref="convaiinnovations/laya, Hugging Face model repository; laya Python package 0.3.10."><a href="#de-ref-laya">[1]</a></span>. ModernBERT-large <span class="de-cite" data-ref="Warner, B., et al. (2024). Smarter, Better, Faster, Longer: A Modern Bidirectional Encoder for Fast, Memory Efficient, and Long Context Finetuning and Inference. arXiv:2412.13663."><a href="#de-ref-modernbert">[2]</a></span>, ~395M parameters, local (PyTorch).</li>
<li><b>Laya typed</b>, typed-decisions checkpoint: <a href="https://huggingface.co/convaiinnovations/laya-typed-decisions">convaiinnovations/laya-typed-decisions</a>. Same backbone, different training mix; local.</li>
<li><b>GLiNER</b>: <a href="https://huggingface.co/fastino/GLiNER2.5-Decide">fastino/GLiNER2.5-Decide</a> <span class="de-cite" data-ref="fastino/GLiNER2.5-Decide, Hugging Face model card."><a href="#de-ref-gliner">[3]</a></span>, DeBERTa-v3-large <span class="de-cite" data-ref="He, P., Gao, J., &amp; Chen, W. (2021). DeBERTaV3: Improving DeBERTa using ELECTRA-Style Pre-Training with Gradient-Disentangled Embedding Sharing. arXiv:2111.09543."><a href="#de-ref-deberta">[4]</a></span>, ~435M parameters, run locally through an fp32 ONNX export (<a href="https://huggingface.co/nishparadox/gliner2.5-decide-onnx">nishparadox/gliner2.5-decide-onnx</a>) with exact parity to PyTorch.</li>
<li><b>Jev 1.14</b>: <a href="https://openrouter.ai/typesafe/jev-1.14">typesafe/jev-1.14</a> on OpenRouter's decisions API <span class="de-cite" data-ref="TypeSafe. Jev 1.14 (typesafe/jev-1.14), OpenRouter decisions API (/api/alpha/decisions). Snapshot typesafe/jev-1.14-20261014."><a href="#de-ref-jev">[5]</a></span>. Hosted; architecture and size undisclosed; USD 0.042 per million input tokens, output free (list price at time of run). Version reported by the API: <code>typesafe/jev-1.14-20261014</code>.</li>
<li><b>GPT-6 Luna</b>: <a href="https://developers.openai.com/api/docs/guides/decisions">gpt-6-luna</a> on OpenAI's Decisions API (<code>POST /v1/decisions</code>, public beta) <span class="de-cite" data-ref="OpenAI. Decisions API guide (POST /v1/decisions, beta); gpt-6-luna is the only supported model. developers.openai.com/api/docs/guides/decisions"><a href="#de-ref-openai">[7]</a></span>. Hosted; architecture and size undisclosed; USD 0.10 per million input tokens, output not billed on this endpoint (list price at time of run). The API reports only the alias <code>gpt-6-luna</code>; no dated snapshot is published, so the run records the model's creation date from the models endpoint (2026-09-14) and the run date (2026-10-16). Our modes map to its question types: choice → <code>choice</code>, noul → <code>predicate</code>, score → <code>score</code>; the state is sent as its JSON text.</li>
</ul>

<span class="de-side">Jev reports about 75 output tokens per request even though it returns only probabilities. That suggests a generative model behind the structured interface, but TypeSafe does not say. GPT-6 Luna reports zero output tokens.</span>

<div data-suite="stem-synth" markdown="1">

**Suite: STEM (synthetic).** 180 generated problems, 15 in each of 12 tiers from single-digit arithmetic through complex analysis, calculus and linear algebra to mechanics and E&M. Each problem has one correct answer and three distractors, which are common mistakes where one exists (kinetic energy without the ½, a determinant with the cofactor signs dropped, i² = +1). `noul` shows the correct answer half the time; `score` asks which order of magnitude the answer's absolute value falls in (five levels). Every model receives byte-identical requests.

</div>

<div class="de" id="de-ctl-mount"></div>

## 1. Accuracy

<figure class="de-figure de-wide" id="figure-1">
<div class="de" id="de-acc"><div class="de-err">Loading…</div></div>
<figcaption><strong>Figure 1 (interactive).</strong> Accuracy per category for each model and question mode; switch modes in the panel. Dashed line: chance. In score mode, black ticks mark a baseline that always guesses the category's most common level. Hover a bar for counts.<span data-suite="stem-synth"> Jev is near ceiling in every mode; GPT-6 Luna is clearly above chance everywhere but often picks the common-mistake distractor (a dropped ½, a flipped sign, a near-miss sum), even on multi-digit addition. GLiNER clears chance only in choice mode; both Laya checkpoints scatter around chance in every tier. Every hosted-model miss was checked against the answer key.</span></figcaption>
</figure>

<figure class="de-figure de-wide" id="table-1">
<div class="de" id="de-t1"></div>
<figcaption><strong>Table 1.</strong> Overall scores. Brackets: 95% bootstrap interval over items (1,000 resamples). Verify uses balanced accuracy, the mean of the accuracies on correct and on wrong shown answers, so a model that always answers yes scores 50%. Click a column to sort.</figcaption>
</figure>

<figure class="de-figure de-wide" id="figure-2">
<div class="de" id="de-ver"></div>
<figcaption><strong>Figure 2 (interactive).</strong> Verification in noul mode. Each dot is one item: the model's P(yes) that the answer shown with the problem is correct, in the lane for whether it actually was. A useful verifier puts the top lane right of the dashed line and the bottom lane left of it. Hover a dot for the item. <span data-suite="stem-synth">Both Laya checkpoints say yes to about 90% of statements and GLiNER says no to all of them. Jev separates the lanes almost perfectly (AUC 0.99) and GPT-6 Luna well (AUC 0.92). Constant answers give exactly chance-level balanced accuracy, which is why three different behaviours share 50% in Table 1.</span></figcaption>
</figure>

## 2. Latency and cost

<figure class="de-figure de-wide" id="figure-3">
<div class="de" id="de-lat"></div>
<figcaption><strong>Figure 3 (interactive).</strong> Score against median latency per item (log scale) with every question answered in one request. Vertical bars: 95% interval on the score. Horizontal bars: interquartile range of latency. Labels: cost per thousand items at the price billed. Up and to the left is better.<span data-suite="stem-synth"> Local models ran on an Apple-silicon laptop; hosted latency includes the network round trip (Jev via OpenRouter, GPT-6 Luna via OpenAI), measured from the same machine with 8 requests in flight.</span></figcaption>
</figure>

<figure class="de-figure de-wide" id="table-2">
<div class="de" id="de-t2"></div>
<figcaption><strong>Table 2.</strong> Latency per item, tokens and what the run cost, with the exact model version each API reported. Tokens and cost come from each response's usage field; GPT-6 Luna's cost is its input tokens at the list price, since the Decisions endpoint bills input only. Local models cost only the hardware they run on.<span data-suite="stem-synth"> Jev was run twice; its two runs agree on 177 of 180 choice picks, so hosted results can move by a point between runs.</span></figcaption>
</figure>

## 3. Calibration

<figure class="de-figure" id="figure-4">
<div class="de" id="de-cal"></div>
<figcaption><strong>Figure 4 (interactive).</strong> Reliability diagram for choice mode. Items are binned by the probability of the option picked; each point is a bin's mean confidence against its accuracy. Dashed: perfect calibration. ECE <span class="de-cite" data-ref="Guo, C., Pleiss, G., Sun, Y., &amp; Weinberger, K. Q. (2017). On Calibration of Modern Neural Networks. ICML 2017."><a href="#de-ref-guo">[6]</a></span>: the confidence–accuracy gap averaged over bins, weighted by size.<span data-suite="stem-synth"> Jev is accurate and calibrated. GPT-6 Luna is reliable when it is sure (93% right on its 103 answers given with ≥0.9 confidence) but overconfident in the middle range (ECE 0.10). Laya's curve is flat, so its confidence says nothing about correctness. Laya typed's low ECE comes from being unconfident and at chance, not from being right.</span></figcaption>
</figure>

## 4. Dataset explorer

<figure class="de-figure de-wide" id="figure-5">
<div class="de" id="de-ex"></div>
<figcaption><strong>Figure 5 (interactive).</strong> Every item and every model's answer in every mode. Filter by category, by who got it wrong, or search. The outlined option is the correct answer.</figcaption>
</figure>

<div class="de" id="de-dl"></div>

## Notes

<div data-suite="stem-synth" markdown="1">

* **Prompting.** One instruction wording, one seed and no tuning for any model. GLiNER's prompt format takes the option *text* as the label, where Laya and Jev see `A`–`D` with the text as the description, and it reserves `(` and `)`, which are swapped for brackets. Re-running Laya with option text as labels (on an earlier 100-item version) left it at chance.
* **Answer key.** Answers are exact to two decimals. An early version rounded to three significant figures, which made a correct rejection count as a miss; all models were re-run.
* **Scope.** Items are template-generated and per-tier n is 15; quote the overall intervals rather than single tiers.

</div>

**Code and data:** [github.com/NISH1001/decision-eval](https://github.com/NISH1001/decision-eval), with the per-item results for every model. To reproduce a suite without cloning anything (results go to `./results/`):

```bash
R="git+https://github.com/NISH1001/decision-eval"
uvx --from "decision-eval[laya] @ $R"   decision-eval run --suite stem-synth --backend laya        # and laya-typed
uvx --from "decision-eval[gliner] @ $R" decision-eval run --suite stem-synth --backend gliner
uvx --from "$R" decision-eval run --suite stem-synth --backend jev          # needs OPENROUTER_API_KEY
uvx --from "$R" decision-eval run --suite stem-synth --backend gpt-6-luna   # needs OPENAI_API_KEY
uvx --from "decision-eval[figures] @ $R" decision-eval figures --suite stem-synth   # paper figures + LaTeX table
```

## References

<ol class="de-refs">
<li id="de-ref-laya">convaiinnovations/laya. Hugging Face model repository (english and typed-decisions checkpoints); <code>laya</code> Python package 0.3.10.</li>
<li id="de-ref-modernbert">Warner, B., et al. (2024). Smarter, Better, Faster, Longer: A Modern Bidirectional Encoder for Fast, Memory Efficient, and Long Context Finetuning and Inference. arXiv:2412.13663.</li>
<li id="de-ref-gliner">fastino/GLiNER2.5-Decide. Hugging Face model card.</li>
<li id="de-ref-deberta">He, P., Gao, J., &amp; Chen, W. (2021). DeBERTaV3: Improving DeBERTa using ELECTRA-Style Pre-Training with Gradient-Disentangled Embedding Sharing. arXiv:2111.09543.</li>
<li id="de-ref-jev">TypeSafe. Jev 1.14 (<code>typesafe/jev-1.14</code>), OpenRouter decisions API. Snapshot <code>typesafe/jev-1.14-20261014</code>.</li>
<li id="de-ref-guo">Guo, C., Pleiss, G., Sun, Y., &amp; Weinberger, K. Q. (2017). On Calibration of Modern Neural Networks. <em>ICML 2017</em>.</li>
<li id="de-ref-openai">OpenAI. Decisions API guide (<code>POST /v1/decisions</code>, beta). developers.openai.com/api/docs/guides/decisions. Model <code>gpt-6-luna</code>, created 2026-09-14, accessed 2026-10-16.</li>
</ol>

## Citation

```bibtex
@techreport{nish2026decisioneval,
  author      = {Pantha, Nishan},
  title       = {decision-eval: Benchmarking Zero-Shot Decision Models},
  institution = {Bits and Paradoxes},
  type        = {Technical Report},
  year        = {2026},
  month       = oct,
  url         = {% raw %}{{% endraw %}{{ site.url }}{{ page.url }}{% raw %}}{% endraw %}
}
```

Plain text:

> Pantha, N. (2026). *decision-eval: Benchmarking Zero-Shot Decision Models.*
> Technical Report. <{{ site.url }}{{ page.url }}>

<!-- DATA:START -->
<script type="application/json" id="de-data">
{% raw %}{"suites":[{"id":"stem-synth","title":"STEM (synthetic)","blurb":"180 generated problems in 12 tiers, from single-digit arithmetic to calculus, complex analysis and electromagnetism. Distractors are common mistakes.","meta":{"suite":"stem-synth","title":"STEM (synthetic)","n":180,"modes":["choice","noul","score"],"categories":["1 single-digit","2 multi-digit +/-","3 multiply/divide","4 fractions/%","5 powers/roots/order","6 algebra","7 complex numbers","8 complex analysis","9 calculus","10 linear alg./number th.","11 physics: mechanics","12 physics: E&M/waves"],"groups":{"arithmetic":["1 single-digit","2 multi-digit +/-","3 multiply/divide","4 fractions/%","5 powers/roots/order"],"algebra & complex":["6 algebra","7 complex numbers","8 complex analysis"],"advanced math":["9 calculus","10 linear alg./number th."],"physics":["11 physics: mechanics","12 physics: E&M/waves"]},"chance":{"choice":0.25,"noul":0.5,"score":0.2},"score_labels":["0 to 9","10 to 99","100 to 999","1,000 to 9,999","10,000 or more"],"generated":"2026-10-16"},"items":[["1 single-digit","What is 6 - 3?",["1","0","3","2"],2,"3",true,0],["2 multi-digit +/-","What is 9364 + 2128?",["11418","11492","11486","11499"],1,"11492",true,4],["3 multiply/divide","What is 85 × 43?",["3655","3582","3584","3575"],0,"3655",true,3],["4 fractions/%","What is 1 + 5/4?",["9/4","6/5","5/2","9/2"],0,"9/4",true,0],["5 powers/roots/order","What is 3^4?",["27","12","81","84"],2,"81",true,1],["6 algebra","Solve for x: 3x + 15 = -9",["x = -8","x = -4","x = -5","x = -7"],0,"x = -4",false,0],["7 complex numbers","What is (1 - i) + (-4 + 3i)?",["-3 + 3i","5 - 4i","-3 - 2i","-3 + 2i"],3,"-3 + 2i",true,0],["8 complex analysis","What is the principal argument of -1 + i, in degrees?",["135°","-45°","-135°","225°"],0,"-45°",false,2],["9 calculus","If f(x) = 2x³ + 1x² + 3x + 8, what is f′(2)?",["31","13","29","34"],0,"13",false,1],["10 linear alg./number th.","What is 5^9 mod 9?",["7","1","8","0"],2,"0",false,0],["11 physics: mechanics","What is the kinetic energy of a 38 kg object moving at 7 m/s?",["266 J","931 J","1862 J","133 J"],1,"931 J",true,2],["12 physics: E&M/waves","How much energy, in millijoules, is stored in a 100 μF capacitor charged to 50 V?",["250 mJ","125000 mJ","125 mJ","2.5 mJ"],2,"125 mJ",true,2],["1 single-digit","What is 9 - 7?",["4","2","3","0"],1,"2",true,0],["2 multi-digit +/-","What is 9386 + 2578?",["11954","12043","11885","11964"],3,"11954",false,4],["3 multiply/divide","What is 73 × 33?",["2395","2409","2430","2443"],1,"2443",false,3],["4 fractions/%","What is 3.7 × 1.7?",["6.29","62.9","7.19","5.19"],0,"62.9",false,0],["5 powers/roots/order","What is 5^3?",["25","130","125","15"],2,"125",true,2],["6 algebra","Solve for x: 6x + 10 = -44",["x = -6","x = -7","x = -9","x = -5"],2,"x = -6",false,0],["7 complex numbers","What is (1 + 4i) + (-1 + 6i)?",["-10i","2 - 2i","11i","10i"],3,"2 - 2i",false,1],["8 complex analysis","Using De Moivre's theorem, what is (1 + i)^10?",["32i","-32i","16 + 16i","1024"],0,"32i",true,1],["9 calculus","What is the limit of sin(9x) / x as x approaches 0?",["0","9","1","1/9"],1,"0",false,0],["10 linear alg./number th.","What is the determinant of the matrix [[-4, -2, 3], [-2, 3, 1], [-2, 4, 4]]?",["-48","50","-50","-26"],2,"-48",false,1],["11 physics: mechanics","A 2 kg cart moving at 6 m/s hits a 9 kg cart at rest and they stick together. What is their speed after the collision?",["1.33 m/s","6 m/s","1.09 m/s","33 m/s"],2,"1.09 m/s",true,0],["12 physics: E&M/waves","What power is dissipated by a 10 Ω resistor with 12 V across it?",["14.4 W","1440 W","120 W","1.2 W"],0,"14.4 W",true,1],["1 single-digit","What is 7 + 3?",["12","13","7","10"],3,"10",true,1],["2 multi-digit +/-","What is 2071 + 9217?",["11174","11376","11389","11288"],3,"11376",false,4],["3 multiply/divide","What is 1564 ÷ 23?",["72","68","73","62"],1,"68",true,1],["4 fractions/%","What is 5% of 170?",["17","4.25","8.5","12.75"],2,"17",false,0],["5 powers/roots/order","What is 7^2?",["56","14","49","7"],2,"49",true,1],["6 algebra","Solve for x: x² - 15x + 56 = 0",["x = 1 or x = 56","x = 7 or x = 8","x = 7 or x = 9","x = -8 or x = -7"],1,"x = 7 or x = 8",true,0],["7 complex numbers","What is the modulus |5 + 12i|?",["14","17","169","13"],3,"13",true,1],["8 complex analysis","What is |(8 + 15i) × (7 - 24i)|?",["425","416","42","442"],0,"42",false,2],["9 calculus","If f(x) = 2x³ - 5x² - 7x - 1, what is f′(2)?",["-9","-19","7","-3"],3,"-9",false,0],["10 linear alg./number th.","What is the greatest common divisor of 42 and 56?",["14","28","42","56"],0,"14",true,1],["11 physics: mechanics","A car moving at 5 m/s accelerates at 4 m/s² for 3 s. What is its final speed?",["60 m/s","12 m/s","17 m/s","41 m/s"],2,"60 m/s",false,1],["12 physics: E&M/waves","How much energy, in millijoules, is stored in a 47 μF capacitor charged to 5 V?",["587.5 mJ","1.18 mJ","0.588 mJ","0.117 mJ"],2,"0.588 mJ",true,0],["1 single-digit","What is 9 - 7?",["2","0","5","1"],0,"1",false,0],["2 multi-digit +/-","What is 4532 + 5785?",["10317","10322","10314","10251"],0,"10314",false,4],["3 multiply/divide","What is 39 × 17?",["663","637","667","662"],0,"662",false,2],["4 fractions/%","What is 5% of 310?",["7.75","23.25","15.5","31"],2,"15.5",true,1],["5 powers/roots/order","What is the square root of 225?",["14","15","18","17"],1,"15",true,1],["6 algebra","Solve for x: x² - 7x + 10 = 0",["x = 2 or x = 6","x = -5 or x = -2","x = 1 or x = 10","x = 2 or x = 5"],3,"x = 2 or x = 6",false,0],["7 complex numbers","What is (-2 - 2i) + (4 - 3i)?",["2 + 5i","-6 + i","2 - 4i","2 - 5i"],3,"-6 + i",false,0],["8 complex analysis","What is |(8 + 15i) × (6 + 8i)|?",["168","170","187","27"],1,"170",true,2],["9 calculus","What is the integral of 8·sin(x) from x = 0 to x = π?",["-16","16","8","0"],1,"-16",false,1],["10 linear alg./number th.","What is the determinant of the matrix [[-3, -4, -4], [-2, 1, -3], [2, 3, 4]]?",["1","-12","15","-15"],3,"-12",false,1],["11 physics: mechanics","A cart starts at 15 m/s and accelerates at 3 m/s² for 2 s. How far does it travel?",["42 m","6 m","36 m","30 m"],2,"42 m",false,1],["12 physics: E&M/waves","What is the electric force between charges of 8 μC and 5 μC placed 0.1 m apart? (k = 8.99 × 10⁹ N·m²/C²)",["71.92 N","40.4 N","35.96 N","3.6 N"],2,"35.96 N",true,1],["1 single-digit","What is 7 - 2?",["4","6","5","3"],2,"5",true,0],["2 multi-digit +/-","What is 1730 - 3666?",["-1876","-1845","-1936","-2051"],2,"-1936",true,3],["3 multiply/divide","What is 2356 ÷ 31?",["74","78","76","75"],2,"75",false,1],["4 fractions/%","What is 5% of 120?",["9","3","12","6"],3,"6",true,0],["5 powers/roots/order","What is 4 + 8 × 7?",["61","60","84","58"],1,"84",false,1],["6 algebra","Solve for x: 8x - 13 = -5",["x = 4","x = 2","x = 0","x = 1"],3,"x = 1",true,0],["7 complex numbers","What is i^29?",["-i","1","i","-1"],2,"-1",false,0],["8 complex analysis","What is (11 - 3i) ÷ (2 - i)?",["25 + 5i","5 + i","5 - i","-5 - i"],1,"25 + 5i",false,0],["9 calculus","What is the limit of sin(2x) / x as x approaches 0?",["1","1/2","2","0"],2,"2",true,0],["10 linear alg./number th.","What is the greatest common divisor of 33 and 55?",["55","11","22","33"],1,"11",true,1],["11 physics: mechanics","What is the gravitational potential energy of a 26 kg mass raised 9 m? (g = 9.8 m/s²)",["254.8 J","2293.2 J","1146.6 J","234 J"],1,"2293.2 J",true,3],["12 physics: E&M/waves","How much energy, in millijoules, is stored in a 220 μF capacitor charged to 50 V?",["275 mJ","5.5 mJ","275000 mJ","550 mJ"],0,"5.5 mJ",false,2],["1 single-digit","What is 7 + 3?",["10","8","9","13"],0,"9",false,1],["2 multi-digit +/-","What is 6274 - 4527?",["1747","1683","1821","1764"],0,"1747",true,3],["3 multiply/divide","What is 51 × 4?",["250","242","205","204"],3,"204",true,2],["4 fractions/%","What is 1.2 × 8.2?",["8.74","10.74","9.84","98.4"],2,"9.84",true,0],["5 powers/roots/order","What is 5^4?",["630","20","125","625"],3,"630",false,2],["6 algebra","Solve for x: 8x - 13 = 75",["x = 10","x = 11","x = 14","x = 13"],1,"x = 11",true,1],["7 complex numbers","What is (2 - 3i) × (-6 - i)?",["-9 + 16i","-15 - 16i","-15 + 16i","-12 + 3i"],2,"-15 + 16i",true,1],["8 complex analysis","What is e^(iπ·2/2)?",["-i","1","-1","i"],2,"1",false,0],["9 calculus","What is the limit of sin(2x) / x as x approaches 0?",["2","0","1/2","1"],0,"2",true,0],["10 linear alg./number th.","What is 5^5 mod 16?",["6","9","7","5"],3,"6",false,0],["11 physics: mechanics","A ball is thrown straight up at 17 m/s. What maximum height does it reach? (g = 9.8 m/s²)",["0.867 m","14.7 m","1.73 m","29.5 m"],1,"14.7 m",true,1],["12 physics: E&M/waves","What is the equivalent resistance of a 3 Ω and a 15 Ω resistor in parallel?",["9 Ω","45 Ω","2.5 Ω","18 Ω"],2,"2.5 Ω",true,0],["1 single-digit","What is 1 - 3?",["-3","-2","-4","-5"],1,"-3",false,0],["2 multi-digit +/-","What is 5494 + 3224?",["8804","8826","8723","8718"],3,"8718",true,3],["3 multiply/divide","What is 1026 ÷ 38?",["30","23","27","28"],2,"27",true,1],["4 fractions/%","What is 5% of 280?",["14","21","7","28"],0,"14",true,1],["5 powers/roots/order","What is 9^2?",["9","90","18","81"],3,"90",false,1],["6 algebra","Solve for x: 7x + 19 = 12",["x = -1","x = 2","x = -4","x = 0"],0,"x = -4",false,0],["7 complex numbers","What is the modulus |-6 - 8i|?",["10","11","14","100"],0,"10",true,1],["8 complex analysis","What is |(3 + 4i) × (5 + 12i)|?",["63","70","65","18"],2,"65",true,1],["9 calculus","If f(x) = 4x³ + 2x² + 8x + 1, what is f′(-2)?",["-39","20","48","52"],2,"48",true,1],["10 linear alg./number th.","What is the determinant of the matrix [[-3, -6], [4, 6]]?",["-42","-6","6","3"],2,"6",true,0],["11 physics: mechanics","What is the kinetic energy of a 40 kg object moving at 30 m/s?",["1200 J","18000 J","600 J","36000 J"],1,"600 J",false,4],["12 physics: E&M/waves","What is the equivalent resistance of a 8 Ω and a 30 Ω resistor in parallel?",["6.32 Ω","240 Ω","38 Ω","19 Ω"],0,"6.32 Ω",true,0],["1 single-digit","What is 4 + 3?",["5","6","10","7"],3,"6",false,0],["2 multi-digit +/-","What is 173 + 7878?",["8057","8081","8169","8051"],3,"8051",true,3],["3 multiply/divide","What is 2025 ÷ 45?",["47","42","45","39"],2,"45",true,1],["4 fractions/%","What is 10% of 210?",["42","10.5","31.5","21"],3,"31.5",false,1],["5 powers/roots/order","What is the square root of 36?",["4","8","7","6"],3,"6",true,0],["6 algebra","Solve for x: 5x + 5 = 15",["x = 1","x = -2","x = 2","x = 4"],2,"x = 1",false,0],["7 complex numbers","What is the modulus |-7 - 24i|?",["26","25","31","625"],1,"31",false,1],["8 complex analysis","What is (-2 + 6i) ÷ (2 + 2i)?",["-1 - 2i","8 + 16i","1 - 2i","1 + 2i"],3,"1 + 2i",true,0],["9 calculus","What is the limit of sin(3x) / x as x approaches 0?",["1/3","3","1","0"],1,"1/3",false,0],["10 linear alg./number th.","What is the determinant of the matrix [[3, -2, -1], [-4, 2, 4], [-2, 2, 1]]?",["-22","6","0","-6"],3,"-22",false,0],["11 physics: mechanics","A car moving at 17 m/s accelerates at 6 m/s² for 2 s. What is its final speed?",["12 m/s","204 m/s","29 m/s","41 m/s"],2,"12 m/s",false,1],["12 physics: E&M/waves","What is the electric force between charges of 5 μC and 7 μC placed 0.3 m apart? (k = 8.99 × 10⁹ N·m²/C²)",["3.5 N","6.99 N","0.35 N","1.05 N"],0,"6.99 N",false,0],["1 single-digit","What is 9 + 8?",["17","19","15","16"],0,"17",true,1],["2 multi-digit +/-","What is 7341 + 8363?",["15622","15804","15693","15704"],3,"15704",true,4],["3 multiply/divide","What is 1554 ÷ 21?",["74","73","79","68"],0,"74",true,1],["4 fractions/%","What is 25% of 340?",["85","42.5","127.5","170"],0,"85",true,1],["5 powers/roots/order","What is 8^2?",["64","16","72","8"],0,"16",false,1],["6 algebra","Solve for x: x² - 7x + 10 = 0",["x = 1 or x = 10","x = -5 or x = -2","x = 2 or x = 6","x = 2 or x = 5"],3,"x = 2 or x = 6",false,0],["7 complex numbers","What is the complex conjugate of 2 + 3i?",["2 - 3i","-2 - 3i","3 + 2i","-2 + 3i"],0,"-2 + 3i",false,0],["8 complex analysis","What is the principal argument of √3 + i, in degrees?",["120°","30°","-30°","60°"],1,"30°",true,1],["9 calculus","If f(x) = 4x³ - 3x² - 4x - 8, what is f′(2)?",["32","38","4","6"],0,"38",false,1],["10 linear alg./number th.","What is the determinant of the matrix [[-2, -5], [0, 4]]?",["-8","8","10","2"],0,"8",false,0],["11 physics: mechanics","What is the kinetic energy of a 15 kg object moving at 21 m/s?",["6615 J","157.5 J","315 J","3307.5 J"],3,"3307.5 J",true,3],["12 physics: E&M/waves","What is the equivalent resistance of a 8 Ω and a 3 Ω resistor in parallel?",["11 Ω","2.18 Ω","24 Ω","5.5 Ω"],1,"2.18 Ω",true,0],["1 single-digit","What is 5 + 3?",["8","7","9","11"],0,"8",true,0],["2 multi-digit +/-","What is 4429 + 288?",["4795","4749","4794","4717"],3,"4717",true,3],["3 multiply/divide","What is 19 × 9?",["177","178","166","171"],3,"178",false,2],["4 fractions/%","What is 4/3 + 1?",["8/3","14/3","7/3","5/4"],2,"7/3",true,0],["5 powers/roots/order","What is 6 + 2 × 6?",["18","48","19","16"],0,"18",true,1],["6 algebra","Solve for x: x² - 6x + 8 = 0",["x = 2 or x = 5","x = -4 or x = -2","x = 1 or x = 8","x = 2 or x = 4"],3,"x = 1 or x = 8",false,0],["7 complex numbers","What is (-4 + 5i) × (-1 - 3i)?",["4 - 15i","19 + 7i","-11 + 7i","19 - 7i"],1,"19 + 7i",true,1],["8 complex analysis","What is |(8 + 15i) × (7 - 24i)|?",["416","442","42","425"],3,"416",false,2],["9 calculus","What is the definite integral of 12x² + 10x from x = 0 to x = 5?",["1750","130","350","625"],3,"625",true,2],["10 linear alg./number th.","What is the determinant of the matrix [[-6, -6], [-4, 2]]?",["44","-36","36","12"],1,"-36",true,1],["11 physics: mechanics","A cart starts at 1 m/s and accelerates at 6 m/s² for 3 s. How far does it travel?",["27 m","57 m","3 m","30 m"],3,"30 m",true,1],["12 physics: E&M/waves","How much energy, in millijoules, is stored in a 10 μF capacitor charged to 25 V?",["6.25 mJ","0.125 mJ","3125 mJ","3.12 mJ"],3,"3.12 mJ",true,0],["1 single-digit","What is 1 + 1?",["-1","1","4","2"],3,"4",false,0],["2 multi-digit +/-","What is 6129 - 5356?",["853","777","672","773"],3,"853",false,2],["3 multiply/divide","What is 85 × 21?",["1785","1717","1784","1748"],0,"1717",false,3],["4 fractions/%","What is 75% of 150?",["56.25","112.5","168.75","225"],1,"112.5",true,2],["5 powers/roots/order","What is 3 + 9 × 3?",["28","30","36","31"],1,"30",true,1],["6 algebra","Solve for x: 8x - 19 = -75",["x = -5","x = -7","x = -10","x = -4"],1,"x = -4",false,0],["7 complex numbers","What is the complex conjugate of 5 - i?",["5 + i","-5 + i","-5 - i","-1 + 5i"],0,"-5 + i",false,0],["8 complex analysis","What is the principal argument of 1 + √3i, in degrees?",["-60°","60°","30°","150°"],1,"60°",true,1],["9 calculus","What is the integral of 4·sin(x) from x = 0 to x = π?",["4","-8","8","0"],2,"4",false,0],["10 linear alg./number th.","What is the determinant of the matrix [[-1, 1, -1], [0, -3, -2], [-3, -1, 2]]?",["-23","6","23","11"],2,"-23",false,1],["11 physics: mechanics","An object is dropped from rest from a height of 10 m. How long does it take to hit the ground? (g = 9.8 m/s²)",["1.01 s","1.02 s","2.04 s","1.43 s"],3,"1.43 s",true,0],["12 physics: E&M/waves","A wave has frequency 440 Hz and wavelength 0.5 m. What is its speed?",["440.5 m/s","0.00114 m/s","880 m/s","220 m/s"],3,"440.5 m/s",false,2],["1 single-digit","What is 5 + 8?",["10","14","11","13"],3,"13",true,1],["2 multi-digit +/-","What is 1703 + 6974?",["8739","8769","8677","8644"],2,"8769",false,3],["3 multiply/divide","What is 304 ÷ 19?",["17","10","11","16"],3,"11",false,1],["4 fractions/%","What is 9.4 × 2.2?",["21.58","20.68","206.8","19.58"],1,"206.8",false,1],["5 powers/roots/order","What is the square root of 576?",["28","21","25","24"],3,"25",false,1],["6 algebra","Solve for x: x² - 15x + 56 = 0",["x = 1 or x = 56","x = 7 or x = 9","x = 7 or x = 8","x = -8 or x = -7"],2,"x = -8 or x = -7",false,0],["7 complex numbers","What is (1 + 4i) × (2 + 5i)?",["2 + 20i","-18 - 13i","-18 + 13i","22 + 13i"],2,"2 + 20i",false,1],["8 complex analysis","What is e^(iπ·5/2)?",["i","-1","-i","1"],0,"1",false,0],["9 calculus","What is the limit of (x² - 64) / (x - 8) as x approaches 8?",["64","16","0","8"],1,"16",true,1],["10 linear alg./number th.","What is the greatest common divisor of 39 and 52?",["13","52","26","39"],0,"13",true,1],["11 physics: mechanics","What is the gravitational potential energy of a 6 kg mass raised 44 m? (g = 9.8 m/s²)",["58.8 J","264 J","2587.2 J","1293.6 J"],2,"264 J",false,3],["12 physics: E&M/waves","A 120 V battery is connected across a 10 Ω resistor. What current flows?",["12 A","6 A","0.0833 A","1200 A"],0,"1200 A",false,1],["1 single-digit","What is 1 + 4?",["4","5","2","7"],1,"4",false,0],["2 multi-digit +/-","What is 4966 - 3333?",["1633","1538","1719","1565"],0,"1538",false,3],["3 multiply/divide","What is 852 ÷ 12?",["71","69","67","66"],0,"69",false,1],["4 fractions/%","What is 2/7 + 3/7?",["6/7","5/14","10/7","5/7"],3,"5/14",false,0],["5 powers/roots/order","What is 9^3?",["738","81","729","27"],2,"738",false,2],["6 algebra","Solve for x: 7x + 1 = -41",["x = -6","x = -2","x = -4","x = -5"],0,"x = -2",false,0],["7 complex numbers","What is (4 + i) × (6 - 5i)?",["29 + 14i","19 - 14i","29 - 14i","24 - 5i"],2,"19 - 14i",false,1],["8 complex analysis","What is |(3 + 4i) × (7 + 24i)|?",["30","125","117","130"],1,"125",true,2],["9 calculus","If f(x) = 1x³ - 6x² - 3x + 6, what is f′(-4)?",["-142","93","37","69"],1,"69",false,1],["10 linear alg./number th.","What is the sum of the eigenvalues of the matrix [[-7, -3], [-8, 5]]?",["-35","-13","-2","-59"],2,"-13",false,0],["11 physics: mechanics","A ball is thrown straight up at 11 m/s. What maximum height does it reach? (g = 9.8 m/s²)",["0.561 m","1.12 m","12.3 m","6.17 m"],3,"1.12 m",false,0],["12 physics: E&M/waves","What is the electric force between charges of 5 μC and 5 μC placed 0.2 m apart? (k = 8.99 × 10⁹ N·m²/C²)",["11.2 N","1.12 N","5.62 N","0.562 N"],2,"5.62 N",true,0],["1 single-digit","What is 1 + 8?",["11","7","8","9"],3,"9",true,0],["2 multi-digit +/-","What is 2586 - 354?",["2122","2232","2204","2230"],1,"2122",false,3],["3 multiply/divide","What is 1470 ÷ 49?",["31","30","36","34"],1,"34",false,1],["4 fractions/%","What is 0.7 × 3.7?",["3.49","2.59","1.49","25.9"],1,"2.59",true,0],["5 powers/roots/order","What is 7^4?",["2401","2408","343","28"],0,"2401",true,3],["6 algebra","Solve for x: x² - 13x + 40 = 0",["x = 5 or x = 8","x = 1 or x = 40","x = -8 or x = -5","x = 5 or x = 9"],0,"x = 5 or x = 8",true,0],["7 complex numbers","What is the complex conjugate of -1 + 3i?",["-1 - 3i","3 - i","1 + 3i","1 - 3i"],0,"1 - 3i",false,0],["8 complex analysis","What is e^(iπ·7/2)?",["1","-i","i","-1"],1,"i",false,0],["9 calculus","If f(x) = 3x³ - 2x² - 1x + 4, what is f′(-2)?",["15","39","-26","43"],3,"39",false,1],["10 linear alg./number th.","What is the determinant of the matrix [[0, 4, 3], [1, 4, -3], [4, 4, 3]]?",["24","96","-96","0"],2,"-96",true,1],["11 physics: mechanics","A car moving at 12 m/s accelerates at 4 m/s² for 5 s. What is its final speed?",["240 m/s","32 m/s","20 m/s","112 m/s"],1,"112 m/s",false,1],["12 physics: E&M/waves","How much energy, in millijoules, is stored in a 10 μF capacitor charged to 50 V?",["25 mJ","12500 mJ","12.5 mJ","0.25 mJ"],2,"12.5 mJ",true,1],["1 single-digit","What is 9 - 5?",["6","3","4","7"],2,"3",false,0],["2 multi-digit +/-","What is 6228 - 1838?",["4370","4491","4467","4390"],3,"4491",false,3],["3 multiply/divide","What is 45 × 20?",["878","938","883","900"],3,"883",false,2],["4 fractions/%","What is 75% of 60?",["90","22.5","45","67.5"],2,"45",true,1],["5 powers/roots/order","What is 5 + 3 × 8?",["30","29","27","64"],1,"29",true,1],["6 algebra","Solve for x: 4x - 18 = -26",["x = -2","x = -5","x = -3","x = 1"],0,"x = -3",false,0],["7 complex numbers","What is (1 - i) + (-1 - 2i)?",["-2i","3i","-3i","2 + i"],2,"-3i",true,0],["8 complex analysis","Using De Moivre's theorem, what is (1 + i)^10?",["16 + 16i","-32i","32i","1024"],2,"32i",true,1],["9 calculus","What is the definite integral of 3x² + 4x from x = 0 to x = 2?",["18","40","20","16"],3,"40",false,1],["10 linear alg./number th.","What is 3^17 mod 7?",["0","6","2","5"],3,"5",true,0],["11 physics: mechanics","A cart starts at 15 m/s and accelerates at 1 m/s² for 7 s. How far does it travel?",["24.5 m","129.5 m","105 m","154 m"],1,"154 m",false,2],["12 physics: E&M/waves","What is the electric force between charges of 8 μC and 9 μC placed 0.2 m apart? (k = 8.99 × 10⁹ N·m²/C²)",["32.4 N","3.24 N","16.2 N","1.62 N"],2,"16.2 N",true,1]],"models":[{"key":"laya","name":"Laya","checkpoint":"convaiinnovations/laya (english)","encoder":"ModernBERT-large","params":"~395M","runtime":"local · PyTorch","model_id":"convaiinnovations/laya@7b928d8 (english), laya 0.3.10","summary":{"choice":[0.24444444444444444,0.18333333333333332,0.3111111111111111],"noul":[0.5032114624505929,0.45555555555555555,0.5474308300395256],"score":[0.36666666666666664,0.29444444444444445,0.4388888888888889],"auc":0.5268033596837944,"says_yes":0.8944444444444445,"mae":0.9833333333333333,"latency_ms":44.57354149781165,"cost_usd":0.0},"preds":[[0,0.3902,0.1791,0.672,0,167],[0,0.3862,0.2764,0.8943,0,43],[1,0.319,0.217,0.7539,0,38],[0,0.6467,0.6467,0.9027,1,38],[0,0.4346,0.2122,0.4288,0,38],[0,0.3503,0.3503,0.9426,0,47],[3,0.7502,0.7502,0.9263,3,49],[0,0.341,0.341,0.8322,1,50],[2,0.3597,0.2562,0.886,1,57],[3,0.2852,0.2156,0.711,0,40],[2,0.3012,0.2596,0.8758,0,53],[2,0.3888,0.3888,0.8734,0,57],[3,0.3985,0.2056,0.5379,0,39],[0,0.3972,0.2521,0.911,0,39],[0,0.4925,0.2023,0.7635,0,38],[0,0.5177,0.5177,0.8863,1,46],[0,0.3828,0.2577,0.3487,0,37],[0,0.5696,0.1181,0.8859,1,44],[3,0.5556,0.5556,0.9427,1,51],[2,0.3789,0.3441,0.9327,0,46],[0,0.5601,0.1337,0.9129,0,46],[0,0.4109,0.1817,0.9173,0,63],[1,0.5866,0.2682,0.9535,0,57],[0,0.6571,0.6571,0.9277,1,47],[0,0.323,0.1438,0.8812,0,38],[2,0.3237,0.2058,0.9372,1,40],[0,0.3764,0.2064,0.8494,0,40],[1,0.3072,0.2403,0.4927,0,43],[2,0.3199,0.3199,0.3949,0,38],[1,0.3369,0.3369,0.9124,0,50],[0,0.3286,0.1944,0.902,1,43],[3,0.3105,0.2926,0.958,1,47],[0,0.3381,0.1964,0.825,1,53],[2,0.4587,0.1961,0.8736,0,43],[3,0.3417,0.1859,0.9201,0,58],[1,0.3709,0.2664,0.8829,0,52],[1,0.5883,0.1827,0.7469,0,40],[0,0.3254,0.3254,0.9042,1,40],[3,0.2961,0.2539,0.8178,0,38],[0,0.4798,0.2101,0.5093,0,39],[0,0.3078,0.2418,0.2825,0,41],[2,0.4109,0.286,0.8453,1,47],[0,0.3791,0.1789,0.9726,0,49],[0,0.351,0.2351,0.9544,1,49],[3,0.4116,0.1387,0.8144,0,59],[0,0.577,0.1156,0.9005,0,65],[0,0.4181,0.1882,0.8472,0,57],[0,0.4013,0.331,0.9066,1,65],[0,0.3023,0.2766,0.6409,0,40],[0,0.4814,0.1846,0.6973,0,41],[0,0.283,0.2712,0.7777,0,39],[0,0.3296,0.1673,0.5279,0,39],[0,0.4679,0.1816,0.8868,1,39],[2,0.4438,0.1601,0.9707,1,46],[0,0.3807,0.1972,0.1644,0,38],[2,0.3763,0.1869,0.9485,1,47],[0,0.3555,0.2501,0.8689,0,48],[3,0.6312,0.083,0.8884,0,43],[1,0.3564,0.3564,0.7423,1,53],[0,0.5463,0.5463,0.8066,0,54],[0,0.4257,0.4257,0.8866,0,38],[0,0.4068,0.4068,0.3039,1,39],[1,0.2912,0.208,0.8514,0,37],[0,0.7436,0.0893,0.9114,1,45],[1,0.2745,0.2148,0.3892,0,38],[3,0.7278,0.0797,0.9485,0,43],[2,0.2845,0.2845,0.9497,0,47],[3,0.4243,0.2129,0.8038,1,47],[1,0.4103,0.258,0.8689,0,47],[0,0.3137,0.3062,0.8241,1,40],[0,0.6976,0.1899,0.8553,1,57],[0,0.4551,0.1377,0.9275,1,53],[0,0.6738,0.2009,0.6845,3,39],[0,0.3896,0.193,0.9205,0,39],[1,0.2897,0.2293,0.8495,0,41],[0,0.4046,0.4046,0.3263,1,41],[0,0.4495,0.1743,0.5211,0,38],[3,0.5073,0.1356,0.9225,0,42],[0,0.332,0.332,0.8838,1,49],[2,0.2996,0.2996,0.9416,1,46],[2,0.4957,0.4957,0.9074,1,55],[0,0.3137,0.1694,0.8787,0,52],[0,0.3219,0.2949,0.7979,0,46],[2,0.35,0.3452,0.9194,1,47],[0,0.5258,0.1455,0.8804,1,38],[3,0.2826,0.2826,0.9001,0,38],[2,0.4801,0.4801,0.844,0,38],[1,0.3124,0.1719,0.4925,1,38],[2,0.2814,0.1941,0.3582,0,39],[0,0.3928,0.2528,0.918,0,43],[0,0.3323,0.2979,0.9313,1,44],[0,0.4552,0.2146,0.9288,0,50],[1,0.2736,0.2736,0.8684,0,47],[2,0.4496,0.1605,0.896,1,61],[0,0.6054,0.1531,0.9585,0,55],[0,0.5059,0.5059,0.9123,1,62],[0,0.3466,0.3466,0.9062,1,41],[0,0.2874,0.2032,0.9068,1,41],[0,0.3234,0.3234,0.8166,0,38],[0,0.2898,0.2898,0.5328,0,38],[2,0.2852,0.2725,0.2875,0,37],[2,0.3194,0.2584,0.8453,1,46],[2,0.4612,0.124,0.8099,1,45],[3,0.3198,0.25,0.7583,1,50],[2,0.422,0.2574,0.8788,1,52],[0,0.3706,0.3706,0.9261,0,51],[0,0.3996,0.1445,0.8099,0,48],[0,0.4512,0.3694,0.9076,1,47],[0,0.5149,0.5149,0.8967,1,37],[0,0.3358,0.2254,0.9197,0,39],[0,0.3107,0.2025,0.91,0,38],[0,0.484,0.1573,0.9366,1,39],[0,0.3581,0.3581,0.9006,1,38],[2,0.3642,0.3249,0.7613,0,44],[1,0.3282,0.3282,0.9321,1,48],[1,0.2896,0.2706,0.963,1,47],[2,0.3086,0.1553,0.832,0,59],[0,0.3364,0.2778,0.9072,1,52],[0,0.75,0.041,0.3109,1,56],[0,0.4718,0.0907,0.8783,0,55],[1,0.3927,0.2711,0.8505,3,37],[0,0.3084,0.2043,0.7217,1,38],[2,0.2755,0.2536,0.7795,0,37],[0,0.3828,0.1945,0.6797,1,41],[2,0.2963,0.2408,0.9085,0,39],[0,0.3482,0.2886,0.945,0,43],[2,0.3766,0.1222,0.9284,1,45],[1,0.3646,0.3646,0.7816,1,50],[3,0.4343,0.1776,0.7873,0,53],[0,0.3619,0.2382,0.9016,0,63],[0,0.7993,0.0277,0.9398,0,59],[0,0.8886,0.0173,0.906,0,51],[1,0.3197,0.214,0.9084,1,39],[0,0.3328,0.2122,0.9257,1,40],[0,0.3423,0.1952,0.7114,0,39],[3,0.3213,0.2408,0.9233,1,42],[2,0.2835,0.2536,0.4179,0,39],[1,0.3068,0.2068,0.9271,0,47],[3,0.3623,0.2809,0.9546,1,46],[0,0.4961,0.4961,0.8177,1,45],[0,0.4121,0.1399,0.8849,0,54],[3,0.4783,0.1981,0.8987,0,44],[0,0.3804,0.2583,0.8402,0,54],[0,0.4546,0.4546,0.5453,0,48],[0,0.6017,0.1651,0.7949,1,38],[0,0.402,0.402,0.6517,0,39],[0,0.3123,0.3123,0.864,0,38],[0,0.3187,0.2398,0.8854,1,43],[0,0.37,0.254,0.4125,0,38],[0,0.3544,0.3544,0.9721,0,43],[2,0.4649,0.4649,0.9327,1,46],[1,0.3608,0.3608,0.9401,1,47],[2,0.3811,0.1571,0.9193,1,56],[0,0.4839,0.1881,0.8392,0,55],[0,0.8007,0.048,0.8387,1,56],[0,0.4073,0.3147,0.9253,1,63],[2,0.5072,0.2218,0.8898,1,38],[2,0.2819,0.2134,0.4528,0,42],[0,0.3996,0.2033,0.8432,0,39],[0,0.7014,0.1184,0.9093,0,45],[0,0.4064,0.4064,0.1301,0,37],[0,0.3637,0.3637,0.9217,0,45],[2,0.3879,0.2514,0.8503,1,46],[0,0.571,0.1233,0.7811,1,43],[0,0.4656,0.121,0.915,1,52],[3,0.3572,0.1504,0.8425,0,54],[1,0.3794,0.3794,0.9451,0,53],[0,0.5483,0.1263,0.8524,0,51],[0,0.3227,0.2227,0.5071,0,39],[3,0.3099,0.3099,0.3686,0,40],[0,0.2968,0.2093,0.7738,0,38],[0,0.3027,0.2981,0.644,1,39],[0,0.4703,0.1585,0.923,1,39],[0,0.4837,0.4837,0.942,0,43],[3,0.6601,0.1148,0.9615,1,45],[0,0.5986,0.1681,0.9327,0,46],[0,0.3692,0.1717,0.8566,0,53],[0,0.6979,0.0726,0.7358,0,40],[0,0.6594,0.1164,0.4167,0,65],[0,0.3921,0.2395,0.8894,1,64]]},{"key":"laya-typed","name":"Laya typed","checkpoint":"convaiinnovations/laya (typed-decisions)","encoder":"ModernBERT-large","params":"~395M","runtime":"local · PyTorch","model_id":"convaiinnovations/laya@7b928d8 (typed-decisions), laya 0.3.10","summary":{"choice":[0.26666666666666666,0.2,0.3277777777777778],"noul":[0.4866600790513834,0.44108215070802315,0.5320478150713801],"score":[0.42777777777777776,0.35555555555555557,0.5],"auc":0.5210597826086957,"says_yes":0.9,"mae":0.8388888888888889,"latency_ms":46.4023954700678,"cost_usd":0.0},"preds":[[0,0.3283,0.2202,0.5621,0,128],[2,0.286,0.2849,0.7056,1,44],[2,0.2622,0.2347,0.5704,1,40],[0,0.41,0.41,0.6747,1,40],[0,0.3003,0.2558,0.5017,1,40],[3,0.2687,0.2522,0.7839,0,49],[3,0.4597,0.4597,0.7607,3,51],[0,0.3193,0.3193,0.6968,1,52],[2,0.2996,0.2382,0.661,1,58],[1,0.2693,0.2391,0.5045,0,40],[2,0.2789,0.2441,0.708,0,51],[2,0.3316,0.3316,0.6643,0,58],[3,0.3518,0.2264,0.5453,0,38],[0,0.2893,0.2799,0.7155,1,39],[0,0.3048,0.2613,0.5954,1,39],[2,0.2806,0.2635,0.693,1,47],[2,0.2797,0.2797,0.4768,1,38],[0,0.2825,0.239,0.7111,1,43],[3,0.4356,0.4356,0.7311,1,52],[2,0.3758,0.2525,0.7424,1,48],[0,0.32,0.2151,0.733,0,47],[0,0.2902,0.252,0.7624,1,64],[1,0.5652,0.2327,0.7069,0,61],[0,0.3816,0.3816,0.7384,1,48],[2,0.2836,0.1983,0.6811,1,40],[2,0.2962,0.2239,0.7504,1,40],[0,0.2828,0.2401,0.6231,1,39],[1,0.2808,0.2639,0.4257,1,43],[3,0.2841,0.2789,0.5139,1,39],[1,0.3688,0.3688,0.7249,0,49],[2,0.2747,0.2359,0.7099,1,43],[3,0.2725,0.2707,0.7345,1,47],[2,0.3128,0.245,0.6343,1,53],[2,0.3653,0.1923,0.6668,1,44],[3,0.2746,0.2662,0.7742,0,58],[0,0.3049,0.2473,0.7018,0,52],[1,0.3866,0.2144,0.5867,0,39],[0,0.2865,0.2865,0.733,1,40],[3,0.2925,0.2348,0.6002,1,38],[0,0.3181,0.2575,0.448,1,40],[3,0.2537,0.2493,0.4343,1,39],[3,0.3691,0.3691,0.6982,0,45],[0,0.3183,0.1925,0.7796,4,46],[0,0.2889,0.2611,0.749,1,47],[3,0.345,0.2085,0.6824,0,55],[0,0.2968,0.2218,0.7372,0,63],[1,0.3531,0.2948,0.6836,0,57],[2,0.3009,0.3009,0.7247,1,66],[2,0.2754,0.2754,0.5764,0,40],[0,0.3113,0.2471,0.3464,1,41],[3,0.276,0.2705,0.5759,1,39],[0,0.278,0.2374,0.4505,1,39],[0,0.3034,0.2461,0.6837,1,39],[2,0.2941,0.2488,0.8378,1,46],[1,0.3034,0.2883,0.352,1,38],[2,0.3153,0.2301,0.7476,1,47],[0,0.2967,0.2379,0.7183,0,49],[3,0.4288,0.1674,0.7103,0,43],[1,0.3046,0.3046,0.6707,1,54],[2,0.3131,0.2813,0.6134,0,56],[0,0.3518,0.3518,0.6954,1,39],[0,0.3078,0.3078,0.4255,0,41],[1,0.2773,0.255,0.6342,1,39],[0,0.4044,0.2161,0.7208,1,46],[2,0.2767,0.2226,0.4655,1,38],[3,0.5002,0.1759,0.7943,1,44],[2,0.2967,0.2967,0.7614,1,47],[3,0.4086,0.2017,0.6373,1,49],[1,0.3063,0.2549,0.7183,0,50],[3,0.3403,0.3403,0.6366,1,43],[0,0.3736,0.3001,0.6602,1,61],[0,0.2959,0.2027,0.731,1,52],[0,0.3968,0.2817,0.579,1,39],[2,0.2737,0.2573,0.7415,1,40],[1,0.253,0.2523,0.5899,1,41],[0,0.3015,0.3015,0.3883,1,44],[0,0.3547,0.2124,0.5266,0,39],[3,0.3601,0.1172,0.7621,1,44],[1,0.2828,0.2811,0.6985,1,50],[2,0.2842,0.2842,0.7352,1,47],[2,0.3528,0.3528,0.7072,1,56],[1,0.2993,0.2328,0.7427,1,54],[2,0.2766,0.269,0.6881,1,47],[2,0.2784,0.2545,0.731,1,47],[0,0.3779,0.2055,0.6872,1,38],[3,0.2867,0.2867,0.7003,1,40],[2,0.4021,0.4021,0.6043,0,41],[1,0.2941,0.2261,0.4448,1,39],[2,0.2703,0.2354,0.4547,0,40],[2,0.3104,0.3104,0.7819,1,46],[1,0.2897,0.2897,0.752,1,46],[3,0.298,0.298,0.6875,1,53],[3,0.2894,0.2463,0.7141,0,48],[2,0.3076,0.2352,0.739,1,65],[0,0.3014,0.2761,0.7981,0,57],[0,0.3129,0.3129,0.7056,1,66],[1,0.302,0.282,0.7167,1,43],[0,0.2715,0.2332,0.7243,1,47],[0,0.2618,0.2618,0.6044,1,41],[0,0.2603,0.2603,0.4598,1,40],[3,0.2757,0.2294,0.4462,1,40],[2,0.3231,0.3002,0.6982,0,49],[2,0.4452,0.1251,0.4877,1,49],[3,0.3674,0.2366,0.6654,1,58],[2,0.344,0.2425,0.6456,1,55],[3,0.3116,0.2711,0.7709,0,52],[1,0.2821,0.2233,0.6809,1,51],[0,0.3414,0.328,0.7263,1,49],[0,0.3667,0.3667,0.7045,1,41],[0,0.2647,0.2313,0.7201,1,40],[0,0.2756,0.2349,0.6941,0,40],[1,0.3022,0.2321,0.7356,1,41],[0,0.2964,0.2964,0.6933,1,41],[3,0.3633,0.3633,0.3926,0,47],[1,0.3421,0.3421,0.72,1,52],[1,0.2794,0.2507,0.7486,1,48],[2,0.2848,0.2069,0.728,0,58],[0,0.2705,0.2607,0.7495,1,52],[2,0.3931,0.1548,0.5691,0,57],[1,0.2918,0.2279,0.6861,1,61],[1,0.3685,0.2851,0.6521,3,42],[2,0.2749,0.2421,0.5624,1,48],[1,0.2783,0.2296,0.5692,1,40],[2,0.2854,0.2302,0.5226,1,44],[0,0.2667,0.2594,0.7073,0,42],[1,0.2918,0.2918,0.7856,0,46],[2,0.3339,0.1602,0.6989,1,47],[1,0.3282,0.3282,0.6772,1,54],[3,0.3225,0.222,0.6928,0,55],[1,0.2797,0.2495,0.7596,2,66],[0,0.4748,0.1119,0.751,0,61],[0,0.613,0.1123,0.707,0,55],[0,0.284,0.2199,0.7161,1,43],[1,0.2974,0.238,0.7417,1,43],[0,0.2655,0.242,0.5737,0,40],[0,0.2806,0.1922,0.7193,1,44],[0,0.3073,0.2411,0.4311,1,41],[1,0.3408,0.2643,0.6317,0,49],[3,0.3586,0.2682,0.7603,1,47],[0,0.3837,0.3837,0.6563,1,47],[0,0.3369,0.1465,0.7496,0,57],[3,0.3904,0.1997,0.7055,0,46],[2,0.297,0.297,0.7104,0,57],[0,0.3114,0.3114,0.5113,1,51],[0,0.4569,0.2039,0.616,1,39],[0,0.2775,0.2775,0.5599,0,40],[2,0.2631,0.24,0.6421,1,41],[0,0.2772,0.2681,0.7077,1,45],[0,0.2814,0.2629,0.5121,0,39],[0,0.2589,0.2589,0.8028,0,45],[2,0.3435,0.3435,0.7393,1,48],[1,0.3013,0.3013,0.7337,1,48],[2,0.3264,0.2374,0.7191,1,57],[0,0.2827,0.2583,0.7051,1,58],[0,0.3939,0.1768,0.6302,1,59],[2,0.2834,0.2834,0.7568,1,66],[2,0.3954,0.2335,0.7016,1,40],[2,0.2737,0.2331,0.5282,0,44],[2,0.2631,0.2453,0.6042,1,40],[0,0.4528,0.2006,0.7213,0,46],[0,0.2829,0.2829,0.3267,1,40],[0,0.31,0.31,0.7518,0,47],[2,0.3338,0.1954,0.6675,1,48],[0,0.3987,0.1601,0.6405,1,44],[0,0.2914,0.2111,0.6819,1,55],[0,0.2906,0.1778,0.7024,0,56],[1,0.3243,0.3243,0.7852,0,56],[3,0.294,0.29,0.6461,0,54],[1,0.278,0.2431,0.5571,0,42],[3,0.2927,0.2927,0.5518,0,42],[1,0.2649,0.2342,0.5651,1,39],[2,0.2842,0.2842,0.523,1,40],[0,0.3163,0.2352,0.7269,1,41],[2,0.2769,0.26,0.7886,1,45],[3,0.5259,0.1824,0.7915,1,47],[0,0.3834,0.2559,0.7424,1,48],[0,0.2701,0.241,0.7261,0,55],[0,0.3886,0.177,0.6025,1,41],[2,0.3337,0.2647,0.6782,0,57],[2,0.3044,0.3044,0.7302,1,63]]},{"key":"gliner","name":"GLiNER","checkpoint":"fastino/GLiNER2.5-Decide (fp32 ONNX)","encoder":"DeBERTa-v3-large","params":"~435M","runtime":"local · ONNX Runtime","model_id":"nishparadox/gliner2.5-decide-onnx@bbbcdb0/model.onnx","summary":{"choice":[0.4888888888888889,0.4166666666666667,0.5611111111111111],"noul":[0.5,0.5,0.5],"score":[0.37777777777777777,0.3055555555555556,0.44458333333333316],"auc":0.4420701581027668,"says_yes":0.0,"mae":1.2666666666666666,"latency_ms":190.2752704918384,"cost_usd":0.0},"preds":[[0,0.2797,0.2554,0.4232,0,159],[1,0.2862,0.2862,0.4086,4,168],[0,0.3688,0.3688,0.4075,4,159],[0,0.3065,0.3065,0.4019,0,172],[2,0.3277,0.3277,0.4238,4,148],[1,0.5544,0.1852,0.4058,0,190],[0,0.5144,0.1987,0.3993,0,222],[1,0.4881,0.1527,0.3974,0,198],[1,0.3826,0.209,0.4121,1,254],[1,0.2716,0.2344,0.416,0,161],[1,0.6891,0.6891,0.3678,4,212],[2,0.4969,0.4969,0.3799,4,243],[1,0.2932,0.2932,0.426,0,149],[0,0.4495,0.1927,0.4114,4,167],[3,0.3329,0.2229,0.4135,4,158],[1,0.3029,0.2365,0.408,1,180],[2,0.3917,0.3917,0.421,4,148],[0,0.8952,0.0326,0.4005,1,193],[1,0.4571,0.2199,0.404,1,214],[0,0.622,0.622,0.4124,4,237],[0,0.3194,0.2178,0.4077,0,213],[0,0.4996,0.1806,0.3853,0,311],[2,0.6924,0.6924,0.3146,0,298],[0,0.6345,0.6345,0.3893,0,212],[2,0.3302,0.3019,0.4113,1,150],[1,0.3042,0.2343,0.4093,4,168],[1,0.3867,0.3867,0.4179,0,155],[0,0.387,0.1814,0.415,0,166],[2,0.3082,0.3082,0.4212,0,151],[1,0.312,0.312,0.3857,4,228],[3,0.3914,0.3914,0.4133,4,177],[2,0.3627,0.2098,0.4211,4,208],[0,0.3079,0.2251,0.4211,0,261],[0,0.4576,0.4576,0.3939,4,177],[0,0.5866,0.1264,0.3788,0,267],[2,0.6079,0.6079,0.3806,3,264],[3,0.2959,0.2491,0.4267,0,152],[2,0.2908,0.2332,0.4113,4,169],[3,0.3767,0.2188,0.4175,0,150],[2,0.4543,0.4543,0.4077,0,170],[1,0.3216,0.3216,0.4072,4,163],[3,0.2917,0.2917,0.3836,4,227],[1,0.5309,0.1378,0.4178,0,228],[1,0.6446,0.6446,0.4191,1,209],[0,0.3276,0.1981,0.3932,0,230],[1,0.4735,0.1796,0.3886,0,324],[0,0.4514,0.1991,0.367,0,261],[2,0.8145,0.8145,0.369,4,347],[2,0.2685,0.2685,0.4238,1,149],[2,0.5536,0.5536,0.4095,0,164],[3,0.3457,0.2272,0.4166,0,153],[3,0.3716,0.3716,0.4179,0,153],[2,0.3208,0.2236,0.4092,1,158],[3,0.6555,0.6555,0.3994,0,189],[2,0.3127,0.3127,0.4258,0,157],[0,0.3614,0.2155,0.4168,1,214],[2,0.3579,0.3579,0.4019,0,211],[1,0.4779,0.4779,0.3943,4,177],[1,0.6146,0.6146,0.3759,4,281],[1,0.4312,0.1896,0.3817,4,260],[2,0.3274,0.2226,0.4105,0,149],[0,0.5922,0.5922,0.416,0,166],[3,0.3799,0.3799,0.4173,4,148],[2,0.2779,0.2779,0.4094,3,180],[0,0.3587,0.2428,0.4179,4,148],[1,0.8974,0.8974,0.3896,4,185],[2,0.3167,0.3167,0.4076,0,226],[3,0.3046,0.1944,0.4165,0,196],[0,0.3207,0.3207,0.4006,0,212],[0,0.3215,0.2414,0.4075,0,167],[1,0.6296,0.6296,0.3753,0,301],[2,0.7186,0.7186,0.3674,0,227],[0,0.343,0.2594,0.417,0,162],[3,0.3471,0.3471,0.41,4,170],[2,0.3402,0.3402,0.4173,4,156],[0,0.3089,0.3089,0.4171,0,157],[1,0.3321,0.2163,0.4154,0,151],[2,0.7597,0.0891,0.4022,4,189],[0,0.3343,0.3343,0.4191,1,179],[2,0.4595,0.4595,0.4156,1,209],[2,0.4437,0.4437,0.41,1,263],[2,0.404,0.404,0.3956,0,239],[2,0.4943,0.1705,0.378,4,219],[0,0.8169,0.8169,0.3627,0,221],[1,0.3074,0.2401,0.4127,1,152],[3,0.3133,0.3133,0.4115,4,162],[2,0.3831,0.3831,0.4109,0,150],[2,0.3088,0.2428,0.407,1,165],[3,0.3145,0.3145,0.4023,0,159],[0,0.7426,0.1008,0.3693,4,184],[2,0.4027,0.2074,0.4137,0,178],[3,0.3178,0.3178,0.4214,0,229],[2,0.295,0.2042,0.4072,0,218],[0,0.3906,0.2175,0.395,0,321],[0,0.5863,0.1248,0.3757,0,278],[1,0.6677,0.1166,0.3673,4,340],[0,0.3553,0.3553,0.4145,1,150],[3,0.3516,0.3516,0.4114,4,170],[0,0.339,0.339,0.4126,4,153],[0,0.3501,0.3501,0.4099,0,160],[1,0.3243,0.2038,0.4191,0,150],[2,0.2883,0.2831,0.3849,4,225],[3,0.3385,0.3307,0.3961,4,202],[1,0.8554,0.8554,0.3844,0,200],[1,0.3678,0.2142,0.4182,1,274],[1,0.3371,0.2231,0.4043,0,239],[3,0.7346,0.7346,0.3666,4,223],[1,0.827,0.827,0.3655,0,222],[0,0.3209,0.3209,0.4108,0,151],[3,0.4268,0.4268,0.4078,4,166],[1,0.4782,0.1622,0.418,0,150],[2,0.3552,0.3552,0.404,1,175],[0,0.3722,0.3722,0.4115,0,162],[2,0.4227,0.2061,0.3776,0,230],[3,0.3429,0.2789,0.4147,0,228],[0,0.4574,0.1887,0.4196,1,210],[3,0.9102,0.9102,0.3753,4,224],[1,0.4249,0.4249,0.4003,0,247],[3,0.5331,0.5331,0.367,0,260],[3,0.5566,0.5566,0.382,4,261],[1,0.3052,0.2588,0.4205,0,161],[0,0.2973,0.24,0.4177,4,170],[1,0.5879,0.131,0.4046,4,162],[1,0.442,0.442,0.3962,1,178],[1,0.2937,0.2937,0.4084,1,169],[3,0.6399,0.1087,0.4042,4,196],[0,0.35,0.35,0.407,4,193],[1,0.729,0.729,0.3825,0,199],[0,0.5442,0.1707,0.3742,0,226],[0,0.435,0.2053,0.3944,0,328],[3,0.5934,0.5934,0.3755,0,324],[0,0.6155,0.1534,0.3788,0,247],[3,0.3521,0.3521,0.4145,1,153],[1,0.2862,0.2387,0.4092,4,171],[2,0.2801,0.2396,0.4152,4,151],[2,0.438,0.1937,0.4094,1,185],[2,0.3583,0.2208,0.4023,4,162],[3,0.4251,0.1811,0.382,4,234],[0,0.4428,0.151,0.3995,1,224],[3,0.3049,0.2963,0.4136,4,190],[1,0.6301,0.6301,0.3861,4,231],[0,0.5755,0.5755,0.3962,4,179],[1,0.5531,0.1597,0.3821,4,274],[3,0.4188,0.1902,0.3898,0,213],[0,0.3096,0.2505,0.4129,0,151],[1,0.447,0.1823,0.4138,4,174],[1,0.3358,0.2104,0.4158,4,161],[3,0.3621,0.3621,0.4044,0,186],[0,0.3071,0.2301,0.422,0,156],[1,0.7683,0.0759,0.4073,4,197],[1,0.2942,0.245,0.4026,1,223],[1,0.5853,0.5853,0.4168,1,211],[3,0.4797,0.1722,0.4177,1,267],[1,0.4735,0.1814,0.3815,0,271],[1,0.5395,0.1617,0.377,0,294],[2,0.7756,0.7756,0.3646,4,344],[3,0.3111,0.3111,0.4138,0,152],[0,0.3023,0.2245,0.4179,4,166],[3,0.3239,0.2277,0.4177,0,157],[1,0.3673,0.3673,0.4097,1,190],[0,0.3106,0.3106,0.4181,4,160],[3,0.3129,0.2891,0.3809,4,227],[0,0.3918,0.3918,0.3949,0,202],[2,0.3617,0.2013,0.4256,4,193],[1,0.4097,0.2032,0.4167,1,264],[2,0.4592,0.4592,0.3927,0,310],[3,0.7543,0.0779,0.381,0,267],[2,0.4969,0.4969,0.3768,4,255],[1,0.262,0.2458,0.4238,0,154],[1,0.2695,0.2449,0.4195,0,166],[2,0.3174,0.227,0.4118,0,162],[2,0.3505,0.3505,0.4022,1,163],[1,0.3266,0.3266,0.4101,4,161],[2,0.6687,0.1294,0.4154,4,199],[2,0.3315,0.3315,0.4084,0,218],[2,0.6333,0.6333,0.4118,1,232],[1,0.4198,0.1882,0.3908,4,229],[3,0.2945,0.2945,0.4103,4,163],[3,0.8403,0.0533,0.3647,0,263],[2,0.896,0.896,0.3646,1,338]]},{"key":"jev","name":"Jev","checkpoint":"typesafe/jev-1.14 (OpenRouter)","encoder":"undisclosed","params":"undisclosed","runtime":"hosted · OpenRouter","model_id":"typesafe/jev-1.14-20261014","summary":{"choice":[0.9388888888888889,0.9055555555555556,0.9666666666666667],"noul":[0.9508399209486166,0.9166656296665008,0.9783323346316455],"score":[0.9611111111111111,0.9333333333333333,0.9888888888888889],"auc":0.9925889328063241,"says_yes":0.5277777777777778,"mae":0.044444444444444446,"latency_ms":233.19995799101883,"cost_usd":0.003942246,"input_tokens":93863,"input_tokens_median":514.0,"output_tokens":13500,"output_tokens_median":75.0},"preds":[[2,1.0,1.0,0.99,0,640],[1,1.0,1.0,1.0,4,712],[0,1.0,1.0,1.0,3,631],[0,1.0,1.0,0.98,0,740],[2,1.0,1.0,0.99,1,641],[0,1.0,1.0,0.02,0,625],[3,1.0,1.0,0.99,0,721],[0,1.0,1.0,0.02,2,651],[0,0.81,0.81,0.23,1,215],[2,0.68,0.68,0.02,0,241],[1,0.99,0.99,0.99,2,241],[2,0.92,0.92,0.97,2,168],[1,1.0,1.0,1.0,0,271],[3,1.0,1.0,0.04,4,252],[1,1.0,1.0,0.01,3,168],[0,1.0,1.0,0.28,0,277],[2,1.0,1.0,1.0,2,177],[2,1.0,1.0,0.0,0,243],[3,1.0,1.0,0.01,1,153],[0,0.51,0.51,0.89,2,166],[1,1.0,1.0,0.01,0,209],[2,0.5,0.5,0.28,1,299],[2,0.95,0.95,0.92,0,173],[0,1.0,1.0,0.98,1,209],[3,1.0,1.0,0.99,1,210],[3,1.0,1.0,0.05,4,257],[1,1.0,1.0,1.0,1,207],[2,1.0,1.0,0.34,1,203],[2,1.0,1.0,1.0,1,199],[1,1.0,1.0,0.99,0,197],[3,1.0,1.0,0.99,1,204],[0,0.97,0.97,0.08,2,174],[0,0.44,0.25,0.81,0,243],[0,1.0,1.0,0.99,1,227],[2,1.0,1.0,0.01,1,205],[2,0.89,0.89,0.81,2,274],[0,1.0,1.0,0.01,0,270],[0,1.0,1.0,0.0,4,331],[0,1.0,1.0,0.01,2,184],[2,1.0,1.0,0.99,1,308],[1,1.0,1.0,0.99,1,245],[3,1.0,1.0,0.01,0,270],[3,1.0,1.0,0.01,0,180],[1,0.83,0.83,0.98,2,315],[1,1.0,1.0,0.05,1,180],[0,0.51,0.22,0.34,1,308],[2,0.77,0.77,0.87,1,481],[2,0.95,0.95,0.97,1,226],[2,1.0,1.0,1.0,0,186],[2,1.0,1.0,1.0,3,194],[2,1.0,1.0,0.01,1,164],[3,1.0,1.0,0.99,1,155],[1,0.99,0.99,0.01,1,199],[3,0.99,0.99,1.0,0,236],[2,0.71,0.71,0.05,0,168],[2,0.7,0.3,0.07,0,307],[2,1.0,1.0,0.99,0,312],[1,1.0,1.0,0.99,1,212],[1,0.99,0.99,0.97,3,209],[0,0.99,0.99,0.24,2,175],[0,1.0,1.0,0.01,1,254],[0,1.0,1.0,1.0,3,197],[3,1.0,1.0,0.99,2,250],[2,1.0,1.0,0.99,1,210],[3,1.0,1.0,0.01,2,221],[1,0.99,0.99,1.0,1,242],[2,0.59,0.59,0.93,1,179],[2,1.0,1.0,0.05,0,267],[0,1.0,1.0,0.99,0,250],[3,0.68,0.68,0.09,0,204],[1,0.98,0.98,0.97,1,202],[2,1.0,1.0,1.0,0,231],[1,1.0,1.0,0.01,0,319],[3,1.0,1.0,1.0,3,205],[2,1.0,1.0,0.99,1,254],[0,1.0,1.0,0.99,1,298],[3,1.0,1.0,0.01,1,225],[0,1.0,1.0,0.0,0,158],[0,1.0,1.0,0.99,1,210],[2,0.98,0.98,0.99,1,252],[1,0.42,0.14,0.17,1,199],[2,0.68,0.68,0.99,0,203],[1,0.95,0.95,0.03,4,195],[0,1.0,1.0,0.87,0,235],[3,1.0,1.0,0.01,0,264],[3,1.0,1.0,1.0,3,318],[2,0.98,0.98,1.0,1,274],[3,1.0,1.0,0.11,1,351],[3,1.0,1.0,0.98,0,234],[2,1.0,1.0,0.02,0,183],[1,1.0,1.0,0.02,1,230],[3,0.92,0.92,0.93,0,340],[1,1.0,1.0,0.02,0,211],[3,0.4,0.4,0.61,1,235],[2,1.0,1.0,0.01,1,187],[0,0.97,0.97,0.05,0,212],[0,1.0,1.0,1.0,1,240],[3,1.0,1.0,1.0,4,233],[0,1.0,1.0,1.0,1,206],[0,0.99,0.99,0.99,1,211],[0,1.0,1.0,0.08,1,225],[3,1.0,1.0,0.01,0,281],[0,1.0,1.0,0.01,0,228],[1,0.99,0.99,0.97,1,292],[2,0.36,0.24,0.08,1,213],[0,0.98,0.98,0.55,0,181],[3,1.0,1.0,0.99,3,180],[1,1.0,1.0,0.87,0,259],[0,1.0,1.0,0.99,0,197],[3,1.0,1.0,1.0,3,406],[3,0.99,0.99,0.01,2,190],[2,1.0,1.0,0.99,0,182],[0,1.0,1.0,1.0,1,193],[3,1.0,1.0,0.01,0,500],[3,0.66,0.3,0.56,1,455],[3,0.88,0.88,0.08,2,253],[3,0.86,0.86,0.52,2,194],[0,0.38,0.38,0.98,1,178],[0,0.54,0.38,0.64,1,188],[3,0.93,0.93,0.95,0,251],[3,1.0,1.0,0.01,0,250],[3,0.99,0.99,0.01,2,354],[0,1.0,1.0,0.01,3,216],[1,1.0,1.0,0.99,2,206],[1,0.97,0.97,1.0,1,174],[1,0.77,0.77,0.0,0,282],[0,1.0,1.0,0.01,0,969],[1,1.0,1.0,0.98,1,290],[2,1.0,1.0,0.02,0,205],[0,0.32,0.29,0.43,1,179],[3,1.0,1.0,1.0,0,213],[3,1.0,1.0,0.01,2,246],[3,1.0,1.0,0.99,1,162],[2,1.0,1.0,0.04,3,306],[3,1.0,1.0,0.01,1,224],[1,1.0,1.0,0.03,1,300],[3,1.0,1.0,0.01,1,261],[2,1.0,1.0,0.01,0,237],[2,0.99,0.99,0.01,1,1741],[0,0.86,0.86,0.04,0,143],[1,1.0,1.0,0.98,1,270],[0,1.0,1.0,0.99,1,295],[2,0.98,0.98,0.04,3,294],[0,1.0,1.0,0.01,1,234],[1,1.0,1.0,0.01,0,266],[0,1.0,1.0,0.0,3,156],[0,1.0,1.0,0.0,1,296],[3,1.0,1.0,0.02,0,211],[2,1.0,1.0,0.01,2,243],[0,1.0,1.0,0.01,0,201],[2,0.95,0.95,0.72,1,493],[1,0.5,0.5,0.98,2,332],[3,0.77,0.08,0.83,1,294],[2,1.0,1.0,0.01,0,182],[3,1.0,1.0,0.01,0,188],[2,0.95,0.95,0.91,0,215],[3,1.0,1.0,0.99,0,303],[1,1.0,1.0,0.01,3,547],[1,1.0,1.0,0.01,1,315],[1,1.0,1.0,0.99,0,169],[0,1.0,1.0,0.99,3,253],[0,0.99,0.99,0.99,0,197],[0,1.0,1.0,0.02,0,1596],[2,0.65,0.35,0.29,0,151],[3,0.48,0.48,0.39,1,223],[2,0.72,0.72,0.82,1,252],[1,1.0,1.0,0.02,1,379],[2,0.94,0.94,0.97,1,190],[2,1.0,1.0,0.01,0,231],[3,1.0,1.0,0.0,3,254],[3,1.0,1.0,0.0,2,347],[2,1.0,1.0,1.0,1,390],[1,1.0,1.0,1.0,1,169],[0,1.0,1.0,0.0,0,237],[2,1.0,1.0,0.98,0,253],[2,0.76,0.76,0.89,2,213],[3,0.68,0.68,0.51,1,180],[3,0.38,0.38,0.81,0,335],[1,0.78,0.78,0.96,2,226],[2,0.72,0.72,0.64,1,261]]},{"key":"gpt-6-luna","name":"GPT-6 Luna","checkpoint":"openai/gpt-6-luna (Decisions API, beta)","encoder":"undisclosed","params":"undisclosed","runtime":"hosted · OpenAI","model_id":"gpt-6-luna (created 2026-09-14)","summary":{"choice":[0.7277777777777777,0.6611111111111111,0.7944444444444444],"noul":[0.8275691699604744,0.7748425344597338,0.8813490985382683],"score":[0.7277777777777777,0.6555555555555556,0.7888888888888889],"auc":0.9153285573122529,"says_yes":0.48333333333333334,"mae":0.2722222222222222,"latency_ms":267.08060450619087,"cost_usd":0.009680600000000001,"input_tokens":96806,"input_tokens_median":527.0,"output_tokens":0,"output_tokens_median":0.0},"preds":[[2,1.0,1.0,1.0,0,248],[0,0.51,0.17,1.0,4,256],[0,0.92,0.92,0.35,2,244],[0,0.98,0.98,1.0,0,503],[2,1.0,1.0,1.0,1,379],[0,0.52,0.52,1.0,0,228],[3,0.99,0.99,1.0,0,346],[0,1.0,1.0,0.0,1,1225],[0,0.36,0.36,0.0,0,1069],[0,0.41,0.27,0.0,0,390],[1,0.78,0.78,1.0,2,270],[0,0.49,0.33,1.0,1,409],[1,1.0,1.0,1.0,0,909],[0,0.53,0.38,0.98,4,910],[1,0.82,0.82,0.16,2,966],[0,1.0,1.0,0.0,0,1155],[2,1.0,1.0,1.0,1,372],[0,0.63,0.1,0.97,0,174],[3,0.87,0.87,0.0,0,914],[1,0.54,0.43,0.37,1,718],[1,1.0,1.0,0.0,0,186],[2,0.32,0.32,0.01,1,186],[0,0.63,0.32,1.0,0,279],[0,1.0,1.0,0.01,0,384],[3,1.0,1.0,1.0,1,415],[0,0.45,0.29,0.0,3,283],[0,0.65,0.11,0.97,1,253],[2,1.0,1.0,0.0,0,387],[2,1.0,1.0,1.0,0,582],[1,1.0,1.0,1.0,0,358],[3,1.0,1.0,1.0,0,358],[0,0.7,0.7,0.0,2,220],[0,0.44,0.1,0.01,0,233],[0,1.0,1.0,1.0,0,304],[2,1.0,1.0,0.0,0,204],[2,0.81,0.81,1.0,0,431],[0,1.0,1.0,0.0,0,300],[0,1.0,1.0,0.0,4,187],[0,0.94,0.94,0.0,2,259],[2,0.92,0.92,1.0,0,256],[1,1.0,1.0,1.0,0,197],[3,1.0,1.0,0.0,0,235],[3,1.0,1.0,0.0,0,212],[1,0.61,0.61,0.74,1,188],[1,1.0,1.0,0.0,0,296],[3,0.5,0.5,0.04,1,364],[0,0.9,0.06,0.98,1,616],[0,0.62,0.3,0.57,0,242],[2,1.0,1.0,1.0,0,182],[2,0.96,0.96,1.0,2,450],[1,0.48,0.23,0.32,1,245],[3,0.98,0.98,1.0,0,469],[0,0.94,0.04,0.0,1,268],[1,0.53,0.36,0.99,0,387],[0,0.66,0.31,0.0,0,183],[1,0.57,0.57,0.0,0,348],[2,1.0,1.0,1.0,0,573],[1,1.0,1.0,1.0,0,297],[1,1.0,1.0,0.87,2,211],[0,0.9,0.9,1.0,2,277],[0,1.0,1.0,0.0,1,364],[0,0.95,0.95,1.0,2,826],[3,0.72,0.72,1.0,1,208],[2,0.98,0.98,1.0,0,193],[3,1.0,1.0,0.0,2,316],[2,0.35,0.34,0.11,0,6138],[2,0.44,0.44,0.43,1,213],[2,0.94,0.94,0.03,0,211],[0,0.99,0.99,1.0,0,644],[3,0.79,0.79,0.0,0,604],[0,0.56,0.23,0.38,0,189],[2,0.98,0.98,1.0,0,387],[1,1.0,1.0,0.02,0,279],[1,0.9,0.01,1.0,3,250],[2,0.5,0.5,0.75,0,457],[0,1.0,1.0,1.0,0,633],[3,1.0,1.0,0.0,1,413],[0,0.8,0.8,0.89,0,368],[0,1.0,1.0,1.0,1,225],[2,0.56,0.56,0.68,1,211],[3,0.29,0.29,0.01,0,297],[1,0.53,0.23,0.0,0,193],[1,0.99,0.99,0.0,4,182],[0,0.98,0.98,0.95,0,234],[3,1.0,1.0,0.0,0,366],[0,0.96,0.03,1.0,3,231],[2,0.52,0.52,0.85,1,333],[3,1.0,1.0,0.0,1,287],[3,1.0,1.0,1.0,0,245],[2,0.93,0.93,0.89,0,374],[1,0.98,0.98,1.0,1,192],[2,0.42,0.34,0.01,0,183],[1,1.0,1.0,0.0,0,230],[2,0.36,0.28,0.06,0,234],[2,1.0,1.0,0.0,1,235],[1,0.6,0.32,0.73,0,202],[0,1.0,1.0,1.0,1,335],[1,0.41,0.22,1.0,4,404],[0,0.62,0.62,0.99,1,223],[0,1.0,1.0,1.0,2,213],[0,1.0,1.0,0.0,0,205],[3,1.0,1.0,0.0,0,213],[0,1.0,1.0,0.0,0,193],[1,0.83,0.83,1.0,0,235],[1,0.59,0.33,0.05,1,235],[0,1.0,1.0,0.0,0,254],[0,0.92,0.06,0.66,3,222],[1,1.0,1.0,0.99,0,550],[0,1.0,1.0,1.0,0,212],[2,0.38,0.1,1.0,3,558],[3,1.0,1.0,0.0,1,245],[2,0.98,0.98,1.0,0,514],[0,0.97,0.97,1.0,0,207],[3,1.0,1.0,0.0,0,266],[1,0.55,0.55,0.12,1,221],[0,0.34,0.31,0.8,2,199],[0,0.63,0.08,0.35,3,635],[0,0.72,0.08,0.0,1,226],[1,0.55,0.15,0.31,0,203],[0,0.63,0.22,0.57,0,879],[3,0.99,0.99,0.0,0,187],[3,1.0,1.0,0.0,2,257],[0,0.99,0.99,0.0,2,182],[1,1.0,1.0,1.0,1,201],[0,0.99,0.01,0.24,1,211],[1,0.42,0.42,0.93,0,191],[0,1.0,1.0,0.0,0,299],[1,1.0,1.0,1.0,1,295],[2,0.97,0.97,1.0,0,264],[2,0.4,0.4,0.01,0,246],[1,0.58,0.09,1.0,0,281],[3,0.94,0.94,0.0,2,392],[3,1.0,1.0,1.0,1,222],[0,0.45,0.12,0.02,3,323],[0,0.52,0.42,0.0,0,714],[1,0.87,0.87,0.0,1,310],[3,1.0,1.0,0.0,1,191],[2,0.99,0.99,0.0,0,229],[2,0.84,0.84,0.0,1,222],[2,0.46,0.42,0.0,0,273],[0,0.4,0.2,0.97,0,206],[0,1.0,1.0,1.0,0,900],[2,0.97,0.97,0.0,2,215],[0,1.0,1.0,0.0,0,414],[1,1.0,1.0,0.0,0,526],[0,1.0,1.0,0.0,3,327],[0,1.0,1.0,0.0,1,255],[3,1.0,1.0,0.0,0,442],[2,1.0,1.0,0.0,2,306],[0,0.95,0.95,0.02,0,1229],[2,0.68,0.68,0.13,1,831],[1,0.45,0.45,0.97,1,228],[0,0.38,0.31,0.29,1,207],[2,0.57,0.57,0.0,0,1120],[3,0.94,0.94,0.98,0,240],[0,0.46,0.2,1.0,0,823],[3,1.0,1.0,1.0,0,378],[1,0.55,0.55,0.0,3,196],[1,1.0,1.0,0.79,1,314],[1,0.57,0.57,1.0,0,211],[0,1.0,1.0,1.0,3,365],[0,1.0,1.0,1.0,0,483],[0,1.0,1.0,0.0,0,608],[1,0.65,0.65,0.0,0,360],[1,0.52,0.26,0.05,1,805],[2,0.36,0.36,0.04,1,248],[1,1.0,1.0,0.0,1,213],[0,0.7,0.28,1.0,0,570],[2,1.0,1.0,0.0,0,198],[3,0.59,0.59,0.0,3,173],[3,1.0,1.0,0.0,2,1080],[2,1.0,1.0,1.0,1,234],[1,0.99,0.99,1.0,0,225],[0,0.73,0.73,0.99,0,193],[0,0.9,0.07,1.0,0,218],[1,0.74,0.19,0.37,1,188],[0,0.64,0.14,0.02,0,921],[1,0.5,0.22,0.98,0,173],[1,0.86,0.86,0.0,1,790],[0,0.5,0.09,0.77,0,176]]}]}]}{% endraw %}
</script>
<!-- DATA:END -->

<script>
{% raw %}
(function () {
  var dataEl = document.getElementById('de-data');
  if (!dataEl) return;
  var ALL;
  try { ALL = JSON.parse(dataEl.textContent); } catch (e) { ALL = null; }
  // suites the page knows about; one without data shows as pending in the selector
  var PLANNED = [{id: 'stem-synth', title: 'STEM (synthetic)'}, {id: 'reflex-guard', title: 'Guardrails (reflex-guard)'}];
  var NS = 'http://www.w3.org/2000/svg';
  var MODES = {choice: {label: 'Choice accuracy', short: 'choice'}, noul: {label: 'Verify balanced accuracy', short: 'verify'},
    score: {label: 'Score-level accuracy', short: 'score'}};
  var SHAPES = ['circle', 'square', 'triangle', 'diamond', 'down'];
  var WEB = {m: ['var(--m0)', 'var(--m1)', 'var(--m2)', 'var(--m3)', 'var(--m4)'], ink: 'var(--de-ink)', muted: 'var(--de-muted)',
    grid: 'var(--de-grid)', bg: 'var(--bg,#fffcf0)', hatch: 'var(--de-hatch)', font: 'inherit', fs: 12.5};
  var PAPER = {m: ['#0072B2', '#56B4E9', '#009E73', '#D55E00', '#CC79A7'], ink: '#111111', muted: '#333333', grid: '#dddddd',
    bg: '#ffffff', hatch: 'rgba(0,0,0,0.45)', font: "'Times New Roman',Times,STIXGeneral,serif", fs: 13};
  var state = {suite: null, view: 'web', mode: null, hidden: {}};
  var S, ITEMS, MODELS, T = WEB;

  // ---------- helpers
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }
  function sv(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function txt(parent, x, y, s, o) {
    o = o || {};
    var t = sv('text', {x: x, y: y, 'text-anchor': o.anchor || 'start',
      style: 'fill:' + (o.ink ? T.ink : T.muted) + ';font-family:' + T.font + ';font-size:' + (o.size || T.fs) + 'px' +
        (o.bold ? ';font-weight:600' : '') + (o.italic ? ';font-style:italic' : '')}, parent);
    t.textContent = s;
    return t;
  }
  function line(p, x1, y1, x2, y2, st) { return sv('line', {x1: x1, y1: y1, x2: x2, y2: y2, style: st}, p); }
  function gridSt() { return 'stroke:' + T.grid + ';stroke-width:1'; }
  function refSt() { return 'stroke:' + T.ink + ';stroke-width:1.2;stroke-dasharray:4 3'; }
  function pct(x, d) { return isNaN(x) ? '–' : (x * 100).toFixed(d || 0) + '%'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]; }); }
  function mean(a) { return a.length ? a.reduce(function (s, v) { return s + v; }, 0) / a.length : NaN; }
  function quant(a, q) { var s = a.slice().sort(function (x, y) { return x - y; }), p = (s.length - 1) * q, i = Math.floor(p); return s[i] + (s[Math.min(i + 1, s.length - 1)] - s[i]) * (p - i); }
  function short(c) { return String(c).replace(/^\d+ /, ''); }
  function has(mode) { return S.meta.modes.indexOf(mode) >= 0; }
  function visible() { return MODELS.filter(function (m) { return !state.hidden[m.key]; }); }
  function jOf(m) { return MODELS.indexOf(m); }
  function sw(j) { return '<span class="de-sw" style="background:' + T.m[j] + '"></span>'; }
  function costPer1k(m) { return m.summary.cost_usd ? m.summary.cost_usd / S.meta.n * 1000 : 0; }
  function lat(m) { return m.preds.map(function (p) { return p[5]; }); }
  function catIdx(c) { var r = []; ITEMS.forEach(function (it, i) { if (it.cat === c) r.push(i); }); return r; }
  function mount(id) { return document.getElementById(id); }

  // ---------- tooltip
  var tip = el('div', {'class': 'de-tip', role: 'status'});
  document.body.appendChild(tip);
  function showTip(evt, html) {
    tip.innerHTML = html; tip.style.opacity = 1;
    var r = tip.getBoundingClientRect(), x = evt.clientX + 14, y = evt.clientY + 14;
    if (x + r.width > window.innerWidth - 8) x = evt.clientX - r.width - 14;
    if (y + r.height > window.innerHeight - 8) y = evt.clientY - r.height - 14;
    tip.style.left = Math.max(8, x) + 'px'; tip.style.top = Math.max(8, y) + 'px';
  }
  function bindTip(node, html) {
    node.addEventListener('mousemove', function (e) { showTip(e, html()); });
    node.addEventListener('mouseleave', function () { tip.style.opacity = 0; });
    node.addEventListener('click', function (e) { showTip(e, html()); });
  }

  // ---------- metrics (same definitions as the Python harness)
  function correct(m, i, mode) {
    var it = ITEMS[i], p = m.preds[i];
    if (mode === 'choice') return it.gold != null && p[0] === it.gold;
    if (mode === 'noul') return it.stmtTrue != null && (p[3] >= 0.5) === it.stmtTrue;
    return it.bin != null && p[4] === it.bin;
  }
  function metric(m, idx, mode) {
    if (!idx.length) return NaN;
    if (mode === 'noul') {
      return mean([true, false].map(function (t) {
        var s = idx.filter(function (i) { return ITEMS[i].stmtTrue === t; });
        return s.length ? mean(s.map(function (i) { return correct(m, i, 'noul') ? 1 : 0; })) : null;
      }).filter(function (v) { return v !== null; }));
    }
    return mean(idx.map(function (i) { return correct(m, i, mode) ? 1 : 0; }));
  }
  function calibration(m) {
    var edges = [], k, bins = [[], [], [], [], [], []];
    for (k = 0; k < 7; k++) edges.push(0.25 + k * (1.0001 - 0.25) / 6);
    m.preds.forEach(function (p, i) {
      if (ITEMS[i].gold == null) return;
      var b = 0;
      while (b < edges.length && p[1] >= edges[b]) b++;
      bins[Math.min(Math.max(b - 1, 0), 5)].push(i);
    });
    var pts = [], ece = 0, n = 0;
    bins.forEach(function (ix) {
      if (!ix.length) return;
      var c = mean(ix.map(function (i) { return m.preds[i][1]; }));
      var a = mean(ix.map(function (i) { return correct(m, i, 'choice') ? 1 : 0; }));
      pts.push({conf: c, acc: a, n: ix.length}); ece += ix.length * Math.abs(c - a); n += ix.length;
    });
    return {pts: pts, ece: ece / n};
  }

  // ---------- svg pieces
  function defs(svg, uid) {
    var d = sv('defs', {}, svg);
    MODELS.forEach(function (m, j) {
      var p = sv('pattern', {id: uid + '-p' + j, patternUnits: 'userSpaceOnUse', width: 6, height: 6}, d);
      sv('rect', {width: 6, height: 6, style: 'fill:' + T.m[j]}, p);
      var st = 'stroke:' + T.hatch + ';stroke-width:1.1', k = j % 5;
      if (k === 0) sv('path', {d: 'M0,6 L6,0 M-1,1 L1,-1 M5,7 L7,5', style: st}, p);
      if (k === 1) sv('path', {d: 'M0,0 L6,6 M-1,5 L1,7 M5,-1 L7,1', style: st}, p);
      if (k === 2) sv('circle', {cx: 3, cy: 3, r: 1.1, style: 'fill:' + T.hatch}, p);
      if (k === 3) sv('path', {d: 'M0,6 L6,0 M0,0 L6,6', style: st}, p);
      if (k === 4) sv('path', {d: 'M0,1.5 L6,1.5 M0,4.5 L6,4.5', style: st}, p);
    });
  }
  function marker(g, j, x, y, r) {
    var shape = SHAPES[j % 5], st = 'fill:' + T.m[j] + ';stroke:' + T.bg + ';stroke-width:1.5', d;
    if (shape === 'circle') return sv('circle', {cx: x, cy: y, r: r, style: st}, g);
    if (shape === 'square') d = 'M' + (x - r) + ',' + (y - r) + 'h' + 2 * r + 'v' + 2 * r + 'h' + -2 * r + 'z';
    if (shape === 'triangle') d = 'M' + x + ',' + (y - r * 1.25) + 'L' + (x + r * 1.15) + ',' + (y + r * 0.85) + 'L' + (x - r * 1.15) + ',' + (y + r * 0.85) + 'z';
    if (shape === 'down') d = 'M' + x + ',' + (y + r * 1.25) + 'L' + (x + r * 1.15) + ',' + (y - r * 0.85) + 'L' + (x - r * 1.15) + ',' + (y - r * 0.85) + 'z';
    if (shape === 'diamond') d = 'M' + x + ',' + (y - r * 1.3) + 'L' + (x + r * 1.15) + ',' + y + 'L' + x + ',' + (y + r * 1.3) + 'L' + (x - r * 1.15) + ',' + y + 'z';
    return sv('path', {d: d, style: st}, g);
  }
  function newSvg(W, H, label) {
    var svg = sv('svg', {xmlns: NS, viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img', 'aria-label': label});
    if (state.view === 'paper') sv('rect', {x: 0, y: 0, width: W, height: H, style: 'fill:#ffffff'}, svg);
    return svg;
  }

  // ---------- panel frame: short title, tools (mode switch, downloads), optional legend
  function frame(id, title, opts) {
    var root = mount(id);
    if (!root) return null;
    opts = opts || {};
    root.innerHTML = '';
    var card = el('div', {'class': 'de-card'});
    var head = el('div', {'class': 'de-head'}, '<span class="t">' + title + '</span>');
    var tools = el('div', {'class': 'tools'});
    head.appendChild(tools); card.appendChild(head);
    var body = el('div', {'class': 'de-body'});
    card.appendChild(body); root.appendChild(card);
    if (opts.modes) tools.appendChild(modeSwitch());
    if (opts.svgName) {
      ['SVG', 'PNG'].forEach(function (fmt) {
        var b = el('button', {'class': 'de-btn de-only-paper', title: 'Download this figure as ' + fmt}, fmt);
        b.onclick = function () { var s = body.querySelector('svg'); if (s) (fmt === 'SVG' ? downloadSvg : downloadPng)(s, opts.svgName); };
        tools.appendChild(b);
      });
    }
    if (opts.legend) legend(body);
    return {root: root, card: card, body: body, tools: tools};
  }
  function legend(container) {
    var lg = el('div', {'class': 'de-legend'});
    MODELS.forEach(function (m, j) {
      var b = el('button', {'class': 'de-chip', 'aria-pressed': state.hidden[m.key] ? 'false' : 'true', title: 'Show or hide ' + m.name}, sw(j) + esc(m.name));
      b.onclick = function () {
        state.hidden[m.key] = !state.hidden[m.key];
        if (!visible().length) state.hidden[m.key] = false;
        renderFigures();
      };
      lg.appendChild(b);
    });
    container.appendChild(lg);
  }
  function modeSwitch() {
    var seg = el('div', {'class': 'de-seg', role: 'group', 'aria-label': 'Question mode'});
    S.meta.modes.forEach(function (k) {
      var b = el('button', {'aria-pressed': state.mode === k ? 'true' : 'false'}, MODES[k].short);
      b.onclick = function () { state.mode = k; writeHash(); renderFigures(); };
      seg.appendChild(b);
    });
    return seg;
  }
  function width(body, min, max) { return Math.min(max || 2000, Math.max(min || 320, Math.floor(body.clientWidth) - 2)); }

  // ---------- downloads, all built in the browser
  function save(blob, name) {
    var a = el('a', {href: URL.createObjectURL(blob), download: name});
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function svgString(svg) { return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(svg); }
  function downloadSvg(svg, name) { save(new Blob([svgString(svg)], {type: 'image/svg+xml'}), S.id + '-' + name + '.svg'); }
  function downloadPng(svg, name) {
    var W = +svg.getAttribute('width'), H = +svg.getAttribute('height'), k = 3, img = new Image();
    img.onload = function () {
      var c = el('canvas', {width: W * k, height: H * k}), ctx = c.getContext('2d');
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W * k, H * k); ctx.drawImage(img, 0, 0, W * k, H * k);
      c.toBlob(function (b) { save(b, S.id + '-' + name + '.png'); });
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString(svg));
  }

  // ---------- control bar: suite and view
  function renderControls() {
    var root = mount('de-ctl-mount');
    root.innerHTML = '';
    var bar = el('div', {'class': 'de-ctl', role: 'toolbar', 'aria-label': 'Suite and view'});
    var ids = ALL.suites.map(function (s) { return s.id; });
    var list = PLANNED.concat(ALL.suites.filter(function (s) { return !PLANNED.some(function (p) { return p.id === s.id; }); }));
    var seg = el('div', {'class': 'de-seg', role: 'group', 'aria-label': 'Suite'});
    list.forEach(function (p) {
      var ready = ids.indexOf(p.id) >= 0, s = ALL.suites[ids.indexOf(p.id)];
      var b = el('button', {'aria-pressed': p.id === state.suite ? 'true' : 'false', title: ready ? s.meta.n + ' items' : 'results pending'},
        esc(p.title) + (ready ? '' : ' · pending'));
      b.disabled = !ready;
      b.onclick = function () { state.suite = p.id; state.mode = null; boot(); };
      seg.appendChild(b);
    });
    bar.appendChild(el('span', {'class': 'lab'}, 'Suite')); bar.appendChild(seg);
    var v = el('div', {'class': 'de-seg', role: 'group', 'aria-label': 'View'});
    [['web', 'Interactive'], ['paper', 'Paper']].forEach(function (p) {
      var b = el('button', {'aria-pressed': state.view === p[0] ? 'true' : 'false'}, p[1]);
      b.onclick = function () { state.view = p[0]; writeHash(); boot(); };
      v.appendChild(b);
    });
    bar.appendChild(el('span', {'class': 'lab', style: 'margin-left:.4rem'}, 'View')); bar.appendChild(v);
    if (state.view === 'paper') bar.appendChild(el('span', {style: 'font-size:.72rem;opacity:.75'}, 'Print styling · SVG / PNG on each figure · LaTeX for Table 1'));
    root.appendChild(bar);
  }

  // ---------- Figure 1: accuracy by category
  function figAccuracy() {
    var mode = state.mode, f = frame('de-acc', MODES[mode].label + ' by category', {modes: true, legend: true, svgName: 'accuracy-by-category'});
    var vis = visible(), mc = S.meta.chance[mode], groups = S.meta.groups || {'': S.meta.categories}, gnames = Object.keys(groups);
    var W = width(f.body, 320, 1000), labelW = W < 480 ? 112 : 160, right = 44;
    var bh = vis.length > 2 ? 10 : 14, gap = 2, groupH = vis.length * (bh + gap) + 14, headH = gnames.length > 1 ? 22 : 4;
    var H = 26 + S.meta.categories.length * groupH + gnames.length * headH + 26;
    var svg = newSvg(W, H, MODES[mode].label + ' by category and model'), uid = 'de' + Math.random().toString(36).slice(2, 7);
    defs(svg, uid);
    var x0 = labelW, x1 = W - right;
    function X(v) { return x0 + v * (x1 - x0); }
    [0, 0.25, 0.5, 0.75, 1].forEach(function (v) { line(svg, X(v), 18, X(v), H - 24, gridSt()); txt(svg, X(v), 12, pct(v), {anchor: 'middle'}); });
    var y = 24, under = sv('g', {}, svg), bars = sv('g', {}, svg);
    gnames.forEach(function (g) {
      if (gnames.length > 1) { txt(svg, 0, y + 14, g, {ink: true, bold: true, italic: true}); y += headH; }
      groups[g].forEach(function (cat) {
        var idx = catIdx(cat), top = y, blockH = vis.length * (bh + gap);
        txt(svg, labelW - 8, top + blockH / 2 + 4, short(cat), {anchor: 'end'});
        if (mode === 'score') {
          var cnt = {};
          idx.forEach(function (i) { cnt[ITEMS[i].bin] = (cnt[ITEMS[i].bin] || 0) + 1; });
          var maj = Math.max.apply(null, Object.keys(cnt).map(function (k) { return cnt[k]; })) / idx.length;
          line(under, X(maj), top - 3, X(maj), top + blockH + 1, 'stroke:' + T.ink + ';stroke-width:3');
        }
        vis.forEach(function (m, r) {
          var j = jOf(m), v = metric(m, idx, mode), by = top + r * (bh + gap);
          var nOk = idx.filter(function (i) { return correct(m, i, mode); }).length;
          sv('rect', {x: x0, y: by, width: Math.max(0.5, X(v) - x0), height: bh, rx: 1.5, fill: 'url(#' + uid + '-p' + j + ')', style: 'stroke:rgba(0,0,0,.55);stroke-width:.6'}, bars);
          if (W >= 440) txt(bars, X(v) + 4, by + bh - 1.5, pct(v), {size: 10});
          var hit = sv('rect', {x: 0, y: by - gap / 2, width: W, height: bh + gap, style: 'fill:transparent;cursor:pointer'}, bars);
          bindTip(hit, function () {
            var extra = mode === 'noul' ? '<br>says yes to ' + idx.filter(function (i) { return m.preds[i][3] >= 0.5; }).length + '/' + idx.length : '';
            return '<b>' + esc(m.name) + '</b> · ' + esc(short(cat)) + '<br>' + MODES[mode].label + ': <b>' + pct(v) + '</b><br>' + nOk + '/' + idx.length + ' items correct' + extra + '<br>chance ' + pct(mc);
          });
        });
        y += groupH;
      });
    });
    line(svg, X(mc), 18, X(mc), H - 24, refSt());
    txt(svg, X(mc) + 3, H - 8, 'chance ' + pct(mc) + (mode === 'score' ? '   ▮ most-common-level baseline' : ''), {ink: true, size: 10});
    f.body.appendChild(svg);
  }

  // ---------- Table 1: overall
  var sortBy = {key: null, dir: -1};
  function table1() {
    var f = frame('de-t1', 'Overall · ' + esc(S.title) + ' · ' + S.meta.n + ' items');
    var cols = [{k: 'name', t: 'Model'}];
    if (has('choice')) cols.push({k: 'choice', t: 'Choice', ci: true, chance: S.meta.chance.choice});
    if (has('noul')) cols.push({k: 'noul', t: 'Verify (bal.)', ci: true, chance: S.meta.chance.noul},
      {k: 'auc', t: 'Verify AUC', f: function (v) { return v.toFixed(2); }, note: 'chance 0.50'},
      {k: 'says_yes', t: 'Says yes', f: function (v) { return pct(v); }, nobest: true});
    if (has('score')) cols.push({k: 'score', t: 'Score level', ci: true, chance: S.meta.chance.score},
      {k: 'mae', t: 'Level MAE', f: function (v) { return v.toFixed(2); }, low: true});
    cols.push({k: 'latency_ms', t: 'Latency', f: function (v) { return Math.round(v) + ' ms'; }, low: true},
      {k: 'cost1k', t: 'Cost / 1k', f: function (v) { return v ? 'USD ' + v.toFixed(3) : 'local'; }, nobest: true});
    if (!sortBy.key || !cols.some(function (c) { return c.k === sortBy.key; })) sortBy = {key: cols[1].k, dir: -1};
    function val(m, k) { if (k === 'name') return m.name; if (k === 'cost1k') return costPer1k(m); var s = m.summary[k]; return Array.isArray(s) ? s[0] : s; }
    var best = {};
    cols.forEach(function (col) {
      if (col.k === 'name' || col.nobest) return;
      var vs = MODELS.map(function (m) { return val(m, col.k); });
      best[col.k] = col.low ? Math.min.apply(null, vs) : Math.max.apply(null, vs);
    });
    var rows = MODELS.slice().sort(function (a, b) { var x = val(a, sortBy.key), y = val(b, sortBy.key); return (x > y ? 1 : x < y ? -1 : 0) * sortBy.dir; });
    var html = '<table><thead><tr>' + cols.map(function (col) {
      var s = sortBy.key === col.k;
      return '<th data-k="' + col.k + '"' + (s ? ' aria-sort="' + (sortBy.dir < 0 ? 'descending' : 'ascending') + '"' : '') + '>' + col.t + (s ? ' <span>' + (sortBy.dir < 0 ? '▾' : '▴') + '</span>' : '') + '</th>';
    }).join('') + '</tr><tr>' + cols.map(function (col) {
      return '<td style="font-size:.66rem;opacity:.6;padding-top:0">' + (col.chance ? 'chance ' + pct(col.chance) : col.note || '') + '</td>';
    }).join('') + '</tr></thead><tbody>' + rows.map(function (m) {
      var j = jOf(m);
      return '<tr>' + cols.map(function (col) {
        if (col.k === 'name') return '<td><span style="display:inline-flex;gap:.4rem;align-items:center">' + sw(j) + '<span class="v">' + esc(m.name) + '</span></span><br><small>' + esc(m.checkpoint) + '</small></td>';
        var v = val(m, col.k), b = best[col.k] === v ? 'best' : '';
        if (col.ci) { var s = m.summary[col.k]; return '<td class="' + b + '"><span class="v">' + pct(v, 1) + '</span><br><small>[' + pct(s[1]) + ', ' + pct(s[2]) + ']</small></td>'; }
        return '<td class="' + b + '"><span class="v">' + col.f(v) + '</span></td>';
      }).join('') + '</tr>';
    }).join('') + '</tbody></table>';
    var wrap = el('div', {'class': 'de-scroll'}, html);
    f.body.style.padding = '0'; f.body.appendChild(wrap);
    wrap.querySelectorAll('th').forEach(function (th) {
      th.onclick = function () { var k = th.getAttribute('data-k'); sortBy = {key: k, dir: sortBy.key === k ? -sortBy.dir : (k === 'name' ? 1 : -1)}; table1(); };
    });
    var tex = el('button', {'class': 'de-btn de-only-paper', title: 'Copy this table as LaTeX (booktabs)'}, 'Copy LaTeX');
    tex.onclick = function () {
      var c = cols.filter(function (x) { return x.k !== 'name'; });
      var out = ['\\begin{tabular}{l' + c.map(function () { return 'c'; }).join('') + '}', '\\toprule', 'Model & ' + c.map(function (x) { return x.t; }).join(' & ') + ' \\\\', '\\midrule'];
      MODELS.forEach(function (m) {
        out.push(m.name + ' & ' + c.map(function (col) {
          var v = val(m, col.k), s = m.summary[col.k];
          var cell = col.ci ? (v * 100).toFixed(1) + ' [' + Math.round(s[1] * 100) + ', ' + Math.round(s[2] * 100) + ']' : col.f(v).replace(/%/g, '\\%');
          return best[col.k] === v ? '\\textbf{' + cell + '}' : cell;
        }).join(' & ') + ' \\\\');
      });
      out.push('\\bottomrule', '\\end{tabular}');
      var s = out.join('\n');
      (navigator.clipboard ? navigator.clipboard.writeText(s) : Promise.reject()).then(function () { tex.textContent = 'Copied'; }, function () { save(new Blob([s], {type: 'text/plain'}), S.id + '-table1.tex'); });
      setTimeout(function () { tex.textContent = 'Copy LaTeX'; }, 1500);
    };
    f.tools.appendChild(tex);
  }

  // ---------- Figure 2: P(yes), correct vs wrong statements
  function figVerify() {
    var fig = mount('figure-2');
    if (!has('noul')) { if (fig) fig.style.display = 'none'; return; }
    if (fig) fig.style.display = '';
    var f = frame('de-ver', 'Verification: P(yes) when the shown answer is correct vs wrong', {legend: true, svgName: 'verify-p-yes'});
    // layout: [model name + stats] [lane label] [dot plot]; one shaded band per model, two lanes per band
    var vis = visible(), W = width(f.body, 320, 1000), narrow = W < 600;
    var nameW = narrow ? 92 : 128, laneW = narrow ? 58 : 150, x0 = nameW + laneW + 10, x1 = W - 16;
    var lane = 30, rowH = lane * 2 + 18, top0 = 34, H = top0 + vis.length * rowH + 52;
    var svg = newSvg(W, H, 'P(yes) per item and model, for correct and wrong shown answers');
    function X(v) { return x0 + v * (x1 - x0); }
    var band = state.view === 'paper' ? '#f3f3f3' : 'var(--bg2,#f2f0e5)';
    vis.forEach(function (m, r) { sv('rect', {x: 0, y: top0 + r * rowH, width: W, height: rowH - 8, rx: 6, style: 'fill:' + band}, svg); });
    [0, 0.25, 0.5, 0.75, 1].forEach(function (v) { line(svg, X(v), top0 - 6, X(v), H - 44, gridSt()); txt(svg, X(v), H - 28, v.toFixed(2), {anchor: 'middle', size: 12}); });
    line(svg, X(0.5), top0 - 12, X(0.5), H - 44, refSt());
    txt(svg, X(0.5) - 8, top0 - 16, '← says no', {anchor: 'end', ink: true, size: 13});
    txt(svg, X(0.5) + 8, top0 - 16, 'says yes →', {ink: true, size: 13});
    txt(svg, (x0 + x1) / 2, H - 8, narrow ? 'P(yes) that the shown answer is correct' : "P(yes): the model's probability that the shown answer is correct", {anchor: 'middle', ink: true, size: 12});
    var seed = 7, rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    vis.forEach(function (m, r) {
      var j = jOf(m), top = top0 + r * rowH;
      txt(svg, 10, top + 22, m.name, {ink: true, bold: true, size: 14});
      txt(svg, 10, top + 40, 'AUC ' + m.summary.auc.toFixed(2), {size: 12});
      txt(svg, 10, top + 56, 'says yes ' + pct(m.summary.says_yes), {size: 12});
      [true, false].forEach(function (truth, k) {
        var cy = top + 16 + k * lane;
        txt(svg, x0 - 10, cy + 4, narrow ? (truth ? 'correct' : 'wrong') : (truth ? 'correct answer shown' : 'wrong answer shown'), {anchor: 'end', size: 12, ink: true});
        ITEMS.forEach(function (it, i) {
          if (it.stmtTrue !== truth) return;
          var p = m.preds[i][3];
          var dot = sv('circle', {cx: X(p), cy: cy + (rnd() - 0.5) * (lane - 12), r: 4,
            style: truth ? 'fill:' + T.m[j] + ';stroke:rgba(0,0,0,.45);stroke-width:.7' : 'fill:' + T.bg + ';stroke:' + T.m[j] + ';stroke-width:1.6'}, svg);
          bindTip(dot, function () { return '<b>' + esc(m.name) + '</b> · P(yes) ' + p.toFixed(2) + '<br>' + esc(it.q) + '<br>shown answer: <b>' + esc(it.stmt) + '</b> (' + (truth ? 'correct' : 'wrong') + ')'; });
        });
      });
    });
    f.body.appendChild(svg);
  }

  // ---------- Figure 3: score against latency
  function figLatency() {
    var mode = state.mode, f = frame('de-lat', MODES[mode].label + ' against latency', {modes: true, legend: true, svgName: 'accuracy-vs-latency'});
    var W = width(f.body, 320, 900), H = Math.round(Math.min(420, Math.max(270, W * 0.5))), L = 46, R = W < 520 ? 100 : 150, Tp = 12, B = 40;
    var svg = newSvg(W, H, MODES[mode].label + ' against latency per model'), all = [];
    MODELS.forEach(function (m) { all = all.concat(lat(m)); });
    var lo = Math.pow(10, Math.floor(Math.log10(Math.max(1, quant(all, 0.02))))), hi = Math.pow(10, Math.ceil(Math.log10(quant(all, 0.98) * 1.2)));
    function X(v) { return L + (Math.log10(Math.max(lo, Math.min(hi, v))) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo)) * (W - L - R); }
    function Y(v) { return H - B - v * (H - Tp - B); }
    [0, 0.25, 0.5, 0.75, 1].forEach(function (v) { line(svg, L, Y(v), W - R, Y(v), gridSt()); txt(svg, L - 6, Y(v) + 4, pct(v), {anchor: 'end'}); });
    for (var e = Math.log10(lo); e <= Math.log10(hi) + 1e-9; e++) {
      [1, 3].forEach(function (k) {
        var v = k * Math.pow(10, e);
        if (v < lo || v > hi) return;
        line(svg, X(v), Tp, X(v), H - B, gridSt());
        txt(svg, X(v), H - B + 15, v >= 1000 ? (v / 1000) + ' s' : v + ' ms', {anchor: 'middle'});
      });
    }
    txt(svg, (L + W - R) / 2, H - 5, 'median latency per item (log scale)', {anchor: 'middle', ink: true});
    var c = S.meta.chance[mode];
    line(svg, L, Y(c), W - R, Y(c), refSt());
    txt(svg, L + 6, Y(c) - 5, 'chance ' + pct(c), {size: 10});
    var labels = [];
    visible().forEach(function (m) {
      var j = jOf(m), s = m.summary[mode], l = lat(m), med = quant(l, 0.5), g = sv('g', {}, svg);
      line(g, X(quant(l, 0.25)), Y(s[0]), X(quant(l, 0.75)), Y(s[0]), 'stroke:' + T.m[j] + ';stroke-width:2;opacity:.6');
      line(g, X(med), Y(s[1]), X(med), Y(s[2]), 'stroke:' + T.m[j] + ';stroke-width:2');
      marker(g, j, X(med), Y(s[0]), 6.5);
      var hit = sv('circle', {cx: X(med), cy: Y(s[0]), r: 14, style: 'fill:transparent;cursor:pointer'}, g);
      bindTip(hit, function () {
        var c1 = costPer1k(m);
        return '<b>' + esc(m.name) + '</b> · ' + esc(m.runtime) + '<br>' + MODES[mode].label + ': <b>' + pct(s[0], 1) + '</b> [' + pct(s[1]) + ', ' + pct(s[2]) + ']' +
          '<br>latency: median ' + Math.round(med) + ' ms · p90 ' + Math.round(quant(l, 0.9)) + ' ms<br>cost: ' + (c1 ? 'USD ' + c1.toFixed(3) + ' per 1k items' : 'local');
      });
      labels.push({m: m, x: X(med), y: Y(s[0])});
    });
    // stack labels top to bottom at least 26px apart, then shift up if the last runs off the plot
    labels.sort(function (a, b) { return a.y - b.y; });
    if (labels.length) labels[0].ly = labels[0].y;
    for (var i = 1; i < labels.length; i++) labels[i].ly = Math.max(labels[i].y, labels[i - 1].ly + 26);
    var over = labels.length ? labels[labels.length - 1].ly - (H - B - 8) : 0;
    if (over > 0) labels.forEach(function (lb) { lb.ly -= over; });
    labels.forEach(function (lb) {
      var lx = W - R + 8, c1 = costPer1k(lb.m);
      line(svg, lb.x + 8, lb.y, lx - 3, lb.ly - 4, 'stroke:' + T.muted + ';stroke-width:.7;opacity:.6');
      txt(svg, lx, lb.ly - 1, lb.m.name, {ink: true, bold: true});
      txt(svg, lx, lb.ly + 11, c1 ? 'USD ' + c1.toFixed(3) + ' / 1k' : 'local', {size: 10});
    });
    f.body.appendChild(svg);
  }

  // ---------- Table 2: latency and cost
  function table2() {
    var f = frame('de-t2', 'Latency, tokens and cost · ' + esc(S.title));
    var n = S.meta.n, fmt = function (v) { return v == null ? '–' : Math.round(v).toLocaleString('en-US'); };
    var rows = MODELS.map(function (m, j) {
      var l = lat(m), su = m.summary, c = su.cost_usd;
      return '<tr><td><span style="display:inline-flex;gap:.4rem;align-items:center">' + sw(j) + '<span class="v">' + esc(m.name) + '</span></span><br><small>' + esc(m.model_id) + '</small></td>' +
        '<td style="text-align:left">' + esc(m.runtime) + '</td><td><span class="v">' + Math.round(quant(l, 0.5)) + ' ms</span></td>' +
        '<td><span class="v">' + Math.round(quant(l, 0.9)) + ' ms</span></td>' +
        '<td><span class="v">' + fmt(su.input_tokens_median) + '</span><br><small>' + (su.input_tokens != null ? fmt(su.input_tokens) + ' total' : '') + '</small></td>' +
        '<td><span class="v">' + fmt(su.output_tokens_median) + '</span><br><small>' + (su.output_tokens != null ? fmt(su.output_tokens) + ' total' : '') + '</small></td>' +
        '<td><span class="v">' + (c ? 'USD ' + c.toFixed(4) : 'local') + '</span><br><small>' + n + ' requests</small></td>' +
        '<td><span class="v">' + (c ? 'USD ' + (c / n).toFixed(6) : '–') + '</span></td>' +
        '<td><span class="v">' + (c ? 'USD ' + (c / n * 1000).toFixed(3) : '–') + '</span></td></tr>';
    }).join('');
    f.body.style.padding = '0';
    f.body.appendChild(el('div', {'class': 'de-scroll'}, '<table><thead><tr><th>Model · version</th><th style="text-align:left">Deployment</th><th>Median</th><th>p90</th><th>Input tok / req</th><th>Output tok / req</th><th>Run cost</th><th>Per request</th><th>Per 1k items</th></tr></thead><tbody>' + rows + '</tbody></table>'));
  }

  // ---------- Figure 4: calibration
  function figCalibration() {
    var fig = mount('figure-4');
    if (!has('choice')) { if (fig) fig.style.display = 'none'; return; }
    if (fig) fig.style.display = '';
    var f = frame('de-cal', 'Reliability · choice mode', {legend: true, svgName: 'calibration'});
    var W = width(f.body, 300, 560), H = Math.round(W * 0.74), L = 42, R = 12, Tp = 10, B = 36;
    var svg = newSvg(W, H, 'Confidence against accuracy per model');
    function X(v) { return L + (v - 0.2) / 0.8 * (W - L - R); }
    function Y(v) { return H - B - v * (H - Tp - B); }
    [0, 0.25, 0.5, 0.75, 1].forEach(function (v) { line(svg, L, Y(v), W - R, Y(v), gridSt()); txt(svg, L - 6, Y(v) + 4, v.toFixed(2), {anchor: 'end'}); });
    [0.2, 0.4, 0.6, 0.8, 1].forEach(function (v) { txt(svg, X(v), H - B + 15, v.toFixed(1), {anchor: 'middle'}); });
    txt(svg, (L + W - R) / 2, H - 4, 'confidence (probability of the picked option)', {anchor: 'middle', ink: true});
    line(svg, X(0.25), Y(0.25), X(1), Y(1), refSt());
    var ly = Tp + 6;
    visible().forEach(function (m) {
      var j = jOf(m), cal = calibration(m), g = sv('g', {}, svg);
      sv('polyline', {points: cal.pts.map(function (p) { return X(p.conf) + ',' + Y(p.acc); }).join(' '), style: 'fill:none;stroke:' + T.m[j] + ';stroke-width:2'}, g);
      cal.pts.forEach(function (p) {
        marker(g, j, X(p.conf), Y(p.acc), 5);
        var hit = sv('circle', {cx: X(p.conf), cy: Y(p.acc), r: 12, style: 'fill:transparent;cursor:pointer'}, g);
        bindTip(hit, function () { return '<b>' + esc(m.name) + '</b><br>mean confidence ' + p.conf.toFixed(2) + '<br>accuracy ' + pct(p.acc) + ' (' + Math.round(p.acc * p.n) + '/' + p.n + ')'; });
      });
      marker(svg, j, L + 12, ly + 4, 4.5);
      txt(svg, L + 22, ly + 8, m.name + '  ECE ' + cal.ece.toFixed(2), {ink: true, size: 10.5});
      ly += 16;
    });
    f.body.appendChild(svg);
  }

  // ---------- Figure 5: explorer
  var ex = {cat: 'all', filter: 'all', q: '', page: 0};
  function filters() {
    var f = {all: ['All items', function () { return true; }]};
    MODELS.forEach(function (m) { f['wrong-' + m.key] = [m.name + ' wrong (any mode)', function (i) { return S.meta.modes.some(function (k) { return !correct(m, i, k); }); }]; });
    if (has('choice')) {
      f.allWrong = ['Every model wrong (choice)', function (i) { return MODELS.every(function (m) { return !correct(m, i, 'choice'); }); }];
      f.disagree = ['Models disagree (choice)', function (i) { var s = {}; MODELS.forEach(function (m) { s[m.preds[i][0]] = 1; }); return Object.keys(s).length > 1; }];
    }
    return f;
  }
  function pick(j, m) { return '<span class="de-pick" title="' + esc(m.name) + '"><i style="background:' + T.m[j] + '"></i>' + esc(m.name.split(' ').map(function (w) { return w[0]; }).join('')) + '</span>'; }
  function mark(ok) { return ok ? '<span class="de-ok">✓</span>' : '<span style="opacity:.7">✗</span>'; }
  function explorer() {
    var F = filters(), f = frame('de-ex', 'Explorer · ' + esc(S.title) + ' · ' + S.meta.n + ' items');
    var ctl = el('div', {'class': 'de-ex-ctl'});
    var cSel = el('select', {'aria-label': 'Category'}, '<option value="all">All categories</option>' + S.meta.categories.map(function (c) { return '<option value="' + esc(c) + '">' + esc(short(c)) + '</option>'; }).join(''));
    var fSel = el('select', {'aria-label': 'Filter'}, Object.keys(F).map(function (k) { return '<option value="' + k + '">' + esc(F[k][0]) + '</option>'; }).join(''));
    var qIn = el('input', {type: 'search', placeholder: 'Search items…', 'aria-label': 'Search items'});
    if (S.meta.categories.indexOf(ex.cat) < 0) ex.cat = 'all';
    if (!F[ex.filter]) ex.filter = 'all';
    cSel.value = ex.cat; fSel.value = ex.filter; qIn.value = ex.q;
    cSel.onchange = function () { ex.cat = cSel.value; ex.page = 0; draw(); };
    fSel.onchange = function () { ex.filter = fSel.value; ex.page = 0; draw(); };
    qIn.oninput = function () { ex.q = qIn.value.toLowerCase(); ex.page = 0; draw(); };
    ctl.appendChild(cSel); ctl.appendChild(fSel); ctl.appendChild(qIn);
    f.body.appendChild(ctl);
    f.body.appendChild(el('div', {style: 'font-size:.72rem;opacity:.75;margin-top:.45rem'}, 'Badges mark the option each model picked: ' + MODELS.map(function (m, j) { return pick(j, m) + ' ' + esc(m.name); }).join(' · ')));
    var list = el('div', {}), pager = el('div', {'class': 'de-pager'});
    f.card.appendChild(list); f.card.appendChild(pager);
    draw();
    function draw() {
      var per = 8, idx = [];
      ITEMS.forEach(function (it, i) {
        if ((ex.cat === 'all' || it.cat === ex.cat) && F[ex.filter][1](i) && (!ex.q || (it.q + ' ' + (it.opts || []).join(' ')).toLowerCase().indexOf(ex.q) >= 0)) idx.push(i);
      });
      var pages = Math.max(1, Math.ceil(idx.length / per));
      ex.page = Math.min(ex.page, pages - 1);
      list.innerHTML = idx.slice(ex.page * per, ex.page * per + per).map(function (i) {
        var it = ITEMS[i], h = '<div class="de-item"><span class="de-tag">' + esc(short(it.cat)) + '</span><span class="de-tag">#' + i + '</span><div class="de-q">' + esc(it.q) + '</div>';
        if (it.opts) h += '<div class="de-opts">' + it.opts.map(function (o, k) {
          var ps = MODELS.map(function (m, j) { return m.preds[i][0] === k ? pick(j, m) : ''; }).join('');
          return '<div class="de-opt' + (k === it.gold ? ' gold' : '') + '"><span class="lt">' + 'ABCDEFGH'[k] + '</span><span class="tx">' + esc(o) + '</span>' + ps + '</div>';
        }).join('') + '</div>';
        h += '<div class="de-lines">';
        if (has('noul') && it.stmt != null) h += '<div><span style="opacity:.7">verify:</span> shown answer <b>' + esc(it.stmt) + '</b> is ' + (it.stmtTrue ? 'correct' : 'wrong') + ' · P(yes): ' +
          MODELS.map(function (m, j) { return pick(j, m) + ' ' + m.preds[i][3].toFixed(2) + ' ' + mark(correct(m, i, 'noul')); }).join(' &nbsp; ') + '</div>';
        if (has('score') && it.bin != null) h += '<div><span style="opacity:.7">score:</span> correct level <b>' + esc(S.meta.score_labels[it.bin]) + '</b> · predicted: ' +
          MODELS.map(function (m, j) { return pick(j, m) + ' ' + esc(S.meta.score_labels[m.preds[i][4]]) + ' ' + mark(correct(m, i, 'score')); }).join(' &nbsp; ') + '</div>';
        return h + '</div></div>';
      }).join('') || '<div class="de-item">No items match.</div>';
      pager.innerHTML = '';
      var prev = el('button', {'class': 'de-btn'}, '← prev'), next = el('button', {'class': 'de-btn'}, 'next →');
      prev.disabled = ex.page === 0; next.disabled = ex.page >= pages - 1;
      prev.onclick = function () { ex.page--; draw(); };
      next.onclick = function () { ex.page++; draw(); };
      pager.appendChild(prev); pager.appendChild(el('span', {}, idx.length + ' items · page ' + (ex.page + 1) + ' of ' + pages)); pager.appendChild(next);
    }
  }

  // ---------- data downloads
  function downloads() {
    var root = mount('de-dl');
    root.innerHTML = '';
    var row = el('div', {style: 'display:flex;flex-wrap:wrap;gap:.4rem;align-items:center;margin:-1rem 0 1.5rem;font-size:.78rem'}, '<span style="opacity:.75">Download this suite, built from the data in this page:</span>');
    var bj = el('button', {'class': 'de-btn'}, 'JSON');
    bj.onclick = function () { save(new Blob([JSON.stringify(S, null, 1)], {type: 'application/json'}), S.id + '.json'); };
    var bc = el('button', {'class': 'de-btn'}, 'CSV');
    bc.onclick = function () {
      var hdr = ['item', 'category', 'prompt', 'model', 'picked_option', 'correct_option', 'choice_correct', 'top_prob', 'p_correct_option', 'shown_answer', 'shown_is_correct', 'p_yes', 'verify_correct', 'pred_level', 'correct_level', 'score_correct', 'latency_ms'];
      var q = function (v) { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
      var lines = [hdr.join(',')];
      MODELS.forEach(function (m) {
        ITEMS.forEach(function (it, i) {
          var p = m.preds[i];
          lines.push([i, it.cat, it.q, m.name, it.opts ? it.opts[p[0]] : '', it.opts ? it.opts[it.gold] : '', correct(m, i, 'choice'), p[1], p[2], it.stmt, it.stmtTrue, p[3],
            correct(m, i, 'noul'), it.bin != null ? S.meta.score_labels[p[4]] : '', it.bin != null ? S.meta.score_labels[it.bin] : '', correct(m, i, 'score'), p[5]].map(q).join(','));
        });
      });
      save(new Blob([lines.join('\n')], {type: 'text/csv'}), S.id + '-predictions.csv');
    };
    row.appendChild(bj); row.appendChild(bc); root.appendChild(row);
  }

  // ---------- state in the query string (?suite=…&view=paper&mode=noul), so the #hash stays free for section
  // links such as #1-accuracy. Only non-default values are written, so a plain link stays plain.
  function readHash() {
    var q = new URLSearchParams(location.search), h = {};
    ['suite', 'view', 'mode'].forEach(function (k) { if (q.get(k)) h[k] = q.get(k); });
    return h;
  }
  function writeHash() {
    if (!history.replaceState) return;
    var q = new URLSearchParams(location.search);
    q.delete('suite'); q.delete('view'); q.delete('mode');
    if (state.suite !== ALL.suites[0].id) q.set('suite', state.suite);
    if (state.view !== 'web') q.set('view', state.view);
    if (state.mode !== S.meta.modes[0]) q.set('mode', state.mode);
    var qs = q.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
  }
  function renderFigures() { figAccuracy(); figVerify(); figLatency(); figCalibration(); }
  function boot() {
    S = ALL.suites.filter(function (s) { return s.id === state.suite; })[0] || ALL.suites[0];
    state.suite = S.id;
    if (!state.mode || !has(state.mode)) state.mode = S.meta.modes[0];
    ITEMS = S.items.map(function (r) { return {cat: r[0], q: r[1], opts: r[2], gold: r[3], stmt: r[4], stmtTrue: r[5], bin: r[6]}; });
    MODELS = S.models;
    T = state.view === 'paper' ? PAPER : WEB;
    document.querySelectorAll('.de').forEach(function (n) { n.classList.toggle('de-paper', state.view === 'paper'); });
    document.querySelectorAll('[data-suite]').forEach(function (n) { n.classList.toggle('on', n.getAttribute('data-suite') === S.id); });
    renderControls(); renderFigures(); table1(); table2(); explorer(); downloads();
    writeHash();
  }
  if (!ALL || !ALL.suites || !ALL.suites.length) {
    var m0 = mount('de-acc');
    if (m0) m0.innerHTML = '<div class="de-err">No results are embedded in this page yet.</div>';
    return;
  }
  var h = readHash();
  state.suite = h.suite || null;
  state.view = h.view === 'paper' ? 'paper' : 'web';
  state.mode = h.mode || null;
  boot();
  var w = window.innerWidth, timer;
  window.addEventListener('resize', function () {
    if (Math.abs(window.innerWidth - w) < 40) return;
    w = window.innerWidth; clearTimeout(timer); timer = setTimeout(renderFigures, 150);
  });
})();
// copy-to-clipboard button on the BibTeX citation block
(function () {
  function attach(block) {
    if (block.querySelector('.de-copy')) return;
    var code = block.querySelector('code') || block, btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'de-copy'; btn.textContent = 'Copy';
    btn.addEventListener('click', function () {
      var text = (code.innerText || code.textContent || '').replace(/\n+$/, '');
      function done() { btn.textContent = 'Copied'; btn.classList.add('ok'); setTimeout(function () { btn.textContent = 'Copy'; btn.classList.remove('ok'); }, 1400); }
      function fallback() { var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.focus(); ta.select(); try { document.execCommand('copy'); done(); } catch (e) {} document.body.removeChild(ta); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
    });
    block.appendChild(btn);
  }
  document.querySelectorAll('.content .language-bibtex').forEach(attach);
})();
{% endraw %}
</script>
