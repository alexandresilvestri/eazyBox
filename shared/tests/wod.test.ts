import { describe, expect, test } from "bun:test";
import { parseWod } from "../index";

describe("parseWod", () => {
  test("splits name, scheme, modality and movements", () => {
    expect(parseWod("Fran\n21-15-9\nFor Time\nThrusters\nPull-ups")).toEqual({
      name: "Fran",
      scheme: "21-15-9",
      modality: "For Time",
      movements: ["Thrusters", "Pull-ups"],
    });
  });

  test("matches a modality case-insensitively but keeps the original casing", () => {
    expect(parseWod("Cindy\n20 min\nAMRAP\nPull-ups").modality).toBe("AMRAP");
    expect(parseWod("Cindy\n20 min\namrap\nPull-ups").modality).toBe("amrap");
  });

  test("recognises every supported modality", () => {
    for (const modality of ["For Time", "AMRAP", "EMOM", "RFT"]) {
      expect(parseWod(`Name\nScheme\n${modality}\nMovement`).modality).toBe(
        modality,
      );
    }
  });

  test("finds a modality that is not the first movement line", () => {
    expect(parseWod("Name\nScheme\nThrusters\nEMOM\nPull-ups")).toEqual({
      name: "Name",
      scheme: "Scheme",
      modality: "EMOM",
      movements: ["Thrusters", "Pull-ups"],
    });
  });

  test("keeps every line as a movement when no modality is present", () => {
    expect(parseWod("Name\nScheme\nThrusters\nPull-ups").movements).toEqual([
      "Thrusters",
      "Pull-ups",
    ]);
  });

  test("never treats the scheme line itself as the modality", () => {
    expect(parseWod("Cindy\nAMRAP\nPull-ups")).toEqual({
      name: "Cindy",
      scheme: "AMRAP",
      modality: null,
      movements: ["Pull-ups"],
    });
  });

  test("trims and drops blank lines", () => {
    expect(parseWod("  Fran  \n\n  21-15-9  \n   \n  Thrusters  ")).toEqual({
      name: "Fran",
      scheme: "21-15-9",
      modality: null,
      movements: ["Thrusters"],
    });
  });

  test("a name-only wod has a null scheme and no movements", () => {
    expect(parseWod("Rest day")).toEqual({
      name: "Rest day",
      scheme: null,
      modality: null,
      movements: [],
    });
  });

  test("an empty string yields an empty name", () => {
    expect(parseWod("")).toEqual({
      name: "",
      scheme: null,
      modality: null,
      movements: [],
    });
  });

  test("a whitespace-only wod yields an empty name", () => {
    expect(parseWod("   \n\n  ").name).toBe("");
  });
});
