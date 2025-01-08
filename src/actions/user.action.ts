/*
What is an action?
It is actually a server action, i.e.
Server Actions are asynchronous functions that are executed on the server. 
They can be called in Server and Client Components to handle form submissions and data mutations in Next.js applications.

Convention
A Server Action can be defined with the React "use server" directive. 
You can place the directive at the top of an async function to mark the function as a Server Action, 
or at the top of a separate file to mark all exports of that file as Server Actions.

source: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations

*/

"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function syncUser(){
    try {
        const {userId} = await auth();
        const user = await currentUser();

        if(!userId || !user) return;

        //check if user exists
        const existingUser = await prisma.user.findUnique({
            where: {
                clerkId: userId
            }
        });

        if(existingUser) return existingUser;
        
        const dbUser = await prisma.user.create({//Benefit of using an ORM
            data: {
                clerkId: userId,
                name: `${user.firstName || ""} ${user.lastName || ""}`,
                username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
                email: user.imageUrl,
            }
        });

        return dbUser;
    }

    catch(error){
        console.log("Error in syncUser", error);
    }
}

export async function getUserByClerkId(clerkId: string){
    return prisma.user.findUnique({
        where: {
            clerkId: clerkId,
        },
        include: {
            _count:{
                select: {
                    followers: true,
                    following: true ,
                    posts: true,
                }
            }
        }
    })
}