import { cx } from './components/cx'
import { AgentIcons, Icon, Logo, type IconName } from './components/icons'
import { EmptyState, Results } from './components/results'
import { parseQuery } from './domains'

const syncUrl = "history.replaceState(null, '', $q ? '/search?q=' + encodeURIComponent($q) : '/search')"

const focusHeaderSearch =
  "setTimeout(() => { const el = document.getElementById('search'); el.focus(); el.setSelectionRange(el.value.length, el.value.length) })"

const agentPrompt = 'Find me an available domain on Bursel Domains: https://bursel.domains/llms.txt'

type SearchFieldProps = { id: string; class?: string; onInput: Record<string, string>; autofocus?: boolean }

function SearchField({ id, class: className, onInput, autofocus }: SearchFieldProps) {
  return (
    <label class={cx('relative flex h-[34px] items-center rounded-lg border focus-field border-line bg-surface', className)}>
      <Icon name="search" class="pointer-events-none absolute left-2.5 size-4 text-muted" />
      <input
        id={id}
        class="size-full min-w-0 bg-transparent pr-14 pl-8 text-sm text-ink outline-none placeholder:text-[#8f8f8f]"
        placeholder="Search a domain or describe your idea"
        autocomplete="off"
        spellcheck={false}
        autofocus={autofocus}
        data-bind="q"
        {...onInput}
        data-on:keydown={`evt.key === 'Escape' && ($q = '', ${syncUrl}, @post('/search'))`}
      />
      <kbd
        class="pointer-events-none absolute right-2 flex h-5 items-center rounded border border-pill px-1.5 font-sans text-xs text-muted"
        data-show="$q"
        style="display: none"
      >
        Esc
      </kbd>
    </label>
  )
}

function HeaderButton({ icon, label, children }: { icon?: IconName; label: string; children?: unknown }) {
  return (
    <button class="relative flex h-8 items-center gap-1.5 rounded-md border border-[#282828] bg-surface px-3 text-sm font-medium transition-colors hover:bg-[#1a1a1a]">
      {icon && <Icon name={icon} />}
      {label}
      {children}
    </button>
  )
}

function Header({ searching }: { searching: boolean }) {
  return (
    <header class="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-line bg-black px-6">
      <a class="flex shrink-0 items-center" href="/" aria-label="Bursel Domains">
        <Logo class="h-[19px] w-[22px]" />
        <span class="ml-[15px] text-lg text-[#3d3d3d]">/</span>
        <span class="ml-[15px] text-base font-medium">Domains</span>
      </a>
      <div class="flex min-w-0 flex-1 justify-center">
        <div class="w-full max-w-[808px]" data-show="$searching" style={searching ? undefined : 'display: none'}>
          <SearchField id="search" onInput={{ 'data-on:input__debounce.150ms': `${syncUrl}; @post('/search')` }} autofocus={searching} />
        </div>
      </div>
      <nav class="flex shrink-0 items-center gap-2.5">
        <HeaderButton label="Feedback" />
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
    <section class="flex min-h-[calc(100vh-64px)] items-center justify-center px-6 pb-[124px]" data-show="!$searching">
      <div class="flex flex-col items-center text-center">
        <h1 class="text-[47px]/[56px] font-semibold tracking-[-0.055em]">
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
          class="mt-6 w-[518px] max-w-[calc(100vw-48px)]"
          autofocus
          onInput={{ 'data-on:input': `$searching = true; ${syncUrl}; @post('/search'); ${focusHeaderSearch}` }}
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
    <div data-signals={JSON.stringify({ sid, q, searching, cart: 0 })} data-init="@get('/connect', {openWhenHidden: true, retryMaxCount: 1000})">
      <Header searching={searching} />
      {!searching && <Hero />}
      <main data-show="$searching" style={searching ? undefined : 'display: none'}>
        {query ? <Results query={query} /> : <EmptyState />}
      </main>
    </div>
  )
}
