import CharacterDetailClient from "./CharacterDetailClient";

// generateStaticParams is required for output: 'export' with dynamic routes.
// Since character IDs are unknown at build time, we return an empty list;
// the shell is still rendered client-side at runtime via Next.js Link navigation.
export function generateStaticParams() {
  return [{ id: "0" }];
}

export default function Page() {
  return <CharacterDetailClient />;
}
