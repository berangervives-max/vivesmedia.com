// Cadres « mockup » pour présenter les écrans comme un studio (sans JS).

export function BrowserFrame({ children, url }: { children: React.ReactNode; url?: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-2xl">
      <div className="flex items-center gap-3 border-b border-border bg-secondary/60 px-4 py-3">
        <span className="flex items-center gap-1.5">
          <span className="block h-3 w-3 rounded-full" style={{ background: '#FF5F57' }} />
          <span className="block h-3 w-3 rounded-full" style={{ background: '#FEBC2E' }} />
          <span className="block h-3 w-3 rounded-full" style={{ background: '#28C840' }} />
        </span>
        {url && (
          <span className="ml-1 hidden truncate rounded-md border border-border bg-white px-3 py-1 text-[11px] text-muted-foreground sm:block">
            {url}
          </span>
        )}
      </div>
      <div className="bg-secondary">{children}</div>
    </div>
  )
}

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[280px] rounded-[2.4rem] border-[7px] bg-foreground p-1 shadow-2xl" style={{ borderColor: '#1a1a1a' }}>
      <div className="overflow-hidden rounded-[1.9rem] bg-secondary">{children}</div>
    </div>
  )
}
