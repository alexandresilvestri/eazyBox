const MODALITIES = ["for time", "amrap", "emom", "rft"];

export const parseWod = (wod: string) => {
  const [name = "", scheme, ...rest] = wod
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const modalityAt = rest.findIndex((line) =>
    MODALITIES.includes(line.toLowerCase()),
  );

  return {
    name,
    scheme: scheme ?? null,
    modality: rest[modalityAt] ?? null,
    movements: rest.filter((_, index) => index !== modalityAt),
  };
};
