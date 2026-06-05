// TODO this might be too hacky and breaks hydration?
export const isServer = () => typeof window === "undefined";
