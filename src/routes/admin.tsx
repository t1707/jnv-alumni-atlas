import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listAlumni } from "@/lib/alumni.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lock, Download, Search, GraduationCap, ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin · JNV Kuchaman Alumni Directory" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Admin,
});

type Data = { header: string[]; rows: string[][] };

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function Admin() {
  const load = useServerFn(listAlumni);
  const [password, setPassword] = useState("");
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await load({ data: { password } });
      setData(res);
      setPage(1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadCsv = () => {
    if (!data) return;
    const all = [data.header, ...data.rows];
    const csv = all
      .map((row) =>
        row
          .map((cell) => {
            const v = (cell ?? "").toString();
            return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
          })
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jnv-kuchaman-alumni-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Reset page when query changes
  useEffect(() => {
    setPage(1);
  }, [query]);

  const filtered = data
    ? data.rows.filter((r) =>
        query.trim()
          ? r.join(" ").toLowerCase().includes(query.toLowerCase())
          : true,
      )
    : [];

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filtered.length);
  const paginated = filtered.slice(startIndex, endIndex);

  // Keep page in bounds if totalPages shrank
  const currentPage = safePage;

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-center" />
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-3">
            <GraduationCap className="h-6 w-6" />
            <span className="text-lg font-semibold tracking-tight">
              JNV Kuchaman Alumni Directory
            </span>
          </Link>
          <span className="text-xs text-primary-foreground/70">Admin</span>
        </div>
      </header>

      {!data ? (
        <main className="mx-auto flex max-w-md flex-col justify-center px-6 py-20">
          <form
            onSubmit={onLogin}
            className="rounded-2xl border bg-card p-8 shadow-sm"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-accent p-2 text-accent-foreground">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  Admin access
                </h1>
                <p className="text-xs text-muted-foreground">
                  Enter the admin password to view the directory.
                </p>
              </div>
            </div>
            <Label className="mb-1.5 block text-sm font-medium">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
            <Button
              type="submit"
              className="mt-5 w-full"
              disabled={loading || !password}
            >
              {loading ? "Loading…" : "Unlock directory"}
            </Button>
          </form>
        </main>
      ) : (
        <main className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Directory
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {data.rows.length} entries
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="w-64 pl-9"
                  placeholder="Search name, batch, place…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={downloadCsv}>
                <Download className="mr-2 h-4 w-4" /> CSV
              </Button>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  {data.header.map((h, i) => (
                    <th
                      key={i}
                      className="whitespace-nowrap px-4 py-3 text-left font-semibold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((row, ri) => (
                  <tr
                    key={ri}
                    className="border-t last:border-b hover:bg-accent/40"
                  >
                    {data.header.map((_, ci) => (
                      <td
                        key={ci}
                        className="whitespace-pre-wrap px-4 py-3 align-top text-foreground"
                      >
                        {row[ci] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={data.header.length}
                      className="px-4 py-10 text-center text-muted-foreground"
                    >
                      No matching entries.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Showing <span className="font-medium text-foreground">{filtered.length > 0 ? startIndex + 1 : 0}</span>
                {" "}–{" "}
                <span className="font-medium text-foreground">{endIndex}</span> of{" "}
                <span className="font-medium text-foreground">{filtered.length}</span>
              </span>
              <span className="hidden sm:inline">·</span>
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:inline text-xs">Per page</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => {
                    setPageSize(Number(v));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous</span>
              </Button>
              <span className="text-sm text-muted-foreground">
                Page <span className="font-medium text-foreground">{currentPage}</span> of{" "}
                <span className="font-medium text-foreground">{totalPages}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next</span>
              </Button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
