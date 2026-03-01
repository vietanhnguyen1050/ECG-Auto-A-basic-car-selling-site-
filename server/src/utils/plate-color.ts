const plateColorMap: Record<number, string> = {
  1: "White",
  2: "Yellow",
  3: "Blue",
  4: "Red",
  5: "Foreign",
  6: "No plate",
};

function getPlateColorLabel(plateColorCode: unknown): string {
  const code = Number(plateColorCode);
  return plateColorMap[code] ?? "Unknown";
}

function withPlateColorLabel(carDoc: any) {
  if (!carDoc || !carDoc.car) return carDoc;

  return {
    ...carDoc,
    car: {
      ...carDoc.car,
      platecolorLabel: getPlateColorLabel(carDoc.car.platecolor),
    },
  };
}

export { getPlateColorLabel, withPlateColorLabel };
