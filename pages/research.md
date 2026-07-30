---
title: "Research"
layout: post
content-type: "static"
permalink: /research
toc: true
---

Publications, talks, and academic work in AI, ML, and NLP.

---

## Technical reports

{% assign reports = site.posts | where_exp: "p", "p.categories contains 'research'" | sort: "date" | reverse %}
{% if reports.size > 0 %}
{% for r in reports %}
### {{ r.title }} [{{ r.date | date: "%Y" }}]

{% if r.subtitle %}{{ r.subtitle }}{% endif %}

[[Read]({{ site.baseurl }}{{ r.url }})]

---
{% endfor %}
{% else %}
*None yet.*

---
{% endif %}

## Publications

*[Google Scholar](https://scholar.google.com/citations?user=a5JbCv0AAAAJ&hl=en): 62 citations | h-index: 3 | i10-index: 3 — as of July 2026*

---

### INDUS-SDE [KDD 2026]

**N. Pantha**, S. Awale, V. Kuruvanthodi, S. KC, M. Ramasubramanian, C. Davis, B. Praveen, E. Foshee, B. Bhattacharjee, K. Bugbee, R. Ramachandran, "INDUS-SDE: A Language Model for Scientific Content Curation and Discovery," in *Proc. 32nd ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD '26)*, AI for Sciences Track, Jeju Island, Republic of Korea, Aug. 2026. [[DOI](https://doi.org/10.1145/3770855.3818847)]

---

### Scientific Code Search at Scale [2026]

**N. Pantha**, P. R. Kumbam, S. Awale, P. Krishnappa, M. Ramasubramanian, N. Jha, E. Foshee, A. Kumar, R. A. Slank, A. Danehkar, R. Ramachandran, "Scientific Code Search at Scale: A Multi-Domain Dataset and Benchmark," *arXiv preprint arXiv:2607.05443*, 2026. [[arXiv](https://arxiv.org/abs/2607.05443)]

A multi-domain dataset of **5,264** scientific repositories across five NASA SMD divisions, with two information-retrieval benchmarks — **219** expert-curated queries over **117,950** code snippets — for evaluating scientific code search.

---

### INDUS [EMNLP 2024]

B. Bhattacharjee, A. Trivedi, M. Muraoka, M. Ramasubramanian, T. Udagawa, I. Gurung, **N. Pantha**, et al., "INDUS: Effective and Efficient Language Models for Scientific Applications," *EMNLP 2024*, Industry Track, pp. 98–112, Miami, FL, 2024. **[25 citations]** [[Paper](https://aclanthology.org/2024.emnlp-industry.9)] [[DOI](https://doi.org/10.18653/v1/2024.emnlp-industry.9)]

Domain-adapted language models for Earth science, biology, physics, heliophysics, planetary sciences and astrophysics.

---

### Guardrailing LLMs for Science [2024]

**N. Pantha**, M. Ramasubramanian, I. Gurung, M. Maskey, R. Ramachandran, "Challenges in Guardrailing Large Language Models for Science," *arXiv preprint arXiv:2411.08181*, 2024. **[21 citations]** [[arXiv](https://arxiv.org/abs/2411.08181)]

A taxonomic framework for LLM guardrails in scientific applications.

---

### Feature Selection [IEEE SoutheastCon 2024]

**N. Pantha**, M. Ramasubramanian, I. Gurung, M. Maskey, L. M. Sanders, et al., "Feature Selection in High-Dimensional Space with Applications to Gene Expression Data," *IEEE SoutheastCon 2024*, Atlanta, GA, pp. 6–15, 2024. **[3 citations]** [[DOI](https://doi.org/10.1109/SoutheastCon52093.2024.10500057)]

---

### Blaze [IEEE CLOUD 2023]

S. Marru, B. Freitag, D. Wannipurage, **N. Pantha**, et al., "Blaze: A High-Performance, Scalable, and Efficient Data Transfer Framework," *IEEE 16th International Conference on Cloud Computing (CLOUD)*, pp. 58–68, 2023. **[11 citations]**

Evaluated transatlantic data transfer between ESA and NASA.

---

### Reasoning Risks Benchmark [NeurIPS 2026, under review]

T. Tchrakian, A. Pascale, **N. Pantha**, J. Barry, N. Jha, R. A. Slank, A. Danehkar, E. Foshee, G. De Mel, M. Ramasubramanian, J. Carnerero-Cano, R. Ramachandran, J. Bernabe-Moreno, "A Benchmark for Reasoning Risks in Scientific Content Generation," submitted to *NeurIPS 2026*, Evaluations and Datasets Track.

---

### Agentic Workflows for Gap-Aware Literature Reviews [2025]

"Agentic Workflows for Gap-Aware Literature Reviews," 2025. **[1 citation]**

---

### IEEE GRSS Workshop Report [2022]

D. That, **N. Pantha**, et al., "Report on the IEEE GRSS Workshop on Remote Sensing Data Management Technologies in Geoscience 2022 [Technical Committees]," *IEEE Geoscience and Remote Sensing Magazine*, vol. 10, no. 4, pp. 273–277, Dec. 2022. [[DOI](https://doi.org/10.1109/MGRS.2022.3223624)]

---

### Query by Humming [IJASS 2019]

P. Koirala, M. Chapagain, **N. Pantha**, N. B. Adhikari, "Effects of Auto Tuning and Pitch Normalization on Query by Humming," *International Journal of Advanced Social Sciences (IJASS)*, vol. 1, no. 2, pp. 11–16, 2019. **[1 citation]** [[PDF](https://ictaes.org/wp-content/uploads/2019/IJASS_01_02/2.11-16-Effects-of-Auto-Tuning-and-Pitch-Normalization-on-Query-by-Humming.pdf)]

---

### ABCDE [2017]

**N. Pantha**, K. Mandal, A. Parajuli, "Artificial Intelligence, Big Data and Cloud Driven E-Governance (ABCDE)," 2017. [[DOI](https://doi.org/10.13140/RG.2.2.30531.30245)]

---

## Talks

---

### Engineering-AI [May-July, 2019]

**Location:** JEC, Bhaktapur, Nepal

As a part-time lecturer for teaching the engineering course AI at [JEC](http://jec.edu.np/), I cover the whole course through the expected timeline.

**Slide:** [nish1001.github.io/engineering-ai/](https://nish1001.github.io/engineering-ai/)

---

### AI Use-Cases [March 26, 2019]

**Location:** Amman, Jordan

The talk is a part of presentation that our [COMPANY Mpercept Tech](http://mpercept.com/) gave in Amman, Jordan to a telecommunication. This part of presentation is where I talk about general introduction to Artificial Intelligence and different usecases for systems that can actually implement AI.

**Slide:** [nish1001.github.io/ai-usecases](https://nish1001.github.io/ai-usecases)

---

### Debunking AI [May 04, 2018]

**Location:** Kaffe Codes, Thapathali, Kathmandu, Nepal

The talk is about debunking the myths and realities of AI and hype. It was given at DMH Friday Session 10 organized by Swopna Digital at Kaffe Codes.

**Slide:** [nish1001.github.io/debunking-ai](https://nish1001.github.io/debunking-ai)

---

### Let's Kickstart ML [October 14, 2017]

**Location:** Patan College, Kupondole, Lalitpur, Nepal

The talk is about how any person can kickstart their path to AI and Machine Learning. It was given at first AI meetup in Kathmandu.

**Slide:** [nish1001.github.io/lets-kickstart-ml](https://nish1001.github.io/lets-kickstart-ml)

**Video:** [youtube.com/watch?v=s0jfB4Ps9O0](https://www.youtube.com/watch?v=s0jfB4Ps9O0)

---

### Writing Clean Code [August 19, 2017]

**Location:** Fusemachines Nepal, Hattisar, Kathmandu, Nepal

This is somewhat agnostic talk about how we can render a code clean. It was given in Python Nepal Meetup #12.

**Slide:** [nish1001.github.io/writing-clean-code](https://nish1001.github.io/writing-clean-code)
