import { format, formatDistanceToNow } from "date-fns";

export const formatAbsolute = (value?: string | null) => {
  if (!value) {
    return "Never";
  }

  return format(new Date(value), "PP p");
};

export const formatRelative = (value?: string | null) => {
  if (!value) {
    return "—";
  }

  return `${formatDistanceToNow(new Date(value), { addSuffix: true })}`;
};


