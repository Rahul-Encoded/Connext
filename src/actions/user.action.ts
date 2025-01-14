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

auth()
The auth() helper returns the Auth object of the currently active user, as well as the redirectToSignIn() method.

Only available for App Router.
Only works on the server-side, such as in Server Components, Route Handlers, and Server Actions.
Requires clerkMiddleware() to be configured.

source: https://clerk.com/docs/references/nextjs/auth

The clerkMiddleware() helper integrates Clerk authentication into your Next.js application through Middleware. clerkMiddleware() is compatible with both the App and Pages routers.

source: https://clerk.com/docs/references/nextjs/clerk-middleware

*/

"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function syncUser(){
    try {
      const { userId } = await auth();

      // console.log("UserId: ", userId);
      
      const user = await currentUser();
      // console.log("Current User: ", user);
  
      if (!userId || !user) return;
  
      const existingUser = await prisma.user.findUnique({//Benefit of using an ORM
        where: {
          clerkId: userId,
        },
      });
  
      if (existingUser) return existingUser;
  
      const dbUser = await prisma.user.create({
        data: {
          clerkId: userId,
          name: `${user.firstName || ""} ${user.lastName || ""}`,
          username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
          email: user.emailAddresses[0].emailAddress,
          image: user.imageUrl,
        },
      });
  
      return dbUser;
    } catch (error) {
      console.log("Error in syncUser", error);
      throw error; // Propagate the error
    }
  }


  export async function getUserByClerkId(clerkId: string) {
    // console.log("Fetching user by Clerk ID:", clerkId);

    const user = await prisma.user.findUnique({
        where: { clerkId },
        include: {
            _count: {
                select: { followers: true, following: true, posts: true },
            },
        },
    });

    if (!user) {
        console.error("No user found for Clerk ID:", clerkId);
    }

    return user;
}


export async function getDbUserId(){

  const authResult = await auth();
  // console.log("Auth Result: ", authResult);

  const {userId:clerkId} = authResult;  //Destructuring... auth() returns an object... and we need userId... which is later renamed as clerkId...

  if(!clerkId) return null;

  const user = await getUserByClerkId(clerkId);

  if(!user) throw new Error("User not found");

  return user.id;

}

export async function getRandomUsers() {
  try {
      const userId = await getDbUserId();
      if (!userId) return [];

      // get 3 random users excluding ourselves and users that we already follow
      const randomUsers = await prisma.user.findMany({
          where: {
              AND: [
                  { NOT: { id: userId } },
                  {
                      NOT: {
                          followers: {
                              some: { followerId: userId },
                          },
                      },
                  },
              ],
          },
          select: {
              id: true,
              name: true,
              username: true,
              image: true,
              _count: { select: { followers: true } },
          },
          take: 3,
      });

      return randomUsers;
  } catch (error) {
      console.error("Error fetching random users:", error);
      return [];
  }
}


export async function toggleFollow(targetUserId: string){
  try {
    const userId = await getDbUserId();

    if(!userId) return;

    if(userId === targetUserId) throw new Error("You cannot follow yourself");

    const existingFollow = await prisma.follows.findUnique({
      where:{
        followerId_followingId: { //in prisma by default seperated by underscore
          followerId :userId,
          followingId: targetUserId
        }
      }
    })

    if(existingFollow){
      //unfollow
      await prisma.follows.delete({
        where:{
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId
          }
        }
      })
    }
    else{
      //follow
      // transaction: ll or nothing
      await prisma.$transaction([  //Here 2 actions, i.e. follows and notification creation will be followed. If any one fails then none of the tasks will be followed through.
        prisma.follows.create({
          data: {
            followerId: userId,
            followingId: targetUserId
          }
        }),
        prisma.notification.create({
          data:{
            type: "FOLLOW",
            userId: targetUserId, //user being followed
            creatorId: userId //user following
          }
        }),
      ]);
    }
    revalidatePath("/");
    return { success: true };
  } 
  catch (error) {
    console.log("Error in toggleFollow", error);
    return {success: false, error: "Error toggling follow"};
  }
}