import CharacterDetailClient from "./CharacterDetailClient";

// generateStaticParams is required for output: 'export' with dynamic routes.
// Next.js 15 requires at least one entry to generate the route shell.
// The placeholder id "0" never exists in the database; real character IDs
// are loaded at runtime via client-side navigation (Next.js Link).
export function generateStaticParams() {
  return [{ id: "0" }];
}

export default function Page() {
  return <CharacterDetailClient />;
}
