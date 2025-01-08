/*
Best practices for using Prisma Client in development
Avoid multiple Prisma Client instances
When developing a Next.js application, one common issue is accidentally creating multiple instances of the Prisma Client. This often occurs due to Next.js’s hot-reloading feature in development.

Why this happens
Next.js’s hot-reloading feature reloads modules frequently to reflect code changes instantly. However, this can lead to multiple instances of Prisma Client being created, which consumes resources and might cause unexpected behavior.

Recommended solution
To avoid this, create a single Prisma Client instance by using a global variable:

Source: https://www.prisma.io/docs/orm/more/help-and-troubleshooting/nextjs-help
*/

import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
    return new PrismaClient();
}

declare const globalThis: {
    prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ? globalThis.prismaGlobal : prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;