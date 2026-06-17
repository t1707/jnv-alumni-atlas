import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { listAlumniPublic } from "@/lib/alumni.functions";
import { findCityIn, type CityCoord } from "@/lib/city-coords";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, Search, MapPin, Minus, Plus, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n, LangToggle } from "@/lib/i18n";

const WORLD_TOPO =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export const Route = createFileRoute("/visualize")({
  head: () => ({
    meta: [
      { title: "Visualize — JNV Alumni Directory" },
      {
        name: "description",
        content:
          "Search JNV alumni by name and explore where they live and work on an interactive map.",
      },
      { property: "og:title", content: "Visualize — JNV Alumni Directory" },
      {
        property: "og:description",
        content:
          "Search alumni by name and explore the JNV alumni network on a zoomable map.",
      },
    ],
  }),
  component: VisualizePage,
});

type Alumnus = {
  name: string;
  batch: string;
  address: string;
  occupation: string;
  department: string;
  post: string;
  postingPlace: string;
  remarks: string;
};

function VisualizePage() {
  const list = useServerFn(listAlumniPublic);
  const { data, isLoading, error } = useQuery({
    queryKey: ["alumni-public"],
    queryFn: () => list(),
  });

  const alumni = (data?.alumni ?? []) as Alumnus[];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-3">
            <GraduationCap className="h-6 w-6" />
            <span className="text-lg font-semibold tracking-tight">
              JNV Alumni Directory
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/" className="text-primary-foreground/70 hover:text-primary-foreground">
              Submit
            </Link>
            <Link to="/visualize" className="font-medium">
              Visualize
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">
            Explore the alumni network
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search by name or pan and zoom the map to see where alumni live and work.
          </p>
        </div>

        {isLoading ? (
          <Card className="p-8 text-sm text-muted-foreground">Loading directory…</Card>
        ) : error ? (
          <Card className="p-8 text-sm text-destructive">
            Couldn't load directory. Please try again.
          </Card>
        ) : (
          <Tabs defaultValue="search" className="w-full">
            <TabsList>
              <TabsTrigger value="search">
                <Search className="mr-2 h-4 w-4" /> Search ({alumni.length})
              </TabsTrigger>
              <TabsTrigger value="map">
                <MapPin className="mr-2 h-4 w-4" /> Map
              </TabsTrigger>
            </TabsList>
            <TabsContent value="search" className="mt-4">
              <SearchView alumni={alumni} />
            </TabsContent>
            <TabsContent value="map" className="mt-4">
              <MapView alumni={alumni} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}

function SearchView({ alumni }: { alumni: Alumnus[] }) {
  const [q, setQ] = useState("");
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const batchOptions = useMemo(() => {
    const years = new Set<string>();
    for (const a of alumni) {
      if (a.batch) years.add(a.batch);
    }
    return Array.from(years).sort((a, b) => Number(a) - Number(b));
  }, [alumni]);

  const filtered = useMemo(() => {
    let result = alumni;
    const needle = q.trim().toLowerCase();
    if (needle) {
      result = result.filter((a) =>
        [a.name, a.batch, a.occupation, a.department, a.post, a.postingPlace, a.address]
          .join(" ")
          .toLowerCase()
          .includes(needle),
      );
    }
    if (batchFilter !== "all") {
      result = result.filter((a) => a.batch === batchFilter);
    }
    return result;
  }, [q, batchFilter, alumni]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search by name, batch, occupation, place…"
            className="pl-9"
          />
        </div>
        <Select
          value={batchFilter}
          onValueChange={(v) => { setBatchFilter(v); setPage(1); }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by batch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All batches</SelectItem>
            {batchOptions.map((year) => (
              <SelectItem key={year} value={year}>
                Batch {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-6 text-sm text-muted-foreground">No matches.</Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {paginated.map((a, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-base font-semibold text-foreground">
                    {a.name}
                  </h3>
                  {a.batch ? (
                    <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                      Batch {a.batch}
                    </span>
                  ) : null}
                </div>
                {(a.post || a.occupation || a.department) && (
                  <p className="mt-1 text-sm text-foreground">
                    {[a.post, a.occupation, a.department].filter(Boolean).join(" · ")}
                  </p>
                )}
                {a.postingPlace || a.address ? (
                  <p className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
                    <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                    <span>{a.postingPlace || a.address}</span>
                  </p>
                ) : null}
                {a.remarks ? (
                  <p className="mt-2 text-xs text-muted-foreground italic">
                    {a.remarks}
                  </p>
                ) : null}
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Showing</span>
              <span className="font-medium text-foreground">
                {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)}
              </span>
              <span>of {filtered.length}</span>
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={String(pageSize)}
                onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}
              >
                <SelectTrigger className="h-8 w-[80px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="min-w-[3ch] text-center text-xs text-muted-foreground">
                  {safePage} / {totalPages}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

type Pin = { city: CityCoord; people: Alumnus[] };

function MapView({ alumni }: { alumni: Alumnus[] }) {
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [20, 10],
    zoom: 1,
  });
  const [selected, setSelected] = useState<Pin | null>(null);

  const { pins, unplaced } = useMemo(() => {
    const map = new Map<string, Pin>();
    const unplacedList: Alumnus[] = [];
    for (const a of alumni) {
      const text = `${a.postingPlace} ${a.address}`;
      const city = findCityIn(text);
      if (!city) {
        unplacedList.push(a);
        continue;
      }
      const key = city.name;
      const existing = map.get(key);
      if (existing) existing.people.push(a);
      else map.set(key, { city, people: [a] });
    }
    return { pins: Array.from(map.values()), unplaced: unplacedList };
  }, [alumni]);

  const zoomTo = (coordinates: [number, number], zoom: number) =>
    setPosition({ coordinates, zoom });

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <Card className="relative overflow-hidden">
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-1">
          <Button
            size="icon"
            variant="secondary"
            onClick={() => setPosition((p) => ({ ...p, zoom: Math.min(p.zoom * 1.5, 64) }))}
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            onClick={() => setPosition((p) => ({ ...p, zoom: Math.max(p.zoom / 1.5, 1) }))}
            aria-label="Zoom out"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            onClick={() => { setPosition({ coordinates: [20, 10], zoom: 1 }); setSelected(null); }}
            aria-label="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="absolute left-3 top-3 z-10 flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => zoomTo([78.9629, 22.5937], 5)}>
            India
          </Button>
          <Button size="sm" variant="secondary" onClick={() => zoomTo([74.2179, 27.0238], 12)}>
            Rajasthan
          </Button>
          <Button size="sm" variant="secondary" onClick={() => zoomTo([74.6399, 26.4499], 32)}>
            Ajmer
          </Button>
        </div>

        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 140 }}
          style={{ width: "100%", height: "560px", background: "var(--muted)" }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            maxZoom={64}
            minZoom={1}
            onMoveEnd={(p) => setPosition({ coordinates: p.coordinates as [number, number], zoom: p.zoom })}
          >
            <Geographies geography={WORLD_TOPO}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="var(--card)"
                    stroke="var(--border)"
                    strokeWidth={0.4}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "var(--accent)", outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {pins.map((pin) => {
              const r = Math.min(3 + pin.people.length * 0.6, 10) / Math.sqrt(position.zoom);
              return (
                <Marker
                  key={pin.city.name}
                  coordinates={[pin.city.lng, pin.city.lat]}
                  onClick={() => setSelected(pin)}
                >
                  <circle
                    r={r}
                    fill="var(--primary)"
                    stroke="var(--background)"
                    strokeWidth={1 / Math.sqrt(position.zoom)}
                    style={{ cursor: "pointer" }}
                  />
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </Card>

      <Card className="p-4">
        {selected ? (
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold">{selected.city.name}</h3>
                {selected.city.state ? (
                  <p className="text-xs text-muted-foreground">{selected.city.state}</p>
                ) : null}
              </div>
              <button
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setSelected(null)}
              >
                Clear
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {selected.people.length} alumni
            </p>
            <ul className="mt-3 max-h-[480px] space-y-2 overflow-auto pr-1">
              {selected.people.map((p, i) => (
                <li key={i} className="rounded-md border p-2">
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {[p.batch && `Batch ${p.batch}`, p.post, p.occupation]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">How to use</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Click <b>India / Rajasthan / Ajmer</b> for quick zoom.</li>
              <li>Scroll or use +/− to zoom; drag to pan.</li>
              <li>Click a pin to see alumni in that city.</li>
            </ul>
            <div className="mt-4 rounded-md bg-muted p-3">
              <div className="text-xs">
                <b>{pins.length}</b> cities mapped · <b>{alumni.length - unplaced.length}</b> alumni placed
                {unplaced.length > 0 ? (
                  <> · <b>{unplaced.length}</b> without a recognized city</>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
