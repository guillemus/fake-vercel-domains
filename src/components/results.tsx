import { badges, formatPrice, type Domain, type Query, type Quote } from '../domains'
import { cx } from './cx'
import { Icon, type IconName } from './icons'

function DomainName({ domain, muted }: { domain: Domain; muted?: boolean }) {
  return (
    <span class={cx('truncate', muted ? 'text-faint' : 'text-ink')}>
      {domain.name}
      <span class="font-semibold">.{domain.tld}</span>
    </span>
  )
}

function CartButton() {
  return (
    <button
      class="flex size-8 shrink-0 items-center justify-center rounded-md border border-line text-ink transition-colors hover:bg-[#1a1a1a]"
      aria-label="Add to cart"
      data-on:click="$cart++"
    >
      <Icon name="cartPlus" />
    </button>
  )
}

function Price({ quote }: { quote: Extract<Quote, { status: 'available' }> }) {
  return (
    <span class="animate-fade-in whitespace-nowrap">
      {quote.pro && (
        <>
          <a class="text-link hover:underline" href="#">
            Free with Pro
          </a>
          <span class="text-muted"> or </span>
        </>
      )}
      {formatPrice(quote.price)}
    </span>
  )
}

function Badge({ children, premium }: { children: string; premium?: boolean }) {
  return (
    <span
      class={cx(
        'ml-2 inline-flex h-5 shrink-0 items-center rounded-full px-2 text-xs font-medium',
        premium ? 'animate-fade-in bg-premium text-premium-ink' : 'bg-pill text-ink',
      )}
    >
      {children}
    </span>
  )
}

export function TopResult({ domain, quote }: { domain: Domain; quote?: Quote }) {
  const id = `top-${domain.tld}`

  return (
    <div
      id={id}
      class="grid min-w-0 grid-cols-[1fr_auto] gap-x-3 rounded-lg border border-line bg-surface p-3.5 [grid-template-areas:'name_cart'_'status_cart'] md:h-[110px] md:p-5 md:[grid-template-areas:'name_name'_'status_cart']"
    >
      <div class="flex min-w-0 text-[19px]/7 [grid-area:name]">
        <DomainName domain={domain} muted={quote?.status === 'unavailable'} />
      </div>
      {!quote ? (
        <>
          <div id={`${id}-pending`} class="mt-0.5 flex h-6 items-center [grid-area:status] md:mt-2.5 md:h-8">
            <span class="h-[18px] w-[60px] rounded bg-skeleton" />
          </div>
          <span id={`${id}-cart-pending`} class="size-8 self-center rounded-md bg-skeleton [grid-area:cart] md:mt-2.5 md:self-auto" />
        </>
      ) : quote.status === 'unavailable' ? (
        <div id={`${id}-unavailable`} class="mt-0.5 flex h-6 animate-fade-in items-center text-base text-faint [grid-area:status] md:mt-2.5 md:h-8">
          Unavailable
        </div>
      ) : (
        <>
          <div id={`${id}-available`} class="mt-0.5 flex h-6 min-w-0 items-center text-base [grid-area:status] md:mt-2.5 md:h-8">
            <Price quote={quote} />
          </div>
          <div id={`${id}-cart`} class="self-center [grid-area:cart] md:mt-2.5 md:self-auto">
            <CartButton />
          </div>
        </>
      )}
    </div>
  )
}

export const lookupStride = 12

export function ResultRow({ domain, quote, index, run }: { domain: Domain; quote?: Quote; index: number; run: number }) {
  const badge = badges[domain.tld]

  const trigger = !quote && index % lookupStride === 0 ? { 'data-on-intersect__once': `@post('/more?run=${run}&from=${index}')` } : {}

  return (
    <div
      id={`row-${domain.tld}`}
      class="flex h-14 min-w-0 items-center justify-between gap-3 bg-surface px-3.5 text-sm md:text-[13.5px]"
      {...trigger}
    >
      <span class="flex min-w-0 items-center">
        <DomainName domain={domain} muted={quote?.status === 'unavailable'} />
        {badge && <Badge>{badge}</Badge>}
        {quote?.status === 'available' && quote.premium && <Badge premium>Premium</Badge>}
      </span>
      {!quote ? (
        <span id={`row-${domain.tld}-pending`} class="h-8 w-[90px] shrink-0 rounded-md bg-skeleton" />
      ) : quote.status === 'unavailable' ? (
        <span id={`row-${domain.tld}-unavailable`} class="shrink-0 animate-fade-in pr-1 text-faint">
          Unavailable
        </span>
      ) : (
        <span id={`row-${domain.tld}-available`} class="flex shrink-0 items-center gap-2">
          <Price quote={quote} />
          <CartButton />
        </span>
      )}
    </div>
  )
}

function FilterButton({ label, icon = 'chevron', class: className }: { label: string; icon?: IconName; class?: string }) {
  return (
    <button
      class={cx(
        'flex h-8 items-center justify-between gap-2 rounded-md border border-line px-3 text-sm whitespace-nowrap transition-colors hover:bg-[#1a1a1a]',
        className,
      )}
    >
      {label}
      <Icon name={icon} class="size-4" />
    </button>
  )
}

export function Results({ query, run }: { query: Query; run: number }) {
  const filler = (3 - (query.tlds.length % 3)) % 3

  return (
    <div id={`results-${run}`} class="mx-auto w-full max-w-[1192px] px-5 pt-4 pb-16 md:px-6 md:pt-3">
      <h2 class="text-xl/7 font-semibold tracking-tight md:text-2xl/8">Top Results</h2>
      <div class="mt-3 grid gap-2.5 md:grid-cols-2 md:gap-3 lg:grid-cols-4">
        {query.top.map((tld) => (
          <TopResult domain={{ name: query.name, tld }} />
        ))}
      </div>
      <div class="mt-6 flex items-center justify-between gap-4">
        <h2 class="text-xl/7 font-semibold tracking-tight md:text-2xl/8">All Results</h2>
        <div class="flex items-center gap-2">
          <FilterButton label="Free with Pro" icon="plus" class="border-dashed border-[#282828]" />
          <FilterButton label="All TLDs" class="w-[97px] bg-surface" />
          <FilterButton label="Show All" class="hidden w-[114px] bg-surface md:flex" />
          <FilterButton label="Relevance" class="hidden w-[128px] bg-surface md:flex" />
          <button
            class="flex size-8 items-center justify-center rounded-md transition-colors hover:bg-[#1a1a1a] md:hidden"
            aria-label="Sort and filter"
          >
            <Icon name="filter" />
          </button>
        </div>
      </div>
      <div class="mt-3 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
        {query.tlds.map((tld, index) => (
          <ResultRow domain={{ name: query.name, tld }} index={index} run={run} />
        ))}
        {Array.from({ length: filler }, () => (
          <div class="hidden bg-surface lg:block" />
        ))}
      </div>
    </div>
  )
}

export function EmptyState() {
  return (
    <div id="results-empty" class="flex flex-1 flex-col items-center justify-center px-6 pb-[3px] text-center">
      <span class="flex size-[34px] items-center justify-center rounded-md border border-line">
        <Icon name="search" class="size-4" />
      </span>
      <h2 class="mt-[11px] text-xl/7 font-semibold tracking-tight">Begin your search</h2>
      <p class="mt-1.5 max-w-[320px] text-sm/5 text-muted">Enter a domain name, keyword, or prompt to find available domains for your next project</p>
    </div>
  )
}
