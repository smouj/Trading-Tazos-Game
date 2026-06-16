import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { FRANCHISE_BY_SLUG } from "@/lib/franchise-config";
import type { TazoFinish } from "@/lib/battle/game-loop";
import TazoDiscImage from "@/components/game/tazo-disc-image";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const tazos = await db.tazo.findMany({
    where: { publishStatus: "published" },
    select: { slug: true },
  });
  return tazos.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tazo = await db.tazo.findFirst({
    where: { slug, publishStatus: "published" },
    include: { franchise: true },
  });
  if (!tazo) return { title: "Tazo not found — Trading Tazos Game" };

  const title = `${tazo.name} | ${tazo.franchise.name} #${tazo.number} | Trading Tazos Game`;
  const description = `${tazo.rarity} ${tazo.combatType || ""} tazo from ${tazo.franchise.name}. ${tazo.displayName || ""} — Collect, battle, and trade at Trading Tazos Game.`;

  return {
    title,
    description: description.replace(/\\s+/g, " ").trim(),
    openGraph: {
      title,
      description,
      images: [{ url: `https://tradingtazosgame.com${tazo.imageUrl}`, width: 1000, height: 1000 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`https://tradingtazosgame.com${tazo.imageUrl}`],
    },
    alternates: { canonical: `https://tradingtazosgame.com/tazos/${slug}` },
  };
}

export default async function TazoPage({ params }: Props) {
  const { slug } = await params;
  const tazo = await db.tazo.findFirst({
    where: { slug, publishStatus: "published" },
    include: { franchise: true },
  });
  if (!tazo) return notFound();

  const fc = FRANCHISE_BY_SLUG[tazo.franchise.slug];

  return (
    <main className="min-h-screen bg-[#1a1a1a] py-12 px-4">
      <article className="max-w-2xl mx-auto">
        <nav className="mb-8">
          <a href="/?page=tazos" className="text-[#FFCC00] hover:underline text-sm font-bold">
            ← Back to Tazo Catalog
          </a>
        </nav>

        <div className="flex flex-col sm:flex-row gap-8 items-start">
          <div className="shrink-0">
            <TazoDiscImage
              src={tazo.imageUrl || ""}
              alt={tazo.name ?? ""}
              size={240}
              borderWidth={0}
              number={tazo.number}
              franchiseSlug={tazo.franchise.slug}
              finish={tazo.finish as TazoFinish}
            />
          </div>

          <div className="flex-1 text-[#e0e0e0] space-y-4">
            <div>
              <p className="text-sm font-bold" style={{ color: fc?.color || "#FFCC00" }}>
                {tazo.franchise.name} #{tazo.number}
              </p>
              <h1 className="text-3xl font-black text-white mt-1">{tazo.name}</h1>
              {tazo.displayName && (
                <p className="text-lg text-[#888] italic mt-1">{tazo.displayName}</p>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold border border-[#333] text-[#e0e0e0]">
                {tazo.rarity}
              </span>
              {tazo.combatType && (
                <span className="px-3 py-1 rounded-full text-xs font-bold border border-[#333] text-[#e0e0e0]">
                  {tazo.combatType}
                </span>
              )}
              {tazo.finish && tazo.finish !== "normal" && (
                <span className="px-3 py-1 rounded-full text-xs font-bold border border-[#333] text-[#e0e0e0]">
                  {tazo.finish}
                </span>
              )}
            </div>

            {tazo.skill && (
              <div className="border border-[#333] p-4 bg-[#222]">
                <p className="text-[#FFCC00] text-xs font-bold">SKILL</p>
                <p className="text-white font-bold">{tazo.skill}</p>
                {tazo.skillDesc && <p className="text-[#888] text-sm mt-1">{tazo.skillDesc}</p>}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 text-xs">
              {(["attack","defense","resistance","weight","stability","spin","control"] as const).map((stat) => (
                <div key={stat} className="bg-[#222] p-2 text-center">
                  <p className="text-[#888] uppercase">{stat}</p>
                  <p className="text-white font-bold text-lg">{tazo[stat] ?? 50}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: tazo.name,
              description: `${tazo.rarity} ${tazo.combatType || ""} tazo from ${tazo.franchise.name}`,
              image: `https://tradingtazosgame.com${tazo.imageUrl}`,
              brand: { "@type": "Brand", name: tazo.franchise.name },
              category: tazo.franchise.name,
            }),
          }}
        />
      </article>
    </main>
  );
}
