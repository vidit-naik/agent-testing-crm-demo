'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock, Film, Popcorn, Ticket, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'

type Movie = {
  id: string
  title: string
  rating: string
  runtime: string
  auditorium: string
  format: string
  synopsis: string
  accent: string
  showtimes: string[]
}

type Concession = {
  id: string
  name: string
  price: number
}

const MOVIES: Movie[] = [
  {
    id: 'midnight-orbit',
    title: 'Midnight Orbit',
    rating: 'PG-13',
    runtime: '2h 08m',
    auditorium: 'Auditorium 4',
    format: 'Laser 4K',
    synopsis: 'A systems engineer races a lunar blackout while a crew waits on the far side.',
    accent: 'from-sky-950 via-indigo-800 to-cyan-700',
    showtimes: ['12:40 PM', '3:30 PM', '6:45 PM', '9:35 PM'],
  },
  {
    id: 'copper-line',
    title: 'The Copper Line',
    rating: 'R',
    runtime: '1h 54m',
    auditorium: 'Auditorium 2',
    format: 'Dolby Atmos',
    synopsis: 'A transit detective follows one missed stop into a city-wide conspiracy.',
    accent: 'from-zinc-950 via-stone-800 to-amber-700',
    showtimes: ['1:15 PM', '4:05 PM', '7:20 PM', '10:10 PM'],
  },
  {
    id: 'paper-suns',
    title: 'Paper Suns',
    rating: 'PG',
    runtime: '1h 42m',
    auditorium: 'Auditorium 7',
    format: 'Standard',
    synopsis: 'Two sisters build a backyard planetarium to keep an impossible promise.',
    accent: 'from-rose-900 via-orange-700 to-yellow-500',
    showtimes: ['11:30 AM', '2:10 PM', '5:00 PM', '7:40 PM'],
  },
]

const CONCESSIONS: Concession[] = [
  { id: 'popcorn', name: 'Large popcorn', price: 8.5 },
  { id: 'soda', name: 'Fountain drink', price: 5.25 },
  { id: 'candy', name: 'Theater candy', price: 4.75 },
  { id: 'combo', name: 'Popcorn + 2 drinks', price: 17.5 },
]

const SERVICE_FEE = 2.49

function currency(amount: number) {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export default function SeatMapPage() {
  const [selected, setSelected] = useState<string[]>([])
  const [seatTotal, setSeatTotal] = useState(0)
  const [movieId, setMovieId] = useState(MOVIES[0].id)
  const [showtime, setShowtime] = useState(MOVIES[0].showtimes[2])
  const [concessions, setConcessions] = useState<Record<string, number>>({})
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [delivery, setDelivery] = useState('email')
  const [notes, setNotes] = useState('')
  const [confirmation, setConfirmation] = useState('')

  useEffect(() => {
    import('@/components/seatmap/seatmap').catch((e) => console.warn('Seatmap component not built:', e))
  }, [])

  useEffect(() => {
    const el = document.querySelector('crm-seatmap')
    if (!el) return
    const onSelect = (e: any) => {
      setSelected(e.detail?.seats || [])
      setSeatTotal(e.detail?.total || 0)
      setConfirmation('')
    }
    el.addEventListener('seat-change', onSelect as any)
    return () => el.removeEventListener('seat-change', onSelect as any)
  }, [])

  const movie = MOVIES.find((m) => m.id === movieId) || MOVIES[0]

  const concessionTotal = useMemo(
    () =>
      CONCESSIONS.reduce((sum, item) => {
        return sum + (concessions[item.id] || 0) * item.price
      }, 0),
    [concessions]
  )

  const fees = selected.length * SERVICE_FEE
  const grandTotal = seatTotal + concessionTotal + fees
  const canReserve = selected.length > 0 && guestName.trim() && guestEmail.trim()

  function updateConcession(id: string, delta: number) {
    setConcessions((current) => {
      const quantity = Math.max(0, (current[id] || 0) + delta)
      return { ...current, [id]: quantity }
    })
    setConfirmation('')
  }

  function resetSeatSelection() {
    setSelected([])
    setSeatTotal(0)
    setConfirmation('')
  }

  function reserveTickets() {
    if (!canReserve) return
    const code = `${movie.title
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .toUpperCase()}-${selected.join('').replace(/\D/g, '').slice(0, 4) || '0000'}`
    setConfirmation(code)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Movie ticket checkout</h1>
          <p className="text-muted-foreground">
            Select a movie, pick seats from the canvas map, add concessions, and reserve tickets.
          </p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Order status</div>
          <div className="font-semibold">{confirmation ? 'Reserved' : 'In progress'}</div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className="rounded-lg border bg-card p-4">
            <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
              <div className={`min-h-64 rounded-lg bg-gradient-to-br ${movie.accent} p-5 text-white shadow-sm`}>
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <div className="mb-5 inline-flex items-center gap-2 rounded-md bg-white/15 px-3 py-1 text-xs font-medium">
                      <Film className="h-3.5 w-3.5" />
                      {movie.format}
                    </div>
                    <h2 className="text-3xl font-bold leading-tight">{movie.title}</h2>
                    <p className="mt-3 text-sm text-white/80">{movie.synopsis}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/85">
                    <span>{movie.rating}</span>
                    <span>{movie.runtime}</span>
                    <span>{movie.auditorium}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Select
                    label="Movie"
                    value={movieId}
                    onChange={(e) => {
                      const nextMovie = MOVIES.find((m) => m.id === e.target.value) || MOVIES[0]
                      setMovieId(nextMovie.id)
                      setShowtime(nextMovie.showtimes[0])
                      resetSeatSelection()
                    }}
                    options={MOVIES.map((m) => ({ value: m.id, label: m.title }))}
                  />
                  <Select
                    label="Ticket delivery"
                    value={delivery}
                    onChange={(e) => {
                      setDelivery(e.target.value)
                      setConfirmation('')
                    }}
                    options={[
                      { value: 'email', label: 'Email tickets' },
                      { value: 'sms', label: 'SMS link' },
                      { value: 'box-office', label: 'Box office pickup' },
                    ]}
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Clock className="h-4 w-4" />
                    Showtime
                  </div>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {movie.showtimes.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => {
                          setShowtime(time)
                          resetSeatSelection()
                        }}
                        className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                          showtime === time
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'bg-background hover:bg-accent'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg border bg-muted/40 p-3">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Date
                    </div>
                    <div className="mt-1 font-semibold">Today</div>
                  </div>
                  <div className="rounded-lg border bg-muted/40 p-3">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Format</div>
                    <div className="mt-1 font-semibold">{movie.format}</div>
                  </div>
                  <div className="rounded-lg border bg-muted/40 p-3">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Auditorium</div>
                    <div className="mt-1 font-semibold">{movie.auditorium}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border bg-card p-4">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Choose seats</h2>
                <p className="text-sm text-muted-foreground">
                  The seating chart is canvas-rendered inside a Lit Web Component.
                </p>
              </div>
              <div className="rounded-md bg-muted px-3 py-2 text-right">
                <div className="text-xs text-muted-foreground">Selected</div>
                <div className="font-semibold">{selected.length}</div>
              </div>
            </div>
            {/* @ts-expect-error - custom element defined at runtime */}
            <crm-seatmap key={`${movie.id}-${showtime}`} class="block w-full" />
          </section>

          <section className="rounded-lg border bg-card p-4">
            <div className="mb-4 flex items-center gap-2">
              <Popcorn className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Concessions</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {CONCESSIONS.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{currency(item.price)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => updateConcession(item.id, -1)}
                    >
                      -
                    </Button>
                    <span className="w-6 text-center font-medium">{concessions[item.id] || 0}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-label={`Add ${item.name}`}
                      onClick={() => updateConcession(item.id, 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border bg-card p-4">
            <div className="mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Guest details</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Full name"
                value={guestName}
                onChange={(e) => {
                  setGuestName(e.target.value)
                  setConfirmation('')
                }}
                placeholder="Jordan Lee"
              />
              <Input
                label="Email"
                type="email"
                value={guestEmail}
                onChange={(e) => {
                  setGuestEmail(e.target.value)
                  setConfirmation('')
                }}
                placeholder="jordan@example.com"
              />
              <Input
                label="Phone"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  setConfirmation('')
                }}
                placeholder="Optional"
              />
              <Input
                label="Accessibility or pickup notes"
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value)
                  setConfirmation('')
                }}
                placeholder="Optional"
              />
            </div>
          </section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          <section className="rounded-lg border bg-card p-4">
            <div className="mb-4 flex items-center gap-2">
              <Ticket className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Order summary</h2>
            </div>

            <div className="space-y-4">
              <div>
                <div className="font-semibold">{movie.title}</div>
                <div className="text-sm text-muted-foreground">
                  {showtime} · {movie.auditorium} · {movie.format}
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Seats</div>
                <div className="mt-1 font-medium">{selected.join(', ') || 'Select seats from the map'}</div>
              </div>

              <div className="space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <span>Tickets</span>
                  <span>{currency(seatTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Convenience fees</span>
                  <span>{currency(fees)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Concessions</span>
                  <span>{currency(concessionTotal)}</span>
                </div>
                <div className="flex justify-between border-t pt-3 text-base font-bold">
                  <span>Total Amount Due</span>
                  <span id="total-amount-due">{currency(grandTotal)}</span>
                </div>
              </div>

              <Button type="button" className="w-full" disabled={!canReserve} onClick={reserveTickets}>
                Reserve tickets
              </Button>

              {!canReserve && (
                <p className="text-sm text-muted-foreground">
                  Select at least one seat and enter a name and email to reserve.
                </p>
              )}

              {confirmation && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-green-950">
                  <div className="text-sm font-semibold">Reservation confirmed</div>
                  <div className="mt-1 text-sm">
                    Reference {confirmation}. No payment was collected.
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-lg border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Fulfillment
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium capitalize">{delivery.replace('-', ' ')}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Guest</span>
                <span className="font-medium">{guestName || 'Not entered'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Notes</span>
                <span className="max-w-44 truncate font-medium">{notes || 'None'}</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
