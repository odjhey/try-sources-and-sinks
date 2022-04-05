import { z } from "zod";

export const zNumberOrString = () => z.string().or(z.number());
