export const driveToDirect = (url: string): string => {
  try {
    const match = url.match(/\/d\/([A-Za-z0-9_-]+)\//);
    const id = match?.[1];
    if (!id) return url;
    return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
  } catch {
    return url;
  }
};

export const driveToFallback = (url: string): string => {
  try {
    const match = url.match(/\/d\/([A-Za-z0-9_-]+)\//);
    const id = match?.[1];
    if (!id) return url;
    return `https://drive.google.com/uc?export=download&id=${id}`;
  } catch {
    return url;
  }
};
