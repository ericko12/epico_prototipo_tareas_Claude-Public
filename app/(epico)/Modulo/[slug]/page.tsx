import { moduleSlugs } from "@/features/layoutMain/domain/data/menuItems.data";
import { ModulePlaceholder } from "./ModulePlaceholder";

const extra = [{ slug: "cajas", label: "Cajas", parent: "Pedidos" }];
const all = [...moduleSlugs, ...extra];

export function generateStaticParams() { return all.map((m) => ({ slug: m.slug })); }

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mod = all.find((m) => m.slug === slug) ?? { label: slug, parent: "Épico" };
  return <ModulePlaceholder label={mod.label} parent={mod.parent} />;
}
