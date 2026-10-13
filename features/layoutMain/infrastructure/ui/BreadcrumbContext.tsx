"use client";
import { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext<{ crumbs: string[]; setCrumbs: (c: string[]) => void }>({ crumbs: [], setCrumbs: () => {} });
export const BreadcrumbProvider = ({ children }: { children: React.ReactNode }) => {
  const [crumbs, setCrumbs] = useState<string[]>([]);
  return <Ctx.Provider value={{ crumbs, setCrumbs }}>{children}</Ctx.Provider>;
};
export const useBreadcrumbs = () => useContext(Ctx).crumbs;
/** Equivalente sintético de useBreadcrumb().setBreadcrumb de Épico. */
export const useSetBreadcrumb = (crumbs: string[]) => {
  const { setCrumbs } = useContext(Ctx);
  const key = crumbs.join("|");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setCrumbs(crumbs); }, [key]);
};
