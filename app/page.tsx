"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PATH_PAGE } from "@/routes/paths";

/** La versión sintética no tiene login: entra directo a Agenda. */
export default function Home() {
  const router = useRouter();
  useEffect(() => { router.replace(PATH_PAGE.agenda.root); }, [router]);
  return null;
}
