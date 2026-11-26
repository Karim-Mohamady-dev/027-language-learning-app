import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  ChartLine,
  ChatCircle,
  Check,
  GameController,
  Globe,
  List,
  Play,
  SpeakerHigh,
  Star,
  X,
} from '@phosphor-icons/react'
import { getInitialLang, locales, saveLang, tx, type Dict, type Lang } from './i18n'

const ICONS: Record<string, typeof ChatCircle> = {
  ChatCircle,
  GameController,
  ChartLine,
  SpeakerHigh,
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 },
    )
    el.querySelectorAll('.reveal').forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])
  return ref
}

function Tagline({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true)
          io.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const words = text.split(' ')
  return (
    <section aria-label="tagline" className="mx-auto max-w-6xl px-4 py-24 sm:px-8">
      <div ref={ref} className="mx-auto max-w-[680px]">
        <p className="heading-3 text-neutral-900 sm:text-5xl sm:leading-none">
          {words.map((w, i) => (
            <span key={i} className={`tagline-word ${on ? 'on' : ''}`} style={{ transitionDelay: on ? `${i * 60}ms` : '0ms' }}>
              {w}{' '}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}

function App() {
  const [lang, setLang] = useState<Lang>(() => getInitialLang())
  const dict: Dict = locales[lang]
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [stage, setStage] = useState<'idle' | 'active' | 'done'>('idle')
  const [qi, setQi] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(() => {
    try {
      return Number(localStorage.getItem('lingua-streak') ?? 1)
    } catch {
      return 1
    }
  })
  const rootRef = useReveal()

  const changeLang = (l: Lang) => {
    setLang(l)
    saveLang(l)
  }

  const questions = dict.demo.questions
  const q = questions[qi]
  const answered = picked !== null
  const isCorrect = picked === q.answer

  const pick = (i: number) => {
    if (answered) return
    setPicked(i)
    if (i === q.answer) setScore((s) => s + 1)
  }
  const next = () => {
    if (qi + 1 >= questions.length) {
      setStage('done')
      const nextStreak = streak + 1
      setStreak(nextStreak)
      try {
        localStorage.setItem('lingua-streak', String(nextStreak))
      } catch {
        /* storage unavailable */
      }
    } else {
      setQi(qi + 1)
      setPicked(null)
    }
  }
  const restart = () => {
    setQi(0)
    setPicked(null)
    setScore(0)
    setStage('active')
  }

  const navLinks = [
    { href: '#lessons', label: dict.nav.links[0] },
    { href: '#how', label: dict.nav.links[1] },
    { href: '#pricing', label: dict.nav.links[2] },
    { href: '#faq', label: dict.nav.links[3] },
  ]

  return (
    <div ref={rootRef} className="min-h-screen bg-white text-neutral-900">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:rounded-lg focus:bg-teal-700 focus:px-4 focus:py-2 focus:text-white">
        {lang === 'ar' ? 'تخطَّ إلى المحتوى' : 'Skip to content'}
      </a>

      <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <nav aria-label="main" className="flex w-full max-w-5xl items-center justify-between rounded-2xl border border-neutral-200 bg-white/90 px-4 py-2 shadow-sm backdrop-blur-md">
          <a href="#top" className="flex items-center gap-2" aria-current="page">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white">
              <Globe size={20} weight="bold" />
            </span>
            <span className="title-1 font-semibold">{dict.nav.brand}</span>
          </a>
          <ul className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="body-5 text-neutral-600 transition-colors duration-300 ease-base hover:text-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 rounded">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full border border-neutral-200 p-1" role="group" aria-label={dict.nav.langLabel}>
              <button type="button" onClick={() => changeLang('en')} aria-pressed={lang === 'en'} className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-300 ease-base ${lang === 'en' ? 'bg-teal-700 text-white' : 'text-neutral-600 hover:text-teal-700'}`}>
                EN
              </button>
              <button type="button" onClick={() => changeLang('ar')} aria-pressed={lang === 'ar'} className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-300 ease-base ${lang === 'ar' ? 'bg-teal-700 text-white' : 'text-neutral-600 hover:text-teal-700'}`}>
                عربي
              </button>
            </div>
            <a href="#pricing" className="button-sm hidden rounded-xl bg-teal-700 px-3 py-2 text-white transition-all duration-300 ease-base hover:bg-teal-800 active:scale-[0.98] sm:inline-block">
              {dict.nav.cta}
            </a>
            <button type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="menu" className="rounded-lg p-2 text-neutral-700 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 md:hidden">
              {menuOpen ? <X size={22} /> : <List size={22} />}
            </button>
          </div>
        </nav>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 pt-24 backdrop-blur-md md:hidden">
          <ul className="flex flex-col gap-2 px-8">
            {navLinks.map((l, i) => (
              <li key={l.href} style={{ animationDelay: `${i * 60}ms` }} className="reveal visible">
                <a href={l.href} onClick={() => setMenuOpen(false)} className="title-1 block rounded-xl px-4 py-3 hover:bg-teal-50">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#pricing" onClick={() => setMenuOpen(false)} className="button-md mt-4 block rounded-xl bg-teal-700 px-4 py-2 text-center text-white">
                {dict.nav.cta}
              </a>
            </li>
          </ul>
        </div>
      )}

      <main id="main">
        {/* Hero */}
        <section id="top" className="bg-[#faf7f2] px-4 pb-16 pt-32 sm:px-8 sm:pt-40">
          <div className="mx-auto max-w-6xl">
            <div className="reveal mx-auto max-w-[680px] text-center">
              <p className="caption-4 inline-block rounded-full border border-teal-700/30 bg-teal-50 px-3 py-1 text-teal-800">{dict.hero.eyebrow}</p>
              <h1 className="hero-gradient-text heading-1 mt-6 text-4xl sm:text-6xl">{dict.hero.title}</h1>
              <p className="body-3 mx-auto mt-6 max-w-[680px] text-neutral-600">{dict.hero.subtitle}</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a href="#demo" className="button-md inline-flex items-center gap-2 rounded-xl bg-teal-700 px-3 py-2 text-white transition-all duration-300 ease-base hover:bg-teal-800 active:scale-[0.98]">
                  {dict.hero.ctaPrimary} <ArrowRight size={18} />
                </a>
                <a href="#how" className="button-md rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-800 transition-all duration-300 ease-base hover:border-teal-700 hover:text-teal-700 active:scale-[0.98]">
                  {dict.hero.ctaSecondary}
                </a>
              </div>
              <p className="caption-2 mt-8 flex items-center justify-center gap-2 text-neutral-500">
                <span className="flex text-amber-500" aria-hidden="true">
                  <Star size={16} weight="fill" /><Star size={16} weight="fill" /><Star size={16} weight="fill" /><Star size={16} weight="fill" /><Star size={16} weight="fill" />
                </span>
                {dict.hero.proofText}
              </p>
            </div>

            {/* Hero visual: lesson card */}
            <div className="reveal mx-auto mt-16 max-w-3xl rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="caption-4 text-neutral-500">{dict.demo.eyebrow}</p>
                  <p className="title-1 mt-1 font-semibold">{dict.demo.title}</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-amber-800">
                  <span className="caption-4 font-semibold">{dict.demo.streak}: {streak}</span>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <p className="caption-4 text-neutral-500">{lang === 'ar' ? 'تقدم الدرس' : 'Lesson progress'}</p>
                  <p className="caption-4 text-neutral-500">3 / 6</p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-full w-1/2 rounded-full bg-teal-700 transition-all duration-500 ease-base" />
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  { icon: BookOpen, label: lang === 'ar' ? 'درس اليوم' : 'Today lesson', value: lang === 'ar' ? 'تحيات الصباح' : 'Morning greetings' },
                  { icon: SpeakerHigh, label: lang === 'ar' ? 'كلمات جديدة' : 'New words', value: '12' },
                  { icon: ChartLine, label: lang === 'ar' ? 'نقاط اليوم' : 'Points today', value: '86' },
                ].map((c) => (
                  <div key={c.label} className="rounded-xl border border-neutral-200 bg-[#faf7f2] p-4">
                    <c.icon size={22} className="text-teal-700" />
                    <p className="caption-4 mt-2 text-neutral-500">{c.label}</p>
                    <p className="title-3 mt-1 font-semibold">{c.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section id="lessons" className="mx-auto max-w-6xl px-4 py-24 sm:px-8">
          <div className="reveal max-w-[680px]">
            <p className="caption-4 text-teal-700">{dict.benefits.eyebrow}</p>
            <h2 className="heading-2 mt-4 text-4xl sm:text-5xl">{dict.benefits.title}</h2>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {dict.benefits.items.map((b) => {
              const Icon = ICONS[b.icon] ?? BookOpen
              return (
                <article key={b.title} className="reveal rounded-2xl border border-neutral-200 bg-white p-8 transition-all duration-300 ease-base hover:border-teal-700/40 hover:shadow-sm">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                    <Icon size={24} />
                  </span>
                  <h3 className="heading-6 mt-6">{b.title}</h3>
                  <p className="body-3 mt-2 text-neutral-600">{b.text}</p>
                </article>
              )
            })}
          </div>
        </section>

        <Tagline text={dict.tagline} />

        {/* How it works */}
        <section id="how" className="bg-[#faf7f2] px-4 py-24 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="reveal max-w-[680px]">
              <p className="caption-4 text-teal-700">{dict.how.eyebrow}</p>
              <h2 className="heading-2 mt-4 text-4xl sm:text-5xl">{dict.how.title}</h2>
            </div>
            <ol className="mt-12 grid gap-8 md:grid-cols-3">
              {dict.how.steps.map((s, i) => (
                <li key={s.title} className="reveal rounded-2xl border border-neutral-200 bg-white p-8">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-700 text-base font-semibold text-white">{i + 1}</span>
                  <h3 className="heading-6 mt-6">{s.title}</h3>
                  <p className="body-3 mt-2 text-neutral-600">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Mini lesson demo */}
        <section id="demo" className="mx-auto max-w-6xl px-4 py-24 sm:px-8">
          <div className="reveal mx-auto max-w-2xl text-center">
            <p className="caption-4 text-teal-700">{dict.demo.eyebrow}</p>
            <h2 className="heading-2 mt-4 text-4xl sm:text-5xl">{dict.demo.title}</h2>
            <p className="body-3 mt-4 text-neutral-600">{dict.demo.subtitle}</p>
          </div>
          <div className="reveal mx-auto mt-12 max-w-2xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            {stage === 'idle' && (
              <div className="py-8 text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                  <Play size={28} weight="fill" />
                </span>
                <p className="title-1 mt-6 font-semibold">{dict.demo.title}</p>
                <p className="body-3 mt-2 text-neutral-600">{dict.demo.subtitle}</p>
                <button type="button" onClick={() => setStage('active')} className="button-md mt-8 rounded-xl bg-teal-700 px-3 py-2 text-white transition-all duration-300 ease-base hover:bg-teal-800 active:scale-[0.98]">
                  {dict.demo.start}
                </button>
              </div>
            )}
            {stage === 'active' && (
              <div>
                <div className="flex items-center justify-between">
                  <p className="caption-4 text-neutral-500">
                    {dict.demo.questionOf} {qi + 1} / {questions.length}
                  </p>
                  <p className="caption-4 text-neutral-500">
                    {dict.demo.score}: {score}
                  </p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-full rounded-full bg-teal-700 transition-all duration-500 ease-base" style={{ width: `${(qi / questions.length) * 100}%` }} />
                </div>
                <p className="heading-4 mt-8 text-center">{q.q}</p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {q.options.map((opt, i) => {
                    const isAnswer = i === q.answer
                    const isPicked = i === picked
                    let cls = 'border-neutral-200 bg-white hover:border-teal-700'
                    if (answered && isAnswer) cls = 'border-teal-700 bg-teal-50'
                    else if (answered && isPicked) cls = 'border-red-400 bg-red-50'
                    return (
                      <button key={opt} type="button" onClick={() => pick(i)} disabled={answered} className={`button-md rounded-xl border px-3 py-2 text-start transition-all duration-300 ease-base active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${cls}`}>
                        {opt}
                      </button>
                    )
                  })}
                </div>
                {answered && (
                  <div className="mt-6 rounded-xl bg-neutral-50 p-4">
                    <p className={`body-2 flex items-center gap-2 ${isCorrect ? 'text-teal-700' : 'text-red-600'}`}>
                      {isCorrect ? <Check size={18} weight="bold" /> : <X size={18} weight="bold" />}
                      {isCorrect ? dict.demo.correct : `${dict.demo.wrong} ${q.options[q.answer]}`}
                    </p>
                    <button type="button" onClick={next} className="button-md mt-4 w-full rounded-xl bg-teal-700 px-3 py-2 text-white transition-all duration-300 ease-base hover:bg-teal-800 active:scale-[0.98]">
                      {qi + 1 >= questions.length ? dict.demo.finish : dict.demo.next}
                    </button>
                  </div>
                )}
              </div>
            )}
            {stage === 'done' && (
              <div className="py-8 text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                  <Check size={28} weight="bold" />
                </span>
                <h3 className="heading-4 mt-6">{dict.demo.doneTitle}</h3>
                <p className="body-3 mt-2 text-neutral-600">
                  {tx(dict, 'demo.doneText').replace('{score}', String(score)).replace('{total}', String(questions.length))}
                </p>
                <p className="caption-2 mt-4 text-neutral-500">
                  {dict.demo.xp}: {score * 10} · {dict.demo.streak}: {streak}
                </p>
                <button type="button" onClick={restart} className="button-md mt-8 rounded-xl bg-teal-700 px-3 py-2 text-white transition-all duration-300 ease-base hover:bg-teal-800 active:scale-[0.98]">
                  {dict.demo.restart}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Languages */}
        <section className="bg-[#faf7f2] px-4 py-24 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="reveal max-w-[680px]">
              <p className="caption-4 text-teal-700">{dict.languages.eyebrow}</p>
              <h2 className="heading-2 mt-4 text-4xl sm:text-5xl">{dict.languages.title}</h2>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {dict.languages.items.map((l) => (
                <button key={l.name} type="button" onClick={() => setStage('idle')} className="reveal rounded-2xl border border-neutral-200 bg-white p-6 text-start transition-all duration-300 ease-base hover:border-teal-700/40 hover:shadow-sm active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-700">{l.flag}</span>
                  <span className="title-3 mt-4 block font-semibold">{l.name}</span>
                  <span className="caption-5 mt-1 block text-neutral-500">{l.learners}</span>
                </button>
              ))}
            </div>
            <p className="caption-2 mt-8 text-neutral-500">{dict.languages.note}</p>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-8">
          <div className="reveal max-w-[680px]">
            <p className="caption-4 text-teal-700">{dict.testimonials.eyebrow}</p>
            <h2 className="heading-2 mt-4 text-4xl sm:text-5xl">{dict.testimonials.title}</h2>
            <p className="caption-2 mt-4 rounded-lg bg-amber-50 px-3 py-2 text-amber-800">{dict.testimonials.note}</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {dict.testimonials.items.map((t) => (
              <figure key={t.name} className="reveal rounded-2xl border border-neutral-200 bg-white p-8">
                <span className="flex text-amber-500" aria-hidden="true">
                  <Star size={16} weight="fill" /><Star size={16} weight="fill" /><Star size={16} weight="fill" /><Star size={16} weight="fill" /><Star size={16} weight="fill" />
                </span>
                <blockquote className="body-3 mt-4 text-neutral-700">{t.quote}</blockquote>
                <figcaption className="mt-6">
                  <p className="title-3 font-semibold">{t.name}</p>
                  <p className="caption-2 text-neutral-500">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="bg-[#faf7f2] px-4 py-24 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="reveal max-w-[680px]">
              <p className="caption-4 text-teal-700">{dict.pricing.eyebrow}</p>
              <h2 className="heading-2 mt-4 text-4xl sm:text-5xl">{dict.pricing.title}</h2>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {dict.pricing.plans.map((p) => (
                <article key={p.name} className={`reveal rounded-2xl border bg-white p-8 ${p.name === 'Plus' || p.name === 'بلس' ? 'border-teal-700 shadow-sm' : 'border-neutral-200'}`}>
                  <h3 className="heading-5">{p.name}</h3>
                  <p className="heading-3 mt-4">{p.price}</p>
                  <p className="caption-2 text-neutral-500">{p.period}</p>
                  <ul className="mt-6 space-y-2">
                    {p.features.map((f) => (
                      <li key={f} className="body-5 flex items-start gap-2 text-neutral-700">
                        <Check size={16} weight="bold" className="mt-1 shrink-0 text-teal-700" /> {f}
                      </li>
                    ))}
                  </ul>
                  <a href="#demo" className={`button-md mt-8 block rounded-xl px-3 py-2 text-center transition-all duration-300 ease-base active:scale-[0.98] ${p.name === 'Plus' || p.name === 'بلس' ? 'bg-teal-700 text-white hover:bg-teal-800' : 'border border-neutral-300 hover:border-teal-700 hover:text-teal-700'}`}>
                    {p.cta}
                  </a>
                </article>
              ))}
            </div>
            <p className="caption-2 mt-8 text-neutral-500">{dict.pricing.note}</p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-4xl px-4 py-24 sm:px-8">
          <div className="reveal max-w-[680px]">
            <p className="caption-4 text-teal-700">{dict.faq.eyebrow}</p>
            <h2 className="heading-2 mt-4 text-4xl sm:text-5xl">{dict.faq.title}</h2>
          </div>
          <div className="mt-12 space-y-4">
            {dict.faq.items.map((f, i) => (
              <div key={f.q} className="reveal rounded-2xl border border-neutral-200 bg-white">
                <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i} className="flex w-full items-center justify-between gap-4 px-6 py-4 text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 rounded-2xl">
                  <span className="title-3 font-semibold">{f.q}</span>
                  <span className="text-teal-700 transition-transform duration-500 ease-base" style={{ transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                </button>
                {openFaq === i && <p className="body-3 px-6 pb-6 text-neutral-600">{f.a}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-8">
          <div className="reveal rounded-2xl bg-[#181818] px-8 py-16 text-center text-white">
            <h2 className="heading-2 mx-auto max-w-[680px] text-4xl sm:text-5xl">{dict.finalCta.title}</h2>
            <p className="body-3 mx-auto mt-4 max-w-[680px] text-neutral-300">{dict.finalCta.text}</p>
            <a href="#demo" className="button-md mt-8 inline-block rounded-xl bg-teal-600 px-3 py-2 text-white transition-all duration-300 ease-base hover:bg-teal-500 active:scale-[0.98]">
              {dict.finalCta.cta}
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 bg-white px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 md:grid-cols-4">
            <div>
              <p className="title-1 flex items-center gap-2 font-semibold">
                <Globe size={20} className="text-teal-700" /> {dict.nav.brand}
              </p>
              <p className="body-3 mt-4 text-neutral-600">{dict.footer.brandText}</p>
            </div>
            {dict.footer.columns.map((c) => (
              <nav key={c.title} aria-label={c.title}>
                <p className="title-3 font-semibold">{c.title}</p>
                <ul className="mt-4 space-y-2">
                  {c.links.map((l) => (
                    <li key={l}>
                      <a href="#top" className="body-5 text-neutral-600 transition-colors duration-300 ease-base hover:text-teal-700">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
          <div className="mt-12 flex flex-col gap-2 border-t border-neutral-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="caption-2 text-neutral-500">© 2026 {dict.nav.brand}. {dict.footer.copyright}</p>
            <p className="caption-2 text-neutral-500">{dict.footer.madeWith}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
