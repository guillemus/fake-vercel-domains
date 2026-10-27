const paths = {
  search: (
    <>
      <circle cx="7" cy="7" r="5.25" />
      <path d="m11 11 3.5 3.5" />
    </>
  ),
  cart: (
    <>
      <path d="M1 1.75h1.6l1.7 8.1a1.2 1.2 0 0 0 1.2.95h6.3a1.2 1.2 0 0 0 1.15-.9L14.2 5H3.4" />
      <circle cx="5.75" cy="13.5" r=".9" fill="currentColor" stroke="none" />
      <circle cx="11.75" cy="13.5" r=".9" fill="currentColor" stroke="none" />
    </>
  ),
  cartPlus: (
    <>
      <path d="M1 1.75h1.6l1.7 8.1a1.2 1.2 0 0 0 1.2.95h6.3a1.2 1.2 0 0 0 1.15-.9l.85-3.4M3.6 6h5.9" />
      <path d="M12.75 0.5v4M10.75 2.5h4" />
      <circle cx="5.75" cy="13.75" r=".9" fill="currentColor" stroke="none" />
      <circle cx="11.75" cy="13.75" r=".9" fill="currentColor" stroke="none" />
    </>
  ),
  bookmark: <path d="M3.75 1.75h8.5v12.5L8 11.25l-4.25 3V1.75Z" />,
  chevron: <path d="m4 6 4 4 4-4" />,
  plus: <path d="M8 2v12M2 8h12" />,
  copy: (
    <>
      <rect x="5.25" y="5.25" width="9" height="9" rx="1.5" />
      <path d="M10.75 3V2.75a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1H3" />
    </>
  ),
}

export type IconName = keyof typeof paths

export function Icon({ name, class: className = 'size-4' }: { name: IconName; class?: string }) {
  return (
    <svg
      class={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

export function Logo({ class: className = '' }: { class?: string }) {
  return (
    <svg class={className} viewBox="0 0 76 65" fill="currentColor" aria-hidden="true">
      <path d="M38 65 76 0H0l38 65Z" />
    </svg>
  )
}

export function AgentIcons() {
  return (
    <span class="flex -space-x-1">
      <span class="flex size-4 items-center justify-center rounded-full bg-[#1c1c1c] ring-1 ring-black">
        <svg class="size-3 text-[#d97757]" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
          <path d="M6 1v10M1 6h10M2.5 2.5l7 7M9.5 2.5l-7 7" />
        </svg>
      </span>
      <span class="flex size-4 items-center justify-center rounded-full bg-[#1c1c1c] ring-1 ring-black">
        <svg class="size-3 text-ink" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2">
          <circle cx="6" cy="6" r="3.75" />
          <path d="M6 2.25v3.75l3.25 1.9M2.75 7.9 6 6" />
        </svg>
      </span>
      <span class="flex size-4 items-center justify-center rounded-full bg-ink ring-1 ring-black">
        <svg class="size-2.5 text-black" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 .5 11 3.25v5.5L6 11.5 1 8.75v-5.5L6 .5Zm0 1.6L2.6 4 6 5.9 9.4 4 6 2.1Z" />
        </svg>
      </span>
    </span>
  )
}
