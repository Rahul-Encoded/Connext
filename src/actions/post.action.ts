"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export async function createPost(content:string, image:string){
    try{
        const userId = await getDbUserId();

        const post = prisma.post.create({
            data: {
                content,
                image,
                authorId: userId,
            }
        
        });

        /**
         * Good to know:
            revalidatePath is available in both Node.js and Edge runtimes.
            revalidatePath only invalidates the cache when the included path is next visited. This means calling revalidatePath with a dynamic route segment will not immediately trigger many revalidations at once. The invalidation only happens when the path is next visited.
            Currently, revalidatePath invalidates all the routes in the client-side Router Cache when used in a server action. This behavior is temporary and will be updated in the future to apply only to the specific path.
            Using revalidatePath invalidates only the specific path in the server-side Route Cache.
         */
        revalidatePath("/");
        return {success: true, post};

    }
    catch(error){
        console.error("Failed to create post:", error);
        return {success: false, error: "Failed to create post."};
    }
}