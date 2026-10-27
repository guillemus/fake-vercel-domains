import { cx } from './components/cx'
import { AgentIcons, Icon, Logo, type IconName } from './components/icons'
import { EmptyState, Results } from './components/results'
import { parseQuery } from './domains'

const repoUrl = 'https://github.com/guillemus/fake-vercel-domains'

const agentPrompt = 'Find me an available domain on Vercel Domains: https://vercel.com/domains/llms.txt'

type SearchFieldProps = { id: string; q: string; class?: string; autofocus?: boolean; [attribute: `data-${string}`]: string }

function SearchField({ id, q, class: className, autofocus, ...attributes }: SearchFieldProps) {
  return (
    <label class={cx('relative flex h-[34px] items-center rounded-lg border focus-field border-line bg-surface', className)}>
      <Icon name="search" class="pointer-events-none absolute left-2.5 size-4 text-muted" />
      <input
        id={id}
        value={q}
        class="size-full min-w-0 bg-transparent pr-14 pl-8 text-base text-ink outline-none placeholder:text-[#8f8f8f] md:text-sm"
        placeholder="Search a domain or describe your idea"
        autocomplete="off"
        spellcheck={false}
        data-init={
          autofocus ? "matchMedia('(min-width: 48rem)').matches && (el.focus(), el.setSelectionRange(el.value.length, el.value.length))" : undefined
        }
        data-bind="q"
        data-on:keydown="evt.key === 'Escape' && ($q = '', @post('/search'))"
        {...attributes}
      />
      <kbd
        class="pointer-events-none absolute right-2 flex h-5 items-center rounded border border-pill px-1.5 font-sans text-xs text-muted"
        data-show="$q"
        style={q ? undefined : 'display: none'}
      >
        Esc
      </kbd>
    </label>
  )
}

function HeaderButton({ icon, label, class: className, children }: { icon?: IconName; label: string; class?: string; children?: unknown }) {
  return (
    <button
      class={cx(
        'relative flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-md border border-[#282828] bg-surface px-2 text-sm font-medium transition-colors hover:bg-[#1a1a1a] md:px-3',
        className,
      )}
      aria-label={label}
    >
      {icon && <Icon name={icon} />}
      <span class={icon ? 'hidden md:inline' : undefined}>{label}</span>
      {children}
    </button>
  )
}

function Header({ q, searching }: { q: string; searching: boolean }) {
  return (
    <header class="z-20 flex shrink-0 flex-wrap items-center gap-x-4 border-b border-line bg-black px-4 md:h-16 md:flex-nowrap md:px-6">
      <a class="flex h-16 shrink-0 items-center" href="/" aria-label="Vercel Domains">
        <Logo class="h-[19px] w-[22px]" />
        <span class="ml-[15px] text-lg text-[#3d3d3d]">/</span>
        <span class="ml-[15px] text-base font-medium">Domains</span>
      </a>
      <div
        class="order-last -mx-4 flex basis-[calc(100%+2rem)] justify-center border-t border-line px-3 py-2.5 md:order-none md:mx-0 md:min-w-0 md:flex-1 md:basis-auto md:border-0 md:p-0"
        data-show="$searching"
        style={searching ? undefined : 'display: none'}
      >
        <SearchField
          id="search"
          q={q}
          class="w-full md:max-w-[808px]"
          autofocus={searching}
          {...{ 'data-on:input__debounce.150ms': "@post('/search')" }}
        />
      </div>
      <nav class="ml-auto flex shrink-0 items-center gap-2 md:gap-2.5">
        <HeaderButton label="Feedback" class="hidden md:flex" />
        <HeaderButton icon="bookmark" label="Saved" />
        <HeaderButton icon="cart" label="Cart">
          <span class="ml-0.5 rounded-full bg-ink px-1.5 text-xs/4 text-black" data-show="$cart > 0" data-text="$cart" style="display: none" />
        </HeaderButton>
        <span class="ml-px size-8 rounded-full bg-[radial-gradient(circle_at_30%_25%,#f2c48d,#a0623a_55%,#3c2418)] ring-1 ring-line" />
      </nav>
    </header>
  )
}

function Hero() {
  return (
    <section class="flex min-h-full items-center justify-center px-5 pb-[176px] md:px-6" data-show="!$searching">
      <div class="flex w-full flex-col items-center text-center">
        <span class="mb-6 flex h-7 items-center rounded-full border border-line bg-surface px-3 text-xs font-medium text-muted">
          This is all fake btw (
          <a class="text-ink underline underline-offset-2 hover:text-link" href={repoUrl} target="_blank" rel="noreferrer">
            code here
          </a>
          )
        </span>
        <h1 class="text-[clamp(30px,9vw,47px)]/[1.19] font-semibold tracking-[-0.055em]">
          Find a domain for
          <br />
          <span class="text-muted">your passion project.</span>
        </h1>
        <p class="mt-3 text-base text-muted">
          Fast. At-cost. Private.{' '}
          <a class="underline decoration-muted/60 underline-offset-[3px] hover:text-ink" href="#">
            View pricing.
          </a>
        </p>
        <SearchField
          id="hero-search"
          q=""
          class="mt-6 w-full max-w-[518px]"
          autofocus
          data-on:input="
            $searching = true;
            @post('/search');
            setTimeout(() => {
              const search = document.getElementById('search');
              search.focus();
              search.setSelectionRange(search.value.length, search.value.length);
            })"
        />
        <button
          class="mt-6 flex h-[34px] items-center gap-2 rounded-full border border-line px-3 text-sm font-medium transition-colors hover:bg-[#111]"
          data-on:click={`navigator.clipboard.writeText('${agentPrompt}')`}
        >
          <AgentIcons />
          <span class="ml-0.5">Let your agent find a domain</span>
          <Icon name="copy" class="size-3.5 text-muted" />
        </button>
      </div>
    </section>
  )
}

export function DomainsPage({ q, sid, searching }: { q: string; sid: string; searching: boolean }) {
  const query = parseQuery(q)
  return (
    <div
      class="flex h-dvh flex-col"
      data-signals={JSON.stringify({ sid, q, searching, cart: 0 })}
      data-init="@get('/connect', {openWhenHidden: true, retryMaxCount: 1000})"
      data-effect="
        const url = $q ? '/search?q=' + encodeURIComponent($q) : '/search';
        if ($searching) history.replaceState(null, '', url)"
    >
      <Header q={q} searching={searching} />
      <main class="min-h-0 flex-1 [scrollbar-gutter:stable] overflow-y-auto overscroll-contain">
        {!searching && <Hero />}
        <div id="results" class="flex min-h-full flex-col" data-show="$searching" style={searching ? undefined : 'display: none'}>
          {query ? <Results query={query} run={0} /> : searching && <EmptyState />}
        </div>
      </main>
    </div>
  )
}
